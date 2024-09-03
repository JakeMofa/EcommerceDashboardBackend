import { Injectable } from '@nestjs/common';
import { VendoBrandDBService, VendoCommerceDBService } from '../prisma.service';
import dayjs from 'src/utils/date.util';
import * as _ from 'lodash';
import { Workbook } from 'exceljs';
import { totalAdsQueryByDateRange } from './totalAdsQueryByDateRange';

@Injectable()
export class AdvertisingService {
  constructor(
    private readonly brandDbService: VendoBrandDBService,
    private readonly commerceDbService: VendoCommerceDBService,
  ) {}

  async getSalesData({ weeks, years, months, search }) {
    const yearColumn = weeks ? 'astr_year' : 'Year(astr_date)';

    const sales: adsSalesDataArray = await this.brandDbService.client.$queryRawUnsafe(`
            SELECT
                ${weeks ? `astr_week AS week,` : `MONTH(astr_date) AS month,`}
                ${yearColumn} AS year,
                SUM(astr_units_ordered) AS total_ordered_units,
                ROUND(SUM(ordered_product_sales), 2) AS total_ordered_product_sales,
                SUM(total_order_items) AS total_order_items
            FROM asin_business_report
            WHERE
            ${search != null ? `AND (astr_child_asin LIKE '%${search}%' OR astr_tilte LIKE '%${search}%')` : ''}
                ${yearColumn} IN (${years}) AND
                ${months ? `MONTH(astr_date) IN (${months})` : ''}
                ${weeks ? `astr_week IN (${weeks})` : ''}
            group by ${yearColumn},
            ${weeks ? `astr_week` : `MONTH(astr_date)`}
    `);
    return sales;
  }

