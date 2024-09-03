import { Injectable } from '@nestjs/common';
import { VendoCommerceDBService, VendoBrandDBService } from '../prisma.service';
import * as _ from 'lodash';

@Injectable()
export class CategoryReportService {
  constructor(
    private readonly commerceDB: VendoCommerceDBService,
    private readonly brandDbService: VendoBrandDBService,
  ) {}

  async getSalesDataByWeekWithYear(
    brandId: number,
    years: string,
    weeks: string,
    months: string,
    categories: string,
    asin?: string,
    isGroupByAsin?: boolean,
  ) {
    let categoriesData: any = await this.commerceDB.$queryRawUnsafe(`
      SELECT
        category_id,
        name,
        product_title,
        product_status,
        asin
      FROM
        category_product_data
      LEFT JOIN
        categories ON category_product_data.category_id = categories.id AND categories.brandId = ${brandId}
      WHERE
        category_product_data.brandId = ${brandId} AND
        (${asin ? `LOWER(asin) LIKE '%${asin.toLowerCase()}%'` : '1'})
    `);

    if (isGroupByAsin) {
      const reportData: any = await this.brandDbService.client.$queryRawUnsafe(`
        SELECT
          astr_child_asin AS asin,
          GROUP_CONCAT(DISTINCT astr_listing_sku) AS sku,
          ${weeks ? 'astr_week AS week' : 'Month(astr_date) AS month'},
          ${weeks ? 'CONCAT("WK", astr_week) AS week_name,' : ''}
          ${months ? 'YEAR(astr_date)' : 'astr_year'} AS year,
          ROUND(SUM(ordered_product_sales), 2) AS total_sales
        FROM
          asin_business_report
        WHERE
          (${months ? 'YEAR(astr_date)' : 'astr_year'} ${`IN (${years})`}) AND
          (${weeks ? `astr_week IN (${weeks})` : '1'}) AND
          (${months ? `Month(astr_date) IN (${months})` : '1'}) AND
          (${asin ? `LOWER(astr_child_asin) LIKE '%${asin.toLowerCase()}%'` : '1'})
        GROUP BY
        astr_child_asin, ${weeks ? 'week, week_name' : 'month'}, year
    `);

      const data: any = [];
      for (const current of reportData) {
        const categoryData = categoriesData.find((c) => c.asin == current.asin);

        const recIndex = data.findIndex(
          (r) =>
            r.year == current.year &&
            r.week == current.week &&
            r.month == current.month &&
            r.asin == current.asin &&
            r.category_id == categoryData?.category_id,
        );

        if (recIndex == -1) {
          data.push({
            category_id: categoryData?.category_id,
            category: categoryData?.name,
            title: categoryData?.product_title,
            status: categoryData?.product_status,
            year: parseInt(current.year),
            asin: current.asin,
            sku: current.sku,
            total_sales: current.total_sales,
            ...(current.week
              ? {
                  week: current.week,
                  week_name: current.week_name,
                }
              : {
                  month: parseInt(current.month),
                }),
          });
        } else {
          data[recIndex].total_sales += current.total_sales;
        }
      }

      if (categories) {
        const category_ids = categories.split(',').map((c) => (c == 'Uncategorizerd' ? undefined : parseInt(c)));
        return data.filter((d) => category_ids.includes(d.category_id));
      } else {
        return data;
      }
    } else {
      categoriesData = categoriesData.reduce((grouped, current) => {
        const index = grouped.findIndex((data) => current.category_id === data.category_id);

        if (index !== -1) {
          grouped[index].asinList.push(current.asin);
        } else {
          grouped.push({
            category_id: current.category_id,
            category: current.name,
            product_title: current.product_title,
            product_status: current.product_status,
            asinList: [current.asin],
          });
        }

        return grouped;
      }, []);

      const reportData: any = await this.brandDbService.client.$queryRawUnsafe(`
        SELECT
          astr_child_asin AS asin,
          ${weeks ? 'astr_week AS week' : 'Month(astr_date) AS month'},
          ${weeks ? 'CONCAT("WK", astr_week) AS week_name,' : ''}
          ${months ? 'YEAR(astr_date)' : 'astr_year'} AS year,
          ROUND(SUM(ordered_product_sales), 2) AS total_sales
        FROM
          asin_business_report
        WHERE
          (${months ? 'YEAR(astr_date)' : 'astr_year'} ${`IN (${years})`}) AND
          (${weeks ? `astr_week IN (${weeks})` : '1'}) AND
          (${months ? `Month(astr_date) IN (${months})` : '1'}) AND
          (${asin ? `LOWER(astr_child_asin) LIKE '%${asin.toLowerCase()}%'` : '1'})
        GROUP BY
          asin, ${weeks ? 'week, week_name' : 'month'}, year
      `);

      const data: any = [];
      for (const current of reportData) {
        const categoryData = categoriesData.find((c) => c.asinList.includes(current.asin));

        const recIndex = data.findIndex(
          (r) =>
            r.year == current.year &&
            r.week == current.week &&
            r.month == current.month &&
            r.category_id == categoryData?.category_id,
        );

        if (recIndex == -1) {
          data.push({
            week: current.week,
            week_name: current.week_name,
            month: current.month,
            year: current.year,
            total_sales: current.total_sales,
            category_id: categoryData?.category_id,
            category: categoryData?.category,
          });
        } else {
          data[recIndex].total_sales += current.total_sales;
        }
      }

      if (categories) {
        const category_ids = categories.split(',').map((c) => (c == 'Uncategorizerd' ? undefined : parseInt(c)));
        return data.filter((d) => category_ids.includes(d.category_id));
      } else {
        return data;
      }
    }
  }

