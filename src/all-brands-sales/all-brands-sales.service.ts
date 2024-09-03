import { Color, computeColor } from './utils/colorFormatting.utils';
import { Injectable } from '@nestjs/common';
import { VendoCommerceDBService } from '../prisma.service';

@Injectable()
export class AllBrandsSalesService {
  constructor(private readonly commerceDb: VendoCommerceDBService) {}

  async getSalesForAllBrandsDaily(
    filters: { [brandId: number]: { from?: Date; to?: Date } },
    extraFilters: { ams: number[]; categories: number[]; brandIds: number[] },
  ) {
    const res: {
      brandName: string;
      vendoContractStartDate: number;
      vendoContractEndDate: number;
      categoryId: number;
      categoryName: string;
      accountManagerId: number;
      accountManagerName: string;
      id: number;
      from?: Date;
      to?: Date;
      average: number;
      total: number;
      perDate: {
        [date: string]: {
          sales: number;
          color: Color;
        };
      };
      perDay: {
        [day: number]: {
          sales: number;
          color: Color;
        };
      };
    }[] = [];
    const filterQuery = this.createAllBrandsFilter(filters, extraFilters, 'MONTH');
    const salesRes: {
      id: number;
      name: string;
      vendo_contract_start_date: number;
      vendo_contract_end_date: number;
      account_manager_id: number;
      account_manager_name: string;
      category_id: number;
      category_name: string;
      date: string;
      sales: number;
    }[] = await this.commerceDb.$queryRawUnsafe(`
        SELECT brandsId as id, B.name as name, vendo_contract_start_date, vendo_contract_end_date, date, SUM(sale) as sales,
        U.id as account_manager_id, U.u_name as account_manager_name, BC.id as category_id, BC.name as category_name
        FROM AllBrandsSum
        LEFT JOIN Brands B on B.id = AllBrandsSum.brandsId
        LEFT JOIN users U on U.id = B.account_manager_id
        LEFT JOIN _BrandCategoriesToBrands BCB on BCB.B = B.id
        LEFT JOIN BrandCategories BC on BC.id = BCB.A
        ${filterQuery}
        GROUP BY brandsId, date
        ORDER BY brandsId, date;
        `);
    const perDaySales: {
      id: number;
      dayOfWeek: string;
      sales: number;
    }[] = await this.commerceDb.$queryRawUnsafe(`
          SELECT brandsId as id, DAYOFWEEK(date) as dayOfWeek, SUM(sale) as sales
          FROM AllBrandsSum
            LEFT JOIN Brands B on B.id = AllBrandsSum.brandsId
            LEFT JOIN users U on U.id = B.account_manager_id
            LEFT JOIN _BrandCategoriesToBrands BCB on BCB.B = B.id
            LEFT JOIN BrandCategories BC on BC.id = BCB.A
          ${filterQuery}
          GROUP BY brandsId, DAYOFWEEK(date)
          ORDER BY brandsId, DAYOFWEEK(date);
          `);
    const totalAndAverages = await this.getTotalAverage(filterQuery);
    const minAndMaxDates = await this.getMinAndMaxDates();
    for (const totalAndAverage of totalAndAverages) {
      const sales = salesRes.filter((s) => s.id === totalAndAverage.id);
      const minMaxPerDate = {
        min: Math.min(...sales.map((s) => s.sales)),
        max: Math.max(...sales.map((s) => s.sales)),
      };
      const dayOfWeekSales = perDaySales.filter((s) => s.id === totalAndAverage.id);
      const minMaxPerDay = {
        min: Math.min(...dayOfWeekSales.map((s) => s.sales)),
        max: Math.max(...dayOfWeekSales.map((s) => s.sales)),
      };
      const minAndMax = minAndMaxDates.find((m) => m.id === totalAndAverage.id);
      const row = {
        brandName: sales[0]?.name,
        vendoContractStartDate: sales[0]?.vendo_contract_start_date,
        vendoContractEndDate: sales[0]?.vendo_contract_end_date,
        categoryId: sales[0]?.category_id,
        categoryName: sales[0]?.category_name,
        accountManagerId: sales[0]?.account_manager_id,
        accountManagerName: sales[0]?.account_manager_name,
        id: totalAndAverage.id,
        from: minAndMax?.minDate,
        to: minAndMax?.maxDate,
        total: totalAndAverage.total,
        average: totalAndAverage.average,
        perDate: {},
        perDay: {},
      };
      for (const data of dayOfWeekSales) {
        row['perDay'][data.dayOfWeek] = {
          sales: data.sales,
          color: computeColor(minMaxPerDay.min, minMaxPerDay.max, data.sales),
        };
      }
      for (const data of sales) {
        row.perDate[new Date(data.date).toISOString().split('T')[0]] = {
          sales: data.sales,
          color: computeColor(minMaxPerDate.min, minMaxPerDate.max, data.sales),
        };
      }
      res.push(row);
    }
    return res;
  }