  async AdvertisingData({
    weeks,
    years,
    search,
    months,
    inside,
  }: {
    weeks?: string;
    years: string;
    search?: string;
    months?: string;
    inside?: boolean;
  }) {
    const dbName: Record<string, string>[] = await this.brandDbService.client.$queryRawUnsafe(`SELECT DATABASE();`);
    const brand = await this.commerceDbService.brands.findFirstOrThrow({
      where: {
        db_name: dbName[0]['DATABASE()'],
      },
    });
    const weekOrMonthAlias = weeks ? 'week' : 'month';
    const weeksOrMonthData = weeks ?? months;
    const isWeek = !!weeks;
    const monthWeekFunction = (fieldName: string) =>
      isWeek ? `ABS(RIGHT(YEARWEEK(${fieldName}, 6), 2))` : `MONTH(${fieldName})`;
    const yearFunction = (fieldName: string) =>
      isWeek ? `SUBSTR(YEARWEEK(${fieldName}, 6), 1, 4)` : `YEAR(${fieldName})`;
    const productMonthWeekFunction = isWeek ? `yearweek_week` : `yearmonth_month`;
    const productYearFunction = isWeek ? `yearweek_year` : `yearmonth_year`;
    const advRaw: AdReportDataArray = await this.brandDbService.client.$queryRawUnsafe(`
    WITH product_data AS (SELECT ${productMonthWeekFunction}   AS ${weekOrMonthAlias},
                             ${productYearFunction}                            AS year,
                             IFNULL(SUM(b.impressions), 0)                  AS impression,
                             IFNULL(SUM(b.clicks), 0)                       AS clicks,
                             IFNULL(SUM(b.attributed_conversions14d), 0)    AS conversions,
                             IFNULL(SUM(b.attributed_units_ordered14d), 0)  AS unit_ordered,
                             ROUND(IFNULL(SUM(b.attributed_sales7d), 0), 2) AS revenue,
                             ROUND(IFNULL(SUM(b.cost), 0), 2)               AS spend
                      FROM advertising_product_report b
                      WHERE ${productYearFunction} IN (${years})
                        AND ${productMonthWeekFunction} IN (${weeksOrMonthData})
                      GROUP BY ${productMonthWeekFunction},
                               ${productYearFunction}),
     dsp_api_data AS (SELECT ${productMonthWeekFunction}   AS ${weekOrMonthAlias},
                         ${productYearFunction}                            AS year,
                         ROUND(IFNULL(SUM(d.totalSales), 0), 2) AS revenue,
                         ROUND(IFNULL(SUM(d.totalCost), 0), 2)  AS spend
                  FROM vendo_commerce.dsp_data d
                  WHERE ${productYearFunction} IN (${years})
                    AND ${productMonthWeekFunction} IN (${weeksOrMonthData})
                    AND brandsId = ${brand.id}
                  GROUP BY ${productMonthWeekFunction},
                           ${productYearFunction}),
     dsp_manual_data AS (SELECT ${productMonthWeekFunction}   AS ${weekOrMonthAlias},
                         ${productYearFunction}                            AS year,
                                ROUND(IFNULL(SUM(d.sales), 0), 2) AS revenue,
                                ROUND(IFNULL(SUM(d.spend), 0), 2) AS spend
                         FROM vendo_commerce.manual_dsp_data d
                         WHERE ${productYearFunction} IN (${years})
                            AND ${productMonthWeekFunction} IN (${weeksOrMonthData})
                            AND brandsId = ${brand.id}
                         GROUP BY ${productMonthWeekFunction},
                           ${productYearFunction}),
     dsp_data AS (SELECT api_data.year                                           year,
                         api_data.${weekOrMonthAlias}                            ${weekOrMonthAlias},
                         GREATEST(COALESCE(api_data.spend, 0), COALESCE(manual_data.spend, 0))     spend,
                         GREATEST(COALESCE(api_data.revenue, 0), COALESCE(manual_data.revenue, 0)) revenue
                  FROM dsp_api_data api_data
                           LEFT OUTER JOIN dsp_manual_data manual_data
                                           ON manual_data.year = api_data.year and manual_data.${weekOrMonthAlias} = api_data.${weekOrMonthAlias}
                  UNION
                  SELECT manual_data.year                                                          year,
                         manual_data.${weekOrMonthAlias}                                           ${weekOrMonthAlias},
                         GREATEST(COALESCE(api_data.spend, 0), COALESCE(manual_data.spend, 0))     spend,
                         GREATEST(COALESCE(api_data.revenue, 0), COALESCE(manual_data.revenue, 0)) revenue
                  FROM dsp_api_data api_data
                           RIGHT OUTER JOIN dsp_manual_data manual_data
                                            ON manual_data.year = api_data.year and manual_data.${weekOrMonthAlias} = api_data.${weekOrMonthAlias}),
     brands_data AS (SELECT ${monthWeekFunction('b.report_date')}         AS ${weekOrMonthAlias},
                            ${yearFunction('b.report_date')}                              AS year,
                            IFNULL(SUM(b.impressions), 0)                    AS impression,
                            IFNULL(SUM(b.clicks), 0)                         AS clicks,
                            IFNULL(SUM(b.attributed_conversions_14d), 0)     AS conversions,
                            ROUND(IFNULL(SUM(b.attributed_sales_14d), 0), 2) AS revenue,
                            ROUND(IFNULL(SUM(b.cost), 0), 2)                 AS spend,
                            0                                                AS unit_ordered
                     FROM advertising_brands_video_campaigns_report b
                     WHERE ${yearFunction('b.report_date')} IN (${years})
                       AND ${monthWeekFunction('b.report_date')} IN (${weeksOrMonthData})
                     GROUP BY ${monthWeekFunction('b.report_date')},
                              ${yearFunction('b.report_date')}),
     display_data AS (SELECT ${monthWeekFunction('b.report_date')}        AS ${weekOrMonthAlias},
                             ${yearFunction('b.report_date')}                           AS year,
                             IFNULL(SUM(b.impressions), 0)                   AS impression,
                             IFNULL(SUM(b.clicks), 0)                        AS clicks,
                             IFNULL(SUM(b.attributed_conversions14d), 0)     AS conversions,
                             IFNULL(SUM(b.attributed_units_ordered14d), 0)   AS unit_ordered,
                             ROUND(IFNULL(SUM(b.attributed_sales14d), 0), 2) AS revenue,
                             ROUND(IFNULL(SUM(b.cost), 0), 2)                AS spend
                      FROM advertising_display_campaigns_report b
                      WHERE ${yearFunction('b.report_date')} IN (${years})
                        AND ${monthWeekFunction('b.report_date')} IN (${weeksOrMonthData})
                      GROUP BY ${monthWeekFunction('b.report_date')},
                               ${yearFunction('b.report_date')}),
     product_brand_data AS (SELECT pd.${weekOrMonthAlias}         AS ${weekOrMonthAlias},
                                   pd.year         AS year,
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
                                     LEFT OUTER JOIN brands_data bd ON pd.${weekOrMonthAlias} = bd.${weekOrMonthAlias} AND pd.year = bd.year
                            UNION
                            SELECT bd.${weekOrMonthAlias}         AS ${weekOrMonthAlias},
                                   bd.year         AS year,
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
                                     RIGHT OUTER JOIN brands_data bd ON pd.${weekOrMonthAlias} = bd.${weekOrMonthAlias} AND pd.year = bd.year),
    product_brand_dsp_data AS (SELECT pbd.*,
                                      dd.revenue as dsp_revenue,
                                      dd.spend as dsp_spend
                                  FROM product_brand_data pbd
                                      LEFT OUTER JOIN dsp_data dd ON pbd.${weekOrMonthAlias} = dd.${weekOrMonthAlias} AND pbd.year = dd.year
                                  UNION
                                  SELECT dd.${weekOrMonthAlias}         AS ${weekOrMonthAlias},
                                      dd.year         AS year,
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
                                      dd.revenue      AS dsp_revenue,
                                      dd.spend        AS dsp_spend
                                  FROM product_brand_data pbd
                                      RIGHT OUTER JOIN dsp_data dd ON pbd.${weekOrMonthAlias} = dd.${weekOrMonthAlias} AND pbd.year = dd.year),
     all_api_data AS (SELECT pbd.*,
                             dd.impression   AS dd_impression,
                             dd.clicks       AS dd_clicks,
                             dd.conversions  AS dd_conversions,
                             dd.unit_ordered AS dd_unit_ordered,
                             dd.revenue      AS dd_revenue,
                             dd.spend        AS dd_spend
                      FROM product_brand_dsp_data pbd
                               LEFT OUTER JOIN display_data dd ON pbd.${weekOrMonthAlias} = dd.${weekOrMonthAlias} AND pbd.year = dd.year
                      UNION
                      SELECT dd.${weekOrMonthAlias}         AS ${weekOrMonthAlias},
                             dd.year         AS year,
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
                             pbd.dsp_revenue,
                             pbd.dsp_spend,
                             dd.impression   AS dd_impression,
                             dd.clicks       AS dd_clicks,
                             dd.conversions  AS dd_conversions,
                             dd.unit_ordered AS dd_unit_ordered,
                             dd.revenue      AS dd_revenue,
                             dd.spend        AS dd_spend
                      FROM product_brand_dsp_data pbd
                               RIGHT OUTER JOIN display_data dd ON pbd.${weekOrMonthAlias} = dd.${weekOrMonthAlias} AND pbd.year = dd.year),
     api_partial_aggregated_data AS (SELECT base.year,
                                            base.${weekOrMonthAlias}                         AS ${weekOrMonthAlias},
                                            COALESCE(base.pd_impression, 0) + COALESCE(base.dd_impression, 0) +
                                            COALESCE(base.bd_impression, 0)   as impression,
                                            COALESCE(base.pd_clicks, 0) + COALESCE(base.dd_clicks, 0) +
                                            COALESCE(base.bd_clicks, 0)       as clicks,
                                            COALESCE(base.pd_conversions, 0) + COALESCE(base.dd_conversions, 0) +
                                            COALESCE(base.bd_conversions, 0)  as conversions,
                                            COALESCE(base.pd_unit_ordered, 0) +
                                            COALESCE(base.dd_unit_ordered, 0) as unit_ordered,
                                            COALESCE(base.pd_revenue, 0) + COALESCE(base.dd_revenue, 0) + COALESCE(base.dsp_revenue, 0) +
                                            COALESCE(base.bd_revenue, 0)      as revenue,
                                            COALESCE(base.pd_spend, 0) + COALESCE(base.dd_spend, 0) + COALESCE(base.dsp_spend, 0) +
                                            COALESCE(base.bd_spend, 0)        as spend,
                                            COALESCE(base.pd_spend, 0)        as product_spend,
                                            COALESCE(base.dd_spend, 0)        as display_spend,
                                            COALESCE(base.bd_spend, 0)        as brand_spend,
                                            COALESCE(base.dsp_spend, 0)        as dsp_spend,
                                            COALESCE(base.pd_revenue, 0)      as product_revenue,
                                            COALESCE(base.dd_revenue, 0)      as display_revenue,
                                            COALESCE(base.bd_revenue, 0)      as brand_revenue,
                                            COALESCE(base.dsp_revenue, 0)      as dsp_revenue
                                     FROM all_api_data base),
     api_aggregated_data AS (SELECT base.*,
                                    ROUND(base.spend / base.unit_ordered, 2)  as CPO,
                                    ROUND(base.spend / base.clicks, 2)        as CPC,
                                    ROUND(base.revenue / base.spend, 2)       as ROAS,
                                    ROUND(base.spend / base.revenue, 2)       as ACoS,
                                    ROUND(base.spend / base.revenue * 100, 2) as ACoS_percentage
                             FROM api_partial_aggregated_data as base),
     manual_data AS (SELECT ${monthWeekFunction('amr.report_date')}    ${weekOrMonthAlias},
                            ${yearFunction('amr.report_date')}    year,
                            SUM(amr.impression)   as impression,
                            SUM(amr.clicks)       as clicks,
                            SUM(amr.unit_ordered) as unit_ordered,
                            SUM(amr.revenue)      as revenue,
                            SUM(amr.spend)        as spend,
                            SUM(product_spend)    as product_spend,
                            SUM(brand_spend)      as brand_spend,
                            SUM(display_spend)    as display_spend,
                            0                     as dsp_spend,
                            SUM(product_revenue)  as product_revenue,
                            SUM(brand_revenue)    as brand_revenue,
                            SUM(display_revenue)  as display_revenue,
                            0                     as dsp_revenue
                     FROM ads_manual_aggregated amr
                     WHERE ${monthWeekFunction('amr.report_date')} IN (${weeksOrMonthData})
                       AND ${yearFunction('amr.report_date')} IN (${years})
                     GROUP BY ${monthWeekFunction('amr.report_date')},
                              ${yearFunction('amr.report_date')}),
     manual_acos_data AS (SELECT manual_data.*,
                                 ROUND(manual_data.spend / manual_data.revenue, 2)         as ACoS,
                                 ROUND((manual_data.spend / manual_data.revenue) * 100, 2) as ACoS_percentage,
                                 ROUND(manual_data.spend / manual_data.unit_ordered, 2)    as CPO,
                                 ROUND(manual_data.spend / manual_data.clicks, 2)          as CPC,
                                 ROUND(manual_data.revenue / manual_data.spend, 2)         as ROAS
                          FROM manual_data)
SELECT GREATEST(COALESCE(manual.${weekOrMonthAlias}, 0), COALESCE(api.${weekOrMonthAlias}, 0))                       ${weekOrMonthAlias},
       GREATEST(COALESCE(manual.year, 0), COALESCE(api.year, 0))                       year,
       GREATEST(COALESCE(manual.impression, 0), COALESCE(api.impression, 0))           impressions,
       GREATEST(COALESCE(manual.clicks, 0), COALESCE(api.clicks, 0))                   clicks,
       GREATEST(COALESCE(manual.unit_ordered, 0), COALESCE(api.unit_ordered, 0))       unit_ordered,
       GREATEST(COALESCE(manual.revenue, 0), COALESCE(api.revenue, 0))                 revenue,
       GREATEST(COALESCE(manual.spend, 0), COALESCE(api.spend, 0))                     spend,
       GREATEST(COALESCE(manual.ACoS, 0), COALESCE(api.ACoS, 0))                       ACoS,
       GREATEST(COALESCE(manual.ROAS, 0), COALESCE(api.ROAS, 0))                       ROAS,
       GREATEST(COALESCE(manual.CPC, 0), COALESCE(api.CPC, 0))                         CPC,
       GREATEST(COALESCE(manual.ACoS_percentage, 0), COALESCE(api.ACoS_percentage, 0)) ACoS_percentage,
       GREATEST(COALESCE(manual.CPO, 0), COALESCE(api.CPO, 0))                         CPO,
       GREATEST(COALESCE(api.conversions, 0), 0)                                       conversions,
       GREATEST(COALESCE(manual.product_spend, 0), COALESCE(api.product_spend, 0))     product_spend,
       GREATEST(COALESCE(manual.brand_spend, 0), COALESCE(api.brand_spend, 0))         brand_spend,
       GREATEST(COALESCE(manual.display_spend, 0), COALESCE(api.display_spend, 0))     display_spend,
       GREATEST(COALESCE(manual.dsp_spend, 0), COALESCE(api.dsp_spend, 0))             dsp_spend,
       GREATEST(COALESCE(manual.product_revenue, 0), COALESCE(api.product_revenue, 0)) product_revenue,
       GREATEST(COALESCE(manual.brand_revenue, 0), COALESCE(api.brand_revenue, 0))     brand_revenue,
       GREATEST(COALESCE(manual.display_revenue, 0), COALESCE(api.display_revenue, 0)) display_revenue,
       GREATEST(COALESCE(manual.dsp_revenue, 0), COALESCE(api.dsp_revenue, 0))         dsp_revenue
FROM api_aggregated_data api
         LEFT OUTER JOIN manual_acos_data manual ON api.${weekOrMonthAlias} = manual.${weekOrMonthAlias} AND api.year = manual.year
UNION
SELECT GREATEST(COALESCE(manual.${weekOrMonthAlias}, 0), COALESCE(api.${weekOrMonthAlias}, 0))                       ${weekOrMonthAlias},
       GREATEST(COALESCE(manual.year, 0), COALESCE(api.year, 0))                       year,
       GREATEST(COALESCE(manual.impression, 0), COALESCE(api.impression, 0))           impressions,
       GREATEST(COALESCE(manual.clicks, 0), COALESCE(api.clicks, 0))                   clicks,
       GREATEST(COALESCE(manual.unit_ordered, 0), COALESCE(api.unit_ordered, 0))       unit_ordered,
       GREATEST(COALESCE(manual.revenue, 0), COALESCE(api.revenue, 0))                 revenue,
       GREATEST(COALESCE(manual.spend, 0), COALESCE(api.spend, 0))                     spend,
       GREATEST(COALESCE(manual.ACoS, 0), COALESCE(api.ACoS, 0))                       ACoS,
       GREATEST(COALESCE(manual.ROAS, 0), COALESCE(api.ROAS, 0))                       ROAS,
       GREATEST(COALESCE(manual.CPC, 0), COALESCE(api.CPC, 0))                         CPC,
       GREATEST(COALESCE(manual.ACoS_percentage, 0), COALESCE(api.ACoS_percentage, 0)) ACoS_percentage,
       GREATEST(COALESCE(manual.CPO, 0), COALESCE(api.CPO, 0))                         CPO,
       GREATEST(COALESCE(api.conversions, 0), 0)                                       conversions,
       GREATEST(COALESCE(manual.product_spend, 0), COALESCE(api.product_spend, 0))     product_spend,
       GREATEST(COALESCE(manual.brand_spend, 0), COALESCE(api.brand_spend, 0))         brand_spend,
       GREATEST(COALESCE(manual.display_spend, 0), COALESCE(api.display_spend, 0))     display_spend,
       GREATEST(COALESCE(manual.dsp_spend, 0), COALESCE(api.dsp_spend, 0))             dsp_spend,
       GREATEST(COALESCE(manual.product_revenue, 0), COALESCE(api.product_revenue, 0)) product_revenue,
       GREATEST(COALESCE(manual.brand_revenue, 0), COALESCE(api.brand_revenue, 0))     brand_revenue,
       GREATEST(COALESCE(manual.display_revenue, 0), COALESCE(api.display_revenue, 0)) display_revenue,
       GREATEST(COALESCE(manual.dsp_revenue, 0), COALESCE(api.dsp_revenue, 0))         dsp_revenue
FROM api_aggregated_data api
         RIGHT OUTER JOIN manual_acos_data manual ON api.${weekOrMonthAlias} = manual.${weekOrMonthAlias} AND api.year = manual.year;
    `);
    const adv = advRaw.map((r) => Object.keys(r).reduce((p, c) => ({ ...p, [c]: Number(r[c]) }), {} as AdReportRecord));
    let advertisingWithMissingData = adv;
    if (!inside) {
      if (weeks) {
        const existingWeeksYears = adv.map((obj) => `${obj.year}-${obj.week}`);
        const allWeeksYears = _.flatMap(years.split(','), (year) => weeks.split(',').map((week) => `${year}-${week}`));
        const missingWeeksYears = _.difference(allWeeksYears, existingWeeksYears);
        const missingWeeks = missingWeeksYears.map((weekYear) => {
          const [year, week] = weekYear.split('-').map(Number);
          return { week, year };
        });
        const advMap = new Map(adv.map((item) => [`${item.year}-${item.week}`, item]));
        missingWeeks.forEach((item) => {
          const key = `${item.year}-${item.week}`;
          if (!advMap.has(key)) {
            advMap.set(key, {
              ...item,
              impressions: 0,
              clicks: 0,
              unitOrdered: 0,
              revenue: 0,
              spend: 0,
              ACoS: 0,
              ROAS: 0,
              CPC: 0,
              ACoSPercentage: 0,
              CPO: 0,
              conversions: 0,
              product_spend: 0,
              display_spend: 0,
              brand_spend: 0,
              product_revenue: 0,
              dsp_spend: 0,
              dsp_revenue: 0,
              display_revenue: 0,
              brand_revenue: 0,
            });
          }
        });

        advertisingWithMissingData = Array.from(advMap.values());
      } else if (months) {
        const existingMonthsYears = adv.map((obj) => `${obj.year}-${obj.month}`);
        const allMonthsYears = _.flatMap(years.split(','), (year) =>
          months.split(',').map((month) => `${year}-${month}`),
        );
        const missingMonthsYears = _.difference(allMonthsYears, existingMonthsYears);
        const missingMonths = missingMonthsYears.map((monthYear) => {
          const [year, month] = monthYear?.split('-').map(Number);
          return { month, year };
        });
        const advMap = new Map(adv.map((item) => [`${item.year}-${item.month}`, item]));
        missingMonths.forEach((item) => {
          const key = `${item.year}-${item.month}`;
          if (!advMap.has(key)) {
            advMap.set(key, {
              ...item,
              impressions: 0,
              clicks: 0,
              unitOrdered: 0,
              revenue: 0,
              spend: 0,
              ACoS: 0,
              ROAS: 0,
              CPC: 0,
              ACoSPercentage: 0,
              CPO: 0,
              conversions: 0,
              product_spend: 0,
              display_spend: 0,
              brand_spend: 0,
              dsp_spend: 0,
              dsp_revenue: 0,
              product_revenue: 0,
              display_revenue: 0,
              brand_revenue: 0,
            });
          }
        });

        // Convert the Map back to an array. This step preserves the original order of `adv`.
        advertisingWithMissingData = Array.from(advMap.values());
      }
    }

    const sales = await this.getSalesData({ weeks, years, months, search });
    const revenueData = weeks ? await this.getBrandRevenueData({ weeks, years }) : [];
    const data = advertisingWithMissingData
      .map((item) => {
        const salesData = sales.filter(
          (sale) =>
            Number(Number(sale.week) === Number(item.week) && Number(sale.year) === Number(item.year)) ||
            Number(Number(sale.month) === Number(item.month) && Number(sale.year) === Number(item.year)),
        );
        return {
          ...item,
          ...(salesData ? salesData[0] : {}),
          year: item.year,
          key: `${item.year}-${item.week || item.month}`,
        };
      })
      .map((item) => {
        const dspData = revenueData.filter((dsp) =>
          Number(dsp.week === Number(item.week) && Number(dsp.year) === Number(item.year)),
        );
        return {
          ...item,
          ...(dspData ? dspData[0] : {}),
        };
      })
      .sort((a, b) => {
        if (a.year && b.year) {
          if (a.year !== b.year) {
            return b.year - a.year;
          } else {
            if (a.week && b.week) {
              return a.week - b.week;
            } else {
              return 0;
            }
          }
        } else {
          return 0;
        }
      })
      .map((i) => {
        if (weeks) {
          return { ...i, week: i.week };
        } else {
          return { ...i, week: i.week };
        }
      });
    return {
      data,
    };
  }

