import { Injectable } from '@nestjs/common';
import { VendoBrandDBService } from '../prisma.service';
import dayjs from 'src/utils/date.util';
import { AdvertisingService } from '../advertising/advertising.service';
import { Prisma } from 'prisma/brand/generated/vendoBrand';
import * as _ from 'lodash';
import { SalesCalloutWeeklyService } from './sales.callout.weekly.service';
import { Dayjs } from 'dayjs';

@Injectable()
export class SalesCalloutMonthlyService {
  constructor(
    private branddb: VendoBrandDBService,
    private advertisingService: AdvertisingService,
    private calloutService: SalesCalloutWeeklyService,
  ) {}

  selectedMonthQuery(date: dayjs.Dayjs): Prisma.PrismaPromise<any> {
    return this.branddb.client.$queryRaw`
      WITH
      this_month AS (
          SELECT
          ROUND(IFNULL(SUM(ordered_product_sales), 0), 2) AS this_month_sales,
          ROUND(IFNULL((SUM(astr_units_ordered) / SUM(astr_sessions)) * 100, 0), 2) AS conversion_rate_up,
          SUM(astr_sessions) AS total_sessions_up,
          SUM(astr_units_ordered) AS this_month_total_ordered_units,
          AVG(astr_buy_box_percentage) AS this_month_avg_buy_box_percentage,
          AVG(unit_session_percentage) AS unit_session_percentage_avg,
          AVG(astr_session_percentage) AS astr_session_percentage_avg
          FROM asin_business_report
          WHERE astr_month = ${date.month() + 1} AND year(astr_date) = ${date.year()}
      ),
      last_month AS (
          SELECT
          ROUND(IFNULL(SUM(ordered_product_sales), 0), 2) AS last_month_sales,
          ROUND(IFNULL((SUM(astr_units_ordered) / SUM(astr_sessions)) * 100, 0), 2) AS conversion_rate_lm,
          SUM(astr_sessions) AS total_sessions_lm,
          SUM(astr_units_ordered) AS total_ordered_units_lm,
          ROUND(IFNULL(SUM(astr_buy_box_percentage) / COUNT(astr_child_asin), 0), 2) AS avg_buy_box_percentage_lm
          FROM asin_business_report
          WHERE astr_month = ${date.subtract(1, 'month').month() + 1} AND year(astr_date) = ${date
      .subtract(1, 'month')
      .year()}
      )
SELECT
    this_month.this_month_sales,
    last_month.last_month_sales,
    this_month.this_month_avg_buy_box_percentage,
    last_month.avg_buy_box_percentage_lm,
    this_month.this_month_total_ordered_units,
    last_month.total_ordered_units_lm,
    this_month.this_month_sales - last_month.last_month_sales AS difference_in_sales,
    this_month.this_month_total_ordered_units - last_month.total_ordered_units_lm AS difference_in_units,
    IF(last_month.last_month_sales = 0, NULL,
    ((this_month.this_month_sales - last_month.last_month_sales) / last_month.last_month_sales) * 100) AS percent_change,
    ((this_month.this_month_total_ordered_units - last_month.total_ordered_units_lm) / last_month.total_ordered_units_lm) * 100 AS unit_percent_change,
    this_month.conversion_rate_up,
    last_month.conversion_rate_lm,
    IF(last_month.conversion_rate_lm = 0, NULL,
    ((this_month.conversion_rate_up - last_month.conversion_rate_lm) / last_month.conversion_rate_lm) * 100) AS percent_change_conversion_rate,
    this_month.total_sessions_up,
    last_month.total_sessions_lm,
    IF(last_month.total_sessions_lm = 0, NULL,
    ((this_month.total_sessions_up - last_month.total_sessions_lm) / last_month.total_sessions_lm) * 100) AS percent_change_total_sessions
FROM
    this_month, last_month;
`;
  }