  async getSalesForAllBrandsWeekly(
    filters: { [brandId: number]: { from?: Date; to?: Date } },
    extraFilters: { ams: number[]; categories: number[]; brandIds: number[] },
  ) {
    const res: {
      brandName: string;
      vendoContractStartDate: number;
      vendoContractEndDate: number;
      id: number;
      from?: Date;
      to?: Date;
      perWeek: {
        [week: string]: {
          sales: number;
          color: Color;
        };
      };
    }[] = [];
    const filterQuery = this.createAllBrandsFilter(filters, extraFilters);
    const salesRes: {
      id: number;
      vendo_contract_start_date: number;
      vendo_contract_end_date: number;
      account_manager_id: number;
      account_manager_name: string;
      category_id: number;
      category_name: string;
      name: string;
      week: string;
      sales: number;
      spend: number;
      revenue: number;
    }[] = await this.commerceDb.$queryRawUnsafe(`
      SELECT brandsId as id, B.name as name, vendo_contract_start_date, vendo_contract_end_date, week,
             SUM(sale) as sales,SUM(revenue) as revenue,SUM(spend) as spend,
      U.id as account_manager_id, U.u_name as account_manager_name, BC.id as category_id, BC.name as category_name
      FROM AllBrandsSum
      LEFT JOIN Brands B on B.id = AllBrandsSum.brandsId
      LEFT JOIN users U on U.id = B.account_manager_id
      LEFT JOIN _BrandCategoriesToBrands BCB on BCB.B = B.id
      LEFT JOIN BrandCategories BC on BC.id = BCB.A
      ${filterQuery}
      GROUP BY brandsId, week
      ORDER BY brandsId, week;
      `);
    const totalAndAverages = await this.getTotalAverage(filterQuery);
    const adTotalAndAverages = await this.getAdTotalAverage(filterQuery);
    const minAndMaxDates = await this.getMinAndMaxDates();
    for (const totalAndAverage of totalAndAverages) {
      const sales = salesRes.filter((s) => s.id === totalAndAverage.id);
      const ads = adTotalAndAverages.find((ad) => ad.id === totalAndAverage.id);
      const minMax = {
        min: Math.min(...sales.map((s) => s.sales)),
        max: Math.max(...sales.map((s) => s.sales)),
      };
      const minAndMax = minAndMaxDates.find((m) => m.id === totalAndAverage.id);
      const row = {
        brandName: sales[0]?.name,
        vendoContractStartDate: sales[0]?.vendo_contract_start_date,
        vendoContractEndDate: sales[0]?.vendo_contract_end_date,
        categoryId: sales[0]?.category_id,
        categoryName: sales[0]?.category_name,
        accountManagerId: sales[0]?.account_manager_id,
        accountManagerName: sales[0]?.account_manager_name,
        id: totalAndAverage.id,
        from: minAndMax?.minDate,
        to: minAndMax?.maxDate,
        totalSale: totalAndAverage.total,
        averageSale: totalAndAverage.average,
        totalSpend: ads!.totalSpend,
        averageSpend: ads!.averageSpend,
        totalRevenue: ads!.totalRevenue,
        averageRevenue: ads!.averageRevenue,
        perWeek: {},
      };
      for (const data of sales) {
        row.perWeek[data.week] = {
          sales: data.sales,
          spend: data.spend,
          revenue: data.revenue,
          color: computeColor(minMax.min, minMax.max, data.sales),
        };
      }
      res.push(row);
    }
    return res;
  }

