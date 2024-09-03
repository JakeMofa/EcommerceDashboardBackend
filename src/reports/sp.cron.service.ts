import { Logger } from '@nestjs/common';
import { ReportLogsUtils } from './utils/reportLogs.utils';
import { Brands, PrismaClient as PrismaVendoCommerce } from '../../prisma/commerce/generated/vendoCommerce';
import { CredentialsSpDto } from '../advertising/dto/credentials.sp.dto';
import {
  asin_business_report,
  get_amazon_fulfilled_shipments_data_general,
  product_report_data,
  report_log,
} from '../../prisma/brand/generated/vendoBrand';
import { SalesAndTrafficReportDto } from './dto/salesAndTrafficeReport.dto';
import { SpReportsService } from './sp.reports.service';
import { ReportRequesterUtils, reportType } from './utils/reportRequester.utils';
import { AdsReportsService } from './ads.reports.service';
import { PrismaClient as PrismaVendoBrand } from 'prisma/brand/generated/vendoBrand';
import { Job } from 'bull';
import * as Queue from 'bull';

export class SpCronService {
  private readonly logger = new Logger(SpCronService.name);

  static REPORT_TYPES: reportType[] = [
    'GET_MERCHANT_LISTINGS_ALL_DATA',
    'GET_SALES_AND_TRAFFIC_REPORT',
    // 'GET_FBA_MYI_ALL_INVENTORY_DATA',
    // 'GET_FBA_FULFILLMENT_CURRENT_INVENTORY_DATA',
    // 'GET_REFERRAL_FEE_PREVIEW_REPORT',
    'GET_AMAZON_FULFILLED_SHIPMENTS_DATA_GENERAL',
    // 'GET_FLAT_FILE_OPEN_LISTINGS_DATA',
    // 'GET_XML_ALL_ORDERS_DATA_BY_LAST_UPDATE_GENERAL',
    // 'GET_XML_ALL_ORDERS_DATA_BY_ORDER_DATE_GENERAL',
    // 'GET_FLAT_FILE_ALL_ORDERS_DATA_BY_ORDER_DATE_GENERAL',
  ];

  constructor(
    private readonly spReportsService: SpReportsService,
    private readonly adsReportService: AdsReportsService,
    private readonly commerceDb: PrismaVendoCommerce,
  ) {}

  async checkReportForSingleBrand(brand: Brands, job: Job) {
    this.logger.log(`Checking reports for brand ${brand.name}`);
    if (!brand.db_name) {
      this.logger.warn(`Brand ${brand.name} doesn't have db name! Skipping`);
      return;
    }
    await ReportLogsUtils.brandDbProvider(brand, async (client) => {
      const allPendingReports = await new ReportLogsUtils(client, brand.id, this.commerceDb).getPendingReports(
        SpCronService.REPORT_TYPES,
      );
      const credential = await this.spReportsService.getSpCredentials(client);
      if (!credential) {
        this.logger.warn(`Sp credentials not found! Skipping`);
        return;
      }
      let processedLtvCount = 0;
      for (let i = 0; i < allPendingReports.length; i++) {
        const pendingReport = allPendingReports[i];
        await job.progress(((i + 1) / allPendingReports.length) * 50 + 50);
        this.logger.log(`Checking report ${pendingReport.report_id}`);
        try {
          const report = await this.spReportsService.getRequestedReport(
            brand.name,
            credential,
            pendingReport.report_id ?? '',
          );
          if (!report) {
            this.logger.warn(`Report not found! skipping report ${pendingReport.report_id}`);
            continue;
          }
          const updated = await new ReportLogsUtils(client, brand.id, this.commerceDb).updateRequestedReportLog(report);
          if (!updated) continue;
          if (updated.report_request_status === 2) {
            if (updated.report_type === 'GET_AMAZON_FULFILLED_SHIPMENTS_DATA_GENERAL') {
              processedLtvCount += 1;
            }
            this.logger.log(`Report ${report.reportId} is ready. Document id: ${updated.report_document_id}`);
            await this.saveReportResult(brand, updated, credential, client);
            await new ReportLogsUtils(client, brand.id, this.commerceDb).markReportAsDone(updated.id);
          } else if (updated.report_request_status === 0 && updated.status === 1) {
            this.logger.log(`Report ${report.reportId} is ${report.processingStatus}.`);
          }
        } catch (e) {
          this.logger.error(`Failed to fetch report ${pendingReport.report_id}`);
          this.logger.error(e);
          await new ReportLogsUtils(client, brand.id, this.commerceDb).markReportAsError(pendingReport.id);
        }
      }
      if (processedLtvCount > 0) {
        await this.addShipmentJobsToQueue(brand.id);
      }
      this.logger.log(`Checking reports for brand ${brand.name} done.`);
    });
  }