  getLastMonth(): Prisma.PrismaPromise<any> {
    return this.branddb.client.$queryRaw`
      WITH
      this_month AS (
          SELECT
          ROUND(IFNULL(SUM(ordered_product_sales), 0), 2) AS this_month_sales,
          ROUND(IFNULL((SUM(astr_units_ordered) / SUM(astr_sessions)) * 100, 0), 2) AS conversion_rate_up,
          SUM(astr_sessions) AS total_sessions_up,
          SUM(astr_units_ordered) AS this_month_total_ordered_units,
          AVG(astr_buy_box_percentage) AS this_month_avg_buy_box_percentage,
          AVG(unit_session_percentage) AS unit_session_percentage_avg,
          AVG(astr_session_percentage) AS astr_session_percentage_avg
          FROM asin_business_report
          WHERE astr_month = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AND year(astr_date) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
      ),
      last_month AS (
          SELECT
          ROUND(IFNULL(SUM(ordered_product_sales), 0), 2) AS last_month_sales,
          ROUND(IFNULL((SUM(astr_units_ordered) / SUM(astr_sessions)) * 100, 0), 2) AS conversion_rate_lm,
          SUM(astr_sessions) AS total_sessions_lm,
          SUM(astr_units_ordered) AS total_ordered_units_lm,
          ROUND(IFNULL(SUM(astr_buy_box_percentage) / COUNT(astr_child_asin), 0), 2) AS avg_buy_box_percentage_lm
          FROM asin_business_report
          WHERE astr_month = MONTH(DATE_SUB(CURDATE(), INTERVAL 2 MONTH)) AND year(astr_date) = YEAR(DATE_SUB(CURDATE(), INTERVAL 2 MONTH))
      )
SELECT
    this_month.this_month_sales,
    last_month.last_month_sales,
    this_month.this_month_avg_buy_box_percentage,
    last_month.avg_buy_box_percentage_lm,
    this_month.this_month_total_ordered_units,
    last_month.total_ordered_units_lm,
    this_month.this_month_sales - last_month.last_month_sales AS difference_in_sales,
    this_month.this_month_total_ordered_units - last_month.total_ordered_units_lm AS difference_in_units,
    IF(last_month.last_month_sales = 0, NULL,
    ((this_month.this_month_sales - last_month.last_month_sales) / last_month.last_month_sales) * 100) AS percent_change,
    ((this_month.this_month_total_ordered_units - last_month.total_ordered_units_lm) / last_month.total_ordered_units_lm) * 100 AS unit_percent_change,
    this_month.conversion_rate_up,
    last_month.conversion_rate_lm,
    IF(last_month.conversion_rate_lm = 0, NULL,
    ((this_month.conversion_rate_up - last_month.conversion_rate_lm) / last_month.conversion_rate_lm) * 100) AS percent_change_conversion_rate,
    this_month.total_sessions_up,
    last_month.total_sessions_lm,
    IF(last_month.total_sessions_lm = 0, NULL,
    ((this_month.total_sessions_up - last_month.total_sessions_lm) / last_month.total_sessions_lm) * 100) AS percent_change_total_sessions
FROM
    this_month, last_month;
`;
  }

