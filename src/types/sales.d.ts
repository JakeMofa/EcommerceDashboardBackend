interface salesBySkuRecord {
  child_asin: string;
  id: number;
  report_date: string;
  parent_asin: string;
  sku: string;
  title: string;
  astr_units_ordered_sum: number;
  ordered_product_sales_sum: number;
  astr_buy_box_percentage_sum: number;
  unit_session_percentage_sum: number;
  astr_sessions_sum: number;
  astr_page_views_sum: number;
  astr_session_percentage_sum: number;
  total_order_items_sum: number;
  astr_page_view_percentage_sum: number;
  astr_buy_box_percentage_avg: number;
  unit_session_percentage_avg: number;
  conversion_rate: number;
  astr_session_percentage_avg: number;
  astr_page_view_percentage_avg: number;
  astr_child_asin_count: number;
}
type salesBySkuDataArray = salesBySkuRecord[];