  async addShipmentJobsToQueue(brandId: number) {
    const queues = ['newVsRepeatShipment', 'ltvShipment', 'productBreakdownShipment'];
    for (const queueName of queues) {
      const queue = new Queue(queueName, {
        redis: {
          host: process.env['QUEUE_HOST'],
          port: Number(process.env['QUEUE_PORT']),
          password: process.env['QUEUE_PASSWORD'],
        },
      });
      await queue.add({ brandId });
      await queue.close();
    }
  }

  async requestReportsForSingleBrand(brand: Brands, job: Job) {
    this.logger.log(`Fetching reports for brand ${brand.name}`);
    if (!brand.db_name) {
      this.logger.warn(`Db name not exists for brand ${brand.name}! Skipping`);
      return;
    }
    await ReportLogsUtils.brandDbProvider(brand, async (client) => {
      for (let i = 0; i < SpCronService.REPORT_TYPES.length; i++) {
        const report = SpCronService.REPORT_TYPES[i];
        await job.progress(((i + 1) / SpCronService.REPORT_TYPES.length) * 50);
        await this.requestNewReport(brand, report, client);
      }
      this.logger.log(`Request reports for brand ${brand.name} finished!`);
    });
  }

  private async requestNewReport(brand: Brands, reportType: reportType, client: PrismaVendoBrand) {
    this.logger.log(`Requesting new report of type ${reportType}`);
    const isAllowed = await this.checkIfReportIsAllowed(reportType, brand.id);
    if (!isAllowed) {
      this.logger.log(`${reportType} is not allowed for brand ${brand.name}. Skipping.`);
      return;
    }
    const requester = new ReportRequesterUtils(
      reportType,
      client,
      this.commerceDb,
      this.spReportsService,
      this.adsReportService,
      brand.name,
      brand.id,
    );
    await requester.request();
  }

  async saveReportResult(brand: Brands, report: report_log, credential: CredentialsSpDto, client: PrismaVendoBrand) {
    this.logger.log(`Processing document ${report.report_document_id} with type ${report.report_type}`);
    const document = await this.spReportsService.downloadReportDocument(
      brand.name,
      credential,
      report.report_document_id ?? '',
      false,
      report.report_type === 'GET_MERCHANT_LISTINGS_ALL_DATA' ? false : undefined,
    );
    switch (report.report_type) {
      case 'GET_AMAZON_FULFILLED_SHIPMENTS_DATA_GENERAL':
        await this.fetchAmazonFulfilledShipmentData(document, report, client);
        break;
      case 'GET_MERCHANT_LISTINGS_ALL_DATA':
        await this.fetchMerchantListingAllData(document, report, client);
        break;
      case 'GET_SALES_AND_TRAFFIC_REPORT':
        await this.fetchSalesAndTrafficReport(document, client, brand.id);
        break;
      default:
        this.logger.warn(`Report type not recognized! skipping document ${report.report_document_id}`);
    }
    this.logger.log(`Process of ${report.report_document_id} finished`);
  }

