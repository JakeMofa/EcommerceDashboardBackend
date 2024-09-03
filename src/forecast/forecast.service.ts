import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { VendoBrandDBService, VendoCommerceDBService } from 'src/prisma.service';
import * as _ from 'lodash';
import { Logger } from '@nestjs/common';
import { ifNullValue } from 'src/utils/number.util';
import dayjs from 'src/utils/date.util';
import { Brand } from '@scaleleap/amazon-advertising-api-sdk';

type ForecastMonthlyData = {
  month: number;
  adBudget: number;
  forecast: number;
  sale: number;
  spend: number;
  revenue: number;
  organicRevenue: number;
  variance: number;
  variancePercentage: number;
  monthPerMonthGrowth: number;
  forcastTacos: number;
  actualTacos: number;
  adBudgetVariance: number;
};

type QuarterlyData = {
  quarter: string; // 'Q1', 'Q2', 'Q3', 'Q4'
} & Omit<ForecastMonthlyData, 'month'>;

type TotalData = Omit<ForecastMonthlyData, 'month' | 'monthPerMonthGrowth'>;

@Injectable()
export class ForecastService {
  prisma: any;
  constructor(private commerceDb: VendoCommerceDBService, private brandDb: VendoBrandDBService) {}
  logger = new Logger(ForecastService.name);

