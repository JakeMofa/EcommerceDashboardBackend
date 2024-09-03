import { Logger } from '@nestjs/common';
import { Brands, PrismaClient as PrismaVendoCommerce } from '../../prisma/commerce/generated/vendoCommerce';
import { AdsReportsService } from './ads.reports.service';
import {
  advertising_brands_video_campaigns_report,
  advertising_display_campaigns_report,
  advertising_product_report,
  report_log,
  user_credentials,
} from '../../prisma/brand/generated/vendoBrand';
import { ReportLogsUtils } from './utils/reportLogs.utils';
import { ReportRequesterUtils, reportType } from './utils/reportRequester.utils';
import { SpReportsService } from './sp.reports.service';
import { PrismaClient as PrismaVendoBrand } from 'prisma/brand/generated/vendoBrand';
import { Job } from 'bull';

export class AdsCronService {
  private readonly logger = new Logger(AdsCronService.name);

  private readonly reportTypes: reportType[] = [
    'AdsProductReport',
    'CampaignBrandReport',
    'CampaignDisplayReportT20',
    'CampaignDisplayReportT30',
  ];

  constructor(
    private readonly adsReportService: AdsReportsService,
    private readonly commerceDb: PrismaVendoCommerce,
    private readonly spReportService: SpReportsService,
  ) {}

  async checkReportsForSingleBrand(brand: Brands, job: Job) {
    this.logger.log(`Checking reports for brand ${brand.name}`);
    if (!brand.db_name) {
      this.logger.warn(`Brand ${brand.name} doesn't have db name! Skipping`);
      return;
    }
    await ReportLogsUtils.brandDbProvider(brand, async (client) => {
      const allPendingReports = await new ReportLogsUtils(client, brand.id, this.commerceDb).getPendingReports(
        this.reportTypes,
      );
      for (let i = 0; i < allPendingReports.length; i++) {
        const report = allPendingReports[i];
        await job.progress(((i + 1) / allPendingReports.length) * 50 + 50);
        await this.checkSingleReport(report, client, brand.id);
      }
    });
  }

  async requestReportsForSingleBrand(brand: Brands, job: Job) {
    this.logger.log(`Requesting ads reports for brand ${brand.name}`);
    if (!brand.db_name) {
      this.logger.warn(`Db name not exists for brand ${brand.name}! Skipping`);
      return;
    }
    await ReportLogsUtils.brandDbProvider(brand, async (client) => {
      for (let i = 0; i < this.reportTypes.length; i++) {
        const reportType = this.reportTypes[i];
        await job.progress(((i + 1) / this.reportTypes.length) * 50);
        this.logger.log(`Requesting report ${reportType} for brand ${brand.name}`);
        const requester = new ReportRequesterUtils(
          reportType,
          client,
          this.commerceDb,
          this.spReportService,
          this.adsReportService,
          brand.name,
          brand.id,
        );
        await requester.request();
      }
    });
  }

  private async checkSingleReport(report: report_log, client: PrismaVendoBrand, brandId: number) {
    try {
      this.logger.log(`Checking report ${report.report_id}`);
      const credentials = await this.adsReportService.getAdsCredentials(client);
      const updatedReport =
        report.report_type === 'CampaignBrandReport'
          ? await this.adsReportService.getRequestedCampaignBrandReport(
              credentials,
              report.marketplace_id ?? '',
              report.report_id ?? '',
            )
          : (report.report_type ?? '').indexOf('CampaignDisplayReport') !== -1
          ? await this.adsReportService.getRequestedCampaignDisplayReport(
              credentials,
              report.marketplace_id ?? '',
              report.report_id ?? '',
            )
          : await this.adsReportService.getRequestedProductAdsReport(
              credentials,
              report.marketplace_id ?? '',
              report.report_id ?? '',
              brandId,
            );
      const newReport = await new ReportLogsUtils(client, brandId, this.commerceDb).updateRequestedReportLog({
        reportId: updatedReport.reportId,
        marketPlaceIds: [report.marketplace_id ?? ''],
        processingStatus: updatedReport.status as any,
        reportType: report.report_type ?? '',
        createdTime: report.created_time ?? '',
        dataStartTime: report.data_start_time ?? '',
        dataEndTime: report.data_end_time ?? '',
      });
      if (!newReport) {
        this.logger.error(`Failed tp update report!`);
        return;
      }
      if (updatedReport.status === 'SUCCESS' || updatedReport.status === 'COMPLETED') {
        switch (report.report_type) {
          case 'CampaignBrandReport':
            await this.fetchCampaignBrandReportResult(
              credentials,
              report.marketplace_id ?? '',
              newReport,
              client,
              brandId,
            );
            break;
          case 'CampaignDisplayReportT30':
          case 'CampaignDisplayReportT20':
            await this.fetchCampaignDisplayReportResult(
              credentials,
              report.marketplace_id ?? '',
              newReport,
              client,
              brandId,
            );
            break;
          default:
            await this.fetchAdsProductReportResult(
              credentials,
              report.marketplace_id ?? '',
              newReport,
              client,
              brandId,
            );
        }
        await new ReportLogsUtils(client, brandId, this.commerceDb).markReportAsDone(newReport.id);
      }
    } catch (e) {
      this.logger.error(e);
      await new ReportLogsUtils(client, brandId, this.commerceDb).markReportAsError(report.id);
    }
  }

