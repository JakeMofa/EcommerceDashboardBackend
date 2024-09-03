import { Prisma, Role } from 'prisma/commerce/generated/vendoCommerce';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { WalmartTagDto } from 'src/budget-management/dto/tag.dto';

export class UsersDto {
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
  })
  id!: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
    nullable: true,
  })
  parent!: number | null;
  @ApiProperty({
    required: false,
  })
  u_name!: string;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  u_last_name!: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  u_amazon_seller_name!: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  u_amazon_marketplace_name!: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  u_permission!: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  allowed_user_id!: string | null;
  @ApiProperty({
    required: false,
  })
  u_email!: string;
  @ApiProperty({
    required: false,
  })
  u_password!: string;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  u_contact_no!: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  u_photo!: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  u_address!: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  u_city!: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  u_country!: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  u_cust_id!: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  u_role!: string | null;
  @ApiProperty({
    enum: Role,
    required: false,
  })
  role!: Role;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
    nullable: true,
  })
  u_card_last_no!: number | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
  })
  u_type!: number;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  access_token!: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  password_reset_token!: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  auth_key!: string | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
    nullable: true,
  })
  u_refunded!: number | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
    nullable: true,
  })
  u_canceled!: number | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
  })
  u_payment!: number;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  u_mws_seller_id!: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  u_mws_auth_token!: string | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
  })
  u_mws_status!: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
    nullable: true,
  })
  u_is_logged!: number | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
    nullable: true,
  })
  u_is_auto_logout!: number | null;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  u_aff_username!: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  u_aff_password!: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  u_affiliate_id!: string | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
    nullable: true,
  })
  u_affiliate_status!: number | null;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  u_sub_plan!: string | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
    nullable: true,
  })
  u_refer_date!: Date | null;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  db_name!: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  u_db_server!: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  u_db_username!: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  u_db_password!: string | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
    nullable: true,
  })
  u_enterprise_id!: number | null;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  u_first_google_sheet_name!: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  u_second_google_sheet_name!: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  u_first_google_sheet_id!: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  u_second_google_sheet_id!: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  amazon_advertising_access_token!: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  amazon_advertising_refresh_token!: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  amazon_advertising_token_type!: string | null;
  @ApiProperty({
    type: 'integer',
    format: 'int64',
    required: false,
    nullable: true,
  })
  amazon_advertising_access_token_expiry!: bigint | null;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  amazon_advertising_profile_id!: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  amazon_advertising_marketplace_id!: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  amazon_advertising_client_id!: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  amazon_advertising_client_secret!: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  amazon_advertising_return_url!: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  amazon_advertising_response!: string | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
    nullable: true,
  })
  rds_credential_id!: number | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
    nullable: true,
  })
  server_credential_id!: number | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
    nullable: true,
  })
  u_is_assigned!: number | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
    nullable: true,
  })
  u_active_asin_count!: number | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
  })
  u_allowed_report_count!: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
    nullable: true,
  })
  pending_reports!: number | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
  })
  status!: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
  })
  user_status!: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
  })
  avg_order_per_day!: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
  })
  avg_sku!: number;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  business_report_is_done!: boolean | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
    nullable: true,
  })
  business_report_count!: number | null;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  previous_business_report_dates!: string | null;
  @ApiProperty({
    type: 'integer',
    format: 'int64',
    required: false,
    nullable: true,
  })
  created_at!: bigint | null;
  @ApiProperty({
    type: 'integer',
    format: 'int64',
    required: false,
    nullable: true,
  })
  updated_at!: bigint | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
    nullable: true,
  })
  created_by!: number | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
    nullable: true,
  })
  updated_by!: number | null;
  @ApiProperty({
    type: 'integer',
    format: 'int64',
    required: false,
    nullable: true,
  })
  last_update!: bigint | null;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  syncing_data!: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  sync_progress!: string | null;
  @ApiProperty({
    type: 'integer',
    format: 'int64',
    required: false,
    nullable: true,
  })
  sync_last_update!: bigint | null;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  table_column_configuration!: string | null;
  @ApiProperty({
    type: 'integer',
    format: 'int64',
    required: false,
    nullable: true,
  })
  days_of_inventory!: bigint | null;
  @ApiProperty({
    type: 'integer',
    format: 'int64',
    required: false,
    nullable: true,
  })
  u_last_cron_time!: bigint | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
  })
  u_status!: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
  })
  u_cron_status!: number;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  u_applied_coupon_code!: string | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
  })
  u_all_report_requested!: number;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  u_error_message!: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  default_sales_by_product_column!: string | null;
}

export class UsersResponseDto {
  @ApiProperty({ example: 1, description: 'The user ID' })
  id: number;

  @ApiProperty({ example: 'User Name', description: 'The name of the user' })
  name: string;

  @ApiProperty({ type: [WalmartTagDto], description: 'The related Walmart tags' })
  @ValidateNested({ each: true })
  @Type(() => WalmartTagDto)
  @IsOptional()
  tags?: WalmartTagDto[];
}
