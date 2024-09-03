import { Injectable } from '@nestjs/common';
import { VendoBrandDBService, VendoCommerceDBService } from 'src/prisma.service';
import { AdvertisingService } from 'src/advertising/advertising.service';
import * as _ from 'lodash';
import dayjs from 'src/utils/date.util';

import { ifNullValue } from 'src/utils/number.util';
import { PaginationOptions } from 'src/middlewares/pagination.middleware';
@Injectable()
export class CustomerAcquisitionService {
  constructor(
    private readonly brandDb: VendoBrandDBService,
    private readonly commerceDb: VendoCommerceDBService,
    private readonly adService: AdvertisingService,
  ) {}

  async countMonthlyProducts({ year, month, brandId, search }) {
    const searchCondition = search
      ? {
          OR: [{ product_name: { contains: search } }, { sku: { contains: search } }, { asin: { contains: search } }],
        }
      : {};
    const data = await this.commerceDb.monthly_product_breakdown.findMany({
      select: {
        asin: true,
      },
      where: {
        AND: [{ brandId }, { year: { in: year } }, { month: { in: month } }, searchCondition],
      },
    });

    return _.uniqBy(data, 'asin').map((item) => item.asin).length;
  }
  async countWeeklyProducts({ year, week, brandId, search }) {
    const searchCondition = search
      ? {
          OR: [{ product_name: { contains: search } }, { sku: { contains: search } }, { asin: { contains: search } }],
        }
      : {};
    const data = await this.commerceDb.weekly_product_breakdown.findMany({
      select: {
        asin: true,
      },
      where: {
        AND: [{ brandId }, { year: { in: year } }, { week: { in: week } }, searchCondition],
      },
    });

    return _.uniqBy(data, 'asin').map((item) => item.asin).length;
  }

  async newVsOldCustomers(year: number[], months: string, brandId: number) {
    const queryMonth = months
      .split(',')
      .map((m) => Number(m) + 1)
      .sort();
    try {
      const customers = await this.commerceDb.monthly_customer_acquistion.findMany({
        where: {
          brandId,
          AND: [{ month: { in: queryMonth } }, { year: { in: year } }],
        },
      });
      const { data } = await this.adService.getDataByMonth(queryMonth.join(','), year.join(','));
      let result = customers.map((item) => {
        const ads = data.find((ad) => ad.month === item.month && ad.year === item.year);
        return {
          ...ads,
          ...item,
          month: Number(item.month) - 1,
          customer_count: Number(item.returned_buyer) + Number(item.unique_buyer),
          month_name: dayjs()
            .year(item.year || Number(year))
            .month(Number(item.month) - 1)
            .format('MMMM'),
          new_customer_count: Number(item.unique_buyer),
          new_customer_sale: item.unique_buyer_sale,
          old_customer_sale: item.returned_buyer_sale,
          old_customer_count: Number(item.returned_buyer),
          new_customer_purchase_aov: ifNullValue(Number(item.unique_buyer_sale) / Number(item.unique_buyer), 0),
          old_customer_purchase_aov: ifNullValue(Number(item.returned_buyer_sale) / Number(item.returned_buyer), 0),
        };
      });
      result = _.flatten(result);
      const totalNewSale = _.sumBy(result, (n) => Number(n.new_customer_sale));
      const totalOldSale = _.sumBy(result, (n) => Number(n.old_customer_sale));
      const totalNewCount = _.sumBy(result, (n) => Number(n.new_customer_count));
      const totalOldCount = _.sumBy(result, (n) => Number(n.old_customer_count));
      const totalAov = (totalNewSale + totalOldSale) / (totalNewCount + totalOldCount);
      const newAOV = totalNewSale / totalNewCount;
      const oldAOV = totalOldSale / totalOldCount;
      return {
        list: result,
        total: {
          new_customers_average_aov: newAOV,
          old_customers_average_aov: oldAOV,
          totalAov,
        },
      };
    } catch (e) {
      if (e.name == 'PrismaClientKnownRequestError') {
        if (e.code !== 'P2015') {
          return {
            list: [],
            total: {
              new_customers_average_aov: 0,
              old_customers_average_aov: 0,
              totalAov: 0,
            },
          };
        } else {
          throw e;
        }
      }
    }
  }

