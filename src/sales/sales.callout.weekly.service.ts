import { Injectable } from '@nestjs/common';
import { VendoBrandDBService } from '../prisma.service';
import dayjs from 'src/utils/date.util';
import { AdvertisingService } from '../advertising/advertising.service';
import { Prisma } from 'prisma/brand/generated/vendoBrand';
import { Dayjs } from 'dayjs';
@Injectable()
export class SalesCalloutWeeklyService {
  constructor(private branddb: VendoBrandDBService, private advertisingService: AdvertisingService) {}
  getYearToDayData(year: number, date: string): Prisma.PrismaPromise<any> {
    return this.branddb.client.$queryRawUnsafe(`
    SELECT
        astr_year AS year,
        MAX(astr_date) AS week_report_last_date,
        SUM(astr_units_ordered) AS total_ordered_units,
        ROUND(IFNULL(SUM(ordered_product_sales), 0), 2) AS total_ordered_product_sales,
        ROUND(IFNULL((SUM(astr_units_ordered) / SUM(astr_sessions)) * 100, 0), 2) AS conversion_rate
    FROM
        asin_business_report
    WHERE
       astr_year = ${year} AND astr_date <= '${date}'
    `);
  }

  selectedWeekQuery(date: dayjs.Dayjs): Prisma.PrismaPromise<any> {
    return this.branddb.client.$queryRaw`
      WITH
      this_week AS (
          SELECT
          ROUND(IFNULL(SUM(ordered_product_sales), 0), 2) AS this_week_sales,
          ROUND(IFNULL((SUM(astr_units_ordered) / SUM(astr_sessions)) * 100, 0), 2) AS conversion_rate_up,
          SUM(astr_sessions) AS total_sessions_up,
          SUM(astr_units_ordered) AS this_week_total_ordered_units,
          AVG(astr_buy_box_percentage) AS this_week_avg_buy_box_percentage,
          AVG(unit_session_percentage) AS unit_session_percentage_avg,
          AVG(astr_session_percentage) AS astr_session_percentage_avg
          FROM asin_business_report
          WHERE astr_week = ${date.week()} AND astr_year = ${date.year()}
      ),
      last_week AS (
          SELECT
          ROUND(IFNULL(SUM(ordered_product_sales), 0), 2) AS last_week_sales,
          ROUND(IFNULL((SUM(astr_units_ordered) / SUM(astr_sessions)) * 100, 0), 2) AS conversion_rate_lw,

          SUM(astr_sessions) AS total_sessions_lw,
          SUM(astr_units_ordered) AS total_ordered_units_lw,
          ROUND(IFNULL(SUM(astr_buy_box_percentage) / COUNT(astr_child_asin), 0), 2) AS avg_buy_box_percentage_lw

          FROM asin_business_report
          WHERE astr_week = ${date.subtract(1, 'week').week()} AND astr_year = ${date.subtract(1, 'week').year()}

      )
SELECT
    this_week.this_week_sales,
    last_week.last_week_sales,
    this_week.this_week_avg_buy_box_percentage,
    last_week.avg_buy_box_percentage_lw,
    this_week.this_week_total_ordered_units,
    last_week.total_ordered_units_lw,
    this_week.this_week_sales - last_week.last_week_sales AS difference_in_sales,
    this_week.this_week_total_ordered_units - last_week.total_ordered_units_lw AS difference_in_units,
    IF(last_week.last_week_sales = 0, NULL,
    ((this_week.this_week_sales - last_week.last_week_sales) / last_week.last_week_sales) * 100) AS percent_change,
    ((this_week.this_week_total_ordered_units - last_week.total_ordered_units_lw) / last_week.total_ordered_units_lw) * 100 AS unit_percent_change,
    this_week.conversion_rate_up,
    last_week.conversion_rate_lw,
    IF(last_week.conversion_rate_lw = 0, NULL,
    ((this_week.conversion_rate_up - last_week.conversion_rate_lw) / last_week.conversion_rate_lw) * 100) AS percent_change_conversion_rate,
    this_week.total_sessions_up,
    last_week.total_sessions_lw,
    IF(last_week.total_sessions_lw = 0, NULL,
    ((this_week.total_sessions_up - last_week.total_sessions_lw) / last_week.total_sessions_lw) * 100) AS percent_change_total_sessions
FROM
    this_week, last_week;
`;
  }

