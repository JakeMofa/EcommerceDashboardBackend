import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsBoolean, IsEnum, IsDate, IsNumber } from 'class-validator';

enum BrandStatus {
  Pending = 'Pending',
  Active = 'Active',
  Inactive = 'Inactive',
}

export class CreateBrandDto {
  @ApiPropertyOptional({
    enum: BrandStatus,
    description: 'Status of the brand',
  })
  @IsOptional()
  @IsEnum(BrandStatus)
  status?: BrandStatus;

  @ApiProperty({ description: 'Name of the brand' })
  @IsString()
  name: string;

  // ... Add all other fields with validation and OpenAPI decorators, following the pattern above

  @ApiPropertyOptional({ description: 'User ID' })
  @IsOptional()
  @IsInt()
  usersId?: number;

  // Include all remaining fields with appropriate decorators
  @ApiPropertyOptional({ description: 'Amazon seller name' })
  @IsOptional()
  @IsString()
  u_amazon_seller_name?: string;

  @ApiPropertyOptional({ description: 'Amazon marketplace name' })
  @IsOptional()
  @IsString()
  u_amazon_marketplace_name?: string;

  @ApiPropertyOptional({ description: 'Allowed user ID' })
  @IsOptional()
  @IsString()
  allowed_user_id?: string;

  @ApiPropertyOptional({ description: 'Customer ID' })
  @IsOptional()
  @IsString()
  u_cust_id?: string;

  @ApiPropertyOptional({ description: 'Card last number' })
  @IsOptional()
  @IsInt()
  u_card_last_no?: number;

  @ApiPropertyOptional({ description: 'Access token' })
  @IsOptional()
  @IsString()
  access_token?: string;

  @ApiPropertyOptional({ description: 'Password reset token' })
  @IsOptional()
  @IsString()
  password_reset_token?: string;

  @ApiPropertyOptional({ description: 'Auth key' })
  @IsOptional()
  @IsString()
  auth_key?: string;

  @ApiPropertyOptional({ description: 'Refunded' })
  @IsOptional()
  @IsInt()
  u_refunded?: number;

  @ApiPropertyOptional({ description: 'Canceled' })
  @IsOptional()
  @IsInt()
  u_canceled?: number;

  @ApiPropertyOptional({ description: 'Payment' })
  @IsOptional()
  @IsInt()
  u_payment?: number;

  @ApiPropertyOptional({ description: 'MWS seller ID' })
  @IsOptional()
  @IsString()
  u_mws_seller_id?: string;

  @ApiPropertyOptional({ description: 'MWS auth token' })
  @IsOptional()
  @IsString()
  u_mws_auth_token?: string;

  @ApiPropertyOptional({ description: 'MWS status' })
  @IsOptional()
  @IsInt()
  u_mws_status?: number;

  @ApiPropertyOptional({ description: 'Is logged' })
  @IsOptional()
  @IsInt()
  u_is_logged?: number;

  @ApiPropertyOptional({ description: 'Is auto logout' })
  @IsOptional()
  @IsInt()
  u_is_auto_logout?: number;

  @ApiPropertyOptional({ description: 'Affiliate username' })
  @IsOptional()
  @IsString()
  u_aff_username?: string;

  @ApiPropertyOptional({ description: 'Affiliate password' })
  @IsOptional()
  @IsString()
  u_aff_password?: string;

  @ApiPropertyOptional({ description: 'Affiliate ID' })
  @IsOptional()
  @IsString()
  u_affiliate_id?: string;

  @ApiPropertyOptional({ description: 'Affiliate status' })
  @IsOptional()
  @IsInt()
  u_affiliate_status?: number;

  @ApiPropertyOptional({ description: 'Subscription plan' })
  @IsOptional()
  @IsString()
  u_sub_plan?: string;

  @ApiPropertyOptional({ description: 'Refer date' })
  @IsOptional()
  @IsDate()
  u_refer_date?: Date;

  @ApiPropertyOptional({ description: 'Database name' })
  @IsOptional()
  @IsString()
  db_name?: string;

  @ApiPropertyOptional({ description: 'Database server' })
  @IsOptional()
  @IsString()
  u_db_server?: string;

  @ApiPropertyOptional({ description: 'Database username' })
  @IsOptional()
  @IsString()
  u_db_username?: string;

  @ApiPropertyOptional({ description: 'Database password' })
  @IsOptional()
  @IsString()
  u_db_password?: string;

  @ApiPropertyOptional({ description: 'Enterprise ID' })
  @IsOptional()
  @IsInt()
  u_enterprise_id?: number;

  @ApiPropertyOptional({ description: 'First Google Sheet name' })
  @IsOptional()
  @IsString()
  u_first_google_sheet_name?: string;

  @ApiPropertyOptional({ description: 'Second Google Sheet name' })
  @IsOptional()
  @IsString()
  u_second_google_sheet_name?: string;

  @ApiPropertyOptional({ description: 'First Google Sheet ID' })
  @IsOptional()
  @IsString()
  u_first_google_sheet_id?: string;

  @ApiPropertyOptional({ description: 'Second Google Sheet ID' })
  @IsOptional()
  @IsString()
  u_second_google_sheet_id?: string;

  @ApiPropertyOptional({ description: 'Amazon advertising access token' })
  @IsOptional()
  @IsString()
  amazon_advertising_access_token?: string;

  @ApiPropertyOptional({ description: 'Amazon advertising refresh token' })
  @IsOptional()
  @IsString()
  amazon_advertising_refresh_token?: string;