  async getAdvertisingAllData(
    brandId: number,
    years: string,
    weeks: string,
    months: string,
    categories: string,
    asin?: string,
    isGroupByAsin?: boolean,
  ) {
    let categoriesData: any = await this.commerceDB.$queryRawUnsafe(`
    SELECT
      category_id,
      name,
      product_title,
      product_status,
      asin
    FROM
      category_product_data
    LEFT JOIN
      categories ON category_product_data.category_id = categories.id AND categories.brandId = ${brandId}
    WHERE
      category_product_data.brandId = ${brandId} AND
      (${asin ? `LOWER(asin) LIKE '%${asin.toLowerCase()}%'` : '1'})
  `);

    const reportData: any = await this.brandDbService.client.$queryRawUnsafe(`
      SELECT
        asin,
        ${months ? 'yearmonth_month AS month' : 'yearweek_week AS week'},
        ${months ? 'yearmonth_year' : 'yearweek_year'} AS year,
        ROUND(IFNULL(SUM(attributed_sales7d), 0), 2) AS revenue,
        ROUND(IFNULL(SUM(cost), 0), 2) AS spend
      FROM
        advertising_product_report
      WHERE
        (attributed_sales7d <> 0 OR cost <> 0) AND
        (${`${months ? 'yearmonth_year' : 'yearweek_year'} IN (${years})`}) AND
        (${weeks ? `yearweek_week IN (${weeks})` : '1'}) AND
        (${months ? `yearmonth_month IN (${months})` : '1'}) AND
        (${asin ? `LOWER(asin) LIKE '%${asin.toLowerCase()}%'` : '1'})
      GROUP BY
      asin, ${months ? 'month' : 'week'}, year
    `);

    const data: any = [];
    for (const current of reportData) {
      const categoryData = categoriesData.find((c) => c.asin == current.asin);

      const recIndex = data.findIndex(
        (r) =>
          r.year == current.year &&
          r.week == current.week &&
          r.month == current.month &&
          r.category_id == categoryData?.category_id &&
          (!isGroupByAsin || r.asin == current.asin),
      );

      if (recIndex == -1) {
        data.push({
          category_id: categoryData?.category_id,
          year: parseInt(current.year),
          revenue: current.revenue,
          spend: current.spend,
          ...(isGroupByAsin ? { asin: current.asin } : {}),
          ...(current.week
            ? {
                week: current.week,
                week_name: current.week_name,
              }
            : {
                month: parseInt(current.month),
              }),
        });
      } else {
        data[recIndex].revenue += current.revenue;
        data[recIndex].spend += current.spend;
      }
    }

    if (categories) {
      const category_ids = categories.split(',').map((c) => (c == 'Uncategorizerd' ? undefined : parseInt(c)));
      return data.filter((d) => category_ids.includes(d.category_id));
    } else {
      return data;
    }
  }

  async asinCount(year: string, weeks: string, months: string) {
    const reportData: any = await this.brandDbService.client.$queryRawUnsafe(`
    SELECT
      count(DISTINCT astr_child_asin)
    FROM
      asin_business_report
    WHERE
      (${months ? 'YEAR(astr_date)' : 'astr_year'} ${`IN (${year})`}) AND
      (${weeks ? `astr_week IN (${weeks})` : '1'}) AND
      (${months ? `Month(astr_date) IN (${months})` : '1'})
  `);

    return reportData[0]['count(DISTINCT astr_child_asin)'];
  }