  getLastWeek(): Prisma.PrismaPromise<any> {
    return this.branddb.client.$queryRaw`
      WITH
      this_week AS (
          SELECT
          ROUND(IFNULL(SUM(ordered_product_sales), 0), 2) AS this_week_sales,
          ROUND(IFNULL((SUM(astr_units_ordered) / SUM(astr_sessions)) * 100, 0), 2) AS conversion_rate_up,
          SUM(astr_sessions) AS total_sessions_up,
          SUM(astr_units_ordered) AS this_week_total_ordered_units,
          AVG(astr_buy_box_percentage) AS this_week_avg_buy_box_percentage,
          AVG(unit_session_percentage) AS unit_session_percentage_avg,
          AVG(astr_session_percentage) AS astr_session_percentage_avg
          FROM asin_business_report
          WHERE astr_week = RIGHT(YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 1 WEEK), 6), 2) AND astr_year = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 WEEK))
      ),
      last_week AS (
          SELECT
          ROUND(IFNULL(SUM(ordered_product_sales), 0), 2) AS last_week_sales,
          ROUND(IFNULL((SUM(astr_units_ordered) / SUM(astr_sessions)) * 100, 0), 2) AS conversion_rate_lw,

          SUM(astr_sessions) AS total_sessions_lw,
          SUM(astr_units_ordered) AS total_ordered_units_lw,
          ROUND(IFNULL(SUM(astr_buy_box_percentage) / COUNT(astr_child_asin), 0), 2) AS avg_buy_box_percentage_lw

          FROM asin_business_report
          WHERE astr_week = RIGHT(YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 2 WEEK), 6), 2) AND astr_year = YEAR(DATE_SUB(CURDATE(), INTERVAL 2 WEEK))

      )
SELECT
    this_week.this_week_sales,
    last_week.last_week_sales,
    this_week.this_week_avg_buy_box_percentage,
    last_week.avg_buy_box_percentage_lw,
    this_week.this_week_total_ordered_units,
    last_week.total_ordered_units_lw,
    this_week.this_week_sales - last_week.last_week_sales AS difference_in_sales,
    this_week.this_week_total_ordered_units - last_week.total_ordered_units_lw AS difference_in_units,
    IF(last_week.last_week_sales = 0, NULL,
    ((this_week.this_week_sales - last_week.last_week_sales) / last_week.last_week_sales) * 100) AS percent_change,
    ((this_week.this_week_total_ordered_units - last_week.total_ordered_units_lw) / last_week.total_ordered_units_lw) * 100 AS unit_percent_change,
    this_week.conversion_rate_up,
    last_week.conversion_rate_lw,
    IF(last_week.conversion_rate_lw = 0, NULL,
    ((this_week.conversion_rate_up - last_week.conversion_rate_lw) / last_week.conversion_rate_lw) * 100) AS percent_change_conversion_rate,
    this_week.total_sessions_up,
    last_week.total_sessions_lw,
    IF(last_week.total_sessions_lw = 0, NULL,
    ((this_week.total_sessions_up - last_week.total_sessions_lw) / last_week.total_sessions_lw) * 100) AS percent_change_total_sessions
FROM
    this_week, last_week;
`;
  }
  getLast4Week(): Prisma.PrismaPromise<any> {
    return this.branddb.client.$queryRaw`
      WITH this_week AS (SELECT ROUND(IFNULL(SUM(ordered_product_sales), 0), 2) AS this_week_sales,
                          ROUND(IFNULL((SUM(astr_units_ordered) / SUM(astr_sessions)) * 100, 0),
                                2)                                        AS conversion_rate_up,
                          SUM(astr_sessions)                              AS total_sessions_up,
                          SUM(astr_units_ordered)                         AS this_week_total_ordered_units,
                          ROUND(IFNULL(SUM(astr_buy_box_percentage) / COUNT(astr_child_asin), 0),
                                2)                                        AS this_week_avg_buy_box_percentage

                   FROM asin_business_report
                   WHERE astr_week = RIGHT(YEARWEEK(astr_date, 6), 2)
                     and astr_year = YEAR(CURDATE())),
     last_week AS (SELECT ROUND(IFNULL(SUM(ordered_product_sales), 0), 2) AS last_week_sales,
                          ROUND(IFNULL(SUM(astr_units_ordered), 0), 2)    AS last_week_units,

                          ROUND(IFNULL((SUM(astr_units_ordered) / SUM(astr_sessions)) * 100, 0),
                                2)                                        AS conversion_rate_lw,
                          SUM(astr_sessions)                              AS total_sessions_lw,
                          SUM(astr_units_ordered)                         AS total_ordered_units_lw,
                          ROUND(IFNULL(SUM(astr_buy_box_percentage) / COUNT(astr_child_asin), 0),
                                2)                                        AS avg_buy_box_percentage_lw

                   FROM asin_business_report
                   WHERE astr_week = RIGHT(YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 1 WEEK), 6), 2)
                     AND astr_year = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 WEEK))),
     last_4_weeks AS (SELECT ROUND(IFNULL(SUM(ordered_product_sales) / (SELECT COUNT(DISTINCT astr_week)
                                                                        FROM asin_business_report
                                                                        WHERE (
                                                                                      (astr_week =
                                                                                       RIGHT(YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 5 WEEK), 6), 2) AND
                                                                                       astr_year =
                                                                                       YEAR(DATE_SUB(CURDATE(), INTERVAL 5 WEEK))) OR
                                                                                      (astr_week =
                                                                                       RIGHT(YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 4 WEEK), 6), 2) AND
                                                                                       astr_year =
                                                                                       YEAR(DATE_SUB(CURDATE(), INTERVAL 4 WEEK))) OR
                                                                                      (astr_week =
                                                                                       RIGHT(YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 3 WEEK), 6), 2) AND
                                                                                       astr_year =
                                                                                       YEAR(DATE_SUB(CURDATE(), INTERVAL 3 WEEK))) OR
                                                                                      (astr_week =
                                                                                       RIGHT(YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 2 WEEK), 6), 2) AND
                                                                                       astr_year =
                                                                                       YEAR(DATE_SUB(CURDATE(), INTERVAL 2 WEEK)))
                                                                                  )), 0),
                                   2)                AS last_4_weeks_average_sales,
                             ROUND(IFNULL(SUM(astr_units_ordered) / (SELECT COUNT(DISTINCT astr_week)
                                                                     FROM asin_business_report
                                                                     WHERE (
                                                                                   (astr_week =
                                                                                    RIGHT(YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 5 WEEK), 6), 2) AND
                                                                                    astr_year =
                                                                                    YEAR(DATE_SUB(CURDATE(), INTERVAL 5 WEEK))) OR
                                                                                   (astr_week =
                                                                                    RIGHT(YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 4 WEEK), 6), 2) AND
                                                                                    astr_year =
                                                                                    YEAR(DATE_SUB(CURDATE(), INTERVAL 4 WEEK))) OR
                                                                                   (astr_week =
                                                                                    RIGHT(YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 3 WEEK), 6), 2) AND
                                                                                    astr_year =
                                                                                    YEAR(DATE_SUB(CURDATE(), INTERVAL 3 WEEK))) OR
                                                                                   (astr_week =
                                                                                    RIGHT(YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 2 WEEK), 6), 2) AND
                                                                                    astr_year =
                                                                                    YEAR(DATE_SUB(CURDATE(), INTERVAL 2 WEEK)))
                                                                               )), 0),
                                   2)                AS last_4_weeks_average_units,

                             ROUND(IFNULL((SUM(astr_units_ordered) / SUM(astr_sessions)) * 100, 0),
                                   2)                AS conversion_rate_l4w,
                             SUM(astr_sessions)      AS total_sessions_l4w,
                             SUM(astr_units_ordered) AS total_ordered_units_l4w,
                             ROUND(IFNULL(SUM(astr_buy_box_percentage) / COUNT(astr_child_asin), 0),
                                   2)                AS avg_buy_box_percentage_l4w

                      FROM asin_business_report
                      WHERE (
                                    (astr_week = RIGHT(YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 5 WEEK), 6), 2) AND
                                     astr_year = YEAR(DATE_SUB(CURDATE(), INTERVAL 5 WEEK))) OR
                                    (astr_week = RIGHT(YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 4 WEEK), 6), 2) AND
                                     astr_year = YEAR(DATE_SUB(CURDATE(), INTERVAL 4 WEEK))) OR
                                    (astr_week = RIGHT(YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 3 WEEK), 6), 2) AND
                                     astr_year = YEAR(DATE_SUB(CURDATE(), INTERVAL 3 WEEK))) OR
                                    (astr_week = RIGHT(YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 2 WEEK), 6), 2) AND
                                     astr_year = YEAR(DATE_SUB(CURDATE(), INTERVAL 2 WEEK)))
                                ))
SELECT last_week.last_week_sales,
       last_week.last_week_units,
       last_4_weeks.last_4_weeks_average_sales,
       last_4_weeks.last_4_weeks_average_units,

       last_week.last_week_sales - last_4_weeks.last_4_weeks_average_sales     AS difference_in_sales,
       IF(last_4_weeks.last_4_weeks_average_sales = 0, NULL,
          ((last_week.last_week_sales - last_4_weeks.last_4_weeks_average_sales) /
           last_4_weeks.last_4_weeks_average_sales) *
          100)                                                                 AS percent_change,

       last_week.last_week_units - last_4_weeks.last_4_weeks_average_units     AS difference_in_units,
       IF(last_4_weeks.last_4_weeks_average_units = 0, NULL,
          ((last_week.last_week_units - last_4_weeks.last_4_weeks_average_units) /
           last_4_weeks.last_4_weeks_average_units) *
          100)                                                                 AS units_percent_change,


       last_week.conversion_rate_lw,
       last_week.total_ordered_units_lw - last_4_weeks.total_ordered_units_l4w AS difference_in_units,
       ((last_week.total_ordered_units_lw - last_4_weeks.total_ordered_units_l4w) /
        last_4_weeks.total_ordered_units_l4w) *
       100                                                                     AS unit_percent_change,
       last_4_weeks.conversion_rate_l4w,
       IF(last_4_weeks.conversion_rate_l4w = 0, NULL,
          ((last_week.conversion_rate_lw - last_4_weeks.conversion_rate_l4w) / last_4_weeks.conversion_rate_l4w) *
          100)                                                                 AS percent_change_conversion_rate,
       last_week.total_sessions_lw,
       last_4_weeks.total_sessions_l4w,
       IF(last_4_weeks.total_sessions_l4w = 0, NULL,
          ((last_week.total_sessions_lw - last_4_weeks.total_sessions_l4w) / last_4_weeks.total_sessions_l4w) *
          100)                                                                 AS percent_change_total_sessions
FROM last_week,
     last_4_weeks;
`;
  }

