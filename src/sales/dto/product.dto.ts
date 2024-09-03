import { ApiProperty } from '@nestjs/swagger';

export class WeeklyDataDto {
  @ApiProperty()
  week: number;

  @ApiProperty()
  week_name: string;

  @ApiProperty()
  total_child_asin_count: number;

  @ApiProperty()
  total_ordered_units: string;

  @ApiProperty()
  total_ordered_product_sales: number;

  @ApiProperty()
  sum_buy_box_percentage: number;

  @ApiProperty()
  avg_buy_box_percentage: number;

  @ApiProperty()
  avg_unit_session_percentage: number;

  @ApiProperty()
  sum_unit_session_percentage: number;

  @ApiProperty()
  total_session: string;

  @ApiProperty()
  browser_sessions: string;

  @ApiProperty()
  mobile_app_sessions: string;

  @ApiProperty()
  total_page_views: string;

  @ApiProperty()
  total_browser_page_views: string;

  @ApiProperty()
  total_mobile_app_page_views: string;

  @ApiProperty()
  avg_session_percentage: number;

  @ApiProperty()
  sum_session_percentage: number;

  @ApiProperty()
  total_order_items: string;

  @ApiProperty()
  avg_page_view_percentage: number;

  @ApiProperty()
  avg_browser_page_views_percentage: number;

  @ApiProperty()
  avg_mobile_app_page_views_percentage: number;

  @ApiProperty()
  sum_page_view_percentage: number;

  @ApiProperty()
  sum_browser_page_views_percentage: number;

  @ApiProperty()
  sum_mobile_app_page_views_percentage: number;

  @ApiProperty()
  sum_browser_session_percentage: number;

  @ApiProperty()
  sum_mobile_app_session_percentage: number;

  @ApiProperty()
  avg_browser_session_percentage: number;

  @ApiProperty()
  avg_mobile_app_session_percentage: number;
}