  getLast4Months(): Prisma.PrismaPromise<any> {
    return this.branddb.client.$queryRaw`
      WITH this_month AS (
        SELECT
          ROUND(IFNULL(SUM(ordered_product_sales), 0), 2) AS this_month_sales,
          ROUND(IFNULL((SUM(astr_units_ordered) / SUM(astr_sessions)) * 100, 0), 2) AS conversion_rate_up,
          SUM(astr_sessions) AS total_sessions_up,
          SUM(astr_units_ordered) AS this_month_total_ordered_units,
          ROUND(IFNULL(SUM(astr_buy_box_percentage) / COUNT(astr_child_asin), 0), 2) AS this_month_avg_buy_box_percentage
        FROM asin_business_report
        WHERE astr_month = MONTH(CURDATE()) AND year(astr_date) = YEAR(CURDATE())
      ),
      last_month AS (
        SELECT
          ROUND(IFNULL(SUM(ordered_product_sales), 0), 2) AS last_month_sales,
          ROUND(IFNULL(SUM(astr_units_ordered), 0), 2) AS last_month_units,
          ROUND(IFNULL((SUM(astr_units_ordered) / SUM(astr_sessions)) * 100, 0), 2) AS conversion_rate_lm,
          SUM(astr_sessions) AS total_sessions_lm,
          SUM(astr_units_ordered) AS total_ordered_units_lm,
          ROUND(IFNULL(SUM(astr_buy_box_percentage) / COUNT(astr_child_asin), 0), 2) AS avg_buy_box_percentage_lm
        FROM asin_business_report
        WHERE astr_month = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AND year(astr_date) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
      ),
      last_4_months AS (
        SELECT
          ROUND(IFNULL(SUM(ordered_product_sales) / (SELECT COUNT(DISTINCT astr_month)
          FROM asin_business_report
          WHERE (
            (astr_month = MONTH(DATE_SUB(CURDATE(), INTERVAL 4 MONTH)) AND year(astr_date) = YEAR(DATE_SUB(CURDATE(), INTERVAL 4 MONTH))) OR
            (astr_month = MONTH(DATE_SUB(CURDATE(), INTERVAL 3 MONTH)) AND year(astr_date) = YEAR(DATE_SUB(CURDATE(), INTERVAL 3 MONTH))) OR
            (astr_month = MONTH(DATE_SUB(CURDATE(), INTERVAL 2 MONTH)) AND year(astr_date) = YEAR(DATE_SUB(CURDATE(), INTERVAL 2 MONTH))) OR
            (astr_month = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AND year(astr_date) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)))
          )), 0), 2) AS last_4_months_average_sales,
          ROUND(IFNULL(SUM(astr_units_ordered) / (SELECT COUNT(DISTINCT astr_month)
          FROM asin_business_report
          WHERE (
            (astr_month = MONTH(DATE_SUB(CURDATE(), INTERVAL 4 MONTH)) AND year(astr_date) = YEAR(DATE_SUB(CURDATE(), INTERVAL 4 MONTH))) OR
            (astr_month = MONTH(DATE_SUB(CURDATE(), INTERVAL 3 MONTH)) AND year(astr_date) = YEAR(DATE_SUB(CURDATE(), INTERVAL 3 MONTH))) OR
            (astr_month = MONTH(DATE_SUB(CURDATE(), INTERVAL 2 MONTH)) AND year(astr_date) = YEAR(DATE_SUB(CURDATE(), INTERVAL 2 MONTH))) OR
            (astr_month = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AND year(astr_date) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)))
          )), 0), 2) AS last_4_months_average_units,
          ROUND(IFNULL((SUM(astr_units_ordered) / SUM(astr_sessions)) * 100, 0), 2) AS conversion_rate_l4m,
          SUM(astr_sessions) AS total_sessions_l4m,
          SUM(astr_units_ordered) AS total_ordered_units_l4m,
          ROUND(IFNULL(SUM(astr_buy_box_percentage) / COUNT(astr_child_asin), 0), 2) AS avg_buy_box_percentage_l4m
        FROM asin_business_report
        WHERE (
          (astr_month = MONTH(DATE_SUB(CURDATE(), INTERVAL 4 MONTH)) AND year(astr_date) = YEAR(DATE_SUB(CURDATE(), INTERVAL 4 MONTH))) OR
          (astr_month = MONTH(DATE_SUB(CURDATE(), INTERVAL 3 MONTH)) AND year(astr_date) = YEAR(DATE_SUB(CURDATE(), INTERVAL 3 MONTH))) OR
          (astr_month = MONTH(DATE_SUB(CURDATE(), INTERVAL 2 MONTH)) AND year(astr_date) = YEAR(DATE_SUB(CURDATE(), INTERVAL 2 MONTH))) OR
          (astr_month = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AND year(astr_date) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)))
        )
      )
SELECT
  last_month.last_month_sales,
  last_month.last_month_units,
  last_4_months.last_4_months_average_sales,
  last_4_months.last_4_months_average_units,
  last_month.last_month_sales - last_4_months.last_4_months_average_sales AS difference_in_sales,
  IF(last_4_months.last_4_months_average_sales = 0, NULL,
  ((last_month.last_month_sales - last_4_months.last_4_months_average_sales) /
  last_4_months.last_4_months_average_sales) * 100) AS percent_change,
  last_month.last_month_units - last_4_months.last_4_months_average_units AS difference_in_units,
  IF(last_4_months.last_4_months_average_units = 0, NULL,
  ((last_month.last_month_units - last_4_months.last_4_months_average_units) /
  last_4_months.last_4_months_average_units) * 100) AS units_percent_change,
  last_month.conversion_rate_lm,
  last_month.total_ordered_units_lm - last_4_months.total_ordered_units_l4m AS difference_in_units,
  ((last_month.total_ordered_units_lm - last_4_months.total_ordered_units_l4m) /
  last_4_months.total_ordered_units_l4m) * 100 AS unit_percent_change,
  last_4_months.conversion_rate_l4m,
  IF(last_4_months.conversion_rate_l4m = 0, NULL,
  ((last_month.conversion_rate_lm - last_4_months.conversion_rate_l4m) / last_4_months.conversion_rate_l4m) * 100) AS percent_change_conversion_rate,
  last_month.total_sessions_lm,
  last_4_months.total_sessions_l4m,
  IF(last_4_months.total_sessions_l4m = 0, NULL,
  ((last_month.total_sessions_lm - last_4_months.total_sessions_l4m) / last_4_months.total_sessions_l4m) * 100) AS percent_change_total_sessions
FROM last_month,
last_4_months;
`;
  }