  AdvertisingDataByRange({ start_date, end_date, brandId }: { start_date: string; end_date: string; brandId: string }) {
    return this.brandDbService.client.$queryRawUnsafe<AdReportDataArray>(
      totalAdsQueryByDateRange({ start_date, end_date, brandId }),
    );
  }

  async getLastWeekData() {
    return await this.AdvertisingData({
      weeks: dayjs().subtract(1, 'week').week().toString(),
      years: dayjs().year().toString(),
      inside: true,
    });
  }

  async getDataByMonth(months: string, years: string) {
    return await this.AdvertisingData({
      months,
      years,
    });
  }

  async getDataByWeek(weeks: string, years: string) {
    return await this.AdvertisingData({
      weeks,
      years,
    });
  }

  getYearToDayData() {
    const weeks = (num) => [...Array(num).keys()].map((i) => i + 1);
    return this.AdvertisingData({
      weeks: weeks(dayjs().week()).join(','),
      years: dayjs().year().toString(),
      inside: true,
    });
  }

  getKPIs(data) {
    const totalCount = data.length;
    const aCoSPercentageValue = data.reduce((sum, data) => sum + data.ACoS_percentage, 0);
    const totalCPC = data.reduce((sum, data) => sum + data.CPC, 0);
    const totalCPO = data.reduce((sum, data) => sum + data.CPO, 0);

    return {
      revenue: data.reduce((sum, data) => sum + Number(data.revenue), 0).toFixed(2),
      spend: data.reduce((sum, data) => sum + Number(data.spend), 0).toFixed(2),
      ACoS: data.reduce((sum, data) => sum + Number(data.ACoS), 0).toFixed(2),
      ACoS_percentage: aCoSPercentageValue ? parseFloat((aCoSPercentageValue / totalCount).toFixed(2)) : 0,
      CPO: totalCPO ? parseFloat((totalCPO / totalCount).toFixed(2)) : 0,
      impression: data.reduce((sum, data) => sum + Number(data.impressions), 0).toFixed(2),
      clicks: data.reduce((sum, data) => sum + Number(data.clicks), 0).toFixed(2),
      orders: data.reduce((sum, data) => sum + Number(data.total_ordered_units), 0).toFixed(2),
      CPC: totalCPC ? parseFloat((totalCPC / totalCount).toFixed(2)) : 0,
    };
  }