  async getMaxDate() {
    const date: [{ latest_date: string }] = await this.branddb.client
      .$queryRaw`SELECT MAX(astr_date) AS latest_date FROM asin_business_report`;
    return dayjs(date[0]?.latest_date).format('YYYY-MM-DD');
  }
  async getSalesByProduct(year: number, weeks: number[]) {
    try {
      const date: [{ latest_date: string }] = await this.branddb.client
        .$queryRaw`SELECT MAX(astr_date) AS latest_date FROM asin_business_report WHERE astr_year = ${year}`;

      const [ytd, lastYtd, last4Weeks, lastWeek] = await this.branddb.client.$transaction([
        this.getYearToDayData(year, dayjs(date[0]?.latest_date).format('YYYY-MM-DD')),
        this.getYearToDayData(year - 1, dayjs(date[0]?.latest_date).subtract(1, 'year').format('YYYY-MM-DD')),
        this.getLast4Week(),
        this.getLastWeek(),
      ]);
      const lastYearSales = lastYtd[0]?.total_ordered_product_sales || 0;
      const lastYearChange = lastYearSales
        ? ((ytd[0]?.total_ordered_product_sales - lastYearSales) / lastYearSales) * 100
        : 0;
      const weeklyData: any[] = await this.branddb.client.$queryRaw`
          WITH cleaned_asin_report as (SELECT astr_week            AS week,
                                              astr_year            AS year,
                                              SUM(astr_units_ordered)    AS total_ordered_units,
                                              SUM(ordered_product_sales) AS total_ordered_product_sales
                                       FROM asin_business_report
                                       GROUP BY astr_year, astr_week)
          SELECT all_weeks.year,
                 all_weeks.week,
                 COALESCE(this_year.total_ordered_units, 0)                                                   AS total_ordered_units_this_week,
                 COALESCE(this_year.total_ordered_product_sales, 0)                                           AS total_ordered_product_sales_this_week,
                 COALESCE(prev_week.total_ordered_units, 0)                                                   AS prev_week_units,
                 COALESCE(prev_week.total_ordered_product_sales, 0)                                           AS prev_week_sales,
                 COALESCE(prev_year.total_ordered_units, 0)                                                   AS prev_year_units,
                 COALESCE(prev_year.total_ordered_product_sales, 0)                                           AS prev_year_sales,
                 COALESCE(this_year.total_ordered_units, 0) -
                 COALESCE(prev_week.total_ordered_units, 0)                                                   AS week_on_week_unit_diff,
                 (COALESCE(this_year.total_ordered_units, 0) - COALESCE(prev_week.total_ordered_units, 0)) /
                 COALESCE(prev_week.total_ordered_units, 1) *
                 100                                                                                          AS week_on_week_unit_perc,
                 COALESCE(this_year.total_ordered_product_sales, 0) -
                 COALESCE(prev_week.total_ordered_product_sales, 0)                                           AS week_on_week_sales_diff,
                 (COALESCE(this_year.total_ordered_product_sales, 0) -
                  COALESCE(prev_week.total_ordered_product_sales, 0)) /
                 COALESCE(prev_week.total_ordered_product_sales, 1) *
                 100                                                                                          AS week_on_week_sales_perc,
                 COALESCE(prev_year.total_ordered_units, 0) -
                 COALESCE(prev_week_year.total_ordered_units, 0)                                              AS year_on_year_unit_diff,
                 (COALESCE(prev_year.total_ordered_units, 0) - COALESCE(prev_week_year.total_ordered_units, 0)) /
                 COALESCE(prev_week_year.total_ordered_units, 1) *
                 100                                                                                          AS year_on_year_unit_perc,
                 COALESCE(prev_year.total_ordered_product_sales, 0) -
                 COALESCE(prev_week_year.total_ordered_product_sales, 0)                                      AS year_on_year_sales_diff,
                 COALESCE(prev_year.total_ordered_product_sales, 0)                                           AS year_on_year_sales,
                 COALESCE(prev_year.total_ordered_units, 0)                                                   AS year_on_year_unit,
                 (COALESCE(prev_year.total_ordered_product_sales, 0) -
                  COALESCE(prev_week_year.total_ordered_product_sales, 0)) /
                 COALESCE(prev_week_year.total_ordered_product_sales, 1) *
                 100                                                                                          AS year_on_year_sales_perc
                FROM (SELECT ${year} AS year,
                week FROM (SELECT 1 AS week UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
                          UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20
                          UNION SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25 UNION SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29 UNION SELECT 30
                          UNION SELECT 31 UNION SELECT 32 UNION SELECT 33 UNION SELECT 34 UNION SELECT 35 UNION SELECT 36 UNION SELECT 37 UNION SELECT 38 UNION SELECT 39 UNION SELECT 40
                          UNION SELECT 41 UNION SELECT 42 UNION SELECT 43 UNION SELECT 44 UNION SELECT 45 UNION SELECT 46 UNION SELECT 47 UNION SELECT 48 UNION SELECT 49 UNION SELECT 50
                          UNION SELECT 51 UNION SELECT 52) weeks) all_weeks
                   LEFT JOIN cleaned_asin_report this_year
                             ON all_weeks.week = this_year.week AND all_weeks.year = this_year.year
                   LEFT JOIN cleaned_asin_report prev_week ON
                  (all_weeks.week > 1 and all_weeks.week = prev_week.week + 1 AND all_weeks.year = prev_week.year) or
                  (all_weeks.week = 1 and prev_week.week = 52 AND all_weeks.year = prev_week.year + 1)
                   LEFT JOIN cleaned_asin_report prev_year
                             ON all_weeks.week = prev_year.week AND all_weeks.year = prev_year.year + 1
                  LEFT JOIN cleaned_asin_report prev_week_year ON
    (all_weeks.week > 1 AND all_weeks.week = prev_week_year.week + 1 AND all_weeks.year = prev_week_year.year + 1) OR
    (all_weeks.week = 1 AND prev_week_year.week = 52 AND all_weeks.year = prev_week_year.year + 2)

          ORDER BY all_weeks.year ASC, all_weeks.week ASC;
      `;
      const dateLastWeek = dayjs().subtract(1, 'week');

      // Getting the week of the year and year of the date last week
      const ads_week = dateLastWeek.week();
      const ads_year = dateLastWeek.year();
      const advertisingData = await this.advertisingService.getTotalRevenueWeekly({
        weeks: ads_week.toString(),
        years: ads_year.toString(),
      });
      const weekDetail = weeklyData
        .map((wwd) => {
          const date = dayjs().year(Number(wwd.year)).startOf('year').week(Number(wwd.week));
          const zeroFlag =
            Number(wwd.total_ordered_product_sales_this_week) === 0 && Number(wwd.total_ordered_units_this_week) === 0;
          if (weeks.includes(Number(wwd.week)))
            return {
              week: wwd.week,
              startdate: date.startOf('week').format('YYYY-MM-DD'),
              enddate: date.endOf('week').format('YYYY-MM-DD'),
              this_week_total_sales: wwd.total_ordered_product_sales_this_week?.toFixed(2),
              this_week_sales_diff: !zeroFlag ? wwd.week_on_week_sales_diff?.toFixed(2) : 0,
              this_week_sales_change: !zeroFlag ? wwd.week_on_week_sales_perc?.toFixed(2) : 0,
              this_week_total_units: wwd.total_ordered_units_this_week?.toFixed(2),
              this_week_units_diff: !zeroFlag ? wwd.week_on_week_unit_diff?.toFixed(2) : 0,
              this_week_units_change: !zeroFlag ? wwd.week_on_week_unit_perc?.toFixed(2) : 0,
              last_year_total_sales: wwd.prev_year_sales?.toFixed(2),
              last_year_sales_diff: wwd.year_on_year_sales_diff?.toFixed(2),
              last_year_sales_change: wwd.year_on_year_sales_perc?.toFixed(2),
              last_year_total_units: wwd.prev_year_units?.toFixed(2),
              last_year_units_diff: wwd.year_on_year_unit_diff?.toFixed(2),
              last_year_units_change: wwd.year_on_year_unit_perc?.toFixed(2),
            };
        })
        .filter((w) => !!w);

      return {
        avgBuyBoxPercentage: lastWeek[0].this_week_avg_buy_box_percentage,
        conversionRate: lastWeek[0].conversion_rate_up,
        upVsLwSession: lastWeek[0].percent_change_total_sessions,
        totalSalesLastWeek: lastWeek[0].this_week_sales,
        upVsLw: lastWeek[0].difference_in_sales,
        upLwDiff: lastWeek[0].percent_change?.toFixed(2),
        upVsL4wk: last4Weeks[0].difference_in_sales,
        ytdSales: ytd.length > 0 ? ytd[0].total_ordered_product_sales : 0,
        lwTotalSales: lastWeek[0].this_week_sales,
        vsSalesL4wk: last4Weeks[0].difference_in_sales,
        vsSalesDiff: lastWeek[0].difference_in_sales,
        vsSalesChg: lastWeek[0].percent_change?.toFixed(2),
        UnitsDiff: lastWeek[0].difference_in_units,
        UnitsChg: lastWeek[0].unit_percent_change?.toFixed(2),
        vsUnitsLw: lastWeek[0].percent_change_units,
        vsUnitsL4wk: last4Weeks[0].percent_change_units,
        vsUnitsDiff: lastWeek[0].difference_in_units,
        vsUnitsChg: lastWeek[0].percent_change_units,
        salesChange: lastWeek[0].percent_change?.toFixed(2),
        lastYearSales: lastYearSales,
        lastYearSalesChange: lastYearChange,
        totalSalesLW: lastWeek[0].this_week_sales,
        lwVsL4wk: last4Weeks[0].difference_in_sales,
        totalSalesL4wk: last4Weeks[0].last_4_weeks_average_sales,
        totalSalesL4wkChange: last4Weeks[0].percent_change?.toFixed(2),
        totalSalesL4wkDiff: last4Weeks[0].difference_in_sales,
        unitsLw: last4Weeks[0].last_week_units,
        totalUnitsL4wk: last4Weeks[0].last_4_weeks_average_units,
        totalUnitsL4wkChange: last4Weeks[0].units_percent_change?.toFixed(2),
        totalUnitsL4wkDiff: last4Weeks[0].last_week_units - last4Weeks[0].last_4_weeks_average_units,
        totalSessionsUP: lastWeek[0].total_sessions_up,
        totalSessionsLW: lastWeek[0].total_sessions_lw,
        advertisementData: advertisingData[0] || {},
        weekDetail,
      };
    } catch (e) {
      if (e.name == 'PrismaClientKnownRequestError') {
        if (e.code === 'P2015') {
          return {
            avgBuyBoxPercentage: 0,
            conversionRate: 0,
            upVsLwSession: 0,
            totalSalesLastWeek: 0,
            upVsLw: 0,
            upLwDiff: 0,
            upVsL4wk: 0,
            ytdSales: 0,
            lwTotalSales: 0,
            vsSalesL4wk: 0,
            vsSalesDiff: 0,
            vsSalesChg: 0,
            UnitsDiff: 0,
            UnitsChg: 0,
            vsUnitsLw: 0,
            vsUnitsL4wk: 0,
            vsUnitsDiff: 0,
            vsUnitsChg: 0,
            salesChange: 0,
            lastYearSales: 0,
            lastYearSalesChange: 0,
            totalSalesLW: 0,
            lwVsL4wk: 0,
            totalSalesL4wk: 0,
            totalSalesL4wkChange: 0,
            totalSalesL4wkDiff: 0,
            unitsLw: 0,
            totalUnitsL4wk: 0,
            totalUnitsL4wkChange: 0,
            totalUnitsL4wkDiff: 0,
            totalSessionsUP: 0,
            totalSessionsLW: 0,
            advertisementData: 0,
            weekDetail: 0,
          };
        } else {
          throw e;
        }
      }
    }
  }