  async getSalesByProduct(year: number, months: number[]) {
    try {
      const date: [{ latest_date: string }] = await this.branddb.client
        .$queryRaw`SELECT MAX(astr_date) AS latest_date FROM asin_business_report WHERE year(astr_date) = ${year}`;
      console.log(dayjs(date[0]?.latest_date).subtract(1, 'year').format('YYYY-MM-DD'));
      const [ytd, lastYtd, last4Months, lastMonth] = await this.branddb.client.$transaction([
        this.calloutService.getYearToDayData(year, dayjs(date[0]?.latest_date).format('YYYY-MM-DD')),
        this.calloutService.getYearToDayData(
          year - 1,
          dayjs(date[0]?.latest_date).subtract(1, 'year').format('YYYY-MM-DD'),
        ),
        this.getLast4Months(),
        this.getLastMonth(),
      ]);
      const lastYearSales = lastYtd[0]?.total_ordered_product_sales || 0;
      const lastYearChange = lastYearSales
        ? ((ytd[0]?.total_ordered_product_sales - lastYearSales) / lastYearSales) * 100
        : 0;
      const monthlyData: any[] = await this.branddb.client.$queryRaw`
          WITH cleaned_asin_report as (SELECT astr_month            AS month,
                                              year(astr_date)            AS year,
                                              SUM(astr_units_ordered)    AS total_ordered_units,
                                              SUM(ordered_product_sales) AS total_ordered_product_sales
                                       FROM asin_business_report
                                       GROUP BY year(astr_date), astr_month)
          SELECT all_months.year,
                 all_months.month,
                 COALESCE(this_year.total_ordered_units, 0)                                                   AS total_ordered_units_this_month,
                 COALESCE(this_year.total_ordered_product_sales, 0)                                           AS total_ordered_product_sales_this_month,
                 COALESCE(prev_month.total_ordered_units, 0)                                                   AS prev_month_units,
                 COALESCE(prev_month.total_ordered_product_sales, 0)                                           AS prev_month_sales,
                 COALESCE(prev_year.total_ordered_units, 0)                                                   AS prev_year_units,
                 COALESCE(prev_year.total_ordered_product_sales, 0)                                           AS prev_year_sales,
                 COALESCE(this_year.total_ordered_units, 0) -
                 COALESCE(prev_month.total_ordered_units, 0)                                                   AS month_on_month_unit_diff,
                 (COALESCE(this_year.total_ordered_units, 0) - COALESCE(prev_month.total_ordered_units, 0)) /
                 COALESCE(prev_month.total_ordered_units, 1) *
                 100                                                                                          AS month_on_month_unit_perc,
                 COALESCE(this_year.total_ordered_product_sales, 0) -
                 COALESCE(prev_month.total_ordered_product_sales, 0)                                           AS month_on_month_sales_diff,
                 (COALESCE(this_year.total_ordered_product_sales, 0) -
                  COALESCE(prev_month.total_ordered_product_sales, 0)) /
                 COALESCE(prev_month.total_ordered_product_sales, 1) *
                 100                                                                                          AS month_on_month_sales_perc,
                 COALESCE(prev_year.total_ordered_units, 0) -
                 COALESCE(prev_month_year.total_ordered_units, 0)                                              AS year_on_year_unit_diff,
                 (COALESCE(prev_year.total_ordered_units, 0) - COALESCE(prev_month_year.total_ordered_units, 0)) /
                 COALESCE(prev_month_year.total_ordered_units, 1) *
                 100                                                                                          AS year_on_year_unit_perc,
                 COALESCE(prev_year.total_ordered_product_sales, 0) -
                 COALESCE(prev_month_year.total_ordered_product_sales, 0)                                      AS year_on_year_sales_diff,
                 COALESCE(prev_year.total_ordered_product_sales, 0)                                           AS year_on_year_sales,
                 COALESCE(prev_year.total_ordered_units, 0)                                                   AS year_on_year_unit,
                 (COALESCE(prev_year.total_ordered_product_sales, 0) -
                  COALESCE(prev_month_year.total_ordered_product_sales, 0)) /
                 COALESCE(prev_month_year.total_ordered_product_sales, 1) *
                 100                                                                                          AS year_on_year_sales_perc
          FROM (SELECT ${year} AS year, month
                FROM (SELECT 1 as month
                      UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
                      UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9
                      UNION SELECT 10 UNION SELECT 11 UNION SELECT 12
                      ) months
                ) all_months
                   LEFT JOIN cleaned_asin_report this_year
                             ON all_months.month = this_year.month AND all_months.year = this_year.year
                   LEFT JOIN cleaned_asin_report prev_month ON
                  (all_months.month > 1 and all_months.month = prev_month.month + 1 AND all_months.year = prev_month.year) or
                  (all_months.month = 1 and prev_month.month = 12 AND all_months.year = prev_month.year + 1)
                   LEFT JOIN cleaned_asin_report prev_year
                             ON all_months.month = prev_year.month AND all_months.year = prev_year.year + 1
                  LEFT JOIN cleaned_asin_report prev_month_year ON
    (all_months.month > 1 AND all_months.month = prev_month_year.month + 1 AND all_months.year = prev_month_year.year + 1) OR
    (all_months.month = 1 AND prev_month_year.month = 12 AND all_months.year = prev_month_year.year + 2)

          ORDER BY all_months.year ASC, all_months.month ASC;
      `;
      const dateLastMonth = dayjs().subtract(1, 'month');

      // Getting the month of the year and year of the date last month
      const ads_month = dateLastMonth.month() + 1;
      const ads_year = dateLastMonth.year();
      const advertisingData = await this.advertisingService.getTotalRevenueMonthly({
        months: ads_month.toString(),
        years: ads_year.toString(),
      });
      const monthDetail = monthlyData
        .map((mmd) => {
          const date = dayjs()
            .year(Number(mmd.year))
            .month(Number(mmd.month) - 1);
          const zeroFlag =
            Number(mmd.total_ordered_product_sales_this_month) === 0 &&
            Number(mmd.total_ordered_units_this_month) === 0;
          if (_.includes(months, Number(mmd.month)))
            return {
              month: mmd.month,
              startdate: date.startOf('month').format('YYYY-MM-DD'),
              enddate: date.endOf('month').format('YYYY-MM-DD'),
              this_month_total_sales: mmd.total_ordered_product_sales_this_month?.toFixed(2),
              this_month_sales_diff: !zeroFlag ? mmd.month_on_month_sales_diff?.toFixed(2) : 0,
              this_month_sales_change: !zeroFlag ? mmd.month_on_month_sales_perc?.toFixed(2) : 0,
              this_month_total_units: mmd.total_ordered_units_this_month?.toFixed(2),
              this_month_units_diff: !zeroFlag ? mmd.month_on_month_unit_diff?.toFixed(2) : 0,
              this_month_units_change: !zeroFlag ? mmd.month_on_month_unit_perc?.toFixed(2) : 0,
              last_year_total_sales: mmd.prev_year_sales?.toFixed(2),
              last_year_sales_diff: mmd.year_on_year_sales_diff?.toFixed(2),
              last_year_sales_change: mmd.year_on_year_sales_perc?.toFixed(2),
              last_year_total_units: mmd.prev_year_units?.toFixed(2),
              last_year_units_diff: mmd.year_on_year_unit_diff?.toFixed(2),
              last_year_units_change: mmd.year_on_year_unit_perc?.toFixed(2),
            };
        })
        .filter((m) => !!m);

      return {
        avgBuyBoxPercentage: lastMonth[0].this_month_avg_buy_box_percentage,
        conversionRate: lastMonth[0].conversion_rate_up,
        upVsLmSession: lastMonth[0].percent_change_total_sessions,
        totalSalesLastMonth: lastMonth[0].this_month_sales,
        upVsLm: lastMonth[0].difference_in_sales,
        upLmDiff: lastMonth[0].percent_change?.toFixed(2),
        upVsL4m: last4Months[0].difference_in_sales,
        ytdSales: ytd.length > 0 ? ytd[0].total_ordered_product_sales : 0,
        lmTotalSales: lastMonth[0].this_month_sales,
        vsSalesL4m: last4Months[0].difference_in_sales,
        vsSalesDiff: lastMonth[0].difference_in_sales,
        vsSalesChg: lastMonth[0].percent_change?.toFixed(2),
        UnitsDiff: lastMonth[0].difference_in_units,
        UnitsChg: lastMonth[0].unit_percent_change?.toFixed(2),
        vsUnitsLm: lastMonth[0].percent_change_units,
        vsUnitsL4m: last4Months[0].percent_change_units,
        vsUnitsDiff: lastMonth[0].difference_in_units,
        vsUnitsChg: lastMonth[0].percent_change_units,
        salesChange: lastMonth[0].percent_change?.toFixed(2),
        lastYearSales: lastYearSales,
        lastYearSalesChange: lastYearChange,
        totalSalesLm: lastMonth[0].this_month_sales,
        lmVsL4m: last4Months[0].difference_in_sales,
        totalSalesL4m: last4Months[0].last_4_months_average_sales,
        totalSalesL4mChange: last4Months[0].percent_change?.toFixed(2),
        totalSalesL4mDiff: last4Months[0].difference_in_sales,
        unitsLm: last4Months[0].last_month_units,
        totalUnitsL4m: last4Months[0].last_4_months_average_units,
        totalUnitsL4mChange: last4Months[0].units_percent_change?.toFixed(2),
        totalUnitsL4mDiff: last4Months[0].last_month_units - last4Months[0].last_4_months_average_units,
        totalSessionsUP: lastMonth[0].total_sessions_up,
        totalSessionsLm: lastMonth[0].total_sessions_lm,
        advertisementData: advertisingData[0] || {},
        monthDetail,
      };
    } catch (e) {
      if (e.name == 'PrismaClientKnownRequestError') {
        if (e.code === 'P2015') {
          return {
            avgBuyBoxPercentage: 0,
            conversionRate: 0,
            upVsLmSession: 0,
            totalSalesLastMonth: 0,
            upVsLm: 0,
            upLmDiff: 0,
            upVsL4m: 0,
            ytdSales: 0,
            lmTotalSales: 0,
            vsSalesL4m: 0,
            vsSalesDiff: 0,
            vsSalesChg: 0,
            UnitsDiff: 0,
            UnitsChg: 0,
            vsUnitsLm: 0,
            vsUnitsL4m: 0,
            vsUnitsDiff: 0,
            vsUnitsChg: 0,
            salesChange: 0,
            lastYearSales: 0,
            lastYearSalesChange: 0,
            totalSalesLm: 0,
            lmVsL4m: 0,
            totalSalesL4m: 0,
            totalSalesL4mChange: 0,
            totalSalesL4mDiff: 0,
            unitsLm: 0,
            totalUnitsL4m: 0,
            totalUnitsL4mChange: 0,
            totalUnitsL4mDiff: 0,
            totalSessionsUP: 0,
            totalSessionsLm: 0,
            advertisementData: 0,
            monthDetail: 0,
          };
        } else {
          throw e;
        }
      }
    }
  }

