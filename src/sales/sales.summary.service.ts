import { Injectable } from '@nestjs/common';
import { SalesService } from './sales.service';
import * as _ from 'lodash';
import { calculateAmazonTacos } from 'src/utils/sales.util';
@Injectable()
export class SalesSummaryService {
  constructor(private salesService: SalesService) {}

  async getMonthSummary(years: string, months: number[]): Promise<any> {
    const { result: salesData } = await this.salesService.getSalesData({
      years,
      months: months.join(','),
    });
    const sumByNumber = (array: Record<string, any>[], property: string) => {
      return _.sumBy(array, (item) => _.defaultTo(_.toNumber(item[property]), 0));
    };

    const meanByNumber = (array: Record<string, any>[], property: string) => {
      return _.meanBy(array, (item) => _.defaultTo(_.toNumber(item[property]), 0));
    };
    const ppcSpend =
      sumByNumber(salesData, 'brand_spend') +
      sumByNumber(salesData, 'product_spend') +
      sumByNumber(salesData, 'display_spend');
    const ppcRevenue =
      sumByNumber(salesData, 'brand_revenue') +
      sumByNumber(salesData, 'product_revenue') +
      sumByNumber(salesData, 'display_revenue');
    return {
      salesByMonthGraphDataFinal: salesData.length,
      totalUnitOrdered: sumByNumber(salesData, 'totalUnitOrdered'),
      totalOrderedProductSales: sumByNumber(salesData, 'totalOrderedProductSales'),
      avgBuyBox: meanByNumber(salesData, 'avgBuyBox'),
      avgUnitSession: meanByNumber(salesData, 'avgUnitSession'),
      totalSession: sumByNumber(salesData, 'totalSession'),
      totalPageViews: sumByNumber(salesData, 'totalPageViews'),
      totalSessionPercentage: meanByNumber(salesData, 'totalSessionPercentage'),
      totalOrderItems: sumByNumber(salesData, 'totalOrderItems'),
      conversionRate: (
        (sumByNumber(salesData, 'totalUnitOrdered') / sumByNumber(salesData, 'totalSession')) *
        100
      ).toFixed(2),
      avgPageViewPercentage: meanByNumber(salesData, 'avgPageViewPercentage'),
      tacos: calculateAmazonTacos(sumByNumber(salesData, 'spend'), sumByNumber(salesData, 'totalOrderedProductSales')),
      revenue: sumByNumber(salesData, 'revenue'),
      spend: sumByNumber(salesData, 'spend'),
      dsp_revenue: sumByNumber(salesData, 'dsp_revenue'),
      dsp_spend: sumByNumber(salesData, 'dsp_spend'),
      ppcSpend,
      ppcRevenue,
    };
  }
  async getWeekSummary(years: string, weeks: number[]): Promise<any> {
    const { result: salesData } = await this.salesService.getSalesData({
      years,
      weeks: weeks.join(','),
    });
    const sumByNumber = (array: Record<string, any>[], property: string) => {
      return _.sumBy(array, (item) => _.defaultTo(_.toNumber(item[property]), 0));
    };

    const meanByNumber = (array: Record<string, any>[], property: string) => {
      return _.meanBy(array, (item) => _.defaultTo(_.toNumber(item[property]), 0));
    };

    const ppcSpend =
      sumByNumber(salesData, 'brand_spend') +
      sumByNumber(salesData, 'product_spend') +
      sumByNumber(salesData, 'display_spend');
    const ppcRevenue =
      sumByNumber(salesData, 'brand_revenue') +
      sumByNumber(salesData, 'product_revenue') +
      sumByNumber(salesData, 'display_revenue');
    return {
      salesByWeekGraphDataFinal: salesData.length,
      totalUnitOrdered: sumByNumber(salesData, 'totalUnitOrdered'),
      totalOrderedProductSales: sumByNumber(salesData, 'totalOrderedProductSales'),
      avgBuyBox: meanByNumber(salesData, 'avgBuyBox'),
      avgUnitSession: meanByNumber(salesData, 'avgUnitSession'),
      totalSession: sumByNumber(salesData, 'totalSession'),
      totalPageViews: sumByNumber(salesData, 'totalPageViews'),
      totalSessionPercentage: meanByNumber(salesData, 'totalSessionPercentage'),
      totalOrderItems: sumByNumber(salesData, 'totalOrderItems'),
      avgPageViewPercentage: meanByNumber(salesData, 'avgPageViewPercentage'),
      conversionRate: (
        (sumByNumber(salesData, 'totalUnitOrdered') / sumByNumber(salesData, 'totalSession')) *
        100
      ).toFixed(2),
      revenue: sumByNumber(salesData, 'revenue'),
      spend: sumByNumber(salesData, 'spend'),
      tacos: calculateAmazonTacos(sumByNumber(salesData, 'spend'), sumByNumber(salesData, 'totalOrderedProductSales')),
      dsp_revenue: sumByNumber(salesData, 'dsp_revenue'),
      dsp_spend: sumByNumber(salesData, 'dsp_spend'),
      ppcSpend,
      ppcRevenue,
    };
  }
}