  async newVsOldCustomersWeekly(year: number[], weeks: string, brandId: number) {
    const queryWeeks = weeks
      .split(',')
      .map((m) => Number(m))
      .sort();
    const customers = await this.commerceDb.weekly_customer_acquistion.findMany({
      where: {
        AND: [{ week: { in: queryWeeks } }, { year: { in: year } }, { brandId: brandId }],
      },
    });
    const { data } = await this.adService.getDataByWeek(queryWeeks.join(','), year.join(','));
    let result = customers.map((item) => {
      const ads = data.find((ad) => ad.week === item.week && ad.year === item.year);
      return {
        ...ads,
        ...item,
        week: Number(item.week),
        customer_count: Number(item.returned_buyer) + Number(item.unique_buyer),
        new_customer_count: Number(item.unique_buyer),
        old_customer_count: Number(item.returned_buyer),
        new_customer_sale: item.unique_buyer_sale,
        old_customer_sale: item.returned_buyer_sale,
        new_customer_purchase_aov: ifNullValue(Number(item.unique_buyer_sale) / Number(item.unique_buyer), 0),
        old_customer_purchase_aov: ifNullValue(Number(item.returned_buyer_sale) / Number(item.returned_buyer), 0),
      };
    });

    result = _.flatten(result);
    const totalNewSale = _.sumBy(result, (n) => Number(n.new_customer_sale));
    const totalOldSale = _.sumBy(result, (n) => Number(n.old_customer_sale));
    const totalNewCount = _.sumBy(result, (n) => Number(n.new_customer_count));
    const totalOldCount = _.sumBy(result, (n) => Number(n.old_customer_count));
    const totalAov = (totalNewSale + totalOldSale) / (totalNewCount + totalOldCount);
    const newAOV = totalNewSale / totalNewCount;
    const oldAOV = totalOldSale / totalOldCount;
    return {
      list: result,
      total: {
        new_customers_average_aov: newAOV,
        old_customers_average_aov: oldAOV,
        totalAov,
      },
    };
  }

  async getLTV(brandId: number) {
    const returnBuyers = await this.commerceDb.customer_acquisition_ltv.findMany({
      where: {
        brandId,
      },
    });
    const UniqueBuyers = await this.commerceDb.monthly_customer_acquistion.findMany({
      where: {
        brandId,
      },
    });
    const uniuqeBuyersyearly = _(UniqueBuyers)
      .map((u) => ({ ...u, key: `${u.month}-${u.year}` }))
      .groupBy('key')
      .value();
    const returnBuyersMonthly = _(returnBuyers)
      .map((u) => ({ ...u, key: `${u.month}-${u.year}` }))
      .groupBy('key')
      .value();
    const sortedReturnBuyersMonthly = Object.entries(returnBuyersMonthly).sort((a, b) => {
      const [monthA, yearA] = a[0].split('-').map(Number);
      const [monthB, yearB] = b[0].split('-').map(Number);

      if (yearA > yearB) return 1;
      if (yearA < yearB) return -1;
      if (monthA > monthB) return 1;
      if (monthA < monthB) return -1;
      return 0;
    });

    const result = sortedReturnBuyersMonthly.map(([key, returnBuyer], i) => {
      const [month, year] = key.split('-').map(Number);
      return {
        month: +month - 1,
        month_name: dayjs()
          .month(+month - 1)
          .format('MMMM'),
        year: year,
        index: i,
        newCustomerCount: (uniuqeBuyersyearly[returnBuyer[0].key] as any)[0].unique_buyer,
        newCustomerSales: (uniuqeBuyersyearly[returnBuyer[0].key] as any)[0].unique_buyer_sale,
        otherMonths: returnBuyer
          .map((io) => {
            return {
              month:
                +dayjs()
                  .month(io.subsequent_month || 0)
                  .subtract(Number(month), 'month')
                  .format('M') - 1,
              year: io.subsequent_year,
              newCustomerSalesTotal: io.total_sales_returning_buyers,
            };
          })
          .sort(function (a, b) {
            if (Number(a.year) > Number(b.year)) return 1;
            if (Number(a.year) < Number(b.year)) return -1;
            if (Number(a.month) > Number(b.month)) return 1;
            if (Number(a.month) < Number(b.month)) return -1;
            return 0;
          })
          .map((io, id) => ({ ...io, index: id })),
      };
    });
    // calculation of averageTotalLTV value
    const allMoreThan6Months = result.filter((r) => r.otherMonths.length >= 7);
    const totalSales = _.sumBy(allMoreThan6Months, (o) =>
      _.sumBy(o.otherMonths, (amt) => Number(amt.newCustomerSalesTotal)),
    );
    const totalCustomerCount = _.sumBy(allMoreThan6Months, 'newCustomerCount');
    const averageTotalLTV = totalSales / totalCustomerCount;

    return { list: result, total: { averageTotalLTV } };
  }