  async getSelectedCalloutData(year: number, week: number, lastFullPeriod: boolean): Promise<any> {
    let date = dayjs().year(year).week(week);
    let maxDate: Dayjs | null = null;
    if (lastFullPeriod) {
      date = dayjs(await this.getMaxDate());
      maxDate = date.clone();
      if (date.isBefore(dayjs().endOf('week'))) {
        date = date.subtract(1, 'week');
      }
    }
    const lastWeek = await this.selectedWeekQuery(date);
    const ytdSales: [{ total_ordered_product_sales: number }] = await this.branddb.client.$queryRaw`
    SELECT ROUND(IFNULL(SUM(ordered_product_sales), 0), 2) AS total_ordered_product_sales
    FROM
        asin_business_report
    WHERE
       astr_year = ${date.year()} AND astr_week <= ${date.week()}`;
    const advertisingData = await this.advertisingService.getTotalRevenueWeekly({
      weeks: date.week().toString(),
      years: date.year().toString(),
    });

    return {
      maxDate: maxDate && maxDate.format('YYYY-MM-DD'),
      avgBuyBoxPercentage: lastWeek[0].this_week_avg_buy_box_percentage,
      conversionRate: lastWeek[0].conversion_rate_up,
      upVsLwSession: lastWeek[0].percent_change_total_sessions,
      totalSalesLastWeek: lastWeek[0].this_week_sales,
      upVsLw: lastWeek[0].difference_in_sales,
      upLwDiff: lastWeek[0].percent_change?.toFixed(2),
      lwTotalSales: lastWeek[0].this_week_sales,
      ytdSales: ytdSales[0].total_ordered_product_sales,
      vsSalesDiff: lastWeek[0].difference_in_sales,
      vsSalesChg: lastWeek[0].percent_change?.toFixed(2),
      UnitsDiff: lastWeek[0].difference_in_units,
      UnitsChg: lastWeek[0].unit_percent_change?.toFixed(2),
      vsUnitsLw: lastWeek[0].percent_change_units,
      vsUnitsDiff: lastWeek[0].difference_in_units,
      vsUnitsChg: lastWeek[0].percent_change_units,
      salesChange: lastWeek[0].percent_change?.toFixed(2),
      totalSalesLW: lastWeek[0].this_week_sales,
      totalSessionsUP: lastWeek[0].total_sessions_up,
      totalSessionsLW: lastWeek[0].total_sessions_lw,
      advertisementData: advertisingData[0] || {},
    };
  }
}