  async fetchAdsProductReportResult(
    credentials: user_credentials[],
    market_place_id: string,
    reportModel: report_log,
    client: PrismaVendoBrand,
    brandId: number,
  ) {
    const adsCredential = this.adsReportService.exportAdsCredential(credentials, market_place_id);
    const reports = await this.adsReportService.downloadRequestedProductAdsReport(
      credentials,
      market_place_id,
      reportModel.report_id ?? '',
      brandId,
    );
    const models: Partial<advertising_product_report>[] = [];
    const fields = [
      'date',
      'campaignName',
      'campaignId',
      'adGroupName',
      'adGroupId',
      'adId',
      'portfolioId',
      'impressions',
      'clicks',
      'costPerClick',
      'clickThroughRate',
      'cost',
      'spend',
      'campaignBudgetCurrencyCode',
      'campaignBudgetAmount',
      'campaignBudgetType',
      'campaignStatus',
      'advertisedAsin',
      'advertisedSku',
      'purchases1d',
      'purchases7d',
      'purchases14d',
      'purchases30d',
      'purchasesSameSku1d',
      'purchasesSameSku7d',
      'purchasesSameSku14d',
      'purchasesSameSku30d',
      'unitsSoldClicks1d',
      'unitsSoldClicks7d',
      'unitsSoldClicks14d',
      'unitsSoldClicks30d',
      'sales1d',
      'sales7d',
      'sales14d',
      'sales30d',
      'attributedSalesSameSku1d',
      'attributedSalesSameSku7d',
      'attributedSalesSameSku14d',
      'attributedSalesSameSku30d',
      'salesOtherSku7d',
      'unitsSoldSameSku1d',
      'unitsSoldSameSku7d',
      'unitsSoldSameSku14d',
      'unitsSoldSameSku30d',
      'unitsSoldOtherSku7d',
      'kindleEditionNormalizedPagesRead14d',
      'kindleEditionNormalizedPagesRoyalties14d',
      'acosClicks7d',
      'acosClicks14d',
      'roasClicks7d',
      'roasClicks14d',
    ] as const;
    type reportType = {
      [key in (typeof fields)[number]]?: string;
    };
    const typeSafeReport = this.exportReportResultAsStrings(reports) as reportType[];
    for (const r of typeSafeReport) {
      const model: Partial<advertising_product_report> = {
        sku: String(r['advertisedSku']),
        asin: String(r['advertisedAsin']),
        ad_id: String(r['adId']),
        report_date: new Date(reportModel.data_start_time ?? ''),
        marketplace_id: market_place_id,
        marketplace: null,
        currency: String(r['campaignBudgetCurrencyCode']),
        attributed_conversions1d: null,
        attributed_conversions7d: null,
        attributed_conversions14d: null,
        attributed_conversions30d: null,
        attributed_sales1d: this.toNumber(r['sales1d']),
        attributed_sales7d: this.toNumber(r['sales7d']),
        attributed_sales14d: this.toNumber(r['sales14d']),
        attributed_sales30d: this.toNumber(r['sales30d']),
        created_at: BigInt(new Date().getTime()),
        attributed_units_ordered1d: this.toNumber(r['purchases1d']),
        attributed_units_ordered7d: this.toNumber(r['purchases7d']),
        attributed_units_ordered14d: this.toNumber(r['purchases14d']),
        attributed_units_ordered30d: this.toNumber(r['purchases30d']),
        campaign_id: String(r['campaignId']),
        cost: this.toNumber(r['cost']),
        campaign_name: String(r['campaignName']),
        clicks: this.toNumber(r['clicks']),
        group_id: String(r['adGroupId']),
        group_name: String(r['adGroupName'] ?? ''),
        impressions: this.toNumber(r['impressions']),
        profile_id: String(adsCredential?.profile_id),
        branded_non_branded_status:
          r['campaignName']?.indexOf(' B ') !== -1
            ? 'B'
            : r['campaignName'].indexOf('NB') !== -1 || r['campaignName'].indexOf('NonBranded') !== -1
            ? 'NB'
            : ' ',
        brand_id: null,
        system_event_process_id: null,
        updated_at: null,
        category: null,
      };
      models.push(model);
    }
    const chunkedFetch = this.chunkArray(models, 200);
    const duplicateModels: advertising_product_report[] = [];
    for (const chunk of chunkedFetch) {
      const foundModels = await client.advertising_product_report.findMany({
        where: {
          OR: chunk.map((m) => ({
            ad_id: m.ad_id,
            report_date: m.report_date,
          })),
        },
      });
      duplicateModels.push(...foundModels);
      await client.$transaction(
        foundModels.map((m) => {
          const newData = models.find(
            (mm) => mm.ad_id === m.ad_id && mm.report_date?.toISOString() === m.report_date?.toISOString(),
          );
          return client.advertising_product_report.update({
            where: {
              id: m.id,
            },
            data: {
              ...m,
              ...newData,
            },
          });
        }),
      );
    }
    const newModels = models.filter(
      (m) =>
        !duplicateModels.find(
          (dm) => dm.ad_id === m.ad_id && dm.report_date?.toISOString() == m.report_date?.toISOString(),
        ),
    );
    const chunkedData = this.chunkArray(newModels, 1000);
    for (const chunk of chunkedData) {
      await client.advertising_product_report.createMany({
        data: chunk,
      });
    }
    await client.$executeRawUnsafe(`
        update advertising_product_report
        set yearweek_year = substr(yearweek(report_date, 6), 1, 4),
            yearweek_week = substr(yearweek(report_date, 6), 4, 6)
        where yearweek_year is null
           or yearweek_week is null;
    `);
    await client.$executeRawUnsafe(`
        update advertising_product_report
        set yearmonth_year = year (report_date), yearmonth_month = month (report_date)
        where yearmonth_year is null
           or yearmonth_month is null;
    `);
    await this.updateTotalSpendRevenueDaily(new Date(reportModel.data_start_time ?? ''), client, brandId);
  }

