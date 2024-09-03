import { ApiProperty } from '@nestjs/swagger';

export class ProductDetailsDto {
  @ApiProperty()
  child_asin: string;

  @ApiProperty()
  parent_asin: string;

  @ApiProperty()
  sku: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  item_names: string;

  @ApiProperty()
  item_descriptions: string;

  @ApiProperty()
  seller_skus: string;

  @ApiProperty()
  image_urls: string;

  @ApiProperty()
  product_ids: string;

  @ApiProperty()
  astr_units_ordered_sum: string;

  @ApiProperty()
  ordered_product_sales_sum: string;

  @ApiProperty()
  astr_buy_box_percentage_sum: string;

  @ApiProperty()
  unit_session_percentage_sum: string;

  @ApiProperty()
  astr_sessions_sum: string;

  @ApiProperty()
  astr_page_views_sum: string;

  @ApiProperty()
  astr_session_percentage_sum: string;

  @ApiProperty()
  total_order_items_sum: string;

  @ApiProperty()
  astr_page_view_percentage_sum: string;

  @ApiProperty()
  astr_buy_box_percentage_avg: string;

  @ApiProperty()
  unit_session_percentage_avg: string;

  @ApiProperty()
  astr_session_percentage_avg: string;

  @ApiProperty()
  astr_page_view_percentage_avg: string;

  @ApiProperty()
  astr_child_asin_count: number;
}

export class ProductSummaryDto {
  @ApiProperty()
  totalSkuCount: string;

  @ApiProperty()
  totalUnitOrdered: string;

  @ApiProperty()
  totalOrderedProductSales: string;

  @ApiProperty()
  avgBuyBox: string;

  @ApiProperty()
  avgUnitSession: string;

  @ApiProperty()
  totalSession: string;

  @ApiProperty()
  totalPageViews: string;

  @ApiProperty()
  totalSessionPercentage: string;

  @ApiProperty()
  totalOrderItems: string;

  @ApiProperty()
  avgPageViewPercentage: string;
}

export class SKUResponseDto {
  @ApiProperty({ type: [ProductDetailsDto] })
  details: ProductDetailsDto[];

  @ApiProperty({ type: ProductSummaryDto })
  summary: ProductSummaryDto;
}