  async productReport(
    brandId: number,
    year: string,
    weeks: string,
    months: string,
    asin: string,
    category: string,
    exportRequest?: boolean,
  ) {
    const paginationRequired = !exportRequest && parseInt(await this.asinCount(year, weeks, months)) > 500;

    const [results, ad_results] = await Promise.all([
      this.getSalesDataByWeekWithYear(brandId, year, weeks, months, category, asin, !paginationRequired),
      this.getAdvertisingAllData(brandId, year, weeks, months, category, asin, !paginationRequired),
    ]);

    const groupedResults: any = [];
    const intervalData: any = [];

    if (paginationRequired) {
      for (const result of results) {
        const intervalIndex = intervalData.findIndex(
          (group) => group.year === result.year && group.week == result.week && group.month == result.month,
        );

        const categoryIndex = groupedResults.findIndex((group) => group.category_id === result.category_id);
        const ad_result = ad_results.find(
          (ad) =>
            ad.year == result.year &&
            ad.week == result.week &&
            ad.month == result.month &&
            ad.category_id == result.category_id,
        );

        if (intervalIndex === -1) {
          intervalData.push({
            week: result.week,
            month: result.month,
            week_name: result.week_name,
            year: result.year,
            sales: result.total_sales,
            ad_sales: ad_result?.revenue || 0,
            ad_spend: ad_result?.spend || 0,
          });
        } else {
          const sales = intervalData[intervalIndex].sales + result.total_sales;
          const ad_sales = intervalData[intervalIndex].ad_sales + (ad_result?.revenue || 0);
          const ad_spend = intervalData[intervalIndex].ad_spend + (ad_result?.spend || 0);

          intervalData[intervalIndex] = {
            ...intervalData[intervalIndex],
            sales: sales,
            ad_sales: ad_sales,
            ad_spend: ad_spend,
          };
        }

        if (categoryIndex === -1) {
          groupedResults.push({
            category: result.category,
            category_id: result.category_id,
            interval_sales: [
              {
                week: result.week,
                week_name: result.week_name,
                month: result.month,
                year: result.year,
                sales: result.total_sales,
                ad_sales: ad_result?.revenue,
                ad_spend: ad_result?.spend,
              },
            ],
          });
        } else {
          groupedResults[categoryIndex].interval_sales.push({
            week: result.week,
            week_name: result.week_name,
            month: result.month,
            year: result.year,
            sales: result.total_sales,
            ad_sales: ad_result?.revenue,
            ad_spend: ad_result?.spend,
          });
        }
      }

      let last_year_data: any = null;
      if (year.length == 4 && (weeks == '1' || months == '1')) {
        last_year_data = (
          await this.categoryPerformanceReport(
            brandId,
            (parseInt(year) - 1).toString(),
            weeks ? '52,53' : weeks,
            months ? '12' : months,
            category,
          )
        ).categories;
      }

      const categories = groupedResults
        .map((result) => {
          const sorted_interval_report = result.interval_sales.sort(
            (a, b) => a.year * 54 + (a.week || a.month) - (b.year * 54 + (b.week || b.month)),
          );
          const lastWeekData = sorted_interval_report[result.interval_sales.length - 1];
          const secondLastWeek = last_year_data
            ? last_year_data.find((c) => c.category == result.category)?.interval_sales?.[0]
            : sorted_interval_report[result.interval_sales.length - 2];

          return {
            category: result.category || 'Uncategorized',
            category_id: result.category_id || 'Uncategorized',
            interval_sales: sorted_interval_report,
            total_sales: _.sum(result.interval_sales.map((w) => w.sales)),
            total_ad_sales: _.sum(result.interval_sales.map((w) => w.ad_sales)),
            total_ad_spend: _.sum(result.interval_sales.map((w) => w.ad_spend)),
            change_interval_over_interval_sales: this.getPercentageChange(lastWeekData?.sales, secondLastWeek?.sales),
            change_interval_over_interval_ad_sales: this.getPercentageChange(
              lastWeekData?.ad_sales,
              secondLastWeek?.ad_sales,
            ),
            change_interval_over_interval_ad_spend: this.getPercentageChange(
              lastWeekData?.ad_spend,
              secondLastWeek?.ad_spend,
            ),
          };
        })
        .sort((a, b) => b.total_sales - a.total_sales);

      return { data: categories, paginated: true };
    } else {
      const groupedResults: any = [];

      for (const result of results) {
        const categoryIndex = groupedResults.findIndex((group) => group.category === result.category);
        const ad_result = ad_results.find(
          (ad) =>
            ad.year == result.year && ad.week == result.week && ad.month == result.month && ad.asin == result.asin,
        );

        if (categoryIndex === -1) {
          groupedResults.push({
            category: result.category,
            category_id: result.category_id,
            total_sales: result.total_sales,
            total_ad_sales: ad_result?.revenue || 0,
            total_ad_spend: ad_result?.spend || 0,
            interval_sales: [
              {
                week: result.week,
                week_name: result.week_name,
                month: result.month,
                year: result.year,
                sales: result.total_sales,
                ad_sales: ad_result?.revenue || 0,
                ad_spend: ad_result?.spend || 0,
              },
            ],
            products_total: [
              {
                asin: result.asin,
                sales: result.total_sales,
                ad_sales: ad_result?.revenue || 0,
                ad_spend: ad_result?.spend || 0,
              },
            ],
            products: [
              {
                title: result.title,
                status: result.status,
                asin: result.asin,
                sku: result.sku,
                week: result.week,
                week_name: result.week_name,
                month: result.month,
                year: result.year,
                sales: result.total_sales,
                ad_sales: ad_result?.revenue || 0,
                ad_spend: ad_result?.spend || 0,
              },
            ],
          });
        } else {
          groupedResults[categoryIndex].total_sales += result.total_sales;
          groupedResults[categoryIndex].total_ad_sales += ad_result?.revenue || 0;
          groupedResults[categoryIndex].total_ad_spend += ad_result?.spend || 0;

          let build_interval = true;
          groupedResults[categoryIndex].interval_sales = groupedResults[categoryIndex].interval_sales.map(
            (interval_sale) => {
              if (
                interval_sale.year === result.year &&
                interval_sale.week === result.week &&
                interval_sale.month === result.month
              ) {
                interval_sale.sales += result.total_sales;
                interval_sale.ad_sales += ad_result?.revenue || 0;
                interval_sale.ad_spend += ad_result?.spend || 0;
                build_interval = false;
              }
              return interval_sale;
            },
          );

          if (build_interval) {
            groupedResults[categoryIndex].interval_sales.push({
              week: result.week,
              week_name: result.week_name,
              month: result.month,
              year: result.year,
              sales: result.total_sales,
              ad_sales: ad_result?.revenue || 0,
              ad_spend: ad_result?.spend || 0,
            });
          }

          let build_product_total = true;
          groupedResults[categoryIndex].products_total = groupedResults[categoryIndex].products_total.map(
            (product_sale) => {
              if (product_sale.asin === result.asin) {
                product_sale.sales += result.total_sales;
                product_sale.ad_sales += ad_result?.revenue || 0;
                product_sale.ad_spend += ad_result?.spend || 0;
                build_product_total = false;
              }
              return product_sale;
            },
          );

          if (build_product_total) {
            groupedResults[categoryIndex].products_total.push({
              asin: result.asin,
              sales: result.total_sales,
              ad_sales: ad_result?.revenue || 0,
              ad_spend: ad_result?.spend || 0,
            });
          }

          groupedResults[categoryIndex].products.push({
            title: result.title,
            status: result.status,
            asin: result.asin,
            sku: result.sku,
            week: result.week,
            month: result.month,
            week_name: result.week_name,
            year: result.year,
            sales: result.total_sales,
            ad_sales: ad_result?.revenue || 0,
            ad_spend: ad_result?.spend || 0,
          });
        }
      }

      const [secondLastInterval, lastInterval] = _.sortBy(
        _.uniq(results.map((r) => r.year * 54 + (r.week || r.month))),
      ).slice(-2);

      const data = groupedResults.map((group) => {
        const asin_list = _.uniq(group.products.map((p) => p.asin));

        const changeIntervalOverInterval = asin_list.map((asin) => {
          const lastIntervalObj = group.products.find(
            (rec) => asin === rec.asin && rec.year * 54 + (rec.week || rec.month) === lastInterval,
          );
          const secondLastIntervalObj = group.products.find(
            (rec) => asin === rec.asin && rec.year * 54 + (rec.week || rec.month) === secondLastInterval,
          );

          return {
            asin: asin,
            ad_sales: this.getPercentageChange(lastIntervalObj?.ad_sales, secondLastIntervalObj?.ad_sales),
            ad_spend: this.getPercentageChange(lastIntervalObj?.ad_spend, secondLastIntervalObj?.ad_spend),
            sales: this.getPercentageChange(lastIntervalObj?.sales, secondLastIntervalObj?.sales),
          };
        });

        const lastIntervalObj = group.interval_sales.find(
          (rec) => rec.year * 54 + (rec.week || rec.month) === lastInterval,
        );
        const secondLastIntervalObj = group.interval_sales.find(
          (rec) => rec.year * 54 + (rec.week || rec.month) === secondLastInterval,
        );

        return {
          ...group,
          products: group.products.filter((a) => a.sales + a.ad_sales + a.ad_spend > 0),
          category: group.category || 'Uncategorized',
          change_interval_over_interval: changeIntervalOverInterval,
          change_interval_over_interval_ad_sales: this.getPercentageChange(
            lastIntervalObj?.ad_sales,
            secondLastIntervalObj?.ad_sales,
          ),
          change_interval_over_interval_ad_spend: this.getPercentageChange(
            lastIntervalObj?.ad_spend,
            secondLastIntervalObj?.ad_spend,
          ),
          change_interval_over_interval_sales: this.getPercentageChange(
            lastIntervalObj?.sales,
            secondLastIntervalObj?.sales,
          ),
        };
      });

      return { paginated: false, data: data };
    }
  }

  async productsCount(
    brandId: number,
    years: string,
    weeks: string,
    months: string,
    asin: string,
    category_id: number,
  ) {
    if (category_id) {
      const asins: any = await this.commerceDB.$queryRawUnsafe(`
      SELECT
        asin
      FROM
        category_product_data
      WHERE
        category_product_data.category_id = ${category_id} AND
        (${asin ? `LOWER(asin) LIKE '%${asin.toLowerCase()}%'` : '1'})
    `);

      const reportData: any = await this.brandDbService.client.$queryRawUnsafe(`
      SELECT
        COUNT(DISTINCT(astr_child_asin))
      FROM
        asin_business_report
      WHERE
        (${months ? 'YEAR(astr_date)' : 'astr_year'} ${`IN (${years})`}) AND
        (${weeks ? `astr_week IN (${weeks})` : '1'}) AND
        (${months ? `Month(astr_date) IN (${months})` : '1'}) AND
        astr_child_asin IN (${asins.map((d) => `'${d.asin}'`).join(',') || "'----'"})
    `);

      return reportData[0]['COUNT(DISTINCT(astr_child_asin))'];
    } else {
      let asins: any = await this.commerceDB.$queryRawUnsafe(`
        SELECT
          asin
        FROM
          category_product_data
        WHERE
          category_product_data.brandId = ${brandId} AND
          category_product_data.category_id IS NOT NULL
      `);

      const reportData: any = await this.brandDbService.client.$queryRawUnsafe(`
        SELECT
          COUNT(DISTINCT(astr_child_asin))
        FROM
          asin_business_report
        WHERE
          (${months ? 'YEAR(astr_date)' : 'astr_year'} ${`IN (${years})`}) AND
          (${weeks ? `astr_week IN (${weeks})` : '1'}) AND
          (${months ? `Month(astr_date) IN (${months})` : '1'}) AND
          ordered_product_sales > 0 AND
          (${asins.length > 0 ? `astr_child_asin NOT IN (${asins.map((d) => `'${d.asin}'`).join(',')})` : '1'}) AND
          (${asin ? `LOWER(astr_child_asin) LIKE '%${asin.toLowerCase()}%'` : '1'})
      `);

      return reportData[0]['COUNT(DISTINCT(astr_child_asin))'];
    }
  }