  private async fetchAmazonFulfilledShipmentData(document: any, report: report_log, client: PrismaVendoBrand) {
    const models: Partial<get_amazon_fulfilled_shipments_data_general>[] = [];
    const updateModels: Partial<get_amazon_fulfilled_shipments_data_general>[] = [];
    const jsonDocument = this.spReportsService.tsvToJson(document instanceof Buffer ? document.toString() : document);
    for (const data of jsonDocument) {
      if (!data['amazon-order-id']) continue;
      const brandId = null;
      const shipmentDate = new Date(data['shipment-date'].split('T')[0]);
      const model: Partial<get_amazon_fulfilled_shipments_data_general> = {
        amazon_order_id: data['amazon-order-id'],
        merchant_order_id: data['merchant-order-id'],
        purchase_date: data['purchase-date'],
        brand_id: brandId,
        fulfillment_channel: data['fulfillment-channel'],
        sales_channel: data['sales-channel'],
        ship_service_level: data['ship-service-level'],
        product_name: data['product-name'],
        sku: data['sku'],
        currency: data['currency'],
        item_price: Number(data['item-price'] ?? 0),
        item_tax: Number(data['item-tax'] ?? 0),
        shipping_price: Number(data['shipping-price'] ?? 0),
        shipping_tax: Number(data['shipping-tax'] ?? 0),
        gift_wrap_price: Number(data['gift-wrap-price'] ?? 0),
        gift_wrap_tax: Number(data['gift-wrap-tax'] ?? 0),
        item_promotion_discount: Number(data['item-promotion-discount'] ?? 0),
        ship_promotion_discount: Number(data['ship-promotion-discount'] ?? 0),
        ship_city: data['ship-city'],
        ship_state: data['ship-state'],
        ship_postal_code: data['ship-postal-code'],
        ship_country: data['ship-country'],
        marketplace_id: report.marketplace_id,
        marketplace: report.marketplace,
        created_at: BigInt(new Date().getTime()),
        updated_at: BigInt(new Date().getTime()),
        status: null,
        shipment_id: data['shipment-id'],
        amazon_order_item_id: data['amazon-order-item-id'],
        bill_address_1: data['bill-address-1'],
        bill_address_2: data['bill-address-2'],
        bill_address_3: data['bill-address-3'],
        bill_city: data['bill-city'],
        bill_state: data['bill-state'],
        bill_country: data['bill-country'],
        bill_postal_code: data['bill-postal-code'],
        buyer_email: data['buyer-email'],
        buyer_name: data['buyer-name'],
        buyer_phone_number: data['buyer-phone-number'],
        carrier: data['carrier'],
        fulfillment_center_id: data['fulfillment-center-id'],
        estimated_arrival_date: data['estimated-arrival-date'],
        month: null,
        system_event_process_id: null,
        created_by: null,
        shipment_date: `${
          shipmentDate.toISOString().split('T')[0]
        } ${shipmentDate.getUTCHours()}:${shipmentDate.getUTCMinutes()}:${shipmentDate.getUTCSeconds()}`,
        merchant_order_item_id: data['merchant-order-item-id'],
        payments_date: data['payments-date'],
        quantity_shipped: Number(data['quantity-shipped'] ?? 0),
        recipient_name: data['recipient-name'],
        reporting_date: data['reporting-date'],
        shipment_item_id: data['shipment-item-id'],
        ship_address_1: data['ship-address-1'],
        ship_address_2: data['ship-address-2'],
        ship_address_3: data['ship-address-3'],
        ship_phone_number: data['ship-phone-number'],
        updated_by: null,
        user_id: null,
        usp_id: null,
        week: null,
        year: null,
        tracking_number: data['tracking-number'],
      };
      models.push(model);
    }
    const duplicateCheckChunk = this.chunkArray(models, 200);
    for (const chunk of duplicateCheckChunk) {
      const foundData = await client.get_amazon_fulfilled_shipments_data_general.findMany({
        where: {
          OR: chunk.map((o) => ({
            amazon_order_id: o.amazon_order_id,
            sku: o.sku,
          })),
        },
      });
      updateModels.push(...foundData);
      await client.$transaction(
        foundData.map((model) => {
          const newData = models.find((o) => o.sku === model.sku && o.amazon_order_id === model.amazon_order_id);
          return client.get_amazon_fulfilled_shipments_data_general.update({
            where: {
              id: model.id,
            },
            data: {
              ...model,
              ...newData,
            },
          });
        }),
      );
    }
    const insertModels = models.filter(
      (o) => !updateModels.find((d) => d.amazon_order_id === o.amazon_order_id && d.sku === o.sku),
    );
    const chunkedData = this.chunkArray(insertModels, 1000);
    for (const chunk of chunkedData) {
      await client.get_amazon_fulfilled_shipments_data_general.createMany({
        data: chunk,
      });
    }
    await client.$executeRawUnsafe(`
        DELETE
        FROM get_amazon_fulfilled_shipments_data_general
        WHERE id IN (SELECT sq.oid
                     FROM (SELECT MIN(id) oid, sku, amazon_order_id, COUNT(*) cnt, MIN(reporting_date)
                           FROM get_amazon_fulfilled_shipments_data_general
                           GROUP BY sku, amazon_order_id) sq
                     WHERE sq.cnt > 1);
    `);
    await client.$executeRawUnsafe(`
     UPDATE get_amazon_fulfilled_shipments_data_general
SET week          = WEEK(CONVERT_TZ(STR_TO_DATE(purchase_date, '%Y-%m-%dT%H:%i:%s+00:00'), '+00:00', '-07:00')),
    year          = YEAR(CONVERT_TZ(STR_TO_DATE(purchase_date, '%Y-%m-%dT%H:%i:%s+00:00'), '+00:00', '-07:00')),
    month         = MONTH(CONVERT_TZ(STR_TO_DATE(purchase_date, '%Y-%m-%dT%H:%i:%s+00:00'), '+00:00', '-07:00')),
    purchase_date = CONVERT_TZ(STR_TO_DATE(purchase_date, '%Y-%m-%dT%H:%i:%s+00:00'), '+00:00', '-07:00')
WHERE purchase_date LIKE '%+00:00';
    `);

    await client.$executeRawUnsafe(`
    UPDATE get_amazon_fulfilled_shipments_data_general sh
    SET sh.year_week = YEARWEEK(STR_TO_DATE(sh.purchase_date, '%Y-%m-%d %H:%i:%s'), 6)
    WHERE sh.purchase_date REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}$';
    `);

    await client.$executeRawUnsafe(`
    UPDATE get_amazon_fulfilled_shipments_data_general sh
    SET sh.year_week = YEARWEEK(STR_TO_DATE(sh.purchase_date, '%Y-%m-%dT%H:%i:%s-08:00'), 6)
    WHERE sh.purchase_date REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}-08:00$';
    `);

    await client.$executeRawUnsafe(`
    UPDATE get_amazon_fulfilled_shipments_data_general sh
    SET sh.year_week = YEARWEEK(STR_TO_DATE(sh.purchase_date, '%Y-%m-%dT%H:%i:%s-07:00'), 6)
    WHERE sh.purchase_date REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}-07:00$';
    `);
  }