  async getAdvertiseData(weeks: string, years: string, search?: string) {
    const lastWeek = await this.getLastWeekData();
    const yearToDay = await this.getYearToDayData();
    const { data } = await this.AdvertisingData({ weeks, years, search, inside: true });
    const lastWeekKPIs = this.getKPIs(lastWeek.data);
    const yearToDayKPIs = this.getKPIs(yearToDay.data);
    return {
      lastWeekKPIs,
      yearToDayKPIs,
      advertisingData: data,
    };
  }

  async getTotalRevenueWeekly({ weeks, years, search }: { weeks: string; years: string; search?: string }) {
    const { data } = await this.AdvertisingData({ weeks, years, search });
    let lastYearWeekArray: { data: Record<string, any> | null }[] = [{ data: null }];
    if (weeks.includes('1')) {
      const yearArray = years.split(',').map(Number).sort();
      if (weeks.includes('52')) {
        lastYearWeekArray = [await this.AdvertisingData({ weeks: '52', years: (yearArray[0] - 1).toString() })];
      } else {
        lastYearWeekArray = await Promise.all(
          yearArray.map(async (y) => {
            return await this.AdvertisingData({ weeks: '52', years: (y - 1).toString() });
          }),
        );
      }
    }
    const brandedData: any = await this.getBrandedData(weeks, years);
    const salesData = await this.getSalesData({ weeks, years } as any);
    const createCompositeKey = (item) => `${item.week}-${item.year}`;

    const mergedSalesAds = _.sortBy(
      _.values(_.merge(_.keyBy(data, createCompositeKey), _.keyBy(salesData, createCompositeKey))),
      'year',
    );

    const result = mergedSalesAds.map((ads, i) => {
      let prevData = i !== 0 ? mergedSalesAds[i - 1] : ads;
      const lastYearWeek = lastYearWeekArray.find((ly) => ly.data?.year === ads.year);
      if (ads.week == 1 && lastYearWeek && lastYearWeek.data) {
        prevData = lastYearWeek.data[0];
      }

      const prevWeekRevenue = prevData?.['revenue'] || 0;
      const prevWeekSpend = prevData?.['spend'] || 0;
      const prevWeekOrganicSales =
        prevData?.['total_ordered_product_sales'] - prevWeekRevenue < 0
          ? 0
          : prevData?.['total_ordered_product_sales'] - prevWeekRevenue || 0;
      const prevWeekOrderedUnit = prevData?.['total_ordered_units'] || 0;
      const prevWeekDspSpend = prevData?.['dsp_spend'] || 0;
      const prevWeekDspRevenue = prevData?.['dsp_revenue'] || 0;
      const prevWeekDisplaySpend = prevData?.['display_spend'] || 0;
      const prevWeekDisplayRevenue = prevData?.['display_revenue'] || 0;
      const prevWeekProductSpend = prevData?.['product_spend'] || 0;
      const prevWeekProductRevenue = prevData?.['product_revenue'] || 0;
      const prevWeekBrandSpend = prevData?.['brand_spend'] || 0;
      const prevWeekBrandRevenue = prevData?.['brand_revenue'] || 0;

      const twRevenue = ads.revenue ?? 0;
      const twSpend = ads.spend ?? 0;
      const twDspRevenue = ads.dsp_revenue ?? 0;
      const twDspSpend = ads.dsp_spend ?? 0;
      const adChange =
        prevWeekRevenue !== 0 ? Number(((twRevenue - prevWeekRevenue) / prevWeekRevenue) * 100).toFixed(2) : 0;
      const spendChange =
        prevWeekSpend !== 0 ? Number(((twSpend - prevWeekSpend) / prevWeekSpend) * 100).toFixed(2) : 0;
      const dspRevenueChange =
        prevWeekDspRevenue !== 0
          ? Number(((twDspRevenue - prevWeekDspRevenue) / prevWeekDspRevenue) * 100).toFixed(2)
          : 0;
      const dspSpendChange =
        prevWeekDspSpend !== 0 ? Number(((twDspSpend - prevWeekDspSpend) / prevWeekDspSpend) * 100).toFixed(2) : 0;
      const totalOrganicSales = ads.total_ordered_product_sales - twRevenue;
      const totalUnitOrder = ads.total_ordered_units;
      const organicSalesChange =
        prevWeekOrganicSales !== 0
          ? Number(((totalOrganicSales - prevWeekOrganicSales) / prevWeekOrganicSales) * 100).toFixed(2)
          : 0;
      const UnitOrderChange =
        prevWeekOrderedUnit !== 0
          ? Number(((totalUnitOrder - prevWeekOrderedUnit) / prevWeekOrderedUnit) * 100).toFixed(2)
          : 0;
      const totalSales = totalOrganicSales + twRevenue;

      const restructuredBrandedData = _.flatMap(brandedData, (weeks, year) =>
        _.flatMap(weeks, (statuses, week) =>
          _.flatMap(statuses, (entries, status) => entries.map((entry) => ({ ...entry, type: status }))),
        ),
      );

      const findBrandSale = (brandData, week, year, type) =>
        brandData.find(
          (brandDataItem) =>
            Number(brandDataItem.week) === week &&
            Number(brandDataItem.year) === Number(year) &&
            brandDataItem.type === type,
        ) || {};

      const brandSaleB = findBrandSale(restructuredBrandedData, ads.week, ads.year, 'B');
      const brandSaleNB = findBrandSale(restructuredBrandedData, ads.week, ads.year, 'NB');
      const brandedSales = ads.branded_sales || brandSaleB.revenue || 0;
      const brandedSpends = ads.branded_spend || brandSaleB.spend || 0;
      const nonBrandedSales = ads.non_branded_sales || brandSaleNB.revenue || 0;
      const nonBrandedSpends = ads.non_branded_spend || brandSaleNB.spend || 0;
      const brandedRoAS = brandedSpends !== 0 ? Number(brandedSales / brandedSpends).toFixed(2) : 0;
      const nonBrandedRoAS = nonBrandedSpends !== 0 ? Number(nonBrandedSales / nonBrandedSpends).toFixed(2) : 0;
      const {
        impressions,
        clicks,
        conversions,
        CPO,
        CPC,
        ROAS,
        product_spend,
        display_spend,
        brand_spend,
        product_revenue,
        display_revenue,
        brand_revenue,
      } = ads;
      const productRoAS = product_spend !== 0 ? Number(product_revenue / product_spend).toFixed(2) : 0;
      const displayRoAS = display_spend !== 0 ? Number(display_revenue / display_spend).toFixed(2) : 0;
      const brandRoAS = brand_spend !== 0 ? Number(brand_revenue / brand_spend).toFixed(2) : 0;
      const PPCSpendLW = prevWeekProductSpend + prevWeekDisplaySpend + prevWeekBrandSpend;
      const PPCSalesLW = prevWeekProductRevenue + prevWeekDisplayRevenue + prevWeekBrandRevenue;
      const PPCSales = display_revenue + brand_revenue + product_revenue;
      const PPCSpend = display_spend + brand_spend + product_spend;
      const PPCSalesChange = PPCSalesLW !== 0 ? Number(((PPCSales - PPCSalesLW) / PPCSalesLW) * 100).toFixed(2) : 0;
      const PPCSpendChange = PPCSpendLW !== 0 ? Number(((PPCSpend - PPCSpendLW) / PPCSpendLW) * 100).toFixed(2) : 0;

      const ACoS_percentage = !!twSpend && twSpend !== 0 ? Number((twSpend / totalSales) * 100).toFixed(2) : 0;
      return {
        week: ads.week,
        year: ads.year,
        twRevenue,
        twSpend,
        dsp_revenue: twDspRevenue,
        dsp_revenue_change: dspRevenueChange,
        dsp_spend: twDspSpend,
        dsp_spend_change: dspSpendChange,
        PPCSales,
        PPCSpend,
        PPCSalesChange,
        PPCSpendChange,
        impressions,
        clicks,
        conversions,
        CPO,
        CPC,
        ROAS,
        ACoS: ACoS_percentage,
        ACoS_percentage: ACoS_percentage,
        twDspSpend,
        adChange,
        spendChange,
        organicSalesChange: Number.isNaN(Number(organicSalesChange)) || totalOrganicSales < 0 ? 0 : organicSalesChange,
        organicSales: totalOrganicSales < 0 ? 0 : totalOrganicSales,
        totalUnitOrder,
        UnitOrderChange,
        totalSales,
        brandedSales,
        brandedSpends,
        nonBrandedSales,
        nonBrandedSpends,
        brandedRoAS,
        nonBrandedRoAS,
        productRoAS,
        displayRoAS,
        brandRoAS,
        sponsoredDisplayAdSpend: display_spend,
        sponsoredDisplayAdSales: display_revenue,
        sponsoredBrandAdSpend: brand_spend,
        sponsoredBrandSales: brand_revenue,
        sponsoredProductAdSpend: product_spend,
        sponsoredProductAdSales: product_revenue,
      };
    });

    return _.sortBy(result, ['year', 'week']);
  }