  async fetchCampaignBrandReportResult(
    credentials: user_credentials[],
    market_place_id: string,
    reportModel: report_log,
    client: PrismaVendoBrand,
    brandId: number,
  ) {
    const adsCredential = this.adsReportService.exportAdsCredential(credentials, market_place_id);
    const reports = await this.adsReportService.downloadRequestedCampaignBrandReport(
      credentials,
      market_place_id,
      reportModel.report_id ?? '',
    );
    const models: Partial<advertising_brands_video_campaigns_report>[] = [];
    const fields = [
      'attributedConversions14d',
      'attributedConversions14dSameSKU',
      'attributedSales14d',
      'attributedSales14dSameSKU',
      'campaignBudget',
      'campaignBudgetType',
      'campaignName',
      'campaignStatus',
      'clicks',
      'cost',
      'dpv14d',
      'impressions',
      'vctr',
      'video5SecondViewRate',
      'video5SecondViews',
      'videoCompleteViews',
      'videoFirstQuartileViews',
      'videoMidpointViews',
      'videoThirdQuartileViews',
      'videoUnmutes',
      'viewableImpressions',
      'vtr',
      'dpv14d',
      'attributedDetailPageViewsClicks14d',
      'attributedOrderRateNewToBrand14d',
      'attributedOrdersNewToBrand14d',
      'attributedOrdersNewToBrandPercentage14d',
      'attributedSalesNewToBrand14d',
      'attributedSalesNewToBrandPercentage14d',
      'attributedUnitsOrderedNewToBrand14d',
      'attributedUnitsOrderedNewToBrandPercentage14d',
      'attributedBrandedSearches14d',
      'currency',
      'topOfSearchImpressionShare',
      'campaignId',
    ] as const;
    type reportType = {
      [key in (typeof fields)[number]]?: string;
    };
    const typeSafeReport = this.exportReportResultAsStrings(reports) as reportType[];
    for (const r of typeSafeReport) {
      const model: Partial<advertising_brands_video_campaigns_report> = {
        report_date: new Date(reportModel.data_start_time ?? ''),
        marketplace_id: adsCredential?.marketplace_id,
        marketplace: null,
        created_at: BigInt(new Date().getTime()),
        campaign_id: String(r['campaignId']),
        cost: this.toNumber(r['cost']),
        campaign_name: String(r['campaignName']),
        clicks: this.toNumber(r['clicks']),
        impressions: this.toNumber(r['impressions']),
        profile_id: String(adsCredential?.profile_id),
        brand_id: null,
        system_event_process_id: null,
        updated_at: null,
        attributed_conversions_14d: this.toNumber(r.attributedConversions14d),
        attributed_conversions_14d_same_sku: this.toNumber(r.attributedConversions14dSameSKU),
        attributed_sales_14d: this.toNumber(r.attributedSales14d),
        campaign_budget: this.toNumber(r.campaignBudget),
        attributed_sales_14d_same_sku: this.toNumber(r.attributedSales14dSameSKU),
        campaign_status: r.campaignStatus,
        campaign_budget_type: r.campaignBudgetType,
        branded_non_branded_status:
          r['campaignName']?.indexOf(' B ') !== -1
            ? 'B'
            : r['campaignName'].indexOf('NB') !== -1 || r['campaignName'].indexOf('NonBranded') !== -1
            ? 'NB'
            : ' ',
      };
      models.push(model);
    }
    const chunkedFetch = this.chunkArray(models, 200);
    const duplicateModels: advertising_brands_video_campaigns_report[] = [];
    for (const chunk of chunkedFetch) {
      const foundModels = await client.advertising_brands_video_campaigns_report.findMany({
        where: {
          OR: chunk.map((m) => ({
            campaign_id: m.campaign_id,
            report_date: m.report_date,
          })),
        },
      });
      duplicateModels.push(...foundModels);
      await client.$transaction(
        foundModels.map((m) => {
          const newData = models.find(
            (mm) => mm.campaign_id === m.campaign_id && mm.report_date?.toISOString() === m.report_date?.toISOString(),
          );
          return client.advertising_brands_video_campaigns_report.update({
            where: {
              id: m.id,
            },
            data: {
              ...m,
              ...newData,
            },
          });
        }),
      );
    }
    const newModels = models.filter(
      (m) =>
        !duplicateModels.find(
          (dm) => dm.campaign_id === m.campaign_id && dm.report_date?.toISOString() == m.report_date?.toISOString(),
        ),
    );
    const chunkedData = this.chunkArray(newModels, 1000);
    for (const chunk of chunkedData) {
      await client.advertising_brands_video_campaigns_report.createMany({
        data: chunk,
      });
    }
    await this.updateTotalSpendRevenueDaily(new Date(reportModel.data_start_time ?? ''), client, brandId);
  }