  async getProductBreakDown({
    year,
    month,
    brandId,
    pagination,
    search,
  }: {
    year: number[];
    month: number[];
    brandId: number;
    pagination: PaginationOptions;
    search: string;
  }) {
    const { page, limit, orderBy, order } = pagination;
    const searchCondition = search
      ? {
          OR: [{ product_name: { contains: search } }, { sku: { contains: search } }, { asin: { contains: search } }],
        }
      : {};

    const asins = await this.commerceDb.monthly_product_breakdown.findMany({
      skip: (page - 1) * limit,
      take: limit,
      select: { asin: true },
      where: {
        AND: [{ brandId }, { year: { in: year } }, { month: { in: month } }, searchCondition],
      },
      distinct: ['asin'],
      orderBy: { [orderBy]: order },
    });
    const data = await this.commerceDb.monthly_product_breakdown.findMany({
      where: {
        brandId,
        year: { in: year },
        ...(month ? { month: { in: month } } : {}),
        asin: { in: asins.map((a) => a.asin || '') },
      },
    });
    // this functionality is to justify the duplicated data.
    const groupedByProduct = _(data)
      .groupBy('asin')
      .map((asins) => {
        return _(asins)
          .groupBy((d) => `${d.month}-${d.year}`)
          .map((a) => ({
            asin: a[0].asin,
            sku: a[0].sku,
            month: a[0].month,
            product_name: a[0].product_name,
            year: a[0].year,
            unique_buyer: _.sumBy(a, 'unique_buyer'),
            returned_buyer: _.sumBy(a, 'returned_buyer'),
          }))
          .value();
      })
      .value();

    const YTDDataAggregated = await this.commerceDb.monthly_product_breakdown.groupBy({
      by: ['asin'], // Group by product ID
      where: { brandId, year: { in: year } },
      _sum: {
        unique_buyer: true, // Sum of unique buyers
        returned_buyer: true, // Sum of returned buyers
      },
    });

    const total = await this.commerceDb.monthly_product_breakdown.groupBy({
      by: ['year', 'month', 'brandId'],
      where: {
        brandId: brandId,
        asin: { not: null },
        year: { in: year },
        ...(search
          ? {
              OR: [
                { product_name: { contains: search } },
                { sku: { contains: search } },
                { asin: { contains: search } },
              ],
            }
          : {}),
      },
      _sum: {
        returned_buyer: true,
        unique_buyer: true,
      },
    });
    // Convert aggregated data into the desired map format
    const ytdGroupedByProductMap = new Map();
    YTDDataAggregated.forEach((item) => {
      ytdGroupedByProductMap.set(item.asin, {
        unique_buyer_ytd: item._sum.unique_buyer,
        returned_buyer_ytd: item._sum.returned_buyer,
      });
    });

    const result = _.map(groupedByProduct, (productEntries) => {
      // Since the ASIN is consistent for a given product,
      // just take the ASIN from the first entry of productEntries.
      const asin = productEntries[0].asin;
      const sku = productEntries[0].sku;
      const product_name = productEntries[0].product_name;
      const ytd_unique_buyer = ytdGroupedByProductMap.get(asin!)!.unique_buyer_ytd;
      const ytd_returned_buyer = ytdGroupedByProductMap.get(asin!)!.returned_buyer_ytd;

      return {
        ytd_unique_buyer: ytd_unique_buyer,
        ytd_returned_buyer: ytd_returned_buyer,
        asin: asin,
        product_name,
        sku,
        total_unique_buyer: _.sumBy(productEntries, 'unique_buyer'),
        total_returned_buyer: _.sumBy(productEntries, 'returned_buyer'),
        months: productEntries
          .map((entry) => ({
            year: entry.year,
            month: entry.month,
            unique_buyer: entry.unique_buyer,
            returned_buyer: entry.returned_buyer,
          }))
          .sort((a, b) => {
            if (a.year !== b.year) {
              return a.year - b.year;
            }
            return a.month - b.month;
          }),
      };
    });
    return {
      result,
      total: total.map((item) => ({
        year: item.year,
        month: item.month,
        total_returned_buyer: item._sum.returned_buyer,
        total_unique_buyer: item._sum.unique_buyer,
      })),
    };
  }