  async getTotalRevenueMonthly({ months, years, search }: { months: string; years: string; search?: string }) {
    const { data } = await this.AdvertisingData({ months, years, search });

    let lastYearMonthArray: { data: Record<string, any> | null }[] = [{ data: null }];
    const yearArray = years.split(',').map(Number).sort();

    if (months.includes('1')) {
      if (months.includes('12')) {
        lastYearMonthArray = [await this.AdvertisingData({ months: '12', years: (yearArray[0] - 1).toString() })];
      } else {
        lastYearMonthArray = await Promise.all(
          yearArray.map(async (y) => {
            return await this.AdvertisingData({ months: '12', years: (y - 1).toString() });
          }),
        );
      }
    }

    const brandedData: any = await this.getBrandedData(months, years);
    const salesData = await this.getSalesData({ months, years } as any);
    const createCompositeKey = (item) => `${item.month}-${item.year}`;

    const mergedSalesAds = _.sortBy(
      _.values(_.merge(_.keyBy(data, createCompositeKey), _.keyBy(salesData, createCompositeKey))),
      'year',
    );
    const result = mergedSalesAds.map((ads, i) => {
      let prevData = i !== 0 ? mergedSalesAds[i - 1] : ads;
      const lastYearMonth = lastYearMonthArray.find((ly) => ly.data?.year === ads.year);
      if (ads.month == 1 && lastYearMonth && lastYearMonth.data) {
        prevData = lastYearMonth.data[0];
      }

      const {
        revenue: twRevenue = 0,
        spend: twSpend = 0,
        dsp_revenue: twDspRevenue = 0,
        dsp_spend: twDspSpend = 0,
        total_ordered_product_sales = 0,
        total_ordered_units = 0,
        impressions,
        clicks,
        conversions,
        CPO,
        CPC,
        ROAS,
        product_spend = 0,
        display_spend = 0,
        brand_spend = 0,
        product_revenue = 0,
        display_revenue = 0,
        brand_revenue = 0,
        branded_sales,
        branded_spend,
        non_branded_sales,
        non_branded_spend,
      } = ads;

      const prevWeekRevenue = prevData?.['revenue'] || 0;
      const prevWeekSpend = prevData?.['spend'] || 0;
      const prevWeekOrganicSales = Math.max(0, prevData?.['total_ordered_product_sales'] - prevWeekRevenue || 0);
      const prevWeekOrderedUnit = prevData?.['total_ordered_units'] || 0;
      const prevWeekDspSpend = prevData?.['dsp_spend'] || 0;
      const prevWeekDspRevenue = prevData?.['dsp_revenue'] || 0;
      const prevWeekDisplaySpend = prevData?.['display_spend'] || 0;
      const prevWeekDisplayRevenue = prevData?.['display_revenue'] || 0;
      const prevWeekProductSpend = prevData?.['product_spend'] || 0;
      const prevWeekProductRevenue = prevData?.['product_revenue'] || 0;
      const prevWeekBrandSpend = prevData?.['brand_spend'] || 0;
      const prevWeekBrandRevenue = prevData?.['brand_revenue'] || 0;

      const adChange = prevWeekRevenue ? Number(((twRevenue - prevWeekRevenue) / prevWeekRevenue) * 100).toFixed(2) : 0;
      const spendChange = prevWeekSpend ? Number(((twSpend - prevWeekSpend) / prevWeekSpend) * 100).toFixed(2) : 0;
      const dspRevenueChange = prevWeekDspRevenue
        ? Number(((twDspRevenue - prevWeekDspRevenue) / prevWeekDspRevenue) * 100).toFixed(2)
        : 0;
      const dspSpendChange = prevWeekDspSpend
        ? Number(((twDspSpend - prevWeekDspSpend) / prevWeekDspSpend) * 100).toFixed(2)
        : 0;
      const totalOrganicSales = total_ordered_product_sales - twRevenue;
      const organicSalesChange = prevWeekOrganicSales
        ? Number(((totalOrganicSales - prevWeekOrganicSales) / prevWeekOrganicSales) * 100).toFixed(2)
        : 0;
      const unitOrderChange = prevWeekOrderedUnit
        ? Number(((total_ordered_units - prevWeekOrderedUnit) / prevWeekOrderedUnit) * 100).toFixed(2)
        : 0;
      const totalSales = totalOrganicSales + twRevenue;

      const restructuredBrandedData = _(brandedData)
        .values()
        .flatMap((weekData) =>
          _(weekData)
            .values()
            .flatMap((statusData) =>
              statusData.map((entry) => ({ ...entry, type: statusData[0].branded_non_branded_status })),
            ),
        )
        .value();

      const findBrandSale = (brandData, month, year, type) =>
        brandData.find(
          (brandDataItem) =>
            Number(brandDataItem.month) === month &&
            Number(brandDataItem.year) === Number(year) &&
            brandDataItem.type === type,
        ) || {};

      const brandSaleB = findBrandSale(restructuredBrandedData, ads.week, ads.year, 'B');
      const brandSaleNB = findBrandSale(restructuredBrandedData, ads.week, ads.year, 'NB');

      const brandedSales = branded_sales || brandSaleB.revenue || 0;
      const brandedSpends = branded_spend || brandSaleB.spend || 0;
      const nonBrandedSales = non_branded_sales || brandSaleNB.revenue || 0;
      const nonBrandedSpends = non_branded_spend || brandSaleNB.spend || 0;
      const brandedRoAS = brandedSpends ? Number(brandedSales / brandedSpends).toFixed(2) : 0;
      const nonBrandedRoAS = nonBrandedSpends ? Number(nonBrandedSales / nonBrandedSpends).toFixed(2) : 0;

      const productRoAS = product_spend ? Number(product_revenue / product_spend).toFixed(2) : 0;
      const displayRoAS = display_spend ? Number(display_revenue / display_spend).toFixed(2) : 0;
      const brandRoAS = brand_spend ? Number(brand_revenue / brand_spend).toFixed(2) : 0;

      const PPCSpendLW = prevWeekProductSpend + prevWeekDisplaySpend + prevWeekBrandSpend;
      const PPCSalesLW = prevWeekProductRevenue + prevWeekDisplayRevenue + prevWeekBrandRevenue;
      const PPCSales = display_revenue + brand_revenue + product_revenue;
      const PPCSpend = display_spend + brand_spend + product_spend;
      const PPCSalesChange = PPCSalesLW ? Number(((PPCSales - PPCSalesLW) / PPCSalesLW) * 100).toFixed(2) : 0;
      const PPCSpendChange = PPCSpendLW ? Number(((PPCSpend - PPCSpendLW) / PPCSpendLW) * 100).toFixed(2) : 0;

      const ACoS_percentage = twSpend ? Number((twSpend / totalSales) * 100).toFixed(2) : 0;

      return {
        month: ads.month,
        year: ads.year,
        twRevenue,
        twSpend,
        dsp_revenue: twDspRevenue,
        dsp_revenue_change: dspRevenueChange,
        dsp_spend: twDspSpend,
        dsp_spend_change: dspSpendChange,
        PPCSales,
        PPCSpend,
        PPCSalesChange,
        PPCSpendChange,
        impressions,
        clicks,
        conversions,
        CPO,
        CPC,
        ROAS,
        ACoS: ACoS_percentage,
        ACoS_percentage: ACoS_percentage,
        twDspSpend,
        adChange,
        spendChange,
        organicSalesChange: isNaN(Number(organicSalesChange)) || totalOrganicSales < 0 ? 0 : organicSalesChange,
        organicSales: totalOrganicSales < 0 ? 0 : totalOrganicSales,
        totalUnitOrder: total_ordered_units,
        UnitOrderChange: unitOrderChange,
        totalSales,
        brandedSales,
        brandedSpends,
        nonBrandedSales,
        nonBrandedSpends,
        brandedRoAS,
        nonBrandedRoAS,
        productRoAS,
        displayRoAS,
        brandRoAS,
        sponsoredDisplayAdSpend: display_spend,
        sponsoredDisplayAdSales: display_revenue,
        sponsoredBrandAdSpend: brand_spend,
        sponsoredBrandSales: brand_revenue,
        sponsoredProductAdSpend: product_spend,
        sponsoredProductAdSales: product_revenue,
      };
    });
    return _.sortBy(result, ['year', 'month']);
  }