  async getSalesForAllBrandsMonthly(
    filters: { [brandId: number]: { from?: Date; to?: Date } },
    extraFilters: { ams: number[]; categories: number[]; brandIds: number[] },
  ) {
    const res: {
      brandName: string;
      vendoContractStartDate: number;
      vendoContractEndDate: number;
      id: number;
      from?: Date;
      to?: Date;
      totalSale: number;
      averageSale: number;
      totalSpend: number;
      averageSpend: number;
      totalRevenue: number;
      averageRevenue: number;
      perMonth: {
        [month: string]: {
          sales: number;
          color: Color;
        };
      };
    }[] = [];
    const filterQuery = this.createAllBrandsFilter(filters, extraFilters);
    const salesRes: {
      id: number;
      vendo_contract_start_date: number;
      vendo_contract_end_date: number;
      account_manager_id: number;
      account_manager_name: string;
      category_id: number;
      category_name: string;
      name: string;
      month: string;
      sales: number;
      spend: number;
      revenue: number;
    }[] = await this.commerceDb.$queryRawUnsafe(`
     SELECT brandsId as id, B.name as name, vendo_contract_start_date, vendo_contract_end_date, month,
      U.id as account_manager_id, U.u_name as account_manager_name, BC.id as category_id, BC.name as category_name,
            SUM(sale) as sales,SUM(spend) as spend,SUM(revenue) as revenue
      FROM AllBrandsSum
               LEFT JOIN Brands B on B.id = AllBrandsSum.brandsId
               LEFT JOIN users U on U.id = B.account_manager_id
               LEFT JOIN _BrandCategoriesToBrands BCB on BCB.B = B.id
               LEFT JOIN BrandCategories BC on BC.id = BCB.A
      ${filterQuery}
      GROUP BY brandsId, month
      ORDER BY brandsId, month;
    `);
    const totalAndAverages = await this.getTotalAverage(filterQuery);
    const adTotalAndAverages = await this.getAdTotalAverage(filterQuery);
    const minAndMaxDates = await this.getMinAndMaxDates();
    for (const totalAndAverage of totalAndAverages) {
      const sales = salesRes.filter((s) => s.id === totalAndAverage.id);
      const ads = adTotalAndAverages.find((ad) => ad.id === totalAndAverage.id);
      const minMax = {
        min: Math.min(...sales.map((s) => s.sales)),
        max: Math.max(...sales.map((s) => s.sales)),
      };
      const minAndMax = minAndMaxDates.find((m) => m.id === totalAndAverage.id);
      const row = {
        brandName: sales[0]?.name,
        vendoContractStartDate: sales[0]?.vendo_contract_start_date,
        vendoContractEndDate: sales[0]?.vendo_contract_end_date,
        categoryId: sales[0]?.category_id,
        categoryName: sales[0]?.category_name,
        accountManagerId: sales[0]?.account_manager_id,
        accountManagerName: sales[0]?.account_manager_name,
        id: totalAndAverage.id,
        from: minAndMax?.minDate,
        to: minAndMax?.maxDate,
        totalSale: totalAndAverage.total,
        averageSale: totalAndAverage.average,
        totalSpend: ads!.totalSpend,
        averageSpend: ads!.averageSpend,
        totalRevenue: ads!.totalRevenue,
        averageRevenue: ads!.averageRevenue,
        perMonth: {},
      };
      for (const data of sales) {
        row.perMonth[data.month] = {
          sales: data.sales,
          spend: data.spend,
          revenue: data.revenue,
          color: computeColor(minMax.min, minMax.max, data.sales),
        };
      }
      res.push(row);
    }
    return res;
  }