  async getProductBreakDownWeekly({
    year,
    week,
    brandId,
    pagination,
    search,
  }: {
    year: number[];
    week?: number[];
    brandId: number;
    pagination: PaginationOptions;
    search?: string;
  }) {
    const { page, limit, orderBy, order } = pagination;
    const searchCondition = search
      ? {
          OR: [{ product_name: { contains: search } }, { sku: { contains: search } }, { asin: { contains: search } }],
        }
      : {};

    const asins = await this.commerceDb.weekly_product_breakdown.findMany({
      skip: (page - 1) * limit,
      take: limit,
      select: { asin: true },
      where: {
        AND: [{ brandId }, { year: { in: year } }, { week: { in: week } }, searchCondition],
      },
      distinct: ['asin'],
      orderBy: { [orderBy]: order },
    });
    const data = await this.commerceDb.weekly_product_breakdown.findMany({
      where: {
        brandId,
        year: { in: year },
        week: { in: week },
        asin: { in: asins.map((a) => a.asin || '') },
      },
    });
    const groupedByProduct = _(data)
      .groupBy('asin')
      .map((asins) => {
        return _(asins)
          .groupBy((d) => `${d.week}-${d.year}`)
          .map((a) => ({
            asin: a[0].asin,
            sku: a[0].sku,
            week: a[0].week,
            product_name: a[0].product_name,
            year: a[0].year,
            unique_buyer: _.sumBy(a, 'unique_buyer'),
            returned_buyer: _.sumBy(a, 'returned_buyer'),
          }))
          .value();
      })
      .value();
    const YTDDataAggregated = await this.commerceDb.weekly_product_breakdown.groupBy({
      by: ['asin'], // Group by product ID
      where: { brandId, year: { in: year } },
      _sum: {
        unique_buyer: true, // Sum of unique buyers
        returned_buyer: true, // Sum of returned buyers
      },
    });
    const total = await this.commerceDb.weekly_product_breakdown.groupBy({
      by: ['year', 'week', 'brandId'],
      where: {
        brandId: brandId,
        asin: { not: null },
        year: { in: year },
        ...(search
          ? {
              OR: [
                { product_name: { contains: search } },
                { sku: { contains: search } },
                { asin: { contains: search } },
              ],
            }
          : {}),
      },
      _sum: {
        returned_buyer: true,
        unique_buyer: true,
      },
    });
    // Convert aggregated data into the desired map format
    const ytdGroupedByProductMap = new Map();
    YTDDataAggregated.forEach((item) => {
      ytdGroupedByProductMap.set(item.asin, {
        unique_buyer_ytd: item._sum.unique_buyer,
        returned_buyer_ytd: item._sum.returned_buyer,
      });
    });

    const result = _.map(groupedByProduct, (productEntries) => {
      // Since the ASIN is consistent for a given product,
      // just take the ASIN from the first entry of productEntries.
      const asin = productEntries[0].asin;
      const sku = productEntries[0].sku;
      const product_name = productEntries[0].product_name;
      const ytd_unique_buyer = ytdGroupedByProductMap.get(asin!)!.unique_buyer_ytd;
      const ytd_returned_buyer = ytdGroupedByProductMap.get(asin!)!.returned_buyer_ytd;

      return {
        ytd_unique_buyer: ytd_unique_buyer,
        ytd_returned_buyer: ytd_returned_buyer,
        asin: asin,
        product_name,
        sku,
        total_unique_buyer: _.sumBy(productEntries, 'unique_buyer'),
        total_returned_buyer: _.sumBy(productEntries, 'returned_buyer'),
        weeks: productEntries
          .map((entry) => ({
            year: entry.year,
            week: entry.week,
            unique_buyer: entry.unique_buyer,
            returned_buyer: entry.returned_buyer,
          }))
          .sort((a, b) => {
            if (a.year !== b.year) {
              return a.year - b.year;
            }
            return a.week - b.week;
          }),
      };
    });
    return {
      result,
      total: total.map((item) => ({
        year: item.year,
        week: item.week,
        total_returned_buyer: item._sum.returned_buyer,
        total_unique_buyer: item._sum.unique_buyer,
      })),
    };
  }