  async productSalesData(brandId: number, year: string, weeks: string, months: string, asins: Array<String>) {
    let productsData: any = await this.commerceDB.$queryRawUnsafe(`
      SELECT
        product_title,
        product_status,
        asin
      FROM
        category_product_data
      WHERE
        category_product_data.brandId = ${brandId} AND
        asin IN (${asins.map((d) => `'${d}'`).join(',')})
    `);

    const reportData: any = await this.brandDbService.client.$queryRawUnsafe(`
        SELECT
          astr_child_asin AS asin,
          GROUP_CONCAT(DISTINCT astr_listing_sku) AS sku,
          ${weeks ? 'astr_week AS week' : 'Month(astr_date) AS month'},
          ${weeks ? 'CONCAT("WK", astr_week) AS week_name,' : ''}
          ${months ? 'YEAR(astr_date)' : 'astr_year'} AS year,
          ROUND(SUM(ordered_product_sales), 2) AS total_sales
        FROM
          asin_business_report
        WHERE
          (${months ? 'YEAR(astr_date)' : 'astr_year'} ${`IN (${year})`}) AND
          (${weeks ? `astr_week IN (${weeks})` : '1'}) AND
          (${months ? `Month(astr_date) IN (${months})` : '1'}) AND
          astr_child_asin IN (${asins.map((d) => `'${d}'`).join(',')})
          GROUP BY
            astr_child_asin, ${weeks ? 'week, week_name' : 'month'}, year
    `);

    const data: any = [];
    for (const current of reportData) {
      const productData = productsData.find((ad) => ad['asin'] == current.asin);

      data.push({
        title: productData?.['product_title'],
        status: productData?.['product_status'],
        asin: current.asin,
        sku: current.sku,
        year: parseInt(current.year),
        total_sales: current.total_sales,
        ...(current.week
          ? {
              week: current.week,
              week_name: current.week_name,
            }
          : {
              month: parseInt(current.month),
            }),
      });
    }

    return data;
  }

  async productAdvertisingData(year: string, weeks: string, months: string, asins: Array<String>) {
    const reportData: any = await this.brandDbService.client.$queryRawUnsafe(`
      SELECT
        asin,
        ${months ? 'yearmonth_month AS month' : 'yearweek_week AS week'},
        ${months ? 'yearmonth_year' : 'yearweek_year'} AS year,
        ROUND(IFNULL(SUM(attributed_sales7d), 0), 2) AS revenue,
        ROUND(IFNULL(SUM(cost), 0), 2) AS spend
      FROM
        advertising_product_report
      WHERE
        (attributed_sales7d <> 0 OR cost <> 0) AND
        (${`${months ? 'yearmonth_year' : 'yearweek_year'} IN (${year})`}) AND
        (${weeks ? `yearweek_week IN (${weeks})` : '1'}) AND
        (${months ? `yearmonth_month IN (${months})` : '1'}) AND
        asin IN (${asins.map((d) => `'${d}'`).join(',')})
      GROUP BY
      asin, ${months ? 'month' : 'week'}, year
    `);

    const data: any = [];
    for (const current of reportData) {
      data.push({
        year: parseInt(current.year),
        asin: current.asin,
        sku: current.sku,
        revenue: current.revenue,
        spend: current.spend,
        ...(current.week
          ? {
              week: current.week,
              week_name: current.week_name,
            }
          : {
              month: parseInt(current.month),
            }),
      });
    }

    return data;
  }