  private async getExcelData(
    buffer: Buffer,
  ): Promise<{ forecast: _.Dictionary<unknown>; adBudget: _.Dictionary<unknown> }> {
    try {
      this.logger.debug('Loading workbook from buffer');
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      this.logger.debug('Extracting worksheet from workbook');
      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        throw new NotFoundException(`The file does not contain any worksheets.`);
      }

      const extractDataFromRow = (rowNum: number) => {
        this.logger.debug(`Extracting data from row ${rowNum}`);
        const row = worksheet.getRow(rowNum);
        if (!row) {
          throw new NotFoundException(`Row ${rowNum} does not exist in the worksheet.`);
        }

        return _.fromPairs(
          Array.from({ length: 12 }, (_, idx) => {
            const value = row.getCell(idx + 2).value?.toString() ?? '';
            return [idx, Number(value.replace(/[^0-9.-]+/g, ''))];
          }),
        );
      };
      const forecast = extractDataFromRow(2);
      const adBudget = extractDataFromRow(3);

      return { forecast, adBudget };
    } catch (err) {
      this.logger.error(`Failed to extract data from Excel file: ${err}`);
      if (err instanceof NotFoundException) {
        throw err;
      } else {
        throw new BadRequestException(`Failed to extract data from Excel file: ${err}`);
      }
    }
  }

  async extractDataFromExcel(buffer: Buffer, year: number, brandsId: number) {
    try {
      this.logger.debug('Starting to extract data from Excel buffer');
      const { forecast, adBudget } = await this.getExcelData(buffer);

      this.logger.debug('Preparing upsert queries');
      const upsertQueries = Object.entries(forecast).map(([month, forecast]) => {
        const adBudgetValue = adBudget[Number(month)];
        const numericMonth = Number(month);
        return this.commerceDb.forecast.upsert({
          where: { month_year: { month: numericMonth, year: year, brandsId } },
          update: { forecast: Number(forecast), adBudget: Number(adBudgetValue), brandsId },
          create: { month: numericMonth, year, forecast: Number(forecast), adBudget: Number(adBudgetValue), brandsId },
        });
      });

      this.logger.debug('Executing upsert queries in transaction');
      await this.commerceDb.$transaction(upsertQueries);
      this.logger.debug('Data upserted successfully');
    } catch (err) {
      this.logger.error(`Failed to upsert data into the database: ${err}`);
      if (err instanceof BadRequestException || err instanceof NotFoundException) {
        throw err;
      } else {
        throw new InternalServerErrorException(`Failed to upsert data into the database: ${err}`);
      }
    }
  }

  sumRevenuesByMonth(array2D) {
    try {
      const tempObj = array2D.reduce((acc, subArray) => {
        subArray.forEach(({ month, year, revenue }) => {
          const key = `${month}-${year}`;
          if (acc[key]) {
            acc[key].revenue += revenue;
          } else {
            acc[key] = { month, year, revenue };
          }
        });
        return acc;
      }, {});
      return Object.values(tempObj);
    } catch (error) {
      this.logger.error(`Error in sumRevenuesByMonth: ${error}`);
      throw error;
    }
  }

  async getDbNames(brandIds) {
    const dbNames = await this.commerceDb.brands.findMany({
      where: { id: { in: brandIds }, status: 'Created' },
      select: {
        db_name: true,
      },
    });
    return _.flatMap(_.omitBy(dbNames, _.isNull), (d) => d.db_name);
  }
  // async getAllBrandsRevenue(brandIds: string[], months: string, year: string) {
  //   return this.brandDb.queryAllDatabases(
  //     brandIds,
  //     `
  //     SELECT COALESCE(m.month, a.month) month, COALESCE(m.year, a.year) year, COALESCE(m.revenue, a.revenue) revenue, COALESCE(m.spend, a.spend) spend
  //     FROM (SELECT MONTH(amr.report_date) month, YEAR(amr.report_date) year, ROUND(SUM(amr.total_sales_7d), 2) revenue, ROUND(SUM(amr.spend), 2) spend
  //           FROM advertising_manual_report amr
  //           WHERE MONTH(amr.report_date) IN (${months}) AND YEAR(amr.report_date) IN (${year})
  //           GROUP BY MONTH(amr.report_date), YEAR(amr.report_date)
  //     ) m
  //     LEFT OUTER JOIN (
  //     SELECT base.*
  //     FROM (SELECT apr.year, apr.month AS month, COALESCE(apr.revenue, 0) + COALESCE(adcr.revenue, 0) + COALESCE(abvcr.revenue, 0) as revenue, COALESCE(apr.spend, 0) + COALESCE(adcr.spend, 0) + COALESCE(abvcr.spend, 0) as spend
  //           FROM (SELECT MONTH(b.report_date) month, YEAR(b.report_date) year, ROUND(IFNULL(SUM(b.attributed_sales7d), 0), 2) revenue, ROUND(IFNULL(SUM(b.cost), 0), 2) spend
  //                 FROM advertising_product_report b
  //                 WHERE YEAR(b.report_date) IN (${year}) AND MONTH(b.report_date) IN (${months})
  //                 GROUP BY MONTH(b.report_date), YEAR(b.report_date)
  //           ) apr
  //           LEFT JOIN (
  //                 SELECT MONTH(b.report_date) month, YEAR(b.report_date) year, ROUND(IFNULL(SUM(b.attributed_sales_14d), 0), 2) revenue, ROUND(IFNULL(SUM(b.cost), 0), 2) spend
  //                 FROM advertising_brands_video_campaigns_report b
  //                 GROUP BY MONTH(b.report_date), YEAR(b.report_date)
  //           ) abvcr ON abvcr.year = apr.year AND abvcr.month = apr.month
  //           LEFT JOIN (
  //                 SELECT MONTH(b.report_date) month, YEAR(b.report_date) year, ROUND(IFNULL(SUM(b.attributed_sales14d), 0), 2) revenue, ROUND(IFNULL(SUM(b.cost), 0), 2) spend
  //                 FROM advertising_display_campaigns_report b
  //                 GROUP BY MONTH(b.report_date), YEAR(b.report_date)
  //           ) adcr ON adcr.year = apr.year AND adcr.month = apr.month
  //     ) base
  //     ) a ON a.month = m.month AND a.year = m.year
  //     UNION
  //     SELECT COALESCE(m.month, a.month) month, COALESCE(m.year, a.year) year, COALESCE(m.revenue, a.revenue) revenue, COALESCE(m.spend, a.spend) spend
  //     FROM (SELECT MONTH(amr.report_date) month, YEAR(amr.report_date) year, ROUND(SUM(amr.total_sales_7d), 2) revenue, ROUND(SUM(amr.spend), 2) spend
  //           FROM advertising_manual_report amr
  //           WHERE MONTH(amr.report_date) IN (${months}) AND YEAR(amr.report_date) IN (${year})
  //           GROUP BY MONTH(amr.report_date), YEAR(amr.report_date)
  //     ) m
  //     RIGHT OUTER JOIN (
  //     SELECT base.*
  //     FROM (SELECT apr.year, apr.month AS month, COALESCE(apr.revenue, 0) + COALESCE(adcr.revenue, 0) + COALESCE(abvcr.revenue, 0) as revenue, COALESCE(apr.spend, 0) + COALESCE(adcr.spend, 0) + COALESCE(abvcr.spend, 0) as spend
  //           FROM (SELECT MONTH(b.report_date) month, YEAR(b.report_date) year, ROUND(IFNULL(SUM(b.attributed_sales7d), 0), 2) revenue, ROUND(IFNULL(SUM(b.cost), 0), 2) spend
  //                 FROM advertising_product_report b
  //                 WHERE YEAR(b.report_date) IN (${year}) AND MONTH(b.report_date) IN (${months})
  //                 GROUP BY MONTH(b.report_date), YEAR(b.report_date)
  //           ) apr
  //           LEFT JOIN (
  //                 SELECT MONTH(b.report_date) month, YEAR(b.report_date) year, ROUND(IFNULL(SUM(b.attributed_sales_14d), 0), 2) revenue, ROUND(IFNULL(SUM(b.cost), 0), 2) spend
  //                 FROM advertising_brands_video_campaigns_report b
  //                 GROUP BY MONTH(b.report_date), YEAR(b.report_date)
  //           ) abvcr ON abvcr.year = apr.year AND abvcr.month = apr.month
  //           LEFT JOIN (
  //                 SELECT MONTH(b.report_date) month, YEAR(b.report_date) year, ROUND(IFNULL(SUM(b.attributed_sales14d), 0), 2) revenue, ROUND(IFNULL(SUM(b.cost), 0), 2) spend
  //                 FROM advertising_display_campaigns_report b
  //                 GROUP BY MONTH(b.report_date), YEAR(b.report_date)
  //           ) adcr ON adcr.year = apr.year AND adcr.month = apr.month
  //     ) base
  //     ) a ON a.month = m.month AND a.year = m.year;
  //       `,
  //   );
  // }
  // async getAllBrandsSales(brandIds: string[], months: string, year: string) {
  //   return this.brandDb.queryAllDatabases(
  //     brandIds,
  //     `
  //     SELECT
  //       astr_month as month,
  //       astr_year as year,
  //       ROUND(SUM(ordered_product_sales), 2) AS total_ordered_product_sales
  //     FROM
  //       asin_business_report
  //     WHERE
  //       astr_year = ${year}
  //       AND astr_month in (${months})
  //     GROUP BY
  //       astr_month,
  //       astr_year
  //     `,
  //   );
  // }
  async calculateForecast({
    brandsId,
    months,
    year,
    categoriesId,
    AMs,
  }: {
    brandsId?: number[];
    months: string;
    year: string;
    categoriesId?: number[];
    AMs?: number[];
  }) {
    const filteredBrandIds = await this.commerceDb.brands.findMany({
      where: {
        AND: [
          { status: 'Created' },
          { ...(brandsId ? { id: { in: brandsId } } : {}) },
          { ...(categoriesId ? { Categories: { some: { id: { in: categoriesId } } } } : {}) },
          { ...(AMs ? { account_manager: { id: { in: AMs } } } : {}) },
        ],
      },
    });
    this.logger.debug('queries', { AMs, categoriesId, brandsId });
    this.logger.debug('founded brand Ids', { AMs, categoriesId, brandsId });

    const brandsTotal = await this.commerceDb.allBrandsSum.groupBy({
      by: ['month', 'year'],
      where: { year: parseInt(year), brandsId: { in: filteredBrandIds.map((brand) => brand.id) } },
      _sum: {
        sale: true,
        revenue: true,
        spend: true,
      },
      orderBy: { month: 'asc' },
    });
    const forecastData = await this.commerceDb.forecast.groupBy({
      where: {
        year: parseInt(year),
        month: { in: months.split(',').map((m) => +m) },
        brandsId: { in: filteredBrandIds.map((brand) => brand.id) },
      },
      _sum: {
        adBudget: true,
        forecast: true,
      },
      by: ['month', 'year'],
    });
    months.split(',').forEach((month) => {
      if (!forecastData.some((inputObj) => inputObj.month === +month)) {
        forecastData.push({
          _sum: { adBudget: 0, forecast: 0 },
          month: +month,
          year: +year,
        });
      }
    });
    // months.split(',').map();
    const mergedData = forecastData.map((forecast) => {
      const total = brandsTotal.find((brand) => brand.month === forecast.month);
      return {
        months: forecast.month,
        adBudget: forecast._sum.adBudget || 0,
        forecast: forecast._sum.forecast || 0,
        sale: total?._sum.sale || 0,
        spend: total?._sum.spend || 0,
        revenue: total?._sum.revenue || 0,
      };
    });

    const monthlyData = mergedData.map((data, index, arr) => {
      const variance = ifNullValue(+(data.sale - data.forecast!).toFixed(2), 0);
      const variancePercentage = ifNullValue(+((data.forecast! / variance) * 100).toFixed(2), 0);
      const monthPerMonthGrowth =
        index > 0
          ? +((((data.forecast || 0) - (arr[index - 1].forecast || 0)) / (arr[index - 1].forecast || 0)) * 100).toFixed(
              2,
            )
          : 0;
      const actualMonthPerMonthGrowth =
        index > 0
          ? +((((data.sale || 0) - (arr[index - 1].sale || 0)) / (arr[index - 1].sale || 0)) * 100).toFixed(2)
          : 0;
      return {
        month: data.months,
        adBudget: data.adBudget,
        forecast: data.forecast,
        sale: data.sale,
        spend: data.spend,
        revenue: data.revenue,
        organicRevenue: ifNullValue(data.sale - data.revenue, 0),
        variance,
        variancePercentage,
        monthPerMonthGrowth,
        actualMonthPerMonthGrowth,
        forcastTacos: ifNullValue(+(((data.adBudget || 0) / (data.forecast || 0)) * 100).toFixed(2), 0),
        actualTacos: ifNullValue(+(((data.spend || 0) / (data.sale || 0)) * 100).toFixed(2), 0),
        adBudgetVariance: ifNullValue(data.spend - (data.adBudget || 0), 0),
      };
    });
    const aggregate = (data: ForecastMonthlyData[]): Omit<ForecastMonthlyData, 'month'> => {
      return {
        adBudget: _.sumBy(data, 'adBudget'),
        forecast: _.sumBy(data, 'forecast'),
        sale: _.sumBy(data, 'sale'),
        spend: _.sumBy(data, 'spend'),
        revenue: _.sumBy(data, 'revenue'),
        organicRevenue: _.sumBy(data, (d) => d.sale - d.revenue),
        variance: _.sumBy(data, 'variance'),
        monthPerMonthGrowth: _.sumBy(data, 'monthPerMonthGrowth'),
        variancePercentage: _.meanBy(data, 'variancePercentage'),
        forcastTacos: _.meanBy(data, 'forcastTacos'),
        actualTacos: _.meanBy(data, 'actualTacos'),
        adBudgetVariance: _.sumBy(data, 'adBudgetVariance'),
      };
    };
    const quarters: QuarterlyData[] = _.chunk(monthlyData, 3).map((quarterData, idx) => {
      const quarter = `Q${idx + 1}`;
      return {
        quarter,
        ...aggregate(quarterData),
      };
    });

    const total: TotalData = aggregate(monthlyData);

    return {
      monthly: monthlyData,
      quarters,
      total,
    };
  }

  async insertBrand() {
    const dbs = await this.commerceDb.brands.findMany({
      where: { status: 'Created', AND: [{ db_name: { not: null } }, { db_name: { not: '' } }] },
      select: { id: true, db_name: true },
    });
    this.logger.debug(dbs);
    const chunks = _.chunk(dbs, 3);
    for (const chunk of chunks) {
      const promises = chunk.map(async (db) => {
        const client = await this.brandDb.createClient(db.db_name || '');
        await client.$connect();
        this.logger.debug('connected to client: ' + db.db_name);

        const ads: any[] = await client.$queryRaw`
  SELECT COALESCE(m.date, a.date)       date,
         COALESCE(m.revenue, a.revenue) revenue,
         COALESCE(m.spend, a.spend)     spend
  FROM (select amr.report_date as                date,
               ROUND(SUM(amr.total_sales_7d), 2) revenue,
               ROUND(SUM(amr.spend), 2)          spend
        FROM advertising_manual_report amr
        GROUP BY amr.report_date) m
           LEFT OUTER JOIN (SELECT base.*
                            FROM (SELECT apr.date                   AS date,
                                         COALESCE(apr.revenue, 0) + COALESCE(adcr.revenue, 0) +
                                         COALESCE(abvcr.revenue, 0) as revenue,
                                         COALESCE(apr.spend, 0) + COALESCE(adcr.spend, 0) +
                                         COALESCE(abvcr.spend, 0)   as spend
                                  FROM (select b.report_date as                               date,
                                               ROUND(IFNULL(SUM(b.attributed_sales7d), 0), 2) revenue,
                                               ROUND(IFNULL(SUM(b.cost), 0), 2)               spend
                                        FROM advertising_product_report b
                                        GROUP BY b.report_date) apr
                                           LEFT JOIN (select b.report_date as                                 date,
                                                             ROUND(IFNULL(SUM(b.attributed_sales_14d), 0), 2) revenue,
                                                             ROUND(IFNULL(SUM(b.cost), 0), 2)                 spend
                                                      FROM advertising_brands_video_campaigns_report b
                                                      GROUP BY b.report_date) abvcr
                                                     ON FORMAT(abvcr.date, 'dd-MM-yyyy') = FORMAT(apr.date, 'dd-MM-yyyy')
                                           LEFT JOIN (select b.report_date as                                date,
                                                             ROUND(IFNULL(SUM(b.attributed_sales14d), 0), 2) revenue,
                                                             ROUND(IFNULL(SUM(b.cost), 0), 2)                spend
                                                      FROM advertising_display_campaigns_report b
                                                      GROUP BY b.report_date) adcr
                                                     ON FORMAT(adcr.date, 'dd-MM-yyyy') = FORMAT(apr.date, 'dd-MM-yyyy')) base) a
                           on a.date = m.date
  UNION
  SELECT COALESCE(m.date, a.date)       date,
         COALESCE(m.revenue, a.revenue) revenue,
         COALESCE(m.spend, a.spend)     spend
  FROM (SELECT amr.report_date as                date,
               ROUND(SUM(amr.total_sales_7d), 2) revenue,
               ROUND(SUM(amr.spend), 2)          spend
        FROM advertising_manual_report amr
        GROUP BY amr.report_date) m
           RIGHT OUTER JOIN (SELECT base.*
                             FROM (SELECT apr.date                   AS date,
                                          COALESCE(apr.revenue, 0) + COALESCE(adcr.revenue, 0) +
                                          COALESCE(abvcr.revenue, 0) as revenue,
                                          COALESCE(apr.spend, 0) + COALESCE(adcr.spend, 0) +
                                          COALESCE(abvcr.spend, 0)   as spend
                                   FROM (select b.report_date as                               date,
                                                ROUND(IFNULL(SUM(b.attributed_sales7d), 0), 2) revenue,
                                                ROUND(IFNULL(SUM(b.cost), 0), 2)               spend
                                         FROM advertising_product_report b
                                         GROUP BY b.report_date) apr
                                            LEFT JOIN (select b.report_date as                                 date,
                                                              ROUND(IFNULL(SUM(b.attributed_sales_14d), 0), 2) revenue,
                                                              ROUND(IFNULL(SUM(b.cost), 0), 2)                 spend
                                                       FROM advertising_brands_video_campaigns_report b
                                                       GROUP BY b.report_date) abvcr
                                                      ON FORMAT(abvcr.date, 'dd-MM-yyyy') = FORMAT(apr.date, 'dd-MM-yyyy')
                                            LEFT JOIN (select b.report_date as                                date,
                                                              ROUND(IFNULL(SUM(b.attributed_sales14d), 0), 2) revenue,
                                                              ROUND(IFNULL(SUM(b.cost), 0), 2)                spend
                                                       FROM advertising_display_campaigns_report b
                                                       GROUP BY b.report_date) adcr
                                                      ON FORMAT(adcr.date, 'dd-MM-yyyy') = FORMAT(apr.date, 'dd-MM-yyyy')) base) a
                            ON FORMAT(a.date, 'dd-MM-yyyy') = FORMAT(m.date, 'dd-MM-yyyy')
      `;
        const sales: any[] = await client.$queryRaw`
    SELECT
        astr_date as date,
        ROUND(SUM(ordered_product_sales), 2) AS sale
  FROM
        asin_business_report
  GROUP BY
        astr_date
      `;
        const mergedMatching = _.map(ads, (item1) => {
          const item2 = _.find(sales, ['date', item1.date]);
          return _.merge({}, item1, item2);
        });
        const transaction = _.unionBy(mergedMatching, sales, 'date').map((item) => {
          return this.commerceDb.allBrandsSum.upsert({
            create: {
              year: dayjs(item.date).year(),
              month: dayjs(item.date).month() + 1,
              week: dayjs(item.date).week(),
              date: item.date,
              sale: item.sale || 0,
              revenue: item.revenue || 0,
              spend: item.spend || 0,
              brandsId: db.id,
            },
            update: { sale: item.sale || 0, revenue: item.revenue || 0, spend: item.spend || 0 },
            where: {
              date_brand: {
                brandsId: db.id,
                date: item.date,
              },
            },
          });
        });
        this.logger.debug('insert started for client: ' + db.db_name + 'transaction counts: ' + transaction.length);
        await client.$transaction(transaction);
        this.logger.debug('insert finished for client: ' + db.db_name);
        await client.$disconnect();
        this.logger.debug('disconnected from client: ' + db.db_name);
      });
      await Promise.all(promises);
    }
  }
}
