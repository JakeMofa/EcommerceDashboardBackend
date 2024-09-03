import { Injectable, Logger } from '@nestjs/common';
import { VendoBrandDBService } from '../prisma.service';
import dayjs from 'src/utils/date.util';
import { PaginationOptions } from 'src/middlewares/pagination.middleware';
import * as _ from 'lodash';
import { AdvertisingService } from 'src/advertising/advertising.service';
import { calculateAmazonTacos, isSKU } from 'src/utils/sales.util';
@Injectable()
export class SalesBySkuService {
  constructor(private branddb: VendoBrandDBService, private adService: AdvertisingService) {}
  logger = new Logger(SalesBySkuService.name);

  async getSalesBySkuCount(startDate: string, endDate: string, search?: string): Promise<{ total_asin: number }> {
    return this.branddb.client.$queryRawUnsafe(`
    select count(distinct astr_child_asin) as total_asin from asin_business_report WHERE astr_date >= '${startDate}'
                  AND astr_date <= '${endDate}'
                          ${
                            search != null
                              ? `AND (astr_child_asin LIKE '%${search}%' OR astr_tilte LIKE '%${search}%')`
                              : ''
                          }

                 `);
  }

  async getSalesBySkuData(
    startDate: string,
    endDate: string,
    pagination: PaginationOptions,
    brandId: string,
    searchText?: string,
  ) {
    const offset = (pagination.page - 1) * pagination.limit;

    const date = {
      startDate: dayjs(startDate).format('YYYY-MM-DD'),
      endDate: dayjs(endDate).format('YYYY-MM-DD'),
    };
    const query = (groupByasin = false) => `
        with asins as (select distinct astr_child_asin as child_asin
               from asin_business_report
               WHERE astr_date >= '${date.startDate}'
                  AND astr_date <= '${date.endDate}'
                          ${
                            searchText != null
                              ? `AND (astr_child_asin LIKE '%${searchText}%' OR astr_tilte LIKE '%${searchText}%')`
                              : ''
                          }

                  order by ${skuColumnMapping[pagination.orderBy]} ${pagination.order}
                  ${
                    groupByasin
                      ? `
                  limit ${pagination.limit}
                  OFFSET ${offset})
                  `
                      : `)`
                  }
        SELECT astr_child_asin AS child_asin,
          astr_id AS id,
          astr_date AS report_date,
          astr_child_asin AS child_asin,
          astr_parent_asin AS parent_asin,
          GROUP_CONCAT(DISTINCT astr_listing_sku SEPARATOR ',') as sku,
       COALESCE(NULLIF(abr.astr_tilte, ''), cpd.product_title) AS title,
          SUM(astr_units_ordered) AS astr_units_ordered_sum,
          SUM(ordered_product_sales) AS ordered_product_sales_sum,
          SUM(astr_buy_box_percentage) AS astr_buy_box_percentage_sum,
          SUM(unit_session_percentage) AS unit_session_percentage_sum,
          SUM(astr_sessions) AS astr_sessions_sum,
          SUM(astr_page_views) AS astr_page_views_sum,
          SUM(astr_session_percentage) AS astr_session_percentage_sum,
          SUM(total_order_items) AS total_order_items_sum,
          SUM(astr_page_view_percentage) AS astr_page_view_percentage_sum,
          AVG(astr_buy_box_percentage) AS astr_buy_box_percentage_avg,
          AVG(unit_session_percentage) AS unit_session_percentage_avg,
          ROUND(IFNULL((SUM(astr_units_ordered) / SUM(astr_sessions)) * 100, 0), 2) AS conversion_rate,
          AVG(astr_session_percentage) AS astr_session_percentage_avg,
          AVG(astr_page_view_percentage) AS astr_page_view_percentage_avg,
          (select count(distinct astr_child_asin) from asin_business_report
          WHERE astr_date >= '${date.startDate}'
                  AND astr_date <= '${date.endDate}')                          AS astr_child_asin_count
        from asins
                left join asin_business_report as abr
                on abr.astr_child_asin = asins.child_asin
                AND astr_date >= '${date.startDate}'
                  AND astr_date <= '${date.endDate}'
                left join vendo_commerce.category_product_data as cpd on cpd.brandId=${brandId} and abr.astr_child_asin = cpd.asin
        ${searchText != null ? `AND (astr_child_asin LIKE '%${searchText}%' OR astr_tilte LIKE '%${searchText}%')` : ''}
        ${groupByasin ? `group by astr_child_asin` : ``}
      `;
    const [salesBySkuData, salesBySkuTotal, adsByRange]: [salesBySkuDataArray, salesBySkuDataArray, AdReportDataArray] =
      await this.branddb.client.$transaction([
        this.branddb.client.$queryRawUnsafe<salesBySkuDataArray>(query(true)),
        this.branddb.client.$queryRawUnsafe<salesBySkuDataArray>(query()),
        this.adService.AdvertisingDataByRange({ start_date: date.startDate, end_date: date.endDate, brandId }),
      ]);
    const asins = _.uniq(_.map(salesBySkuData, 'child_asin'));

    const asinAdvertisingData = await this.adService.getRevenuePerAsinByDateRange({ ...date, asins });
    const totalAds = _.reduce(
      adsByRange,
      (acc, item) => {
        const PPCSales = item.display_revenue + item.brand_revenue + item.product_revenue;
        const PPCSpend = item.display_spend + item.brand_spend + item.product_spend;

        return {
          totalSpend: acc.totalSpend + item.spend,
          totalRevenue: acc.totalRevenue + item.revenue,
          totalDspSpend: acc.totalDspSpend + item.dsp_spend,
          totalDspRevenue: acc.totalDspRevenue + item.dsp_revenue,
          totalPPCSpend: acc.totalPPCSpend + PPCSpend,
          totalPPCRevenue: acc.totalPPCRevenue + PPCSales,
        };
      },
      { totalSpend: 0, totalRevenue: 0, totalDspSpend: 0, totalDspRevenue: 0, totalPPCSpend: 0, totalPPCRevenue: 0 },
    );

    const details = _.map(salesBySkuData, (s) => {
      const filteredAds = _(asinAdvertisingData)
        .groupBy('asin')
        .map((ads) => {
          return {
            asin: ads[0].asin,
            sku: ads[0].sku,
            revenue: _.sumBy(ads, 'revenue'),
            spend: _.sumBy(ads, 'spend'),
          };
        })
        .value();
      const ads = _.find(filteredAds, { asin: s.child_asin });
      const tacos = calculateAmazonTacos(ads?.spend, s.ordered_product_sales_sum);
      return {
        ..._.mapValues(s, (value) => (_.isNumber(value) ? value.toFixed(2) : value)),
        ..._.pick(ads, ['spend', 'revenue', 'dsp_spend', 'dsp_revenue']),
        ...(isSKU(s.sku) ? {} : _.pick(ads, ['sku'])),
        tacos: tacos,
      };
    }).sort((a, b) => {
      const tempA = a[`${pagination.orderBy}`];
      const tempB = b[`${pagination.orderBy}`];
      if (pagination.order === 'desc') return tempB - tempA;
      return tempA - tempB;
    });
    // get total revenue and spend with reduce and return an object of 2 keys
    const adsSummary = details.reduce(
      (a, b) => {
        return {
          totalSpend: (b.spend || 0) + a.totalSpend,
          totalRevenue: (b.revenue || 0) + a.totalRevenue,
        };
      },
      { totalSpend: 0, totalRevenue: 0 },
    );
    const summary = _.mapValues(salesBySkuTotal[0], (value: any) =>
      _.isNumber(value) ? value?.toFixed(2) : value?.toString(),
    );
    const tacos = calculateAmazonTacos(
      searchText ? adsSummary.totalSpend : totalAds.totalSpend,
      summary.ordered_product_sales_sum,
    );
    return {
      count: summary.astr_child_asin_count?.toString(),
      details,
      summary: {
        totalUnitOrdered: summary.astr_units_ordered_sum,
        totalSession: summary.astr_sessions_sum,
        totalPageViews: summary.astr_page_views_sum,
        totalOrderedProductSales: summary.ordered_product_sales_sum,
        avgBuyBox: summary.astr_buy_box_percentage_avg,
        avgUnitSession: summary.conversion_rate,
        totalSessionPercentage: summary.astr_session_percentage_avg,
        avgPageViewPercentage: summary.astr_page_view_percentage_avg,
        totalSkuCount: summary.astr_child_asin_count?.toString(),
        totalOrderItems: summary.total_order_items_sum?.toString(),
        revenue: searchText ? adsSummary.totalRevenue : totalAds.totalRevenue,
        spend: searchText ? adsSummary.totalSpend : totalAds.totalSpend,
        dsp_revenue: searchText ? 0 : totalAds.totalDspRevenue,
        dsp_spend: searchText ? 0 : totalAds.totalDspSpend,
        tacos,
        ppc_spend: searchText ? adsSummary.totalSpend : totalAds.totalPPCSpend,
        ppc_revenue: searchText ? adsSummary.totalRevenue : totalAds.totalPPCRevenue,
      },
    };
  }

  async getSkuGraph({ startDate, endDate, search }) {
    const sku = await this.branddb.client.asin_business_report.groupBy({
      by: ['astr_date'],
      where: {
        AND: [
          { astr_date: { gte: new Date(startDate), lte: new Date(endDate) } },
          ...(!!search
            ? [{ OR: [{ astr_tilte: { contains: search } }, { astr_child_asin: { contains: search } }] }]
            : []),
        ],
      },
      _sum: {
        astr_units_ordered: true,
        astr_buy_box_percentage: true,
        unit_session_percentage: true,
        astr_sessions: true,
        astr_page_views: true,
        astr_session_percentage: true,
        total_order_items: true,
        astr_page_view_percentage: true,
        ordered_product_sales: true,
      },
      _avg: {
        astr_buy_box_percentage: true,
        unit_session_percentage: true,
        astr_session_percentage: true,
        astr_page_view_percentage: true,
      },
      _count: {
        astr_child_asin: true,
      },
    });
    const date = {
      startDate: dayjs(startDate).format('YYYY-MM-DD'),
      endDate: dayjs(endDate).format('YYYY-MM-DD'),
    };
    const asinAdvertisingData = await this.adService.getRevenuePerAsinByDateRange(date);
    const filteredAds = _(asinAdvertisingData)
      .groupBy('report_date')
      .map((ads) => {
        const revenue = _.sumBy(ads, 'revenue');
        const spend = _.sumBy(ads, 'spend');
        return {
          report_date: ads[0].report_date,
          revenue,
          spend,
        };
      })
      .value();
    return _.map(sku, (data) => {
      const sumProps = _.mapKeys(data._sum, (value, key) => `sum_${key}`);
      const avgProps = _.mapKeys(data._avg, (value, key) => `avg_${key}`);
      const { spend = 0, revenue = 0 } = _.find(filteredAds, { report_date: data.astr_date }) || {};
      const ads = _.find(filteredAds, { report_date: data.astr_date });
      const total_sales = data?._sum?.ordered_product_sales || 0;
      const tacos = calculateAmazonTacos(ads?.spend, total_sales);

      return {
        label: data.astr_date,
        ...sumProps,
        ...avgProps,
        tacos,
        spend,
        revenue,
      };
    });
  }
}

const skuColumnMapping = {
  astr_units_ordered_sum: 'astr_units_ordered',
  ordered_product_sales_sum: 'ordered_product_sales',
  astr_buy_box_percentage_sum: 'astr_buy_box_percentage',
  unit_session_percentage_sum: 'unit_session_percentage',
  astr_sessions_sum: 'astr_sessions',
  astr_page_views_sum: 'astr_page_views',
  astr_session_percentage_sum: 'astr_session_percentage',
  total_order_items_sum: 'total_order_items',
  astr_page_view_percentage_sum: 'astr_page_view_percentage',
  astr_buy_box_percentage_avg: 'astr_buy_box_percentage',
  unit_session_percentage_avg: 'unit_session_percentage',
  astr_session_percentage_avg: 'astr_session_percentage',
  astr_page_view_percentage_avg: 'astr_page_view_percentage',
};