  private async fetchMerchantListingAllData(document: any, report: report_log, client: PrismaVendoBrand) {
    const jsonDocument = this.spReportsService.tsvToJson(
      document instanceof Buffer ? document.toString('utf-8') : document,
    );
    const models: Partial<product_report_data>[] = [];
    for (const data of jsonDocument) {
      const brandId = null;
      const model: Partial<product_report_data> = {
        brand_id: brandId,
        item_name: data['item-name'],
        item_description: data['item-description'],
        listing_id: data['listing-id'],
        seller_sku: data['seller-sku'],
        price: Number(data['price'] ?? 0),
        quantity: Number(data['quantity'] ?? 0),
        open_date: data['open-date'],
        image_url: data['image-url'],
        item_is_marketplace: data['item-is-marketplace'],
        product_id_type: Number(data['product-id-type'] ?? 0),
        zshop_shipping_fee: data['zshop-shipping-fee'],
        item_note: data['item-note']?.substring(0, 254),
        item_condition: data['item-condition'],
        zshop_category1: data['zshop-category1'],
        zshop_browse_path: data['zshop-browse-path'],
        zshop_storefront_feature: data['zshop-storefront-feature'],
        asin1: data['asin1'],
        asin2: data['asin2'],
        asin3: data['asin3'],
        will_ship_internationally: data['will-ship-internationally'],
        expedited_shipping: data['expedited-shipping'],
        zshop_boldface: data['zshop-boldface'],
        product_id: data['product-id'],
        bid_for_featured_placement: data['bid-for-featured-placement'],
        add_delete: data['add-delete'],
        pending_quantity: data['pending-quantity'],
        fulfillment_channel: data['fulfillment-channel'],
        merchant_shipping_group: data['merchant-shipping-group'],
        status: data['status'],
        marketplace_id: report.marketplace_id,
        marketplace: report.marketplace,
        created_at: BigInt(Date.now()),
        updated_at: BigInt(Date.now()),
      };
      models.push(model);
    }
    for (const model of models) {
      const checkSku = await client.product_report_data.findFirst({
        where: {
          seller_sku: model.seller_sku,
          asin1: model.asin1,
        },
      });
      if (checkSku) {
        await client.product_report_data.update({
          where: {
            id: checkSku.id,
          },
          data: model,
        });
      } else {
        await client.product_report_data.create({
          data: model,
        });
      }
    }
  }