  async getBrandedData(weeks, years) {
    const brandedData: any[] = await this.brandDbService.client.$queryRawUnsafe(`
WITH api as (SELECT ANY_VALUE(sq.report_date)         as report_date,
                    sq.branded_non_branded_status,
                    sq.week,
                    sq.year,
                    ROUND(IFNULL(SUM(sq.revenue), 0)) as revenue,
                    ROUND(IFNULL(SUM(sq.spend), 0))   as spend
             FROM (SELECT ANY_VALUE(report_date)                        as report_date,
                          branded_non_branded_status,
                          yearweek_week                                 AS week,
                          yearweek_year                                 AS year,
                          ROUND(IFNULL(SUM(attributed_sales14d), 0), 2) AS revenue,
                          ROUND(IFNULL(SUM(cost), 0), 2)                AS spend
                   FROM advertising_product_report
                   WHERE advertising_product_report.yearweek_year IN (${years})
                     AND advertising_product_report.yearweek_week IN (${weeks})
                     AND branded_non_branded_status IS NOT NULL
                     AND branded_non_branded_status != ' '

                   GROUP BY yearweek_week,
                            yearweek_year,
                            branded_non_branded_status

                   UNION

                   SELECT ANY_VALUE(report_date)                        as report_date,
                          branded_non_branded_status,
                          WEEK(report_date, 6)                          AS week,
                          YEAR(report_date)                             AS year,
                          ROUND(IFNULL(SUM(attributed_sales14d), 0), 2) AS revenue,
                          ROUND(IFNULL(SUM(cost), 0), 2)                AS spend
                   FROM advertising_display_campaigns_report
                   WHERE YEAR(report_date) IN (${years})
                     AND WEEK(report_date, 6) IN (${weeks})
                     AND branded_non_branded_status IS NOT NULL
                     AND branded_non_branded_status != ' '

                   GROUP BY WEEK(report_date, 6),
                            YEAR(report_date),
                            branded_non_branded_status

                   UNION

                   SELECT ANY_VALUE(report_date)                         as report_date,
                          branded_non_branded_status,
                          WEEK(report_date, 6)                           AS week,
                          YEAR(report_date)                              AS year,
                          ROUND(IFNULL(SUM(attributed_sales_14d), 0), 2) AS revenue,
                          ROUND(IFNULL(SUM(cost), 0), 2)                 AS spend
                   FROM advertising_brands_video_campaigns_report
                   WHERE YEAR(report_date) IN (${years})
                     AND WEEK(report_date, 6) IN (${weeks})
                     AND branded_non_branded_status IS NOT NULL
                     AND branded_non_branded_status != ' '

                   GROUP BY WEEK(report_date, 6),
                            YEAR(report_date),
                            branded_non_branded_status) sq
             GROUP BY sq.branded_non_branded_status, sq.week, sq.year),

     manual as (SELECT ANY_VALUE(report_date)        as report_date,
                       'B'                           as branded_non_branded_status,
                       year(report_date)             as year,
                       WEEK(report_date, 6)          as week,
                       ROUND(SUM(total_sales_7d), 2) as revenue,
                       ROUND(SUM(spend), 2)          as spend
                FROM advertising_manual_report
                WHERE YEAR(report_date) IN (${years})
                  AND WEEK(report_date, 6) IN (${weeks})
                  AND campaign_name LIKE '%| B |%'
                GROUP BY year(report_date), WEEK(report_date, 6)

                UNION

                SELECT ANY_VALUE(report_date)        as report_date,
                       'NB'                          as branded_non_branded_status,
                       year(report_date)             as year,
                       WEEK(report_date, 6)          as week,
                       ROUND(SUM(total_sales_7d), 2) as revenue,
                       ROUND(SUM(spend), 2)          as spend
                FROM advertising_manual_report
                WHERE YEAR(report_date) IN (${years})
                  AND WEEK(report_date, 6) IN (${weeks})
                  AND campaign_name LIKE '%NB%'
                GROUP BY year(report_date), WEEK(report_date, 6))
SELECT api.report_date                as report_date,
       api.branded_non_branded_status as branded_non_branded_status,
       api.week                       as week,
       api.year                       as year,
       CASE
           WHEN api.revenue > COALESCE(manual.revenue, 0) THEN api.revenue
           ELSE COALESCE(manual.revenue, api.revenue)
           END                        as revenue,
       CASE
           WHEN api.spend > COALESCE(manual.spend, 0) THEN api.spend
           ELSE COALESCE(manual.spend, api.spend)
           END                        as spend
FROM api
         LEFT OUTER JOIN manual ON api.branded_non_branded_status = manual.branded_non_branded_status AND
                                   api.week = manual.week AND api.year = manual.year

UNION

SELECT manual.report_date                as report_date,
       manual.branded_non_branded_status as branded_non_branded_status,
       manual.week                       as week,
       manual.year                       as year,
       CASE
           WHEN api.revenue > COALESCE(manual.revenue, 0) THEN api.revenue
           ELSE COALESCE(manual.revenue, api.revenue)
           END                           as revenue,
       CASE
           WHEN api.spend > COALESCE(manual.spend, 0) THEN api.spend
           ELSE COALESCE(manual.spend, api.spend)
           END                           as spend
FROM api
         RIGHT OUTER JOIN manual ON api.branded_non_branded_status = manual.branded_non_branded_status AND
                                    api.week = manual.week AND api.year = manual.year;
    `);

    return _(brandedData)
      .groupBy('year')
      .mapValues((yearData) =>
        _(yearData)
          .groupBy('week')
          .mapValues((weekData) => _.groupBy(weekData, 'branded_non_branded_status'))
          .value(),
      )
      .value();
  }

  async getBrandRevenueData({ weeks, years }): Promise<BrandRevenueDataArray> {
    const count = await this.brandDbService.client.advertising_revenue_data.count();
    if (count > 0) {
      return this.brandDbService.client.$queryRawUnsafe(`
        SELECT week,
                year,
                spend,
                week_name,
                total_sales as total_ordered_product_sales,
                organic_sales,
                ad_revenue as revenue,
                impression,
                clicks,
                total_units_orders as unit_ordered,
                branded_spend,
                branded_sales,
                non_branded_spend,
                non_branded_sales
          FROM (SELECT week,
                      year,
                      week_name,
                      spend,
                      total_sales,
                      organic_sales,
                      ad_revenue,
                      impression,
                      clicks,
                      total_units_orders,
                      branded_spend,
                      branded_sales,
                      non_branded_spend,
                      non_branded_sales
                FROM advertising_revenue_data
                WHERE year IN (${years})
                  AND week IN (${weeks})) subquery
          GROUP BY week;
      `) as Promise<any[]>;
    }
    return [];
  }

  rowToArray(columns, row) {
    return columns.map((column) => {
      return Number(
        row
          .getCell(column.key)
          ?.value?.toString()
          ?.replace(/[^0-9\.]/g, '') || '',
      );
    });
  }

  async getTotalSales(year, week) {
    const aggregations = await this.brandDbService.client.asin_business_report.aggregate({
      _sum: {
        ordered_product_sales: true,
      },
      where: {
        astr_year: {
          equals: year,
        },
        astr_week: {
          equals: week,
        },
      },
    });

    return aggregations._sum.ordered_product_sales;
  }

