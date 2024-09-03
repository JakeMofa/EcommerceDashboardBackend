import { Injectable } from '@nestjs/common';
import { VendoBrandDBService } from 'src/prisma.service';
import dayjs from 'src/utils/date.util';
import { AdvertisingService } from 'src/advertising/advertising.service';
import * as _ from 'lodash';
import { calculateAmazonTacos } from 'src/utils/sales.util';
@Injectable()
export class SalesGraphService {
  constructor(private branddb: VendoBrandDBService, private adsService: AdvertisingService) {}
  async salesGraphData({ months, years, weeks, graphFilterType, sku, child_asins, parent_asins }): Promise<any> {
    try {
      const yearColumn = weeks ? 'astr_year' : 'Year(astr_date)';
      const conditions: string[] = [];

      if (child_asins?.length > 0) {
        conditions.push(`astr_child_asin IN (${child_asins.map((asin) => `'${asin}'`).join(',')})`);
      }
      if (parent_asins?.length > 0) {
        conditions.push(`astr_parent_asin IN (${parent_asins.map((asin) => `'${asin}'`).join(',')})`);
      }
      if (sku?.length > 0) {
        conditions.push(`astr_listing_sku IN (${sku.map((sku) => `'${sku}'`).join(',')})`);
      }
      const salesByWeekData: any[] = await this.branddb.client.$queryRawUnsafe(`
        SELECT
            ${yearColumn} as astr_year,
            ${weeks ? 'astr_week' : 'MONTH(astr_date)'} AS ${weeks ? 'astr_week' : 'astr_month'},
            AVG(astr_buy_box_percentage) AS avg_astr_buy_box_percentage,
            AVG(astr_session_percentage) AS avg_astr_session_percentage,
            AVG(astr_page_view_percentage) AS avg_astr_page_view_percentage,
            AVG(unit_session_percentage) AS avg_unit_session_percentage,
            SUM(astr_units_ordered) AS sum_astr_units_ordered,
            SUM(ordered_product_sales) AS sum_ordered_product_sales,
            SUM(astr_buy_box_percentage) AS sum_astr_buy_box_percentage,
            SUM(astr_session_percentage) AS sum_astr_session_percentage,
            SUM(astr_page_view_percentage) AS sum_astr_page_view_percentage,
            SUM(unit_session_percentage) AS sum_unit_session_percentage,
            SUM(astr_sessions) AS sum_astr_sessions,
            SUM(astr_page_views) AS sum_astr_page_views,
            SUM(total_order_items) AS sum_total_order_items,
            COUNT(DISTINCT astr_child_asin) AS count_astr_child_asin
        FROM
            asin_business_report
        WHERE
            ${yearColumn} IN (${years})
            AND (
                ${weeks ? `astr_week IN (${weeks})` : ''}
                ${months ? `MONTH(astr_date) IN (${months})` : ''}
            )
            AND (
                ${conditions.length ? `${conditions.join(' OR ')}` : '1'}
            )
        GROUP BY
            ${yearColumn},
            ${weeks ? 'astr_week' : 'MONTH(astr_date)'}
        ORDER BY
            ${yearColumn},
            ${weeks ? 'astr_week' : 'MONTH(astr_date)'} ASC;
      `);
      let ads: any;
      if (conditions.length < 1) {
        ads = weeks
          ? await this.adsService.getDataByWeek(weeks.join(','), years)
          : await this.adsService.getDataByMonth(months.join(',') || '', years);
      } else {
        ads = {};
        ads.data = await this.adsService.getRevenuePerAsin({ weeks, months, years, child_asins, skus: sku });
      }

      return salesByWeekData.map((acc) => {
        const isWeek = graphFilterType === 'week';
        let date: dayjs.Dayjs;
        let label;
        if (isWeek) {
          date = dayjs().year(Number(acc.astr_year)).week(Number(acc.astr_week));
          label = `WK${Number(acc.astr_week)}`;
        } else {
          date = dayjs()
            .year(Number(acc.astr_year))
            .month(Number(acc.astr_month) - 1);
          label = date.format('MMMM');
        }
        const mappedAdsPerPeriod = ads.data.find(
          (ad) =>
            ((Number(acc.astr_week) && ad.week === Number(acc.astr_week)) ||
              (Number(acc.astr_month) && ad.month === Number(acc.astr_month))) &&
            ad.year === Number(acc.astr_year),
        );
        const columnData = getGraphColumnData(acc);
        const tacos = calculateAmazonTacos(mappedAdsPerPeriod?.spend, columnData.sum_of_ordered_product_sales);
        const timePeriod: { week?: number; month?: number } = {};

        if (graphFilterType === 'week') {
          timePeriod.week = Number(acc.astr_week);
        } else if (graphFilterType === 'month') {
          timePeriod.month = Number(acc.astr_month);
        }

        const data = {
          ...columnData,
          spend: mappedAdsPerPeriod?.spend || 0,
          revenue: mappedAdsPerPeriod?.revenue || 0,
          dsp_spend: mappedAdsPerPeriod?.dsp_spend || 0,
          dsp_revenue: mappedAdsPerPeriod?.dsp_revenue || 0,
          label: label,
          year: acc.astr_year,
          ...timePeriod,
          tacos: tacos,
        };
        return data;
      }, {});

      function getGraphColumnData(item) {
        const conversion_rate =
          item.sum_astr_sessions && item.sum_astr_units_ordered
            ? ((Number(item.sum_astr_units_ordered) / Number(item.sum_astr_sessions)) * 100).toFixed(2)
            : '0.00';
        return {
          conversion_rate,
          sum_of_units_ordered_label: 'Sum of Units Ordered',
          sum_of_units_ordered: item.sum_astr_units_ordered,
          sum_of_ordered_product_sales_label: 'Sum of Ordered Product Sales',
          sum_of_ordered_product_sales: item.sum_ordered_product_sales,
          average_of_buy_box_percentage_label: 'Average of Buy Box Percentage',
          average_of_buy_box_percentage: item.avg_astr_buy_box_percentage,
          sum_of_unit_session_percentage_label: 'Sum of Unit Session Percentage',
          sum_of_unit_session_percentage: conversion_rate,
          sum_of_sessions_label: 'Sum of Sessions',
          sum_of_sessions: item.sum_astr_sessions,
          dsp_spend_label: 'Dsp Spend',
          dsp_revenue_label: 'Dsp Revenue',
          sum_of_page_views_label: 'Sum of Page Views',
          sum_of_page_views: item.sum_astr_page_views,
          sum_of_session_percentage_label: 'Sum of Session Percentage',
          sum_of_session_percentage: item.avg_astr_session_percentage,
          sum_of_page_views_percentage_label: 'Sum of Page Views Percentage',
          sum_of_page_views_percentage: item.avg_astr_page_view_percentage,
          sum_of_total_order_items_label: 'Sum of Total Order Items',
          sum_of_total_order_items: item.sum_total_order_items,
          tacos: 'tacos',
        };
      }
    } catch (e) {
      if (e.name == 'PrismaClientKnownRequestError') {
        if (e.code !== 'P2015') {
          return {
            conversion_rate: 0,
            sum_of_units_ordered_label: 'Sum of Units Ordered',
            sum_of_units_ordered: 0,
            sum_of_ordered_product_sales_label: 'Sum of Ordered Product Sales',
            sum_of_ordered_product_sales: 0,
            average_of_buy_box_percentage_label: 'Average of Buy Box Percentage',
            average_of_buy_box_percentage: 0,
            sum_of_unit_session_percentage_label: 'Sum of Unit Session Percentage',
            sum_of_unit_session_percentage: 0,
            sum_of_sessions_label: 'Sum of Sessions',
            sum_of_sessions: 0,
            sum_of_page_views_label: 'Sum of Page Views',
            sum_of_page_views: 0,
            sum_of_session_percentage_label: 'Sum of Session Percentage',
            sum_of_session_percentage: 0,
            sum_of_page_views_percentage_label: 'Sum of Page Views Percentage',
            sum_of_page_views_percentage: 0,
            sum_of_total_order_items_label: 'Sum of Total Order Items',
            sum_of_total_order_items: 0,
            tacos: 'tacos',
          };
        } else {
          throw e;
        }
      }
    }
  }
}
