import { Injectable, Logger } from '@nestjs/common';
import { VendoBrandDBService, VendoCommerceDBService } from 'src/prisma.service';
import * as _ from 'lodash';
import dayjs from 'src/utils/date.util';
import { restock_data } from 'prisma/commerce/generated/vendoCommerce';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(private readonly commerceDb: VendoCommerceDBService, private readonly brandDb: VendoBrandDBService) {}

  async getLatestRestockData(brandId: number) {
    const maxDate = await this.commerceDb.restock_data.findFirst({
      where: { brandId },
      orderBy: { report_date: 'desc' },
      select: { report_date: true },
    });

    if (!maxDate) return [];

    return await this.commerceDb.restock_data.findMany({
      where: {
        brandId,
        report_date: maxDate.report_date,
      },
    });
  }

  async getInventoryManagement(brandId: number) {
    const current_date = dayjs();
    const date_ranges = this.getDateRanges(current_date);

    const aggregated_data = await this.brandDb.client.$transaction([
      this.aggregateSalesData(date_ranges.last_7_days),
      this.aggregateSalesData(date_ranges.last_30_days),
      this.aggregateSalesData(date_ranges.last_60_days),
      this.aggregateSalesData(date_ranges.last_90_days),
      this.aggregateSalesData(date_ranges.year_to_date),
    ]);

    const sales_aggregation = this.combineAggregatedData(aggregated_data);
    const latest_restock_data = await this.getLatestRestockData(brandId);
    const inventory_management_data = await this.commerceDb.inventory_management.findMany({ where: { brandId } });
    const inventory_management_map = _.keyBy(inventory_management_data, 'asin');

    return this.combineData(sales_aggregation, _.keyBy(latest_restock_data, 'asin'), inventory_management_map);
  }

  private getDateRanges(current_date) {
    return {
      last_7_days: current_date.subtract(7, 'day').toDate(),
      last_30_days: current_date.subtract(30, 'day').toDate(),
      last_60_days: current_date.subtract(60, 'day').toDate(),
      last_90_days: current_date.subtract(90, 'day').toDate(),
      year_to_date: current_date.startOf('year').toDate(),
    };
  }

  private aggregateSalesData(since_date: Date) {
    return this.brandDb.client.asin_business_report.groupBy({
      by: ['astr_child_asin'],
      where: {
        astr_date: {
          gte: since_date,
        },
      },
      _sum: {
        astr_units_ordered: true,
        ordered_product_sales: true,
      },
    });
  }

  private combineAggregatedData(aggregated_data: any[]) {
    const sales_aggregation = {};

    aggregated_data.forEach((period_data, index) => {
      const period_key = ['last_7_days', 'last_30_days', 'last_60_days', 'last_90_days', 'year_to_date'][index];
      period_data.forEach((data) => {
        const { astr_child_asin: asin, _sum } = data;
        if (!sales_aggregation[asin]) {
          sales_aggregation[asin] = {};
        }
        sales_aggregation[asin][period_key] = {
          units_sold: _sum.astr_units_ordered,
          sales: _sum.ordered_product_sales,
        };
      });
    });

    return sales_aggregation;
  }

  private combineData(sales_aggregation, latest_restock_data, inventory_management_map) {
    return _.map(latest_restock_data, (restock, asin) => {
      const sales: any = sales_aggregation[asin] || {};
      const inventory_management = inventory_management_map[asin] || {};
      const calculated_values = this.calculateValues(sales, restock, inventory_management);
      return {
        asin,
        product_name: restock.productName,
        merchant_sku: restock.merchantSku,
        f_sku: restock.fnSku,
        last_7_day_units_sold: sales?.last_7_days?.units_sold || null,
        last_30_day_units_sold: sales?.last_30_days?.units_sold || null,
        last_60_day_units_sold: sales?.last_60_days?.units_sold || null,
        last_90_day_units_sold: sales?.last_90_days?.units_sold || null,
        ytd_units_sold: sales?.year_to_date?.units_sold || null,
        ytd_sales: sales?.year_to_date?.sales || null,
        on_hand: inventory_management.on_hand || null,
        ...calculated_values,
        available: restock.available,
        inbound: restock.inbound,
        fc_transfer: restock.fcTransfer,
        inventory_multiplier: inventory_management.multiplier || 1,
      };
    });
  }

  private calculateValues(sales, restock: restock_data, inventory_management) {
    const one_month_supply = this.calculateOneMonthSupply(
      sales?.last_7_days?.units_sold || 0,
      sales?.last_30_days?.units_sold || 0,
      sales?.last_60_days?.units_sold || 0,
      sales?.last_90_days?.units_sold || 0,
    );

    const total_units = this.calculateTotalUnits(restock.available || 0, restock.inbound || 0, restock.available || 0);
    const inventory_recommendations = this.calculateInventoryRecommendations(
      inventory_management.multiplier,
      total_units,
      one_month_supply,
    );

    return {
      one_month_supply,
      total_units,
      inventory_recommendations,
      overal_supply_days: (total_units / one_month_supply) * 30 || 0,
      overal_amazon_supply_days: (restock.available || 0 / one_month_supply) * 30 || 0,
    };
  }

  private calculateOneMonthSupply(
    sevenDayUnitsSold: number,
    thirtyDayUnitsSold: number,
    sixtyDayUnitsSold: number,
    ninetyDayUnitsSold: number,
  ): number {
    const value1 = (sevenDayUnitsSold / 7) * 30;
    const value2 = (thirtyDayUnitsSold / 30) * 30;
    const value3 = (sixtyDayUnitsSold / 60) * 30;
    const value4 = ninetyDayUnitsSold / 3;
    return Math.max(value1, value2, value3, value4);
  }

  private calculateTotalUnits(available: number, inbound: number, fc_transfer: number): number {
    return (available || 0) + (inbound || 0) + (fc_transfer || 0);
  }

  private calculateInventoryRecommendations(
    inventoryMultiplier: number,
    totalUnits: number,
    oneMonthSupply: number,
  ): number {
    return (inventoryMultiplier || 1) * oneMonthSupply - totalUnits;
  }

  async addInventoryManagement(brandId: number, body: { asin: string; multiplier?: number; on_hand?: number }) {
    return await this.commerceDb.inventory_management.upsert({
      create: {
        asin: body.asin,
        multiplier: body.multiplier,
        on_hand: body.on_hand,
        brandId: brandId,
      },
      update: {
        multiplier: body.multiplier,
        on_hand: body.on_hand,
      },
      where: {
        inventory_management_asin_brandId_key: {
          asin: body.asin,
          brandId: brandId,
        },
      },
    });
  }
}