  private async fetchSalesAndTrafficReport(document: any, client: PrismaVendoBrand, brandId: number) {
    const doc = JSON.parse(document) as SalesAndTrafficReportDto;
    const insertModels: Partial<asin_business_report>[] = [];
    const updateModels: Partial<asin_business_report>[] = [];
    const eosdDate = new Date(doc.reportSpecification.dataEndTime);
    for (const row of doc.salesAndTrafficByAsin) {
      const model: Partial<asin_business_report> = {
        astr_date: eosdDate,
        astr_parent_asin: row.parentAsin,
        astr_child_asin: row.childAsin,
        astr_listing_sku: '---',
        astr_sessions: BigInt(row.trafficByAsin['sessions'] ?? 0),
        astr_session_percentage: row.trafficByAsin['sessionPercentage'],
        astr_page_views: BigInt(row.trafficByAsin['browserPageViews'] ?? 0),
        astr_page_view_percentage: row.trafficByAsin['browserPageViewsPercentage'],
        astr_buy_box_percentage: row.trafficByAsin['buyBoxPercentage'],
        astr_units_ordered: row.salesByAsin.unitsOrdered,
        astr_units_ordered_b2b: row.salesByAsin.unitsOrderedB2B,
        unit_session_percentage: row.trafficByAsin['unitSessionPercentage'],
        unit_session_percentage_b2b: row.trafficByAsin['unitSessionPercentageB2B'],
        ordered_product_sales: row.salesByAsin.orderedProductSales?.amount ?? 0,
        ordered_product_sales_b2b: row.salesByAsin.orderedProductSalesB2B?.amount ?? 0,
        total_order_items: row.salesByAsin.totalOrderItems,
        total_order_items_b2b: row.salesByAsin.totalOrderItemsB2B,
        report_name: 'sales_and_traffic_report_' + eosdDate.toISOString().split('T')[0],
        marketplace_id: doc.reportSpecification.marketplaceIds[0],
        browser_sessions: BigInt(row.trafficByAsin['browserSessions'] ?? 0),
        mobile_app_sessions: BigInt(row.trafficByAsin['mobileAppSessions'] ?? 0),
        browser_session_percentage: row.trafficByAsin['browserSessionPercentage'],
        mobile_app_session_percentage: row.trafficByAsin['mobileAppSessionPercentage'],
        browser_page_views: BigInt(row.trafficByAsin['browserPageViews'] ?? 0),
        mobile_app_page_views: BigInt(row.trafficByAsin['mobileAppPageViews'] ?? 0),
        browser_page_views_percentage: row.trafficByAsin['browserPageViewsPercentage'],
        mobile_app_page_views_percentage: row.trafficByAsin['mobileAppPageViewsPercentage'],
        created_at: BigInt(Date.now()),
        updated_at: BigInt(Date.now()),
      };
      const checkAsin = await client.asin_business_report.findFirst({
        where: {
          astr_date: eosdDate,
          astr_child_asin: row.childAsin,
        },
      });
      if (checkAsin) {
        updateModels.push({
          ...checkAsin,
          ...model,
        });
        continue;
      }
      insertModels.push(model);
    }
    const chunkedData = this.chunkArray(insertModels, 200);
    for (const chunk of chunkedData) {
      await client.asin_business_report.createMany({
        data: chunk,
      });
    }
    for (const model of updateModels) {
      await client.asin_business_report.update({
        where: {
          astr_id: model.astr_id,
        },
        data: model,
      });
    }
    await client.$executeRawUnsafe(`
      UPDATE asin_business_report
      SET
          astr_year = YEAR(STR_TO_DATE(astr_date, '%Y-%m-%d')),
          astr_month = MONTH(STR_TO_DATE(astr_date, '%Y-%m-%d')),
          astr_week = WEEK(STR_TO_DATE(astr_date, '%Y-%m-%d'))

      WHERE astr_year is NULL;
    `);
    await client.$executeRawUnsafe(`
      UPDATE asin_business_report abr LEFT JOIN (SELECT prd.asin1                    asin,
                                                        GROUP_CONCAT(prd.seller_sku) sku,
                                                        min(prd.item_name)           title
                                                 FROM product_report_data prd
                                                 GROUP BY prd.asin1) prd
          ON abr.astr_child_asin = prd.asin
      SET astr_tilte       = prd.title,
          astr_listing_sku = prd.sku
      WHERE astr_tilte is NULL
    `);
    await this.updateAllBrandsSumSales(eosdDate, brandId, client);
  }

