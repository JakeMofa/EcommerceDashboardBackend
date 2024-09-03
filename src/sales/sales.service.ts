import { Injectable } from '@nestjs/common';
import { VendoBrandDBService } from 'src/prisma.service';
import dayjs from 'src/utils/date.util';
import { AdvertisingService } from 'src/advertising/advertising.service';
import * as _ from 'lodash';
import { calculateAmazonTacos, isSKU } from 'src/utils/sales.util';

@Injectable()
export class SalesService {
  constructor(private branddb: VendoBrandDBService, private adService: AdvertisingService) {}

  getWeekOrMonthDate({ year, week, month, point }: { year: number; week?: number; month?: number; point: string }) {
    if (week !== 0 && !week && !month) {
      throw new Error('Either week or month should be provided');
    }
    let date = dayjs().year(Number(year) || 0);
    if (week) {
      date = date.week(Number(week) || 0);
    }
    if (month) {
      date = date.month(Number(month) - 1 || 0); // Note: months are 0 indexed, so January is 0, February is 1, etc.
    }
    return date[point === 'start' ? 'startOf' : 'endOf'](week ? 'week' : 'month').format('MM-DD-YYYY');
  }

  async salesQuery({
    years,
    weeks,
    months,
    groupByFields,
  }: {
    years: string;
    weeks?: string;
    months?: string;
    groupByFields?: string[];
  }): Promise<any> {
    const weekOrMonthColumn = weeks ? 'astr_week' : 'Month(astr_date)';
    const yearColumn = weeks ? 'astr_year' : 'Year(astr_date)';
    const weekOrMonthData = weeks ? weeks : months;
    const weekOrMonthLabel = weeks ? 'week' : 'month';
    return this.branddb.client.$queryRawUnsafe(`
    SELECT
      ${weekOrMonthColumn} as ${weekOrMonthLabel},
      ${yearColumn} as year,
      ${
        groupByFields?.includes('astr_child_asin')
          ? `astr_child_asin as child_asin,
          astr_parent_asin as parent_asin,
          astr_listing_sku as sku,
          astr_tilte as title,`
          : ''
      }
      ROUND(AVG(astr_buy_box_percentage), 2) AS avg_buy_box_percentage,
      ROUND(AVG(astr_session_percentage), 2) AS avg_session_percentage,
      ROUND(AVG(astr_page_view_percentage), 2) AS avg_page_view_percentage,
      ROUND(AVG(unit_session_percentage), 2) AS avg_unit_session_percentage,
      ROUND(IFNULL((SUM(astr_units_ordered) / SUM(astr_sessions)) * 100, 0), 2) AS conversion_rate,
      ROUND(SUM(astr_units_ordered), 2) AS total_ordered_units,
      ROUND(SUM(ordered_product_sales), 2) AS total_ordered_product_sales,
      ROUND(SUM(astr_sessions), 2) AS total_session,
      ROUND(SUM(astr_page_views), 2) AS total_page_views,
      ROUND(SUM(total_order_items), 2) AS total_order_items
    FROM
      asin_business_report
    WHERE
      ${yearColumn} IN (${years})
      AND ${weekOrMonthColumn} in (${weekOrMonthData})
    GROUP BY
      ${weekOrMonthColumn},
      ${yearColumn}
      ${groupByFields ? ',' + groupByFields.join(',') : ''}
    ORDER BY
      ${weekOrMonthColumn} DESC;
    `);
  }
  async getSalesDetail({ year, month, week }: { year: string; month?: string; week?: string }) {
    const [SalesDetail, advertisingPerAsin] = await Promise.all([
      this.salesQuery({ years: year, weeks: week, months: month, groupByFields: ['astr_child_asin'] }),
      this.adService.getRevenuePerAsin({ weeks: week, years: year, months: month }),
    ]);
    const period = week || month || 0;
    const period_name = week ? 'week' : 'month';
    return SalesDetail.map((sale) => {
      const total_sales = sale.total_ordered_product_sales;
      const { revenue, spend, sku } = advertisingPerAsin.filter(
        (ad) => Number(ad[period_name]) === Number(period) && ad.asin === sale.child_asin,
      )[0] || {
        revenue: 0,
        spend: 0,
      };
      const tacos = calculateAmazonTacos(spend, total_sales);
      console.log(isSKU(sale.sku) ? sale.sku : sku);
      return {
        ...sale,
        ...(period_name === 'month' ? { month: +sale.month - 1 } : {}),
        sku: isSKU(sale.sku) ? sale.sku : sku,
        avg_unit_session_percentage: sale.conversion_rate,
        revenue,
        spend,
        tacos,
      };
    }).sort((a, b) => b.total_ordered_product_sales - a.total_ordered_product_sales);
  }
  async getSalesData({ years, weeks, months }: { years: string; weeks?: string; months?: string }) {
    months = months
      ?.split(',')
      .map((m) => +m + 1)
      .join(',');
    const [salesData, advertisingPerPeriod] = await Promise.all([
      this.salesQuery({ years, weeks, months }),
      weeks ? this.adService.getDataByWeek(weeks, years) : this.adService.getDataByMonth(months || '', years),
    ]);
    const result = salesData
      .map(
        ({
          year,
          week,
          month,
          total_ordered_units,
          total_ordered_product_sales,
          avg_buy_box_percentage,
          avg_unit_session_percentage,
          total_page_views,
          avg_session_percentage,
          total_order_items,
          conversion_rate,
          avg_page_view_percentage,
          total_session,
          ...otherData
        }) => {
          const salesDate = {
            year: Number(year),
            week: Number(week),
            month: Number(month),
          };
          const isWeek = Boolean(week === 0 || week);
          let period = isWeek ? salesDate.week : salesDate.month;
          const period_name = isWeek ? `week` : `month`;
          const start_date = this.getWeekOrMonthDate({ year, week, month, point: 'start' });
          const end_date = this.getWeekOrMonthDate({ year, week, month, point: 'end' });
          const mappedAdsPerPeriod = advertisingPerPeriod.data.find(
            (ad) =>
              ((week && Number(ad.week) === salesDate.week) ||
                (salesDate.month && Number(ad.month) === salesDate.month)) &&
              ad.year === salesDate.year,
          );
          period = !isWeek ? period - 1 : period;
          if (mappedAdsPerPeriod) {
            delete mappedAdsPerPeriod['week'];
            delete mappedAdsPerPeriod['month'];
          }
          const ppcSpend =
            mappedAdsPerPeriod!.brand_spend + mappedAdsPerPeriod!.product_spend + mappedAdsPerPeriod!.display_spend;
          const ppcRevenue =
            mappedAdsPerPeriod!.brand_revenue +
            mappedAdsPerPeriod!.product_revenue +
            mappedAdsPerPeriod!.display_revenue;
          return {
            year,
            [`${period_name}`]: period,
            [`${period_name}_name`]: isWeek ? `WK${period}` : dayjs().month(period).format('MMMM'),
            start_date,
            end_date,
            ...otherData,
            ...mappedAdsPerPeriod,
            totalUnitOrdered: total_ordered_units,
            totalOrderedProductSales: total_ordered_product_sales,
            avgBuyBox: avg_buy_box_percentage,
            totalPageViews: total_page_views,
            totalSessionPercentage: avg_session_percentage,
            totalSession: total_session,
            totalOrderItems: total_order_items,
            conversionRate: conversion_rate,
            avgUnitSession: conversion_rate,
            avgPageViewPercentage: avg_page_view_percentage,
            ppcSpend,
            ppcRevenue,
            tacos: calculateAmazonTacos(mappedAdsPerPeriod?.spend, total_ordered_product_sales),
          };
        },
      )
      .sort((a, b) => {
        const isWeekA = 'week' in a;
        const isWeekB = 'week' in b;
        const keyA = isWeekA
          ? `${a.year}-${a.week.toString().padStart(2, '0')}`
          : `${a.year}-${a.month.toString().padStart(2, '0')}`;
        const keyB = isWeekB
          ? `${b.year}-${b.week.toString().padStart(2, '0')}`
          : `${b.year}-${b.month.toString().padStart(2, '0')}`;
        return keyB.localeCompare(keyA);
      });
    const lastTwoRecords = result.slice(0, 2);
    const comparisonSummary = {};
    if (lastTwoRecords.length === 2) {
      const compareValues = (key) => {
        const value1 = parseFloat(lastTwoRecords[0][key]) || 0;
        const value2 = parseFloat(lastTwoRecords[1][key]) || 0;
        return (((value1 - value2) / (value2 || 1)) * 100).toFixed(2);
      };

      const keysToCompare = [
        'ACoS',
        'ACoS_percentage',
        'CPC',
        'CPO',
        'ROAS',
        'avgBuyBox',
        'avgPageViewPercentage',
        'avgUnitSession',
        'brand_revenue',
        'brand_spend',
        'clicks',
        'conversionRate',
        'conversions',
        'display_revenue',
        'display_spend',
        'dsp_revenue',
        'dsp_spend',
        'end_date',
        'impressions',
        'ppcRevenue',
        'ppcSpend',
        'product_revenue',
        'product_spend',
        'revenue',
        'spend',
        'start_date',
        'tacos',
        'totalOrderItems',
        'totalOrderedProductSales',
        'totalPageViews',
        'totalSession',
        'totalSessionPercentage',
        'totalUnitOrdered',
        'total_order_items',
        'total_ordered_product_sales',
        'total_ordered_units',
        'unit_ordered',
      ];

      keysToCompare.forEach((key) => {
        if (_.isNumber(parseFloat(lastTwoRecords[0][key])) && _.isNumber(parseFloat(lastTwoRecords[1][key]))) {
          comparisonSummary[key] = compareValues(key);
        }
      });
    }
    return { result, comparisonSummary };
  }

  async getAllAsins({ years, weeks, months }) {
    const list = await this.branddb.client.asin_business_report.groupBy({
      by: ['astr_child_asin', 'astr_parent_asin', 'astr_listing_sku'],
      where: {
        AND: [{ astr_year: { in: years } }],
        OR: [
          ...(!!weeks ? [...weeks.map((w) => ({ astr_week: w }))] : []),
          ...(!!months ? [...months.map((m) => ({ astr_month: m }))] : []),
        ],
      },
    });

    return {
      astr_child_asin: _.uniq(list.map((item) => item.astr_child_asin)),
      astr_parent_asin: _.uniq(list.map((item) => item.astr_parent_asin)),
      astr_listing_sku: _.filter(
        _.uniq(_.flatten(list.map((item) => item.astr_listing_sku).map((item) => item?.split(',')))),
        _.isString,
      ),
    };
  }
}