  async categoryProductsData(
    brandId: number,
    year: string,
    weeks: string,
    months: string,
    asin: string,
    category_id: number,
    page: number,
    limit: number,
  ) {
    const count = await this.productsCount(brandId, year, weeks, months, asin, category_id);
    let asins_list: any = [];
    if (category_id) {
      const asins: any = await this.commerceDB.$queryRawUnsafe(`
      SELECT
        asin
      FROM
        category_product_data
      WHERE
        category_product_data.category_id = ${category_id} AND
        (${asin ? `LOWER(asin) LIKE '%${asin.toLowerCase()}%'` : '1'})
    `);

      asins_list = await this.brandDbService.client.$queryRawUnsafe(`
        SELECT
          astr_child_asin AS asin,
          ROUND(SUM(ordered_product_sales), 2) AS total_sales
        FROM
          asin_business_report
        WHERE
          (${months ? 'YEAR(astr_date)' : 'astr_year'} ${`IN (${year})`}) AND
          (${weeks ? `astr_week IN (${weeks})` : '1'}) AND
          (${months ? `Month(astr_date) IN (${months})` : '1'}) AND
          astr_child_asin IN (${asins.map((d) => `'${d.asin}'`).join(',')})
        GROUP BY astr_child_asin
        ORDER BY total_sales desc
        LIMIT ${limit}
        OFFSET ${(page - 1) * limit}
    `);
    } else {
      let asins: any = await this.commerceDB.$queryRawUnsafe(`
        SELECT
          asin
        FROM
          category_product_data
        WHERE
          category_product_data.brandId = ${brandId} AND
          category_product_data.category_id IS NOT NULL
      `);

      asins_list = await this.brandDbService.client.$queryRawUnsafe(`
        SELECT
          astr_child_asin AS asin,
          ROUND(SUM(ordered_product_sales), 2) AS total_sales
        FROM
          asin_business_report
        WHERE
          (${months ? 'YEAR(astr_date)' : 'astr_year'} ${`IN (${year})`}) AND
          (${weeks ? `astr_week IN (${weeks})` : '1'}) AND
          (${months ? `Month(astr_date) IN (${months})` : '1'}) AND
          (${asins.length > 0 ? `astr_child_asin NOT IN (${asins.map((d) => `'${d.asin}'`).join(',')})` : '1'}) AND
          (${asin ? `LOWER(astr_child_asin) LIKE '%${asin.toLowerCase()}%'` : '1'})
        GROUP BY astr_child_asin
        ORDER BY total_sales desc
        LIMIT ${limit}
        OFFSET ${(page - 1) * limit}
    `);
    }

    asins_list = asins_list.map((d) => d['asin']);

    const results = asins_list.length > 0 ? await this.productSalesData(brandId, year, weeks, months, asins_list) : [];
    const ad_results = asins_list.length > 0 ? await this.productAdvertisingData(year, weeks, months, asins_list) : [];

    const groupedResults: any = [];
    const intervalData: any = [];

    for (const result of results) {
      const intervalIndex = intervalData.findIndex(
        (group) => group.year === result.year && group.week == result.week && group.month == result.month,
      );

      const productIndex = groupedResults.findIndex((group) => group.asin === result.asin);
      const ad_result = ad_results.find(
        (ad) => ad.year == result.year && ad.week == result.week && ad.month == result.month && ad.asin == result.asin,
      );

      if (intervalIndex === -1) {
        intervalData.push({
          week: result.week,
          month: result.month,
          week_name: result.week_name,
          year: result.year,
          sales: result.total_sales,
          ad_sales: ad_result?.revenue || 0,
          ad_spend: ad_result?.spend || 0,
        });
      } else {
        const sales = intervalData[intervalIndex].sales + result.total_sales;
        const ad_sales = intervalData[intervalIndex].ad_sales + (ad_result?.revenue || 0);
        const ad_spend = intervalData[intervalIndex].ad_spend + (ad_result?.spend || 0);

        intervalData[intervalIndex] = {
          ...intervalData[intervalIndex],
          sales: sales,
          ad_sales: ad_sales,
          ad_spend: ad_spend,
        };
      }

      if (productIndex === -1) {
        groupedResults.push({
          asin: result.asin,
          title: result.title,
          status: result.status,
          sku: result.sku,
          interval_sales: [
            {
              week: result.week,
              week_name: result.week_name,
              month: result.month,
              year: result.year,
              sales: result.total_sales,
              ad_sales: ad_result?.revenue,
              ad_spend: ad_result?.spend,
            },
          ],
        });
      } else {
        groupedResults[productIndex].interval_sales.push({
          week: result.week,
          week_name: result.week_name,
          month: result.month,
          year: result.year,
          sales: result.total_sales,
          ad_sales: ad_result?.revenue,
          ad_spend: ad_result?.spend,
        });
      }
    }

    let last_year_data: any = null;
    if (year.length == 4 && (weeks == '1' || months == '1')) {
      last_year_data = (
        await this.categoryProductsData(
          brandId,
          (parseInt(year) - 1).toString(),
          weeks ? '52,53' : weeks,
          months ? '12' : months,
          asin,
          category_id,
          page,
          limit,
        )
      ).items;
    }

    const products = groupedResults
      .map((result) => {
        const sorted_interval_report = result.interval_sales.sort(
          (a, b) => a.year * 54 + (a.week || a.month) - (b.year * 54 + (b.week || b.month)),
        );
        const lastWeekData = sorted_interval_report[result.interval_sales.length - 1];
        let secondLastWeek = last_year_data
          ? last_year_data.find((c) => c.asin == result.asin)?.interval_sales?.[0]
          : sorted_interval_report[result.interval_sales.length - 2];

        return {
          asin: result.asin,
          title: result.title,
          status: result.status,
          sku: result.sku,
          interval_sales: sorted_interval_report,
          total_sales: _.sum(result.interval_sales.map((w) => w.sales)),
          total_ad_sales: _.sum(result.interval_sales.map((w) => w.ad_sales)),
          total_ad_spend: _.sum(result.interval_sales.map((w) => w.ad_spend)),
          change_interval_over_interval_sales: this.getPercentageChange(lastWeekData?.sales, secondLastWeek?.sales),
          change_interval_over_interval_ad_sales: this.getPercentageChange(
            lastWeekData?.ad_sales,
            secondLastWeek?.ad_sales,
          ),
          change_interval_over_interval_ad_spend: this.getPercentageChange(
            lastWeekData?.ad_spend,
            secondLastWeek?.ad_spend,
          ),
        };
      })
      .sort((a, b) => b.total_sales - a.total_sales);

    return { count: count, page: page, limit: limit, items: products };
  }

  getPercentageChange(newNumber, oldNumber, avg?) {
    if (!newNumber || !oldNumber) {
      return 0;
    }

    if (avg) {
      return newNumber - oldNumber;
    }
    return oldNumber >= 1 ? ((newNumber - oldNumber) / oldNumber) * 100 : 0;
  }

  async categoryPerformanceReport(brandId: number, year: string, weeks: string, months: string, category: string) {
    const results = await this.getSalesDataByWeekWithYear(brandId, year, weeks, months, category);
    const ad_results = await this.getAdvertisingAllData(brandId, year, weeks, months, category);
    const groupedResults: any = [];
    const intervalData: any = [];
    const grandTotal = {
      shipped_revenue: 0,
      TACoS: 0,
      ad_sales: 0,
      ad_spend: 0,
    };

    for (const result of results) {
      const intervalIndex = intervalData.findIndex(
        (group) => group.year === result.year && group.week == result.week && group.month == result.month,
      );

      const categoryIndex = groupedResults.findIndex((group) => group.category_id === result.category_id);
      const ad_result = ad_results.find(
        (ad) =>
          ad.year == result.year &&
          ad.week == result.week &&
          ad.month == result.month &&
          ad.category_id == result.category_id,
      );

      const ACoS_percentage = ((ad_result?.spend || 0.000001) / (result.total_sales || 1)) * 100;

      grandTotal.shipped_revenue = grandTotal.shipped_revenue + result.total_sales;
      grandTotal.TACoS = grandTotal.TACoS + ACoS_percentage / results.length;
      grandTotal.ad_sales = grandTotal.ad_sales + (ad_result?.revenue || 0);
      grandTotal.ad_spend = grandTotal.ad_spend + (ad_result?.spend || 0);

      if (intervalIndex === -1) {
        intervalData.push({
          week: result.week,
          month: result.month,
          week_name: result.week_name,
          year: result.year,
          shipped_revenue: result.total_sales,
          TACoS: ((ad_result?.spend || 0.000001) / (result.total_sales || 1)) * 100,
          ad_sales: ad_result?.revenue || 0,
          ad_spend: ad_result?.spend || 0,
        });
      } else {
        const shipped_revenue = intervalData[intervalIndex].shipped_revenue + result.total_sales;
        const ad_sales = intervalData[intervalIndex].ad_sales + (ad_result?.revenue || 0);
        const ad_spend = intervalData[intervalIndex].ad_spend + (ad_result?.spend || 0);

        intervalData[intervalIndex] = {
          ...intervalData[intervalIndex],
          shipped_revenue: shipped_revenue,
          TACoS: ((ad_spend || 0.000001) / (shipped_revenue || 1)) * 100,
          ad_sales: ad_sales,
          ad_spend: ad_spend,
        };
      }

      if (categoryIndex === -1) {
        groupedResults.push({
          category: result.category,
          category_id: result.category_id,
          interval_report: [
            {
              week: result.week,
              week_name: result.week_name,
              month: result.month,
              year: result.year,
              shipped_revenue: result.total_sales,
              TACoS: ACoS_percentage,
              ad_sales: ad_result?.revenue,
              ad_spend: ad_result?.spend,
            },
          ],
        });
      } else {
        groupedResults[categoryIndex].interval_report.push({
          week: result.week,
          week_name: result.week_name,
          month: result.month,
          year: result.year,
          shipped_revenue: result.total_sales,
          TACoS: ACoS_percentage,
          ad_sales: ad_result?.revenue,
          ad_spend: ad_result?.spend,
        });
      }
    }

    let last_year_data: any = null;
    if (year.length == 4 && (weeks == '1' || months == '1')) {
      last_year_data = (
        await this.categoryPerformanceReport(
          brandId,
          (parseInt(year) - 1).toString(),
          weeks ? '52,53' : weeks,
          months ? '12' : months,
          category,
        )
      ).categories;
    }

    const categories = groupedResults
      .map((result) => {
        const sorted_interval_report = result.interval_report.sort(
          (a, b) => a.year * 54 + (a.week || a.month) - (b.year * 54 + (b.week || b.month)),
        );
        const lastWeekData = sorted_interval_report[result.interval_report.length - 1];
        let secondLastWeek = last_year_data
          ? last_year_data.find((c) => c.category == result.category)?.interval_report?.[0]
          : sorted_interval_report[result.interval_report.length - 2];

        return {
          category: result.category || 'Uncategorized',
          interval_report: sorted_interval_report,
          total: {
            shipped_revenue: _.sum(result.interval_report.map((w) => w.shipped_revenue)),
            TACoS: _.mean(result.interval_report.map((w) => w.TACoS)),
            ad_sales: _.sum(result.interval_report.map((w) => w.ad_sales)),
            ad_spend: _.sum(result.interval_report.map((w) => w.ad_spend)),
          },
          change_interval_over_interval: {
            shipped_revenue: this.getPercentageChange(lastWeekData?.shipped_revenue, secondLastWeek?.shipped_revenue),
            TACoS: this.getPercentageChange(lastWeekData?.TACoS, secondLastWeek?.TACoS, true),
            ad_sales: this.getPercentageChange(lastWeekData?.ad_sales, secondLastWeek?.ad_sales),
            ad_spend: this.getPercentageChange(lastWeekData?.ad_spend, secondLastWeek?.ad_spend),
          },
        };
      })
      .sort((a, b) => b.total.shipped_revenue - a.total.shipped_revenue);

    return { grandTotal: grandTotal, intervalTotal: intervalData, categories: categories };
  }