  async getCategoryBreakDown({
    year,
    month,
    brandId,
    categoryIds,
  }: {
    year: number[];
    month: number[];
    categoryIds: number[];
    brandId: number;
  }) {
    const [productBreakdowns, categoryData] = await Promise.all([
      this.commerceDb.monthly_product_breakdown.findMany({
        where: { brandId, month: { in: month }, year: { in: year } },
      }),
      this.commerceDb.$queryRawUnsafe(`
        SELECT asin, COALESCE(parent_categories.name, child_categories.name) AS "category"
        FROM category_product_data
        LEFT JOIN categories as child_categories ON category_product_data.category_id = child_categories.id
        LEFT JOIN categories as parent_categories ON child_categories.parent_id = parent_categories.id
        WHERE category_product_data.brandId = ${brandId} AND ${
        categoryIds ? `category_id IN (${categoryIds}) OR child_categories.parent_id IN (${categoryIds})` : '1'
      }
        `),
    ]);

    const asinToCategory = (categoryData as Array<any>).reduce((acc, { asin, category }) => {
      if (asin) {
        acc[asin] = category || 'Others';
      }
      return acc;
    }, {} as { [asin: string]: string });

    const categoryAggregates: { [category: string]: any[] } = {};
    const uniqueCategories: string[] = [];

    productBreakdowns.forEach(({ asin, ...rest }) => {
      const categoryName = asinToCategory[asin || ''] || 'Others';
      if (!categoryAggregates[categoryName]) {
        categoryAggregates[categoryName] = [];
        uniqueCategories.push(categoryName);
      }
      categoryAggregates[categoryName].push(rest);
    });

    const sortedCategories = _.orderBy(uniqueCategories, [
      (category) => (category === 'Others' ? 1 : 0),
      (category) => category,
    ]);

    return sortedCategories.map((categoryName) => {
      const monthlyData = _.groupBy(categoryAggregates[categoryName], (entry) => `${entry.year}-${entry.month}`);

      const monthlyAggregates = Object.entries(monthlyData).map(([yearMonthKey, entries]) => {
        const [year, month] = yearMonthKey.split('-').map(Number);
        return {
          year: year,
          month: month,
          unique_buyer: _.sumBy(entries, 'unique_buyer'),
          returned_buyer: _.sumBy(entries, 'returned_buyer'),
        };
      });

      return {
        category: categoryName,
        total_unique_buyer: _.sumBy(monthlyAggregates, 'unique_buyer'),
        total_returned_buyer: _.sumBy(monthlyAggregates, 'returned_buyer'),
        months: monthlyAggregates.sort((a, b) => {
          if (a.year !== b.year) {
            return a.year - b.year;
          }
          return a.month - b.month;
        }),
      };
    });
  }