  async importAdvertisingData(brandId: number, file: Express.Multer.File) {
    const workbook = new Workbook();
    await workbook.xlsx.load(file.buffer);

    const sheet = workbook.getWorksheet(1);
    sheet.columns = [
      { header: 'Year', key: 'year' },
      { header: 'Week', key: 'week' },
      { header: 'AD Spend', key: 'ad_spend' },
      { header: 'Ad Revenue', key: 'ad_revenue' },
      { header: 'DSP Spend', key: 'dsp_spend' },
      { header: 'DSP Revenue', key: 'dsp_revenue' },
      { header: 'Impressions ', key: 'impressions' },
      { header: 'Clicks', key: 'clicks' },
      { header: 'Total Orders', key: 'total_orders' },
      { header: 'B Spend', key: 'b_spend' },
      { header: 'B Sales', key: 'b_sales' },
      { header: 'NB Spend', key: 'nb_spend' },
      { header: 'NB Sales', key: 'nb_sales' },
    ];

    let success = 0;
    for (let rowIndex = 2; rowIndex <= sheet.rowCount; rowIndex++) {
      const row = sheet.getRow(rowIndex);
      const [
        year,
        week,
        adSpend,
        adRevenue,
        dspSpend,
        dspRevenue,
        impressions,
        clicks,
        totalOrders,
        bSpend,
        bSales,
        nbSpend,
        nbSales,
      ] = this.rowToArray(sheet.columns, row);

      if (year > 0 && week > 0) {
        const totalSales = (await this.getTotalSales(year, week)) || 0;

        const data = {
          spend: adSpend,
          total_sales: totalSales,
          organic_sales: totalSales - adRevenue,
          ad_revenue: adRevenue,
          impression: impressions,
          clicks: clicks,
          total_units_orders: totalOrders,
          branded_spend: bSpend,
          branded_sales: bSales,
          non_branded_spend: nbSpend,
          non_branded_sales: nbSales,
          dsp_spend: dspSpend,
          dsp_sales: dspRevenue,
        };

        const adData = await this.brandDbService.client.advertising_revenue_data.findFirst({
          where: {
            year: year.toString(),
            week: week.toString(),
          },
        });

        if (adData) {
          await this.brandDbService.client.advertising_revenue_data.update({
            where: {
              id: adData.id,
            },
            data: {
              ...data,
              updated_at: new Date().getTime(),
            },
          });
        } else {
          await this.brandDbService.client.advertising_revenue_data.create({
            data: {
              ...data,
              year: year.toString(),
              week: week.toString(),
              week_name: `WK${week}`,
              created_at: new Date().getTime(),
              updated_at: new Date().getTime(),
            },
          });
        }
        success = success + 1;
      }
    }

    return { message: `Successfully imported ${success} rows.` };
  }

  async getTotalRevenueSpend({ weeks, months, years }: { weeks?: string; years: string; months?: string }): Promise<{
    revenue: number;
    spend: number;
  }> {
    const { data } = await this.AdvertisingData({ weeks, years, months });
    return data.reduce(
      (sums, obj) => {
        if (obj.revenue && obj.spend) {
          sums.revenue += obj.revenue;
          sums.spend += obj.spend;
        }
        return sums;
      },
      { revenue: 0, spend: 0 },
    );
  }

  async getRevenuePerAsin({
    weeks,
    months,
    years,
    child_asins = [],
    skus = [],
  }: {
    weeks?: string;
    years: string;
    months?: string;
    skus?: string[];
    child_asins?: string[];
  }): Promise<any[]> {
    const yearTitle = weeks ? 'yearweek_year' : 'yearmonth_year';
    const periodTitle = weeks ? 'yearweek_week' : 'yearmonth_month';
    const period = weeks ? 'week' : 'month';
    const conditions: string[] = [];

    if (child_asins.length > 0) {
      conditions.push(`asin IN (${child_asins.map((asin) => `'${asin}'`).join(',')})`);
    }
    if (skus.length > 0) {
      conditions.push(`sku IN (${skus.map((sku) => `'${sku}'`).join(',')})`);
    }
    return await this.brandDbService.client.$queryRawUnsafe(`
    SELECT
      ${periodTitle} as ${period},
      ${yearTitle} AS year,
      asin,
      min(sku) as sku,

      ROUND(IFNULL(SUM(b.attributed_sales7d), 0), 2) AS revenue,
      ROUND(IFNULL(SUM(b.cost), 0), 2) AS spend
    FROM
      advertising_product_report b
    WHERE
      ${yearTitle} IN (${years})
      AND ${months ? `yearmonth_month IN (${months})` : ''}
      ${weeks ? `yearweek_week IN (${weeks})` : ''}
      AND (
        ${conditions.length ? `${conditions.join(' OR ')}` : '1'}
      )
    GROUP BY
      ${periodTitle},
      b.asin
  `);
  }

  async getRevenuePerAsinByDateRange({
    startDate,
    endDate,
    asins = [],
  }: {
    startDate: string;
    endDate: string;
    asins?: string[];
  }): Promise<any[]> {
    return await this.brandDbService.client.$queryRawUnsafe(`
        SELECT asin,
          report_date,
          min(sku) as sku,
          ROUND(IFNULL(SUM(b.attributed_sales7d), 0), 2) AS revenue,
          ROUND(IFNULL(SUM(b.cost), 0), 2)               AS spend
        FROM advertising_product_report b
        WHERE b.report_date >= '${startDate}'
          AND b.report_date <= '${endDate}'
          ${asins?.length > 0 ? `AND asin IN (${asins.map((a) => `'${a}'`).join(',')})` : ''}
        GROUP BY b.asin, b.report_date;
  `);
  }