  // Subcategories

  async getSalesSubcategoriesPerformanceData(
    brandId: number,
    years: string,
    weeks: string,
    months: string,
    category: string,
  ) {
    category = category && JSON.stringify(category.split(',')).replace(/\[|\]/g, '');
    const uncategorized = category?.includes('Uncategorizerd');

    const results: any = await this.brandDbService.client.$queryRawUnsafe(`
    SELECT
      parent_categories.name as category,
      parent_categories.id as category_id,
      ${months ? 'Month(astr_date) AS month' : 'astr_week AS week'},
      ${months ? '' : 'CONCAT("WK", astr_week) AS week_name,'}
      ${months ? 'YEAR(astr_date)' : 'astr_year'} AS year,
      ROUND(SUM(ordered_product_sales), 2) AS total_sales
    FROM
      asin_business_report
    LEFT JOIN
      vendo_commerce.category_product_data ON asin_business_report.astr_child_asin=category_product_data.asin AND category_product_data.brandId = ${brandId}
    LEFT JOIN
      vendo_commerce.categories ON category_product_data.category_id = categories.id AND categories.brandId = ${brandId}
    LEFT JOIN
      vendo_commerce.categories parent_categories ON categories.parent_id = parent_categories.id AND parent_categories.brandId = ${brandId}
    WHERE
      (${months ? 'YEAR(astr_date)' : 'astr_year'} ${`IN (${years})`}) AND
      (${weeks ? `astr_week IN (${weeks})` : '1'}) AND
      (${months ? `Month(astr_date) IN (${months})` : '1'}) AND
      (${
        category
          ? `categories.parent_id IN (${category}) OR (${
              uncategorized ? 'category_product_data.category_id IS NULL' : 'false'
            })`
          : '1'
      })
    GROUP BY
     category, parent_categories.id, ${months ? 'month' : 'week, week_name'}, year
  `);

    return results;
  }

  async getAdvertisingSubcategoriesPerformanceData(
    brandId: number,
    years: string,
    weeks: string,
    months: string,
    category: string,
  ) {
    category = category && JSON.stringify(category.split(',')).replace(/\[|\]/g, '');
    const uncategorized = category?.includes('Uncategorizerd');

    const results: any = await this.brandDbService.client.$queryRawUnsafe(`
      SELECT
        categories.parent_id as category_id,
        ${months ? 'yearmonth_month AS month' : 'yearweek_week AS week'},
        ${months ? 'yearmonth_year' : 'yearweek_year'} AS year,
        ROUND(IFNULL(SUM(attributed_sales7d), 0), 2) AS revenue,
        ROUND(IFNULL(SUM(cost), 0), 2) AS spend
      FROM
        advertising_product_report
      LEFT JOIN
        vendo_commerce.category_product_data ON advertising_product_report.asin=category_product_data.asin AND category_product_data.brandId = ${brandId}
      LEFT JOIN
        vendo_commerce.categories ON category_product_data.category_id = categories.id AND categories.brandId = ${brandId}
      WHERE
        (attributed_sales7d <> 0 OR cost <> 0) AND
        (${`${months ? 'yearmonth_year' : 'yearweek_year'} IN (${years})`}) AND
        (${weeks ? `yearweek_week IN (${weeks})` : '1'}) AND
        (${months ? `yearmonth_month IN (${months})` : '1'}) AND
        (${
          category
            ? `categories.parent_id IN (${category}) OR (${
                uncategorized ? 'category_product_data.category_id IS NULL' : 'false'
              })`
            : '1'
        })
      GROUP BY
      categories.parent_id, ${months ? 'month' : 'week'}, year
    `);

    return results;
  }