  async getSelectedCalloutData(year: number, month: number, lastFullPeriod: boolean): Promise<any> {
    let date = dayjs()
      .year(year)
      .month(month - 1);
    let maxDate: Dayjs | null = null;

    if (lastFullPeriod) {
      date = dayjs(await this.calloutService.getMaxDate());
      maxDate = date.clone();
      if (date.isBefore(dayjs().endOf('month'))) {
        date = date.subtract(1, 'month');
      }
    }
    const lastMonth = await this.selectedMonthQuery(date);
    const ytdSales: [{ total_ordered_product_sales: number }] = await this.branddb.client.$queryRaw`
    SELECT ROUND(IFNULL(SUM(ordered_product_sales), 0), 2) AS total_ordered_product_sales
    FROM
        asin_business_report
    WHERE
       year(astr_date) = ${date.year()} AND astr_month <= ${date.month() + 1}`;
    const advertisingData = await this.advertisingService.getTotalRevenueMonthly({
      months: (date.month() + 1).toString(),
      years: date.year().toString(),
    });

    return {
      maxDate: maxDate && maxDate.format('YYYY-MM-DD'),
      avgBuyBoxPercentage: lastMonth[0].this_month_avg_buy_box_percentage,
      conversionRate: lastMonth[0].conversion_rate_up,
      upVsLmSession: lastMonth[0].percent_change_total_sessions,
      totalSalesLastMonth: lastMonth[0].this_month_sales,
      upVsLm: lastMonth[0].difference_in_sales,
      upLmDiff: lastMonth[0].percent_change?.toFixed(2),
      lmTotalSales: lastMonth[0].this_month_sales,
      ytdSales: ytdSales[0].total_ordered_product_sales,
      vsSalesDiff: lastMonth[0].difference_in_sales,
      vsSalesChg: lastMonth[0].percent_change?.toFixed(2),
      UnitsDiff: lastMonth[0].difference_in_units,
      UnitsChg: lastMonth[0].unit_percent_change?.toFixed(2),
      vsUnitsLm: lastMonth[0].percent_change_units,
      vsUnitsDiff: lastMonth[0].difference_in_units,
      vsUnitsChg: lastMonth[0].percent_change_units,
      salesChange: lastMonth[0].percent_change?.toFixed(2),
      totalSalesLm: lastMonth[0].this_month_sales,
      totalSessionsUP: lastMonth[0].total_sessions_up,
      totalSessionsLm: lastMonth[0].total_sessions_lm,
      advertisementData: advertisingData[0] || {},
    };
  }
}
