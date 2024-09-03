export interface SalesAndTrafficReportDto {
  reportSpecification: ReportSpecification;
  salesAndTrafficByDate: SalesAndTrafficByDate[];
  salesAndTrafficByAsin: SalesAndTrafficByAsin[];
}

export interface ReportSpecification {
  reportType: string;
  reportOptions: ReportOptions;
  dataStartTime: Date;
  dataEndTime: Date;
  marketplaceIds: string[];
}

export interface ReportOptions {
  dateGranularity: string;
  asinGranularity: string;
}

export interface SalesAndTrafficByAsin {
  parentAsin: string;
  childAsin: string;
  salesByAsin: SalesByAsin;
  trafficByAsin: { [key: string]: number };
}

export interface SalesByAsin {
  unitsOrdered: number;
  unitsOrderedB2B: number;
  orderedProductSales: OrderedProductSales;
  orderedProductSalesB2B: OrderedProductSales;
  totalOrderItems: number;
  totalOrderItemsB2B: number;
}

export interface OrderedProductSales {
  amount: number;
  currencyCode: CurrencyCode;
}

export enum CurrencyCode {
  Usd = 'USD',
}

export interface SalesAndTrafficByDate {
  date: Date;
  salesByDate: SalesByDate;
  trafficByDate: { [key: string]: number };
}

export interface SalesByDate {
  orderedProductSales: OrderedProductSales;
  orderedProductSalesB2B: OrderedProductSales;
  unitsOrdered: number;
  unitsOrderedB2B: number;
  totalOrderItems: number;
  totalOrderItemsB2B: number;
  averageSalesPerOrderItem: OrderedProductSales;
  averageSalesPerOrderItemB2B: OrderedProductSales;
  averageUnitsPerOrderItem: number;
  averageUnitsPerOrderItemB2B: number;
  averageSellingPrice: OrderedProductSales;
  averageSellingPriceB2B: OrderedProductSales;
  unitsRefunded: number;
  refundRate: number;
  claimsGranted: number;
  claimsAmount: OrderedProductSales;
  shippedProductSales: OrderedProductSales;
  unitsShipped: number;
  ordersShipped: number;
}