  @ApiPropertyOptional({ description: 'Amazon advertising token type' })
  @IsOptional()
  @IsString()
  amazon_advertising_token_type?: string;

  @ApiPropertyOptional({
    description: 'Amazon advertising access token expiry',
  })
  @IsOptional()
  @IsNumber()
  amazon_advertising_access_token_expiry?: number;

  @ApiPropertyOptional({ description: 'Amazon advertising profile ID' })
  @IsOptional()
  @IsString()
  amazon_advertising_profile_id?: string;

  @ApiPropertyOptional({ description: 'Amazon advertising marketplace ID' })
  @IsOptional()
  @IsString()
  amazon_advertising_marketplace_id?: string;

  @ApiPropertyOptional({ description: 'Amazon advertising client ID' })
  @IsOptional()
  @IsString()
  amazon_advertising_client_id?: string;

  @ApiPropertyOptional({ description: 'Amazon advertising client secret' })
  @IsOptional()
  @IsString()
  amazon_advertising_client_secret?: string;

  @ApiPropertyOptional({ description: 'Amazon advertising return URL' })
  @IsOptional()
  @IsString()
  amazon_advertising_return_url?: string;

  @ApiPropertyOptional({ description: 'Amazon advertising response' })
  @IsOptional()
  @IsString()
  amazon_advertising_response?: string;

  @ApiPropertyOptional({ description: 'RDS credential ID' })
  @IsOptional()
  @IsInt()
  rds_credential_id?: number;

  @ApiPropertyOptional({ description: 'Server credential ID' })
  @IsOptional()
  @IsInt()
  server_credential_id?: number;

  @ApiPropertyOptional({ description: 'Is assigned' })
  @IsOptional()
  @IsInt()
  u_is_assigned?: number;

  @ApiPropertyOptional({ description: 'Active ASIN count' })
  @IsOptional()
  @IsInt()
  u_active_asin_count?: number;

  @ApiPropertyOptional({ description: 'Allowed report count' })
  @IsOptional()
  @IsInt()
  u_allowed_report_count?: number;

  @ApiPropertyOptional({ description: 'Pending reports' })
  @IsOptional()
  @IsInt()
  pending_reports?: number;

  @ApiPropertyOptional({ description: 'Average order per day' })
  @IsOptional()
  @IsInt()
  avg_order_per_day?: number;

  @ApiPropertyOptional({ description: 'Average SKU' })
  @IsOptional()
  @IsInt()
  avg_sku?: number;

  @ApiPropertyOptional({ description: 'Business report is done' })
  @IsOptional()
  @IsBoolean()
  business_report_is_done?: boolean;

  @ApiPropertyOptional({ description: 'Business report count' })
  @IsOptional()
  @IsInt()
  business_report_count?: number;

  @ApiPropertyOptional({ description: 'Previous business report dates' })
  @IsOptional()
  @IsString()
  previous_business_report_dates?: string;

  @ApiPropertyOptional({ description: 'Created at' })
  @IsOptional()
  @IsNumber()
  created_at?: number;

  @ApiPropertyOptional({ description: 'Updated at' })
  @IsOptional()
  @IsNumber()
  updated_at?: number;

  @ApiPropertyOptional({ description: 'Created by' })
  @IsOptional()
  @IsInt()
  created_by?: number;

  @ApiPropertyOptional({ description: 'Updated by' })
  @IsOptional()
  @IsInt()
  updated_by?: number;

  @ApiPropertyOptional({ description: 'Last update' })
  @IsOptional()
  @IsNumber()
  last_update?: number;

  @ApiPropertyOptional({ description: 'Syncing data' })
  @IsOptional()
  @IsString()
  syncing_data?: string;

  @ApiPropertyOptional({ description: 'Sync progress' })
  @IsOptional()
  @IsString()
  sync_progress?: string;

  @ApiPropertyOptional({ description: 'Sync last update' })
  @IsOptional()
  @IsNumber()
  sync_last_update?: number;

  @ApiPropertyOptional({ description: 'Table column configuration' })
  @IsOptional()
  @IsString()
  table_column_configuration?: string;

  @ApiPropertyOptional({ description: 'Days of inventory' })
  @IsOptional()
  @IsNumber()
  days_of_inventory?: number;

  @ApiPropertyOptional({ description: 'Last cron time' })
  @IsOptional()
  @IsNumber()
  u_last_cron_time?: number;

  @ApiPropertyOptional({ description: 'Cron status' })
  @IsOptional()
  @IsInt()
  u_cron_status?: number;

  @ApiPropertyOptional({ description: 'Applied coupon code' })
  @IsOptional()
  @IsString()
  u_applied_coupon_code?: string;

  @ApiPropertyOptional({ description: 'All report requested' })
  @IsOptional()
  @IsBoolean()
  all_report_requested?: boolean;

  @ApiPropertyOptional({ description: 'Requested report types' })
  @IsOptional()
  @IsString()
  requested_report_types?: string;

  @ApiPropertyOptional({ description: 'Auto sync' })
  @IsOptional()
  @IsInt()
  u_auto_sync?: number;

  @ApiPropertyOptional({ description: 'Report ID' })
  @IsOptional()
  @IsInt()
  report_id?: number;

  @ApiPropertyOptional({ description: 'End date' })
  @IsOptional()
  @IsNumber()
  end_date?: number;

  @ApiPropertyOptional({ description: 'Start date' })
  @IsOptional()
  @IsNumber()
  start_date?: number;
}