  async getCampaignData({ start_date, end_date, search }) {
    const periodDuration = dayjs(end_date).diff(start_date, 'day');
    const previousPriod = {
      start_date: dayjs(start_date).subtract(periodDuration, 'day').format('YYYY-MM-DD'),
      end_date: start_date,
    };
    const [campaignRawData, previousCampaignRawData]: any[] = await this.brandDbService.client.$transaction([
      this.brandDbService.client.$queryRawUnsafe(`
    SELECT b.report_date,
        b.campaign_id,
        b.campaign_name,
        'ads product report' as name,
        IFNULL(SUM(b.impressions), 0) AS impression,
        IFNULL(SUM(b.clicks), 0) AS clicks,
        IFNULL(SUM(b.attributed_conversions14d), 0) AS conversions,
        IFNULL(SUM(b.attributed_units_ordered14d), 0) AS unit_ordered,
        ROUND(IFNULL(SUM(b.attributed_sales7d), 0), 2) AS revenue,
        ROUND(IFNULL(SUM(b.cost), 0), 2) AS spend
    FROM advertising_product_report b
    WHERE b.report_date >= '${start_date}' and b.report_date <= '${end_date}'
    ${search ? `and b.campaign_name Like '%${search}%'` : ''}
    GROUP BY b.campaign_id
    union
    SELECT b.report_date,
        b.campaign_id,
        b.campaign_name,
        'ads brand video campaign report' as name,
        IFNULL(SUM(b.impressions), 0) AS impression,
        IFNULL(SUM(b.clicks), 0) AS clicks,
        IFNULL(SUM(b.attributed_conversions_14d), 0) AS conversions,
        0 AS unit_ordered,
        ROUND(IFNULL(SUM(b.attributed_sales_14d), 0), 2) AS revenue,
        ROUND(IFNULL(SUM(b.cost), 0), 2) AS spend
    FROM advertising_brands_video_campaigns_report b
    where b.report_date >= '${start_date}' and b.report_date <= '${end_date}'  and campaign_status = 'enabled'
    ${search ? `and b.campaign_name Like '%${search}%'` : ''}
    GROUP BY b.campaign_id
    union
    SELECT b.report_date,
        b.campaign_id,
        b.campaign_name,
        'ads display campaign report' as name,
        IFNULL(SUM(b.impressions), 0) AS impression,
        IFNULL(SUM(b.clicks), 0) AS clicks,
        IFNULL(SUM(b.attributed_conversions14d), 0) AS conversions,
        IFNULL(SUM(b.attributed_units_ordered14d), 0) AS unit_ordered,
        ROUND(IFNULL(SUM(b.attributed_sales14d), 0), 2) AS revenue,
        ROUND(IFNULL(SUM(b.cost), 0), 2) AS spend
    FROM advertising_display_campaigns_report b
    where b.report_date >= '${start_date}' and b.report_date <= '${end_date}'  and campaign_status = 'enabled'
    ${search ? `and b.campaign_name Like '%${search}%'` : ''}
    GROUP BY b.campaign_id
    `),
      this.brandDbService.client.$queryRawUnsafe(`
    SELECT b.report_date,
        b.campaign_id,
        b.campaign_name,
        'ads product report' as name,
        IFNULL(SUM(b.impressions), 0) AS impression,
        IFNULL(SUM(b.clicks), 0) AS clicks,
        IFNULL(SUM(b.attributed_conversions14d), 0) AS conversions,
        IFNULL(SUM(b.attributed_units_ordered14d), 0) AS unit_ordered,
        ROUND(IFNULL(SUM(b.attributed_sales7d), 0), 2) AS revenue,
        ROUND(IFNULL(SUM(b.cost), 0), 2) AS spend
    FROM advertising_product_report b
    WHERE b.report_date >= '${previousPriod.start_date}' and b.report_date <= '${previousPriod.end_date}'
    ${search ? `and b.campaign_name Like '%${search}%'` : ''}
    GROUP BY b.campaign_id
    union
    SELECT b.report_date,
        b.campaign_id,
        b.campaign_name,
        'ads brand video campaign report' as name,
        IFNULL(SUM(b.impressions), 0) AS impression,
        IFNULL(SUM(b.clicks), 0) AS clicks,
        IFNULL(SUM(b.attributed_conversions_14d), 0) AS conversions,
        0 AS unit_ordered,
        ROUND(IFNULL(SUM(b.attributed_sales_14d), 0), 2) AS revenue,
        ROUND(IFNULL(SUM(b.cost), 0), 2) AS spend
    FROM advertising_brands_video_campaigns_report b
    WHERE b.report_date >= '${previousPriod.start_date}' and b.report_date <= '${
        previousPriod.end_date
      }' and campaign_status = 'enabled'
    ${search ? `and b.campaign_name Like '%${search}%'` : ''}
    GROUP BY b.campaign_id
    union
    SELECT b.report_date,
        b.campaign_id,
        b.campaign_name,
        'ads display campaign report' as name,
        IFNULL(SUM(b.impressions), 0) AS impression,
        IFNULL(SUM(b.clicks), 0) AS clicks,
        IFNULL(SUM(b.attributed_conversions14d), 0) AS conversions,
        IFNULL(SUM(b.attributed_units_ordered14d), 0) AS unit_ordered,
        ROUND(IFNULL(SUM(b.attributed_sales14d), 0), 2) AS revenue,
        ROUND(IFNULL(SUM(b.cost), 0), 2) AS spend
    FROM advertising_display_campaigns_report b
    WHERE b.report_date >= '${previousPriod.start_date}' and b.report_date <= '${
        previousPriod.end_date
      }' and campaign_status = 'enabled'
    ${search ? `and b.campaign_name Like '%${search}%'` : ''}
    GROUP BY b.campaign_id
    `),
    ]);

    const computeDiffAndPct = (currentValue: number, previousValue: number) => {
      const difference = currentValue - previousValue;
      let percentage;
      if (previousValue === 0) {
        percentage = currentValue !== 0 ? 'Infinity' : '0';
      } else {
        percentage = ((difference / previousValue) * 100).toFixed(2);
      }
      if (percentage === 'Infinity' || isNaN(percentage)) {
        percentage = '0';
      }
      return { difference, percentage };
    };

    return _.map(campaignRawData, (current) => {
      const prev = _.find(previousCampaignRawData, { campaign_id: current.campaign_id }) || {};

      const metrics = ['impression', 'clicks', 'conversions', 'unit_ordered', 'revenue', 'spend'];
      const results = {};

      for (const metric of metrics) {
        const currentMetricValue = current[metric] || 0;
        const prevMetricValue = prev[metric] || 0;

        const { difference, percentage } = computeDiffAndPct(currentMetricValue, prevMetricValue);
        results[`current_${metric}`] = currentMetricValue;
        results[`previous_${metric}`] = prevMetricValue;
        results[`${metric}_diff`] = difference;
        results[`${metric}_pct`] = percentage;
      }

      return {
        campaign_id: current.campaign_id,
        campaign_name: current.campaign_name,
        ...results,
      };
    }).filter(Boolean);
  }

  async getCampaignGraph({ start_date, end_date, search, campaign_ids }) {
    const campaignRawData: any[] = await this.brandDbService.client.$queryRawUnsafe(`
    SELECT b.report_date,
        b.campaign_id,
        b.campaign_name,
        'ads product report' as name,
        IFNULL(SUM(b.impressions), 0) AS impression,
        IFNULL(SUM(b.clicks), 0) AS clicks,
        IFNULL(SUM(b.attributed_conversions14d), 0) AS conversions,
        IFNULL(SUM(b.attributed_units_ordered14d), 0) AS unit_ordered,
        ROUND(IFNULL(SUM(b.attributed_sales7d), 0), 2) AS revenue,
        ROUND(IFNULL(SUM(b.cost), 0), 2) AS spend
    FROM advertising_product_report b
    WHERE b.report_date >= '${start_date}' and b.report_date <= '${end_date}'
    ${search ? `and b.campaign_name Like '%${search}%'` : ''}
    ${campaign_ids ? `and b.campaign_id IN (${campaign_ids.join(',')})` : ''}
    GROUP BY b.campaign_id, b.report_date
    union
    SELECT b.report_date,
        b.campaign_id,
        b.campaign_name,
        'ads brand video campaign report' as name,
        IFNULL(SUM(b.impressions), 0) AS impression,
        IFNULL(SUM(b.clicks), 0) AS clicks,
        IFNULL(SUM(b.attributed_conversions_14d), 0) AS conversions,
        0 AS unit_ordered,
        ROUND(IFNULL(SUM(b.attributed_sales_14d), 0), 2) AS revenue,
        ROUND(IFNULL(SUM(b.cost), 0), 2) AS spend
    FROM advertising_brands_video_campaigns_report b
    where b.report_date >= '${start_date}' and b.report_date <= '${end_date}'  and campaign_status = 'enabled'
    ${search ? `and b.campaign_name Like '%${search}%'` : ''}
    ${campaign_ids ? `and b.campaign_id IN (${campaign_ids.join(',')})` : ''}
    GROUP BY b.campaign_id, b.report_date
    union
    SELECT b.report_date,
        b.campaign_id,
        b.campaign_name,
        'ads display campaign report' as name,
        IFNULL(SUM(b.impressions), 0) AS impression,
        IFNULL(SUM(b.clicks), 0) AS clicks,
        IFNULL(SUM(b.attributed_conversions14d), 0) AS conversions,
        IFNULL(SUM(b.attributed_units_ordered14d), 0) AS unit_ordered,
        ROUND(IFNULL(SUM(b.attributed_sales14d), 0), 2) AS revenue,
        ROUND(IFNULL(SUM(b.cost), 0), 2) AS spend
    FROM advertising_display_campaigns_report b
    where b.report_date >= '${start_date}' and b.report_date <= '${end_date}'  and campaign_status = 'enabled'
    ${search ? `and b.campaign_name Like '%${search}%'` : ''}
    ${campaign_ids ? `and b.campaign_id IN (${campaign_ids.join(',')})` : ''}
    GROUP BY b.campaign_id, b.report_date
    `);

    const campaigns = {};

    for (const data of campaignRawData) {
      const dateKey = dayjs(data.report_date).format('YYYY-MM-DD');
      if (!campaigns[dateKey]) {
        campaigns[dateKey] = [];
      }
      campaigns[dateKey].push({
        campaign_id: data.campaign_id,
        campaign_name: data.campaign_name,
        name: data.name,
        impression: data.impression,
        clicks: data.clicks,
        conversions: data.conversions,
        unit_ordered: data.unit_ordered,
        revenue: data.revenue,
        spend: data.spend,
      });
    }
    const dates = _(campaignRawData)
      .groupBy((data) => dayjs(data.report_date).format('YYYY-MM-DD'))
      .map((group, date) => ({
        date,
        impression: _.sumBy(group, (g) => Number(g.impression)).toFixed(2),
        clicks: _.sumBy(group, (g) => Number(g.clicks)).toFixed(2),
        conversions: _.sumBy(group, (g) => Number(g.conversions)).toFixed(2),
        unit_ordered: _.sumBy(group, (g) => Number(g.unit_ordered)).toFixed(2),
        revenue: _.sumBy(group, (g) => Number(g.revenue)).toFixed(2),
        spend: _.sumBy(group, (g) => Number(g.spend)).toFixed(2),
      }))
      .value();

    return { campaigns, dates };
  }
}