  async updateAllBrandsSumSales(date: Date, brandId: number, client: PrismaVendoBrand) {
    const sales: {
      astr_date: string;
      sales: number;
      year: number;
      month: number;
      week: number;
    }[] = await client.$queryRawUnsafe(`
      SELECT date(astr_date)            as astr_date,
       SUM(ordered_product_sales) as sales,
       YEAR(astr_date)            as year,
       MONTH(astr_date)           as month,
       WEEK(astr_date)            as week
      FROM asin_business_report
      WHERE date(astr_date) = '${date.toISOString().split('T')[0]}'
      GROUP BY date(astr_date);
    `);
    if (sales.length === 0) {
      return;
    }
    const availableRow = await this.commerceDb.allBrandsSum.findFirst({
      where: {
        date: sales[0].astr_date,
        brandsId: brandId,
      },
    });
    if (availableRow) {
      await this.commerceDb.allBrandsSum.update({
        where: {
          id: availableRow.id,
        },
        data: {
          ...availableRow,
          sale: sales[0].sales,
        },
      });
      return;
    }
    await this.commerceDb.allBrandsSum.create({
      data: {
        date: sales[0].astr_date,
        brandsId: brandId,
        sale: sales[0].sales,
        year: Number(sales[0].year),
        month: Number(sales[0].month),
        week: Number(sales[0].week),
        spend: 0,
        revenue: 0,
      },
    });
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const res: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      const chunk = array.slice(i, i + chunkSize);
      res.push(chunk);
    }
    return res;
  }

  private async checkIfReportIsAllowed(reportType: reportType, brandId: number) {
    if (reportType !== 'GET_AMAZON_FULFILLED_SHIPMENTS_DATA_GENERAL') {
      return true;
    }
    const brand = await this.commerceDb.brands.findUniqueOrThrow({
      where: {
        id: brandId,
      },
    });
    return brand.is_shipment_reports_active;
  }
}