  async fetchCampaignDisplayReportResult(
    credentials: user_credentials[],
    market_place_id: string,
    reportModel: report_log,
    client: PrismaVendoBrand,
    brandId: number,
  ) {
    const adsCredential = this.adsReportService.exportAdsCredential(credentials, market_place_id);
    const reports = await this.adsReportService.downloadRequestedCampaignDisplayReport(
      credentials,
      market_place_id,
      reportModel.report_id ?? '',
    );
    const models: Partial<advertising_display_campaigns_report>[] = [];
    const fields = [
      'attributedSales14d',
      'attributedConversions14dSameSKU',
      'attributedConversions1d',
      'attributedConversions1dSameSKU',
      'attributedConversions30d',
      'attributedConversions30dSameSKU',
      'attributedConversions7d',
      'attributedConversions7dSameSKU',
      'attributedSales14d',
      'attributedSales14dSameSKU',
      'attributedSales1d',
      'attributedSales1dSameSKU',
      'attributedSales30d',
      'attributedSales30dSameSKU',
      'attributedSales7d',
      'attributedSales7dSameSKU',
      'attributedUnitsOrdered14d',
      'attributedUnitsOrdered1d',
      'attributedUnitsOrdered30d',
      'attributedUnitsOrdered7d',
      'campaignId',
      'campaignName',
      'campaignStatus',
      'clicks',
      'cost',
      'currency',
      'impressions',
      'attributedConversions14d',
      'viewAttributedConversions14d',
      'viewAttributedDetailPageView14d',
      'viewAttributedSales14d',
      'viewAttributedUnitsOrdered14d',
      'viewImpressions',
    ] as const;
    type reportType = {
      [key in (typeof fields)[number]]?: string;
    };
    const typeSafeReport = this.exportReportResultAsStrings(reports) as reportType[];
    for (const r of typeSafeReport) {
      const model: Partial<advertising_display_campaigns_report> = {
        report_date: new Date(reportModel.data_start_time ?? ''),
        marketplace_id: market_place_id,
        marketplace: null,
        created_at: BigInt(new Date().getTime()),
        campaign_id: String(r['campaignId']),
        cost: this.toNumber(r['cost']),
        campaign_name: String(r['campaignName']),
        clicks: this.toNumber(r['clicks']),
        impressions: this.toNumber(r['impressions']),
        profile_id: String(adsCredential?.profile_id),
        brand_id: null,
        system_event_process_id: null,
        updated_at: null,
        attributed_conversions_14d_same_sku: this.toNumber(r.attributedConversions14dSameSKU),
        attributed_sales_14d_same_sku: this.toNumber(r.attributedSales14dSameSKU),
        campaign_status: r.campaignStatus,
        attributed_conversions1d: this.toNumber(r.attributedConversions1d),
        attributed_conversions7d: this.toNumber(r.attributedConversions7d),
        attributed_conversions14d: this.toNumber(r.attributedConversions14d),
        attributed_conversions30d: this.toNumber(r.attributedConversions30d),
        attributed_sales1d: this.toNumber(r.attributedSales1d),
        attributed_sales7d: this.toNumber(r.attributedSales7d),
        attributed_sales14d: this.toNumber(r.viewAttributedSales14d),
        attributed_sales30d: this.toNumber(r.attributedSales30d),
        attributed_units_ordered30d: this.toNumber(r.attributedUnitsOrdered30d),
        attributed_units_ordered14d: this.toNumber(r.viewAttributedUnitsOrdered14d),
        attributed_units_ordered1d: this.toNumber(r.attributedUnitsOrdered1d),
        attributed_units_ordered7d: this.toNumber(r.attributedUnitsOrdered7d),
        attributed_conversions_1d_same_sku: this.toNumber(r.attributedConversions1dSameSKU),
        currency: r.currency,
        attributed_conversions_7d_same_sku: this.toNumber(r.attributedConversions7dSameSKU),
        attributed_conversions_30d_same_sku: this.toNumber(r.attributedConversions30dSameSKU),
        attributed_sales_1d_same_sku: this.toNumber(r.attributedSales1dSameSKU),
        attributed_sales_7d_same_sku: this.toNumber(r.attributedSales7dSameSKU),
        attributed_sales_30d_same_sku: this.toNumber(r.attributedSales30dSameSKU),
        tactic_name: null,
        tactic_type: null,
        branded_non_branded_status:
          r['campaignName']?.indexOf(' B ') !== -1
            ? 'B'
            : r['campaignName'].indexOf('NB') !== -1 || r['campaignName'].indexOf('NonBranded') !== -1
            ? 'NB'
            : ' ',
      };
      models.push(model);
    }
    const chunkedFetch = this.chunkArray(models, 200);
    const duplicateModels: advertising_display_campaigns_report[] = [];
    for (const chunk of chunkedFetch) {
      const foundModels = await client.advertising_display_campaigns_report.findMany({
        where: {
          OR: chunk.map((m) => ({
            campaign_id: m.campaign_id,
            report_date: m.report_date,
          })),
        },
      });
      duplicateModels.push(...foundModels);
      await client.$transaction(
        foundModels.map((m) => {
          const newData = models.find(
            (mm) => mm.campaign_id === m.campaign_id && mm.report_date?.toISOString() === m.report_date?.toISOString(),
          );
          return client.advertising_display_campaigns_report.update({
            where: {
              id: m.id,
            },
            data: {
              ...m,
              ...newData,
            },
          });
        }),
      );
    }
    const newModels = models.filter(
      (m) =>
        !duplicateModels.find(
          (dm) => dm.campaign_id === m.campaign_id && dm.report_date?.toISOString() == m.report_date?.toISOString(),
        ),
    );
    const chunkedData = this.chunkArray(newModels, 1000);
    for (const chunk of chunkedData) {
      await client.advertising_display_campaigns_report.createMany({
        data: chunk,
      });
    }
    await this.updateTotalSpendRevenueDaily(new Date(reportModel.data_start_time ?? ''), client, brandId);
  }