  async categoryPerformanceReportWithSubcategories(
    brandId: number,
    year: string,
    weeks: string,
    months: string,
    category: string,
  ) {
    const results = await this.getSalesSubcategoriesPerformanceData(brandId, year, weeks, months, category);
    const ad_results = await this.getAdvertisingSubcategoriesPerformanceData(brandId, year, weeks, months, category);
    const groupedResults: any = [];
    const intervalData: any = [];
    const grandTotal = {
      shipped_revenue: 0,
      TACoS: 0,
      ad_sales: 0,
      ad_spend: 0,
    };

    for (const result of results) {
      const intervalIndex = intervalData.findIndex(
        (group) => group.year == result.year && group.week == result.week && group.month == result.month,
      );

      const categoryIndex = groupedResults.findIndex((group) => group.category === result.category);
      const ad_result = ad_results.find(
        (ad) =>
          ad.year == result.year &&
          ad.week == result.week &&
          ad.month == result.month &&
          result.category_id == ad.category_id,
      );

      const ACoS_percentage = ((ad_result?.spend || 0.000001) / (result.total_sales || 1)) * 100;

      grandTotal.shipped_revenue = grandTotal.shipped_revenue + result.total_sales;
      grandTotal.TACoS = grandTotal.TACoS + ACoS_percentage / results.length;
      grandTotal.ad_sales = grandTotal.ad_sales + (ad_result?.revenue || 0);
      grandTotal.ad_spend = grandTotal.ad_spend + (ad_result?.spend || 0);

      if (intervalIndex === -1) {
        intervalData.push({
          week: result.week,
          week_name: result.week_name,
          month: result.month,
          year: result.year,
          shipped_revenue: result.total_sales,
          TACoS: ((ad_result?.spend || 0.000001) / (result.total_sales || 1)) * 100,
          ad_sales: ad_result?.revenue || 0,
          ad_spend: ad_result?.spend || 0,
        });
      } else {
        const shipped_revenue = intervalData[intervalIndex].shipped_revenue + result.total_sales;
        const ad_sales = intervalData[intervalIndex].ad_sales + (ad_result?.revenue || 0);
        const ad_spend = intervalData[intervalIndex].ad_spend + (ad_result?.spend || 0);

        intervalData[intervalIndex] = {
          ...intervalData[intervalIndex],
          shipped_revenue: shipped_revenue,
          TACoS: ((ad_spend || 0.000001) / (shipped_revenue || 1)) * 100,
          ad_sales: ad_sales,
          ad_spend: ad_spend,
        };
      }

      if (categoryIndex === -1) {
        groupedResults.push({
          category: result.category,
          interval_report: [
            {
              week: result.week,
              week_name: result.week_name,
              month: result.month,
              year: result.year,
              shipped_revenue: result.total_sales,
              TACoS: ACoS_percentage,
              ad_sales: ad_result?.revenue,
              ad_spend: ad_result?.spend,
            },
          ],
        });
      } else {
        groupedResults[categoryIndex].interval_report.push({
          week: result.week,
          week_name: result.week_name,
          month: result.month,
          year: result.year,
          shipped_revenue: result.total_sales,
          TACoS: ACoS_percentage,
          ad_sales: ad_result?.revenue,
          ad_spend: ad_result?.spend,
        });
      }
    }

    let last_year_data: any = null;
    if (year.length == 4 && (weeks == '1' || months == '1')) {
      last_year_data = (
        await this.categoryPerformanceReportWithSubcategories(
          brandId,
          (parseInt(year) - 1).toString(),
          weeks ? '52,53' : weeks,
          months ? '12' : months,
          category,
        )
      ).categories;
    }

    const categories = groupedResults
      .map((result) => {
        const sorted_interval_report = result.interval_report.sort(
          (a, b) => a.year * 54 + (a.week || a.month) - (b.year * 54 + (b.week || b.month)),
        );
        const lastWeekData = sorted_interval_report[result.interval_report.length - 1];
        let secondLastWeek = last_year_data
          ? last_year_data.find((c) => c.category == result.category)?.interval_report?.[0]
          : sorted_interval_report[result.interval_report.length - 2];

        return {
          category: result.category || 'Uncategorized',
          interval_report: sorted_interval_report,
          total: {
            shipped_revenue: _.sum(result.interval_report.map((w) => w.shipped_revenue)),
            TACoS: _.mean(result.interval_report.map((w) => w.TACoS)),
            ad_sales: _.sum(result.interval_report.map((w) => w.ad_sales)),
            ad_spend: _.sum(result.interval_report.map((w) => w.ad_spend)),
          },
          change_interval_over_interval: {
            shipped_revenue: this.getPercentageChange(lastWeekData?.shipped_revenue, secondLastWeek?.shipped_revenue),
            TACoS: this.getPercentageChange(lastWeekData?.TACoS, secondLastWeek?.TACoS, true),
            ad_sales: this.getPercentageChange(lastWeekData?.ad_sales, secondLastWeek?.ad_sales),
            ad_spend: this.getPercentageChange(lastWeekData?.ad_spend, secondLastWeek?.ad_spend),
          },
        };
      })
      .sort((a, b) => b.total.shipped_revenue - a.total.shipped_revenue);

    return { grandTotal: grandTotal, intervalTotal: intervalData, categories: categories };
  }

  async getSalesWithSubcategoriesDataByWeekWithYear(
    brandId: number,
    years: string,
    weeks: string,
    months: string,
    category: string,
    asin: string,
  ) {
    category = category && JSON.stringify(category.split(',')).replace(/\[|\]/g, '');
    const uncategorized = category?.includes('Uncategorizerd');

    const results: any = await this.brandDbService.client.$queryRawUnsafe(`
      SELECT
        category_product_data.category_id as category_id,
        ${weeks ? 'astr_week AS week' : 'Month(astr_date) AS month'},
        ${months ? 'YEAR(astr_date)' : 'astr_year'} AS year,
        ROUND(SUM(ordered_product_sales), 2) AS total_sales
      FROM
        asin_business_report
      LEFT JOIN
        vendo_commerce.category_product_data ON asin_business_report.astr_child_asin=category_product_data.asin AND category_product_data.brandId = ${brandId}
      LEFT JOIN
        vendo_commerce.categories ON category_product_data.category_id = categories.id AND categories.brandId = ${brandId}
      LEFT JOIN
        vendo_commerce.categories parent_categories ON categories.parent_id = parent_categories.id AND parent_categories.brandId = ${brandId}
      WHERE
        (${months ? 'YEAR(astr_date)' : 'astr_year'} ${`IN (${years})`}) AND
        (${weeks ? `astr_week IN (${weeks})` : '1'}) AND
        (${months ? `Month(astr_date) IN (${months})` : '1'}) AND
        (${asin ? `LOWER(category_product_data.asin) LIKE '%${asin.toLowerCase()}%'` : '1'}) AND
        (${
          category
            ? `category_product_data.category_id IN (${category}) OR (${
                uncategorized ? 'category_product_data.category_id IS NULL' : 'false'
              })`
            : '1'
        })
      GROUP BY
      category_id, ${weeks ? 'week' : 'month'}, year
    `);

    return results;
  }

  async categoriesMapping(brandId: number, category: string) {
    const uncategorized = category?.includes('Uncategorizerd');

    let categoriesData: any = await this.commerceDB.$queryRawUnsafe(`
      SELECT
        categories.id as category_id,
        categories.name as category,
        categories.parent_id as parent_category_id,
        parent_categories.name as parent_category
      FROM
        vendo_commerce.categories
      LEFT JOIN
        vendo_commerce.categories parent_categories ON categories.parent_id = parent_categories.id AND parent_categories.brandId = ${brandId}
      WHERE
        categories.brandId = ${brandId} AND
        (${category ? `categories.id IN (${category}) OR (${uncategorized ? 'categories.id IS NULL' : 'false'})` : '1'})
    `);

    return categoriesData;
  }