  private async getMinAndMaxDates() {
    const res: { id: number; minDate: Date; maxDate: Date }[] = await this.commerceDb.$queryRawUnsafe(
      `SELECT brandsId as id, MIN(date) as minDate, max(date) as maxDate FROM AllBrandsSum GROUP BY brandsId;`,
    );

    return res;
  }

  private async getTotalAverage(filterQuery: string) {
    const res: {
      id: number;
      total: number;
      average: number;
    }[] = await this.commerceDb.$queryRawUnsafe(`
        SELECT brandsId as id, SUM(sale) as total, AVG(sale) as average
        FROM AllBrandsSum
                 LEFT JOIN Brands B on B.id = AllBrandsSum.brandsId
                 LEFT JOIN users U on U.id = B.account_manager_id
                 LEFT JOIN _BrandCategoriesToBrands BCB on BCB.B = B.id
                 LEFT JOIN BrandCategories BC on BC.id = BCB.A ${filterQuery} GROUP BY brandsId;
    `);
    return res;
  }

  private async getAdTotalAverage(filterQuery: string) {
    const res: {
      id: number;
      totalSpend: number;
      averageSpend: number;
      totalRevenue: number;
      averageRevenue: number;
    }[] = await this.commerceDb.$queryRawUnsafe(`
      SELECT brandsId as id, SUM(spend) as totalSpend, SUM(revenue) as totalRevenue, 
             AVG(spend) as averageSpend, AVG(revenue) as averageRevenue 
      FROM AllBrandsSum
               LEFT JOIN Brands B on B.id = AllBrandsSum.brandsId
               LEFT JOIN users U on U.id = B.account_manager_id
               LEFT JOIN _BrandCategoriesToBrands BCB on BCB.B = B.id
               LEFT JOIN BrandCategories BC on BC.id = BCB.A ${filterQuery} GROUP BY brandsId;
    `);
    return res;
  }

  private createAllBrandsFilter(
    filters: { [brandId: number]: { from?: Date; to?: Date } },
    extraFilters: { ams: number[]; categories: number[]; brandIds: number[] } = {
      ams: [],
      categories: [],
      brandIds: [],
    },
    defaultFilter: 'WEEK' | 'YEAR' | 'MONTH' = 'YEAR',
  ) {
    const filtersList: string[] = [];
    const extraFilter: string[] = [];
    for (const key of Object.keys(filters)) {
      filtersList.push(this.createSingleBrandFilter(key, filters[key].from, filters[key].to));
    }
    if (extraFilters?.categories?.length > 0) {
      extraFilter.push(`BC.id in (${extraFilters?.categories?.join(',')})`);
    }
    if (extraFilters?.brandIds?.length > 0) {
      extraFilter.push(`B.id in (${extraFilters?.brandIds?.join(',')})`);
    }
    if (extraFilters?.ams?.length > 0) {
      extraFilter.push(`B.account_manager_id in (${extraFilters?.ams?.join(',')})`);
    }
    if (filtersList.length === 0) {
      return `WHERE ${extraFilter.join(' AND ')} ${
        extraFilter.length > 0 ? 'AND' : ''
      } date >= now() - INTERVAL 1 ${defaultFilter}`;
    }
    filtersList.push(
      `(brandsId NOT IN (${Object.keys(filters).join(',')}) AND date >= date_sub(now(), INTERVAL 1 ${defaultFilter}))`,
    );
    return `WHERE ${extraFilter.join(' AND ')} ${extraFilter.length > 0 ? 'AND (' : ''} ${filtersList.join(' OR ')} ${
      extraFilter.length > 0 ? ')' : ''
    } `;
  }

  private createSingleBrandFilter(brandId: string, from?: Date, to?: Date) {
    const filterList: string[] = [`brandsId = ${brandId}`];
    if (from) {
      filterList.push(`date >= '${new Date(from).toISOString().split('T')[0]}'`);
    }
    if (to) {
      filterList.push(`date <= '${new Date(to).toISOString().split('T')[0]}'`);
    }
    return `(${filterList.join(' AND ')})`;
  }
}
