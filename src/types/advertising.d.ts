interface AdReportRecord {
  week?: number;
  month?: number;
  year: number;
  impressions: number;
  clicks: number;
  unitOrdered: number;
  revenue: number;
  spend: number;
  ACoS: number;
  ROAS: number;
  CPC: number;
  ACoSPercentage: number;
  CPO: number;
  conversions: number;
  product_spend: number;
  display_spend: number;
  brand_spend: number;
  product_revenue: number;
  display_spend: number;
  dsp_spend: number;
  dsp_revenue: number;
  display_revenue: number;
  brand_revenue: number;
}

type AdReportDataArray = AdReportRecord[];

interface adsSalesRecord {
  week?: number;
  month?: number;
  year: number;
  total_ordered_units: number;
  total_ordered_product_sales: number;
  total_order_items: number;
}
type adsSalesDataArray = adsSalesRecord[];

interface BrandRevenueRecord {
  week: number;
  year: number;
  dsp_spend: number;
  dsp_revenue: number;
  spend: number;
  week_name: string;
  total_ordered_product_sales: number;
  organic_sales: number;
  revenue: number;
  impression: number;
  clicks: number;
  unit_ordered: number;
  branded_spend: number;
  branded_sales: number;
  non_branded_spend: number;
  non_branded_sales: number;
}

type BrandRevenueDataArray = BrandRevenueRecord[];
