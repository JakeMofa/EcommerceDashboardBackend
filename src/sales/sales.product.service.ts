import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { VendoBrandDBService } from '../prisma.service';
import { AdvertisingService } from 'src/advertising/advertising.service';
import * as _ from 'lodash';
import { isSKU, calculateAmazonTacos } from 'src/utils/sales.util';
import { PaginationOptions } from 'src/middlewares/pagination.middleware';
@Injectable()
export class SalesProductService {
  constructor(private branddb: VendoBrandDBService, private adService: AdvertisingService) {}
  async getSalesByProductCount(years: string, weeks: string, searchText: string): Promise<{ total_asin: number }> {
    return await this.branddb.client.$queryRawUnsafe(`
    select count(distinct abr.astr_child_asin) as total_asin from asin_business_report as abr WHERE abr.astr_year IN (${years})
                 AND abr.astr_week IN (${weeks})
                 AND (
                            ${
                              searchText
                                ? `abr.astr_child_asin LIKE '%${searchText}%' OR abr.astr_tilte LIKE '%${searchText}%' OR abr.astr_parent_asin LIKE '%${searchText}%' OR abr.astr_listing_sku LIKE '%${searchText}%'`
                                : '1=1'
                            }
                      )
                 `);
  }

  async getSalesByProduct(
    years: string,
    weeks: string,
    brandId: string,
    pagination: PaginationOptions,
    searchText: string | null = null,
  ) {
    try {
      const offset = (pagination.page - 1) * pagination.limit;
      const salesByProductData: any[] = await this.branddb.client.$queryRawUnsafe(`
      with asins as (select distinct abr.astr_child_asin as child_asin
               from asin_business_report as abr
               WHERE abr.astr_year IN (${years})
                 AND abr.astr_week IN (${weeks})
                 AND (
                            ${
                              searchText
                                ? `abr.astr_child_asin LIKE '%${searchText}%' OR abr.astr_tilte LIKE '%${searchText}%' OR abr.astr_parent_asin LIKE '%${searchText}%' OR abr.astr_listing_sku LIKE '%${searchText}%'`
                                : '1=1'
                            }
                      )
               order by ${productColumnMapping[pagination.orderBy]} ${pagination.order}
               limit ${pagination.limit}
               OFFSET ${offset})
select astr_child_asin                                 AS child_asin,
       min(astr_parent_asin)                           AS parent_asin,
       min(astr_listing_sku)                           AS sku,
       COALESCE(NULLIF(abr.astr_tilte, ''), cpd.product_title) AS title,
       astr_week                                       AS week,
       astr_year                                       AS year,
       SUM(astr_units_ordered)                         AS total_ordered_units,
       ROUND(SUM(ordered_product_sales), 2)            AS total_ordered_product_sales,
       ROUND(SUM(astr_buy_box_percentage), 2)          AS sum_buy_box_percentage,
       ROUND(AVG(astr_buy_box_percentage), 2)          AS avg_buy_box_percentage,
       ROUND(AVG(unit_session_percentage), 2)          AS avg_unit_session_percentage,
       ROUND(SUM(unit_session_percentage), 2)          AS sum_unit_session_percentage,
       SUM(astr_sessions)                              AS total_session,
       SUM(browser_sessions)                           AS browser_sessions,
       SUM(mobile_app_sessions)                        AS mobile_app_sessions,
       SUM(astr_page_views)                            AS total_page_views,
       SUM(browser_page_views)                         AS total_browser_page_views,
       SUM(mobile_app_page_views)                      AS total_mobile_app_page_views,
       ROUND(AVG(astr_session_percentage), 2)          AS avg_session_percentage,
       ROUND(SUM(astr_session_percentage), 2)          AS sum_session_percentage,
       SUM(total_order_items)                          AS total_order_items,
       ROUND(AVG(astr_page_view_percentage), 2)        AS avg_page_view_percentage,
       ROUND(AVG(browser_page_views_percentage), 2)    AS avg_browser_page_views_percentage,
       ROUND(AVG(mobile_app_page_views_percentage), 2) AS avg_mobile_app_page_views_percentage,
       ROUND(SUM(astr_page_view_percentage), 2)        AS sum_page_view_percentage,
       ROUND(SUM(browser_page_views_percentage), 2)    AS sum_browser_page_views_percentage,
       ROUND(SUM(mobile_app_page_views_percentage), 2) AS sum_mobile_app_page_views_percentage,
       ROUND(SUM(browser_session_percentage), 2)       AS sum_browser_session_percentage,
       ROUND(SUM(mobile_app_session_percentage), 2)    AS sum_mobile_app_session_percentage,
       ROUND(AVG(browser_session_percentage), 2)       AS avg_browser_session_percentage,
       ROUND(AVG(mobile_app_session_percentage), 2)    AS avg_mobile_app_session_percentage

from asins
         left join asin_business_report as abr on abr.astr_child_asin = asins.child_asin and abr.astr_year IN (${years})
    AND abr.astr_week IN (${weeks})
                    left join vendo_commerce.category_product_data as cpd on cpd.brandId=${brandId} and abr.astr_child_asin = cpd.asin
group by astr_week, astr_year,astr_child_asin;


      `);
      const asins = _.uniq(_.map(salesByProductData, 'child_asin'));
      const asinAdvertisingData = await this.adService.getRevenuePerAsin({ weeks, years, child_asins: asins });
      const salesByProductWeekList = _.map(salesByProductData, (spd) => {
        const correspondingAd = _.find(asinAdvertisingData, {
          asin: spd.child_asin,
          week: spd.week,
          year: spd.year,
        });
        const tacos = calculateAmazonTacos(correspondingAd?.spend, spd.total_ordered_product_sales);
        const mergedData = correspondingAd
          ? {
              ...spd,
              ..._.pick(correspondingAd, ['spend', 'revenue']),
              ...(isSKU(spd.sku) ? {} : _.pick(correspondingAd, ['sku'])),
              tacos,
            }
          : {
              ...spd,
              ...(isSKU(spd.sku) ? {} : _.pick(correspondingAd, ['sku'])),
            };

        return mergedData;
      });
      const yearList = years.split(',');
      const weekList = weeks.split(',');

      const salesByProductWeekListWithTotal = _(salesByProductWeekList)
        .groupBy('child_asin')
        .mapValues((items, childAsin) => {
          const allCombinations = _.flatMap(yearList, (year) =>
            weekList.map((week) => ({
              year,
              week,
              child_asin: childAsin,
              title: _.get(_.find(items, { child_asin: childAsin }), 'title', '-'),
              sku: isSKU(_.get(_.find(items, { child_asin: childAsin }), 'sku'))
                ? _.get(_.find(items, { child_asin: childAsin }), 'sku')
                : _.get(_.find(asinAdvertisingData, { asin: childAsin }), 'sku', '-'),
            })),
          );

          const completeItems = _.map(allCombinations, (combination) => {
            const foundItem = _.find(items, { week: +combination.week, year: +combination.year });
            return (
              foundItem || {
                child_asin: combination.child_asin,
                title: combination.title,
                sku: combination.sku,
                week: +combination.week,
                year: +combination.year,
                total_ordered_units: null,
                total_ordered_product_sales: null,
                sum_buy_box_percentage: null,
                avg_buy_box_percentage: null,
                avg_unit_session_percentage: null,
                sum_unit_session_percentage: null,
                total_session: null,
                browser_sessions: null,
                mobile_app_sessions: null,
                total_page_views: null,
                total_browser_page_views: null,
                total_mobile_app_page_views: null,
                avg_session_percentage: null,
                sum_session_percentage: null,
                total_order_items: null,
                avg_page_view_percentage: null,
                avg_browser_page_views_percentage: null,
                avg_mobile_app_page_views_percentage: null,
                sum_page_view_percentage: null,
                sum_browser_page_views_percentage: null,
                sum_mobile_app_page_views_percentage: null,
                sum_browser_session_percentage: null,
                sum_mobile_app_session_percentage: null,
                avg_browser_session_percentage: null,
                avg_mobile_app_session_percentage: null,
                tacos: null,
                revenue: null,
                spend: null,
              }
            );
          });

          const totalRevenue = _.sumBy(completeItems, (item) => (_.isNumber(item.revenue) ? item.revenue : 0));
          const totalSpend = _.sumBy(completeItems, (item) => (_.isNumber(item.spend) ? item.spend : 0));
          const totalSales = _.sumBy(completeItems, (item) =>
            _.isNumber(item.total_ordered_product_sales) ? item.total_ordered_product_sales : 0,
          );
          const tacos = calculateAmazonTacos(totalSpend, totalSales + totalRevenue);

          return {
            child_asin: childAsin,
            data: completeItems,
            total: {
              tacos,
              totalSales,
              totalRevenue,
              totalSpend,
            },
          };
        })
        .values()
        .value();

      return salesByProductWeekListWithTotal;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }
}

const productColumnMapping = {
  total_ordered_units: 'astr_units_ordered',
  total_ordered_product_sales: 'ordered_product_sales',
  sum_buy_box_percentage: 'astr_buy_box_percentage',
  avg_buy_box_percentage: 'astr_buy_box_percentage',
  avg_unit_session_percentage: 'unit_session_percentage',
  sum_unit_session_percentage: 'unit_session_percentage',
  total_session: 'astr_sessions',
  browser_sessions: 'browser_sessions',
  mobile_app_sessions: 'mobile_app_sessions',
  total_page_views: 'astr_page_views',
  total_browser_page_views: 'browser_page_views',
  total_mobile_app_page_views: 'mobile_app_page_views',
  avg_session_percentage: 'astr_session_percentage',
  sum_session_percentage: 'astr_session_percentage',
  total_order_items: 'total_order_items',
  avg_page_view_percentage: 'astr_page_view_percentage',
  avg_browser_page_views_percentage: 'browser_page_views_percentage',
  avg_mobile_app_page_views_percentage: 'mobile_app_page_views_percentage',
  sum_page_view_percentage: 'astr_page_view_percentage',
  sum_browser_page_views_percentage: 'browser_page_views_percentage',
  sum_mobile_app_page_views_percentage: 'mobile_app_page_views_percentage',
  sum_browser_session_percentage: 'browser_session_percentage',
  sum_mobile_app_session_percentage: 'mobile_app_session_percentage',
  avg_browser_session_percentage: 'browser_session_percentage',
  avg_mobile_app_session_percentage: 'mobile_app_session_percentage',
};