  private exportReportResultAsStrings(report: Partial<Record<string, string | number>>[]) {
    const result: Partial<Record<string, string>>[] = [];
    for (const row of report) {
      const rowRes: Partial<Record<string, string>> = {};
      for (const key of Object.keys(row)) {
        rowRes[key.trim()] = row[key] ? String(row[key]) : undefined;
      }
      result.push(rowRes);
    }
    return result;
  }

  private toNumber(num?: string, int = false) {
    return num !== undefined ? (int ? Math.round(Number(num)) : Number(num)) : undefined;
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const res: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      const chunk = array.slice(i, i + chunkSize);
      res.push(chunk);
    }
    return res;
  }

  private async calculateTotalSpendRevenueDaily(date: Date, client: PrismaVendoBrand) {
    const report_date = "'" + date.toISOString().split('T')[0] + "'";
    const result: {
      report_date: string;
      revenue: number;
      spend: number;
      week: number;
      year: number;
      month: number;
    }[] = await client.$queryRawUnsafe(`
      WITH product_data AS (SELECT report_date                                    as report_date,
                             IFNULL(SUM(b.impressions), 0)                  AS impression,
                             IFNULL(SUM(b.clicks), 0)                       AS clicks,
                             IFNULL(SUM(b.attributed_conversions14d), 0)    AS conversions,
                             IFNULL(SUM(b.attributed_units_ordered14d), 0)  AS unit_ordered,
                             ROUND(IFNULL(SUM(b.attributed_sales7d), 0), 2) AS revenue,
                             ROUND(IFNULL(SUM(b.cost), 0), 2)               AS spend
                      FROM advertising_product_report b
                      WHERE report_date = ${report_date}
                      GROUP BY report_date),
     brands_data AS (SELECT report_date                                      as report_date,
                            IFNULL(SUM(b.impressions), 0)                    AS impression,
                            IFNULL(SUM(b.clicks), 0)                         AS clicks,
                            IFNULL(SUM(b.attributed_conversions_14d), 0)     AS conversions,
                            ROUND(IFNULL(SUM(b.attributed_sales_14d), 0), 2) AS revenue,
                            ROUND(IFNULL(SUM(b.cost), 0), 2)                 AS spend,
                            0                                                AS unit_ordered
                     FROM advertising_brands_video_campaigns_report b
                     WHERE report_date = ${report_date}
                     GROUP BY report_date),
     display_data AS (SELECT report_date                                     as report_date,
                             IFNULL(SUM(b.impressions), 0)                   AS impression,
                             IFNULL(SUM(b.clicks), 0)                        AS clicks,
                             IFNULL(SUM(b.attributed_conversions14d), 0)     AS conversions,
                             IFNULL(SUM(b.attributed_units_ordered14d), 0)   AS unit_ordered,
                             ROUND(IFNULL(SUM(b.attributed_sales14d), 0), 2) AS revenue,
                             ROUND(IFNULL(SUM(b.cost), 0), 2)                AS spend
                      FROM advertising_display_campaigns_report b
                      WHERE report_date = ${report_date}
                      GROUP BY report_date),
     product_brand_data AS (SELECT pd.report_date  as report_date,
                                   pd.impression   AS pd_impression,
                                   pd.clicks       AS pd_clicks,
                                   pd.conversions  AS pd_conversions,
                                   pd.unit_ordered AS pd_unit_ordered,
                                   pd.revenue      AS pd_revenue,
                                   pd.spend        AS pd_spend,
                                   bd.impression   AS bd_impression,
                                   bd.clicks       AS bd_clicks,
                                   bd.conversions  AS bd_conversions,
                                   bd.revenue      AS bd_revenue,
                                   bd.spend        AS bd_spend,
                                   bd.unit_ordered AS bd_unit_ordered
                            FROM product_data pd
                                     LEFT OUTER JOIN brands_data bd
                                                     ON pd.report_date = bd.report_date
                            UNION
                            SELECT bd.report_date  as report_date,
                                   pd.impression   AS pd_impression,
                                   pd.clicks       AS pd_clicks,
                                   pd.conversions  AS pd_conversions,
                                   pd.unit_ordered AS pd_unit_ordered,
                                   pd.revenue      AS pd_revenue,
                                   pd.spend        AS pd_spend,
                                   bd.impression   AS bd_impression,
                                   bd.clicks       AS bd_clicks,
                                   bd.conversions  AS bd_conversions,
                                   bd.revenue      AS bd_revenue,
                                   bd.spend        AS bd_spend,
                                   bd.unit_ordered AS bd_unit_ordered
                            FROM product_data pd
                                     RIGHT OUTER JOIN brands_data bd
                                                      ON bd.report_date = pd.report_date),
     all_api_data AS (SELECT pbd.*,
                             dd.impression   AS dd_impression,
                             dd.clicks       AS dd_clicks,
                             dd.conversions  AS dd_conversions,
                             dd.unit_ordered AS dd_unit_ordered,
                             dd.revenue      AS dd_revenue,
                             dd.spend        AS dd_spend
                      FROM product_brand_data pbd
                               LEFT OUTER JOIN display_data dd
                                               ON pbd.report_date = dd.report_date
                      UNION
                      SELECT dd.report_date,
                             pbd.pd_impression,
                             pbd.pd_clicks,
                             pbd.pd_conversions,
                             pbd.pd_unit_ordered,
                             pbd.pd_revenue,
                             pbd.pd_spend,
                             pbd.bd_impression,
                             pbd.bd_clicks,
                             pbd.bd_conversions,
                             pbd.bd_revenue,
                             pbd.bd_spend,
                             pbd.bd_unit_ordered,
                             dd.impression   AS dd_impression,
                             dd.clicks       AS dd_clicks,
                             dd.conversions  AS dd_conversions,
                             dd.unit_ordered AS dd_unit_ordered,
                             dd.revenue      AS dd_revenue,
                             dd.spend        AS dd_spend
                      FROM product_brand_data pbd
                               RIGHT OUTER JOIN display_data dd
                                                ON pbd.report_date = dd.report_date),
     api_partial_aggregated_data AS (SELECT base.report_date                  as report_date,
                                            COALESCE(base.pd_impression, 0) + COALESCE(base.dd_impression, 0) +
                                            COALESCE(base.bd_impression, 0)   as impression,
                                            COALESCE(base.pd_clicks, 0) + COALESCE(base.dd_clicks, 0) +
                                            COALESCE(base.bd_clicks, 0)       as clicks,
                                            COALESCE(base.pd_conversions, 0) + COALESCE(base.dd_conversions, 0) +
                                            COALESCE(base.bd_conversions, 0)  as conversions,
                                            COALESCE(base.pd_unit_ordered, 0) +
                                            COALESCE(base.dd_unit_ordered, 0) as unit_ordered,
                                            COALESCE(base.pd_revenue, 0) + COALESCE(base.dd_revenue, 0) +
                                            COALESCE(base.bd_revenue, 0)      as revenue,
                                            COALESCE(base.pd_spend, 0) + COALESCE(base.dd_spend, 0) +
                                            COALESCE(base.bd_spend, 0)        as spend,
                                            COALESCE(base.pd_spend, 0)        as product_spend,
                                            COALESCE(base.dd_spend, 0)        as display_spend,
                                            COALESCE(base.bd_spend, 0)        as brand_spend,
                                            COALESCE(base.pd_revenue, 0)      as product_revenue,
                                            COALESCE(base.dd_revenue, 0)      as display_revenue,
                                            COALESCE(base.bd_revenue, 0)      as brand_revenue
                                     FROM all_api_data base),
     api_aggregated_data AS (SELECT base.*,
                                    ROUND(base.spend / base.unit_ordered, 2)  as CPO,
                                    ROUND(base.spend / base.clicks, 2)        as CPC,
                                    ROUND(base.revenue / base.spend, 2)       as ROAS,
                                    ROUND(base.spend / base.revenue, 2)       as ACoS,
                                    ROUND(base.spend / base.revenue * 100, 2) as ACoS_percentage
                             FROM api_partial_aggregated_data as base),
     manual_data AS (SELECT amr.report_date       as report_date,
                            SUM(amr.impression)   as impression,
                            SUM(amr.clicks)       as clicks,
                            SUM(amr.unit_ordered) as unit_ordered,
                            SUM(amr.revenue)      as revenue,
                            SUM(amr.spend)        as spend,
                            SUM(ACoS)             as ACoS,
                            SUM(ROAS)             as ROAS,
                            SUM(CPC)              as CPC,
                            SUM(ACoS_percentage)  as ACoS_percentage,
                            SUM(CPO)              as CPO,
                            SUM(product_spend)    as product_spend,
                            SUM(brand_spend)      as brand_spend,
                            SUM(display_spend)    as display_spend,
                            SUM(product_revenue)  as product_revenue,
                            SUM(brand_revenue)    as brand_revenue,
                            SUM(display_revenue)  as display_revenue
                     FROM ads_manual_aggregated amr
                     WHERE report_date = ${report_date}
                     GROUP BY report_date),
     all_aggregated AS (SELECT COALESCE(api.report_date, manual.report_date) as                          report_date,
                               GREATEST(COALESCE(manual.impression, 0), COALESCE(api.impression, 0))     impressions,
                               GREATEST(COALESCE(manual.clicks, 0), COALESCE(api.clicks, 0))             clicks,
                               GREATEST(COALESCE(manual.unit_ordered, 0), COALESCE(api.unit_ordered, 0)) unit_ordered,
                               GREATEST(COALESCE(manual.revenue, 0), COALESCE(api.revenue, 0))           revenue,
                               GREATEST(COALESCE(manual.spend, 0), COALESCE(api.spend, 0))               spend,
                               GREATEST(COALESCE(manual.ACoS, 0), COALESCE(api.ACoS, 0))                 ACoS,
                               GREATEST(COALESCE(manual.ROAS, 0), COALESCE(api.ROAS, 0))                 ROAS,
                               GREATEST(COALESCE(manual.CPC, 0), COALESCE(api.CPC, 0))                   CPC,
                               GREATEST(COALESCE(manual.ACoS_percentage, 0),
                                        COALESCE(api.ACoS_percentage, 0))                                ACoS_percentage,
                               GREATEST(COALESCE(manual.CPO, 0), COALESCE(api.CPO, 0))                   CPO,
                               GREATEST(COALESCE(api.conversions, 0), 0)                                 conversions,
                               GREATEST(COALESCE(manual.product_spend, 0),
                                        COALESCE(api.product_spend, 0))                                  product_spend,
                               GREATEST(COALESCE(manual.brand_spend, 0), COALESCE(api.brand_spend, 0))   brand_spend,
                               GREATEST(COALESCE(manual.display_spend, 0),
                                        COALESCE(api.display_spend, 0))                                  display_spend,
                               GREATEST(COALESCE(manual.product_revenue, 0),
                                        COALESCE(api.product_revenue, 0))                                product_revenue,
                               GREATEST(COALESCE(manual.brand_revenue, 0),
                                        COALESCE(api.brand_revenue, 0))                                  brand_revenue,
                               GREATEST(COALESCE(manual.display_revenue, 0),
                                        COALESCE(api.display_revenue, 0))                                display_revenue
                        FROM api_aggregated_data api
                                 LEFT OUTER JOIN manual_data manual ON api.report_date = manual.report_date
                        UNION
                        SELECT COALESCE(manual.report_date, api.report_date) as                          report_date,
                               GREATEST(COALESCE(manual.impression, 0), COALESCE(api.impression, 0))     impressions,
                               GREATEST(COALESCE(manual.clicks, 0), COALESCE(api.clicks, 0))             clicks,
                               GREATEST(COALESCE(manual.unit_ordered, 0), COALESCE(api.unit_ordered, 0)) unit_ordered,
                               GREATEST(COALESCE(manual.revenue, 0), COALESCE(api.revenue, 0))           revenue,
                               GREATEST(COALESCE(manual.spend, 0), COALESCE(api.spend, 0))               spend,
                               GREATEST(COALESCE(manual.ACoS, 0), COALESCE(api.ACoS, 0))                 ACoS,
                               GREATEST(COALESCE(manual.ROAS, 0), COALESCE(api.ROAS, 0))                 ROAS,
                               GREATEST(COALESCE(manual.CPC, 0), COALESCE(api.CPC, 0))                   CPC,
                               GREATEST(COALESCE(manual.ACoS_percentage, 0),
                                        COALESCE(api.ACoS_percentage, 0))                                ACoS_percentage,
                               GREATEST(COALESCE(manual.CPO, 0), COALESCE(api.CPO, 0))                   CPO,
                               GREATEST(COALESCE(api.conversions, 0), 0)                                 conversions,
                               GREATEST(COALESCE(manual.product_spend, 0),
                                        COALESCE(api.product_spend, 0))                                  product_spend,
                               GREATEST(COALESCE(manual.brand_spend, 0), COALESCE(api.brand_spend, 0))   brand_spend,
                               GREATEST(COALESCE(manual.display_spend, 0),
                                        COALESCE(api.display_spend, 0))                                  display_spend,
                               GREATEST(COALESCE(manual.product_revenue, 0),
                                        COALESCE(api.product_revenue, 0))                                product_revenue,
                               GREATEST(COALESCE(manual.brand_revenue, 0),
                                        COALESCE(api.brand_revenue, 0))                                  brand_revenue,
                               GREATEST(COALESCE(manual.display_revenue, 0),
                                        COALESCE(api.display_revenue, 0))                                display_revenue
                        FROM api_aggregated_data api
                                 RIGHT OUTER JOIN manual_data manual
                                                  ON api.report_date = manual.report_date)
SELECT report_date,
       revenue,
       spend,
       WEEK(report_date)  as week,
       YEAR(report_date)  as year,
       MONTH(report_date) as month
FROM all_aggregated;
    `);
    if (result.length > 0) {
      return result[0];
    }
    return null;
  }

  async updateTotalSpendRevenueDaily(date: Date, client: PrismaVendoBrand, brandId: number) {
    const reportDate = date.toISOString().split('T')[0];
    const availableData = await this.commerceDb.allBrandsSum.findFirst({
      where: {
        date: new Date(reportDate),
        brandsId: brandId,
      },
    });
    const newData = await this.calculateTotalSpendRevenueDaily(date, client);
    if (!newData) return;
    if (availableData) {
      await this.commerceDb.allBrandsSum.update({
        where: {
          id: availableData.id,
        },
        data: {
          ...availableData,
          spend: newData.spend,
          revenue: newData.revenue,
        },
      });
      return;
    }
    await this.commerceDb.allBrandsSum.create({
      data: {
        revenue: newData.revenue,
        spend: newData.spend,
        date: newData.report_date,
        brandsId: brandId,
        year: Number(newData.year),
        month: Number(newData.month),
        sale: 0,
        week: Number(newData.week),
      },
    });
  }
}