  async getCategoryBreakDownWeekly({
    year,
    week,
    brandId,
    categoryIds,
  }: {
    year: number[];
    week: number[];
    categoryIds: number[];
    brandId: number;
  }) {
    const [productBreakdowns, categoryData] = await Promise.all([
      this.commerceDb.weekly_product_breakdown.findMany({
        where: { brandId, week: { in: week }, year: { in: year } },
      }),
      this.commerceDb.$queryRawUnsafe(`
        SELECT asin, COALESCE(parent_categories.name, child_categories.name) AS "category"
        FROM category_product_data
        LEFT JOIN categories as child_categories ON category_product_data.category_id = child_categories.id
        LEFT JOIN categories as parent_categories ON child_categories.parent_id = parent_categories.id
        WHERE category_product_data.brandID = ${brandId} AND ${
        categoryIds ? `category_id IN (${categoryIds}) OR child_categories.parent_id IN (${categoryIds})` : '1'
      }
        `),
    ]);

    const asinToCategory = (categoryData as Array<any>).reduce((acc, { asin, category }) => {
      if (asin) {
        acc[asin] = category || 'Others';
      }
      return acc;
    }, {} as { [asin: string]: string });

    const categoryAggregates: { [category: string]: any[] } = {};
    const uniqueCategories: string[] = [];

    productBreakdowns.forEach(({ asin, ...rest }) => {
      const categoryName = asinToCategory[asin || ''] || 'Others';
      if (!categoryAggregates[categoryName]) {
        categoryAggregates[categoryName] = [];
        uniqueCategories.push(categoryName);
      }
      categoryAggregates[categoryName].push(rest);
    });

    const sortedCategories = _.orderBy(uniqueCategories, [
      (category) => (category === 'Others' ? 1 : 0),
      (category) => category,
    ]);

    return sortedCategories.map((categoryName) => {
      const weeklyData = _.groupBy(categoryAggregates[categoryName], (entry) => `${entry.year}-${entry.week}`);

      const weeklyAggregates = Object.entries(weeklyData).map(([yearweekKey, entries]) => {
        const [year, week] = yearweekKey.split('-').map(Number);
        return {
          year: year,
          week: week,
          unique_buyer: _.sumBy(entries, 'unique_buyer'),
          returned_buyer: _.sumBy(entries, 'returned_buyer'),
        };
      });

      return {
        category: categoryName,
        total_unique_buyer: _.sumBy(weeklyAggregates, 'unique_buyer'),
        total_returned_buyer: _.sumBy(weeklyAggregates, 'returned_buyer'),
        weeks: weeklyAggregates.sort((a, b) => {
          if (a.year !== b.year) {
            return a.year - b.year;
          }
          return a.week - b.week;
        }),
      };
    });
  }
  async getPridiction(months: number, brandId: number) {
    const { list } = await this.getLTV(brandId);
    const allMoreThan6Months = list
      .filter((r) => r.otherMonths.length > months + 1)
      .map((r) => ({
        ...r,
        otherMonths: r.otherMonths.slice(0, months + 1),
      }));
    const totalSales = _.sumBy(allMoreThan6Months, (o) =>
      _.sumBy(o.otherMonths, (amt) => Number(amt.newCustomerSalesTotal)),
    );
    const totalCustomerCount = _.sumBy(allMoreThan6Months, 'newCustomerCount');
    const averageTotalLTV = totalSales / totalCustomerCount;

    return { ltvPrediction: averageTotalLTV };
  }
}