  async productReportWithSubcategories(
    brandId: number,
    year: string,
    weeks: string,
    months: string,
    asin: string,
    category: string,
  ) {
    const [categories, results, ad_results] = await Promise.all([
      this.categoriesMapping(brandId, category),
      this.getSalesWithSubcategoriesDataByWeekWithYear(brandId, year, weeks, months, category, asin),
      this.getAdvertisingAllData(brandId, year, weeks, months, category, asin),
    ]);

    let groupedResults: any = [];
    let mapping: any = [];

    for (const result of results) {
      mapping.push({
        category_id: result.category_id,
        week: result.week,
        month: result.month,
        year: result.year,
      });
    }

    for (const result of ad_results) {
      const mappingIndex = mapping.findIndex(
        (ad) =>
          ad.year == result.year &&
          ad.week == result.week &&
          ad.month == result.month &&
          ad.category_id == result.category_id,
      );
      if (mappingIndex == -1) {
        mapping.push({
          category_id: result.category_id,
          week: result.week,
          month: result.month,
          year: result.year,
        });
      }
    }

    for (const record of mapping) {
      const categoryIndex = groupedResults.findIndex((group) => group.category_id == record.category_id);
      const category = categories.find((c) => c.category_id == record.category_id);

      const result = results.find(
        (ad) =>
          ad.year == record.year &&
          ad.week == record.week &&
          ad.month == record.month &&
          ad.category_id == record.category_id,
      );

      const ad_result = ad_results.find(
        (ad) =>
          ad.year == record.year &&
          ad.week == record.week &&
          ad.month == record.month &&
          ad.category_id == record.category_id,
      );

      if (categoryIndex === -1) {
        groupedResults.push({
          category: category?.category,
          category_id: category?.category_id,
          parent_category: category?.parent_category,
          parent_category_id: category?.parent_category_id,
          total_sales: result?.total_sales || 0,
          total_ad_sales: ad_result?.revenue || 0,
          total_ad_spend: ad_result?.spend || 0,
          interval_sales: [
            {
              week: record.week,
              month: record.month,
              year: record.year,
              sales: result?.total_sales || 0,
              ad_sales: ad_result?.revenue || 0,
              ad_spend: ad_result?.spend || 0,
            },
          ],
        });
      } else {
        groupedResults[categoryIndex].total_sales += result?.total_sales || 0;
        groupedResults[categoryIndex].total_ad_sales += ad_result?.revenue || 0;
        groupedResults[categoryIndex].total_ad_spend += ad_result?.spend || 0;

        let build_interval = true;
        groupedResults[categoryIndex].interval_sales = groupedResults[categoryIndex].interval_sales.map(
          (interval_sale) => {
            if (
              interval_sale.year === record.year &&
              interval_sale.week === record.week &&
              interval_sale.month === record.month
            ) {
              interval_sale.sales += result?.total_sales || 0;
              interval_sale.ad_sales += ad_result?.revenue || 0;
              interval_sale.ad_spend += ad_result?.spend || 0;
              build_interval = false;
            }
            return interval_sale;
          },
        );

        if (build_interval) {
          groupedResults[categoryIndex].interval_sales.push({
            week: record.week,
            month: record.month,
            year: record.year,
            sales: result?.total_sales || 0,
            ad_sales: ad_result?.revenue || 0,
            ad_spend: ad_result?.spend || 0,
          });
        }
      }
    }

    const [secondLastInterval, lastInterval] = _.sortBy(
      _.uniq(results.map((r) => r.year * 54 + (r.week || r.month))),
    ).slice(-2);

    groupedResults = groupedResults.map((group) => {
      const lastIntervalObj = group.interval_sales.find(
        (rec) => rec.year * 54 + (rec.week || rec.month) === lastInterval,
      );
      const secondLastIntervalObj = group.interval_sales.find(
        (rec) => rec.year * 54 + (rec.week || rec.month) === secondLastInterval,
      );

      return {
        ...group,
        category: group.category || 'Uncategorized',
        change_interval_over_interval_ad_sales: this.getPercentageChange(
          lastIntervalObj?.ad_sales,
          secondLastIntervalObj?.ad_sales,
        ),
        change_interval_over_interval_ad_spend: this.getPercentageChange(
          lastIntervalObj?.ad_spend,
          secondLastIntervalObj?.ad_spend,
        ),
        change_interval_over_interval_sales: this.getPercentageChange(
          lastIntervalObj?.sales,
          secondLastIntervalObj?.sales,
        ),
      };
    });

    const parentGroupedResults: any = [];

    for (const result of groupedResults) {
      const categoryIndex = parentGroupedResults.findIndex((group) => group.category_id == result.parent_category_id);

      if (categoryIndex === -1) {
        parentGroupedResults.push({
          category: result.parent_category,
          category_id: result.parent_category_id,
          total_sales: result.total_sales,
          total_ad_sales: result.total_ad_sales,
          total_ad_spend: result.total_ad_spend,
          interval_sales: result.interval_sales,
          categories: [_.cloneDeep(result)],
        });
      } else {
        parentGroupedResults[categoryIndex].total_sales += result.total_sales;
        parentGroupedResults[categoryIndex].total_ad_sales += result.total_ad_sales;
        parentGroupedResults[categoryIndex].total_ad_spend += result.total_ad_spend;

        parentGroupedResults[categoryIndex].interval_sales = parentGroupedResults[categoryIndex].interval_sales.map(
          (interval_sale) => {
            const interval_sale_rec = result.interval_sales.find(
              (ws) =>
                interval_sale.year === ws.year && interval_sale.week === ws.week && interval_sale.month === ws.month,
            );
            if (interval_sale_rec) {
              interval_sale.sales += interval_sale_rec.sales;
              interval_sale.ad_sales += interval_sale_rec.ad_sales;
              interval_sale.ad_spend += interval_sale_rec.ad_spend;
            }
            return interval_sale;
          },
        );

        parentGroupedResults[categoryIndex].interval_sales = parentGroupedResults[categoryIndex].interval_sales.concat(
          result.interval_sales.filter(
            (r) =>
              !parentGroupedResults[categoryIndex].interval_sales.find(
                (ws) => r.year === ws.year && r.week === ws.week && r.month === ws.month,
              ),
          ),
        );
        parentGroupedResults[categoryIndex].categories.push(result);
      }
    }

    return parentGroupedResults.map((group) => {
      const lastIntervalObj = group.interval_sales.find(
        (rec) => rec.year * 54 + (rec.week || rec.month) === lastInterval,
      );
      const secondLastIntervalObj = group.interval_sales.find(
        (rec) => rec.year * 54 + (rec.week || rec.month) === secondLastInterval,
      );

      return {
        ...group,
        category: group.category || 'Uncategorized',
        change_interval_over_interval_ad_sales: this.getPercentageChange(
          lastIntervalObj?.ad_sales,
          secondLastIntervalObj?.ad_sales,
        ),
        change_interval_over_interval_ad_spend: this.getPercentageChange(
          lastIntervalObj?.ad_spend,
          secondLastIntervalObj?.ad_spend,
        ),
        change_interval_over_interval_sales: this.getPercentageChange(
          lastIntervalObj?.sales,
          secondLastIntervalObj?.sales,
        ),
      };
    });
  }
}
