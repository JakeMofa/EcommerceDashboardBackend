-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `parent` INTEGER NULL,
    `u_name` VARCHAR(150) NOT NULL,
    `u_last_name` VARCHAR(100) NULL,
    `u_role` VARCHAR(150) NULL,
    `u_amazon_seller_name` VARCHAR(200) NULL,
    `u_amazon_marketplace_name` VARCHAR(100) NULL,
    `u_permission` TEXT NULL,
    `allowed_user_id` TEXT NULL,
    `u_email` VARCHAR(150) NOT NULL,
    `u_password` VARCHAR(255) NOT NULL,
    `u_contact_no` VARCHAR(20) NULL,
    `u_photo` VARCHAR(255) NULL,
    `u_address` VARCHAR(255) NULL,
    `u_city` VARCHAR(50) NULL,
    `u_country` VARCHAR(50) NULL,
    `u_cust_id` VARCHAR(150) NULL,
    `u_card_last_no` INTEGER NULL,
    `u_type` INTEGER NOT NULL,
    `access_token` TEXT NULL,
    `password_reset_token` VARCHAR(255) NULL,
    `auth_key` VARCHAR(255) NULL,
    `u_refunded` INTEGER NULL,
    `u_canceled` INTEGER NULL,
    `u_payment` INTEGER NOT NULL DEFAULT 0,
    `u_mws_seller_id` VARCHAR(100) NULL,
    `u_mws_auth_token` VARCHAR(150) NULL,
    `u_mws_status` INTEGER NOT NULL DEFAULT 1,
    `u_is_logged` INTEGER NULL DEFAULT 0,
    `u_is_auto_logout` INTEGER NULL DEFAULT 0,
    `u_aff_username` VARCHAR(100) NULL,
    `u_aff_password` VARCHAR(255) NULL,
    `u_affiliate_id` VARCHAR(100) NULL,
    `u_affiliate_status` INTEGER NULL,
    `u_sub_plan` VARCHAR(100) NULL,
    `u_refer_date` DATE NULL,
    `db_name` VARCHAR(255) NULL,
    `u_db_server` VARCHAR(255) NULL,
    `u_db_username` VARCHAR(255) NULL,
    `u_db_password` VARCHAR(255) NULL,
    `u_enterprise_id` INTEGER NULL,
    `u_first_google_sheet_name` VARCHAR(100) NULL,
    `u_second_google_sheet_name` VARCHAR(100) NULL,
    `u_first_google_sheet_id` VARCHAR(200) NULL,
    `u_second_google_sheet_id` VARCHAR(200) NULL,
    `amazon_advertising_access_token` TEXT NULL,
    `amazon_advertising_refresh_token` TEXT NULL,
    `amazon_advertising_token_type` VARCHAR(100) NULL,
    `amazon_advertising_access_token_expiry` BIGINT NULL,
    `amazon_advertising_profile_id` TEXT NULL,
    `amazon_advertising_marketplace_id` VARCHAR(50) NULL,
    `amazon_advertising_client_id` TEXT NULL,
    `amazon_advertising_client_secret` TEXT NULL,
    `amazon_advertising_return_url` VARCHAR(255) NULL,
    `amazon_advertising_response` TEXT NULL,
    `rds_credential_id` INTEGER NULL,
    `server_credential_id` INTEGER NULL,
    `u_is_assigned` INTEGER NULL DEFAULT 0,
    `u_active_asin_count` INTEGER NULL,
    `u_allowed_report_count` INTEGER NOT NULL DEFAULT 0,
    `pending_reports` INTEGER NULL DEFAULT 0,
    `status` INTEGER NOT NULL DEFAULT 0,
    `user_status` INTEGER NOT NULL,
    `avg_order_per_day` INTEGER NOT NULL DEFAULT 0,
    `avg_sku` INTEGER NOT NULL DEFAULT 0,
    `business_report_is_done` BOOLEAN NULL DEFAULT false,
    `business_report_count` INTEGER NULL DEFAULT 0,
    `previous_business_report_dates` TEXT NULL,
    `created_at` BIGINT NULL,
    `updated_at` BIGINT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `last_update` BIGINT NULL,
    `syncing_data` VARCHAR(255) NULL,
    `sync_progress` VARCHAR(255) NULL,
    `sync_last_update` BIGINT NULL,
    `table_column_configuration` TEXT NULL,
    `days_of_inventory` BIGINT NULL,
    `u_last_cron_time` BIGINT NULL,
    `u_status` INTEGER NOT NULL DEFAULT 0,
    `u_cron_status` INTEGER NOT NULL DEFAULT 0,
    `u_applied_coupon_code` VARCHAR(100) NULL,
    `u_all_report_requested` INTEGER NOT NULL DEFAULT 0,
    `u_error_message` TEXT NULL,
    `default_sales_by_product_column` VARCHAR(255) NULL,
    `role` ENUM('Admin', 'Manager', 'User') NOT NULL DEFAULT 'User',
    `account_type` VARCHAR(10) NULL DEFAULT 'internal',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Brands` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` ENUM('Pending', 'Created', 'Deleted') NOT NULL DEFAULT 'Pending',
    `name` VARCHAR(150) NOT NULL,
    `u_amazon_seller_name` VARCHAR(200) NULL,
    `u_amazon_marketplace_name` VARCHAR(100) NULL,
    `allowed_user_id` TEXT NULL,
    `u_cust_id` VARCHAR(150) NULL,
    `u_card_last_no` INTEGER NULL,
    `access_token` TEXT NULL,
    `password_reset_token` VARCHAR(255) NULL,
    `auth_key` VARCHAR(255) NULL,
    `u_refunded` INTEGER NULL,
    `u_canceled` INTEGER NULL,
    `u_payment` INTEGER NULL DEFAULT 0,
    `u_mws_seller_id` VARCHAR(100) NULL,
    `u_mws_auth_token` VARCHAR(150) NULL,
    `u_mws_status` INTEGER NULL DEFAULT 1,
    `u_is_logged` INTEGER NULL DEFAULT 0,
    `u_is_auto_logout` INTEGER NULL DEFAULT 0,
    `u_aff_username` VARCHAR(100) NULL,
    `u_aff_password` VARCHAR(255) NULL,
    `u_affiliate_id` VARCHAR(100) NULL,
    `u_affiliate_status` INTEGER NULL,
    `u_sub_plan` VARCHAR(100) NULL,
    `u_refer_date` DATE NULL,
    `db_name` VARCHAR(255) NULL,
    `u_db_server` VARCHAR(255) NULL,
    `u_db_username` VARCHAR(255) NULL,
    `u_db_password` VARCHAR(255) NULL,
    `u_enterprise_id` INTEGER NULL,
    `u_first_google_sheet_name` VARCHAR(100) NULL,
    `u_second_google_sheet_name` VARCHAR(100) NULL,
    `u_first_google_sheet_id` VARCHAR(200) NULL,
    `u_second_google_sheet_id` VARCHAR(200) NULL,
    `amazon_advertising_access_token` TEXT NULL,
    `amazon_advertising_refresh_token` TEXT NULL,
    `amazon_advertising_token_type` VARCHAR(100) NULL,
    `amazon_advertising_access_token_expiry` BIGINT NULL,
    `amazon_advertising_profile_id` TEXT NULL,
    `amazon_advertising_marketplace_id` VARCHAR(50) NULL,
    `amazon_advertising_client_id` TEXT NULL,
    `amazon_advertising_client_secret` TEXT NULL,
    `amazon_advertising_return_url` VARCHAR(255) NULL,
    `amazon_advertising_response` TEXT NULL,
    `rds_credential_id` INTEGER NULL,
    `server_credential_id` INTEGER NULL,
    `u_is_assigned` INTEGER NULL DEFAULT 0,
    `u_active_asin_count` INTEGER NULL,
    `u_allowed_report_count` INTEGER NULL DEFAULT 0,
    `pending_reports` INTEGER NULL DEFAULT 0,
    `avg_order_per_day` INTEGER NULL DEFAULT 0,
    `avg_sku` INTEGER NULL DEFAULT 0,
    `business_report_is_done` BOOLEAN NULL DEFAULT false,
    `business_report_count` INTEGER NULL DEFAULT 0,
    `previous_business_report_dates` TEXT NULL,
    `created_at` BIGINT NULL,
    `updated_at` BIGINT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `last_update` BIGINT NULL,
    `syncing_data` VARCHAR(255) NULL,
    `sync_progress` VARCHAR(255) NULL,
    `sync_last_update` BIGINT NULL,
    `table_column_configuration` TEXT NULL,
    `days_of_inventory` BIGINT NULL,
    `u_last_cron_time` BIGINT NULL,
    `u_cron_status` INTEGER NULL DEFAULT 0,
    `u_applied_coupon_code` VARCHAR(100) NULL,
    `u_all_report_requested` INTEGER NULL DEFAULT 0,
    `u_error_message` TEXT NULL,
    `default_sales_by_product_column` VARCHAR(255) NULL,
    `is_shipment_reports_active` BOOLEAN NOT NULL DEFAULT false,
    `vendo_contract_end_date` BIGINT NULL,
    `vendo_contract_start_date` BIGINT NULL,
    `subcategories_enabled` BOOLEAN NOT NULL DEFAULT false,
    `account_manager_id` INTEGER NULL,
    `brand_source` VARCHAR(10) NULL DEFAULT 'Amazon',
    `advertiser_id` VARCHAR(255) NULL,

    INDEX `Brands_account_manager_id_fkey`(`account_manager_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_monthly_breakdown` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `asin` VARCHAR(191) NULL,
    `sku` VARCHAR(191) NULL,
    `product_name` VARCHAR(455) NOT NULL,
    `unique_buyer` INTEGER NOT NULL DEFAULT 0,
    `returned_buyer` INTEGER NOT NULL DEFAULT 0,
    `month` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `brandId` INTEGER NOT NULL,

    INDEX `month_year_idx`(`month`, `year`),
    INDEX `product_monthly_breakdown_asin_sku_product_name_idx`(`asin`, `sku`),
    INDEX `product_monthly_breakdown_brandId_fkey`(`brandId`),
    UNIQUE INDEX `product_monthly_breakdown_sku_brandId_month_year_key`(`sku`, `brandId`, `month`, `year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_weekly_breakdown` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `week` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `unique_buyer` INTEGER NOT NULL DEFAULT 0,
    `returned_buyer` INTEGER NOT NULL DEFAULT 0,
    `brandId` INTEGER NOT NULL,
    `returned_buyer_sale` DECIMAL(15, 3) NOT NULL DEFAULT 0.000,
    `unique_buyer_sale` DECIMAL(15, 3) NOT NULL DEFAULT 0.000,

    INDEX `product_weekly_breakdown_year_week_idx`(`brandId`, `week`, `year`),
    UNIQUE INDEX `weekly_breakdown_brand_yearweek_unique`(`brandId`, `year`, `week`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `weekly_customer_acquistion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `week` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `unique_buyer` INTEGER NOT NULL DEFAULT 0,
    `returned_buyer` INTEGER NOT NULL DEFAULT 0,
    `brandId` INTEGER NOT NULL,
    `returned_buyer_sale` DECIMAL(15, 3) NOT NULL DEFAULT 0.000,
    `unique_buyer_sale` DECIMAL(15, 3) NOT NULL DEFAULT 0.000,

    INDEX `weekly_customer_acquistion_year_week_idx`(`brandId`, `week`, `year`),
    UNIQUE INDEX `weekly_customer_acquistion_pk`(`brandId`, `year`, `week`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `walmart_keyword` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `brandId` INTEGER NULL,
    `week` INTEGER NULL,
    `year` INTEGER NULL,
    `date` DATE NULL,
    `keywordId` INTEGER NULL,
    `searchedKeyword` TEXT NULL,
    `biddedKeyword` TEXT NULL,
    `matchType` VARCHAR(50) NULL,
    `campaignId` INTEGER NULL,
    `adGroupId` INTEGER NULL,
    `ntbUnits3days` INTEGER NULL,
    `ntbUnits14days` INTEGER NULL,
    `ntbUnits30days` INTEGER NULL,
    `ntbOrders3days` INTEGER NULL,
    `ntbOrders14days` INTEGER NULL,
    `ntbOrders30days` INTEGER NULL,
    `ntbRevenue3days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `ntbRevenue14days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `ntbRevenue30days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `bid` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `numAdsShown` INTEGER NULL,
    `numAdsClicks` INTEGER NULL,
    `adSpend` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `directAttributedSales3days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `directAttributedSales14days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `directAttributedSales30days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `advertisedSkuSales3days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `advertisedSkuSales14days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `advertisedSkuSales30days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `attributedUnits3days` INTEGER NULL,
    `attributedUnits14days` INTEGER NULL,
    `attributedUnits30days` INTEGER NULL,
    `brandAttributedSales3days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `brandAttributedSales14days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `brandAttributedSales30days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `relatedAttributedSales3days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `relatedAttributedSales14days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `relatedAttributedSales30days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `otherSkuSales3days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `otherSkuSales14days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `otherSkuSales30days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `attributedOrders3days` INTEGER NULL,
    `attributedOrders14days` INTEGER NULL,
    `attributedOrders30days` INTEGER NULL,

    INDEX `walmart_keyword_adGroupId_index`(`adGroupId`),
    INDEX `walmart_keyword_brand_idx`(`brandId`),
    INDEX `walmart_keyword_campaignId_index`(`campaignId`),
    INDEX `walmart_keyword_date_index`(`date`),
    INDEX `walmart_keyword_keywordId_index`(`keywordId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `walmart_ad_item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `brandId` INTEGER NULL,
    `date` DATE NULL,
    `campaignId` INTEGER NULL,
    `adGroupId` INTEGER NULL,
    `itemId` INTEGER NULL,
    `itemName` VARCHAR(50) NULL,
    `itemImage` VARCHAR(300) NULL,
    `numAdsShown` INTEGER NULL,
    `numAdsClicks` INTEGER NULL,
    `adSpend` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `directAttributedSales3days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `directAttributedSales14days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `directAttributedSales30days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `advertisedSkuSales3days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `advertisedSkuSales14days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `advertisedSkuSales30days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `attributedUnits3days` INTEGER NULL,
    `attributedUnits14days` INTEGER NULL,
    `attributedUnits30days` INTEGER NULL,
    `attributedOrders3days` INTEGER NULL,
    `attributedOrders14days` INTEGER NULL,
    `attributedOrders30days` INTEGER NULL,
    `brandAttributedSales3days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `brandAttributedSales14days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `brandAttributedSales30days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `relatedAttributedSales3days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `relatedAttributedSales14days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `relatedAttributedSales30days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `otherSkuSales3days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `otherSkuSales14days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `otherSkuSales30days` DECIMAL(15, 3) NULL DEFAULT 0.000,

    INDEX `walmart_ad_item_brand_idx`(`brandId`),
    INDEX `walmart_ad_item_adGroupId_index`(`adGroupId`),
    INDEX `walmart_ad_item_campaignId_index`(`campaignId`),
    INDEX `walmart_ad_item_date_index`(`date`),
    INDEX `walmart_ad_item_itemId_index`(`itemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `walmart_ad_group` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `brandId` INTEGER NOT NULL,
    `date` DATETIME(0) NULL,
    `campaignId` INTEGER NOT NULL,
    `adGroupId` INTEGER NOT NULL,
    `ntbUnits3days` INTEGER NULL,
    `ntbOrders3days` INTEGER NULL,
    `ntbRevenue3days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `ntbUnits14days` INTEGER NULL,
    `ntbOrders14days` INTEGER NULL,
    `ntbRevenue14days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `ntbUnits30days` INTEGER NULL,
    `ntbOrders30days` INTEGER NULL,
    `ntbRevenue30days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `numAdsShown` INTEGER NULL,
    `numAdsClicks` INTEGER NULL,
    `adSpend` INTEGER NULL,
    `directAttributedSales3days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `directAttributedSales14days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `directAttributedSales30days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `attributedUnits3days` INTEGER NULL,
    `attributedUnits14days` INTEGER NULL,
    `attributedUnits30days` INTEGER NULL,
    `brandAttributedSales3days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `brandAttributedSales14days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `relatedAttributedSales3days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `relatedAttributedSales14days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `relatedAttributedSales30days` DECIMAL(15, 3) NULL DEFAULT 0.000,
    `attributedOrders3days` INTEGER NULL,
    `attributedOrders14days` INTEGER NULL,
    `attributedOrders30days` INTEGER NULL,

    INDEX `walmart_ad_group_brand_idx`(`brandId`),
    INDEX `walmart_ad_group_adGroupId_index`(`adGroupId`),
    INDEX `walmart_ad_group_campaignId_index`(`campaignId`),
    INDEX `walmart_ad_group_date_index`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `monthly_customer_acquistion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `month` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `unique_buyer` INTEGER NOT NULL DEFAULT 0,
    `returned_buyer` INTEGER NOT NULL DEFAULT 0,
    `brandId` INTEGER NOT NULL,
    `returned_buyer_sale` DECIMAL(15, 3) NOT NULL DEFAULT 0.000,
    `unique_buyer_sale` DECIMAL(15, 3) NOT NULL DEFAULT 0.000,

    INDEX `monthly_customer_acquistion_year_month_idx`(`brandId`, `month`, `year`),
    UNIQUE INDEX `monthly_customer_acquistion_pk`(`brandId`, `year`, `month`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_acquisition_ltv` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `month` INTEGER NULL,
    `year` INTEGER NULL,
    `subsequent_month` INTEGER NULL,
    `subsequent_year` INTEGER NULL,
    `returning_buyers` INTEGER NULL,
    `total_sales_returning_buyers` DECIMAL(15, 2) NULL,
    `brandId` INTEGER NOT NULL,

    INDEX `customer_acquisition_ltv_brandId_fkey`(`brandId`),
    UNIQUE INDEX `customer_acquisition_ltv_month_year_brandId`(`month`, `year`, `subsequent_month`, `subsequent_year`, `brandId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `monthly_product_breakdown` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `asin` VARCHAR(191) NULL,
    `sku` VARCHAR(191) NULL,
    `product_name` VARCHAR(455) NOT NULL,
    `unique_buyer` INTEGER NOT NULL DEFAULT 0,
    `returned_buyer` INTEGER NOT NULL DEFAULT 0,
    `month` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `brandId` INTEGER NOT NULL,

    INDEX `month_year_idx`(`month`, `year`),
    INDEX `monthly_product_breakdown_asin_sku_product_name_idx`(`asin`, `sku`),
    INDEX `monthly_product_breakdown_brandId_fkey`(`brandId`),
    UNIQUE INDEX `monthly_product_breakdown_sku_brandId_month_year_key`(`sku`, `brandId`, `month`, `year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `weekly_product_breakdown` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `asin` VARCHAR(191) NULL,
    `sku` VARCHAR(191) NULL,
    `product_name` VARCHAR(455) NOT NULL,
    `unique_buyer` INTEGER NOT NULL DEFAULT 0,
    `returned_buyer` INTEGER NOT NULL DEFAULT 0,
    `week` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `brandId` INTEGER NOT NULL,

    INDEX `week_year_idx`(`week`, `year`),
    INDEX `weekly_product_breakdown_asin_sku_product_name_idx`(`asin`, `sku`),
    INDEX `weekly_product_breakdown_brandId_fkey`(`brandId`),
    UNIQUE INDEX `weekly_product_breakdown_sku_brandId_week_year_key`(`sku`, `brandId`, `week`, `year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BrandCategories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Forecast` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `forecast` INTEGER NULL,
    `adBudget` INTEGER NULL,
    `month` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `brandsId` INTEGER NULL,

    INDEX `idx-forecast-month`(`month`),
    INDEX `idx-forecast-month-year`(`month`, `year`),
    INDEX `Forecast_brandsId_fkey`(`brandsId`),
    UNIQUE INDEX `Forecast_month_year_brandsId_key`(`month`, `year`, `brandsId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AllBrandsSum` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `year` INTEGER NOT NULL,
    `month` INTEGER NOT NULL,
    `week` INTEGER NOT NULL,
    `spend` DOUBLE NULL,
    `revenue` DOUBLE NULL,
    `sale` DOUBLE NULL,
    `brandsId` INTEGER NOT NULL,

    INDEX `idx-allbrand-date`(`date`),
    INDEX `idx-allbrands-week`(`week`),
    INDEX `idx-allbrands-month`(`month`),
    INDEX `idx-allbrand-date-brandId`(`date`, `brandsId`),
    INDEX `AllBrandsSum_brandsId_fkey`(`brandsId`),
    INDEX `idx-allbrand-month`(`date`),
    INDEX `idx-allbrand-week`(`date`),
    INDEX `idx-allbrand-year`(`date`),
    UNIQUE INDEX `AllBrandsSum_date_brandsId_key`(`date`, `brandsId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Configuration` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,
    `brandId` INTEGER NOT NULL,

    INDEX `Configuration_brandId_fkey`(`brandId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserBrand` (
    `userId` INTEGER NOT NULL,
    `brandId` INTEGER NOT NULL,
    `role` ENUM('Admin', 'Manager', 'User') NOT NULL,

    INDEX `UserBrand_brandId_fkey`(`brandId`),
    PRIMARY KEY (`userId`, `brandId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Permissions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `archived_inventory` (
    `ai_id` BIGINT NOT NULL AUTO_INCREMENT,
    `usp_id` INTEGER NULL,
    `ai_date` DATE NULL,
    `brand_id` INTEGER NULL,
    `marketplace_id` VARCHAR(100) NULL,
    `marketplace` VARCHAR(100) NULL,
    `sku` VARCHAR(255) NULL,
    `fnsku` VARCHAR(255) NULL,
    `asin` VARCHAR(255) NULL,
    `product_name` TEXT NULL,
    `condition` VARCHAR(255) NULL,
    `your_price` VARCHAR(255) NULL,
    `mfn_listing_exists` VARCHAR(255) NULL,
    `mfn_fulfillable_quantity` INTEGER NULL DEFAULT 0,
    `afn_listing_exists` VARCHAR(255) NULL,
    `afn_warehouse_quantity` INTEGER NULL DEFAULT 0,
    `afn_fulfillable_quantity` INTEGER NULL DEFAULT 0,
    `afn_unsellable_quantity` INTEGER NULL DEFAULT 0,
    `afn_reserved_quantity` INTEGER NULL DEFAULT 0,
    `afn_total_quantity` INTEGER NULL DEFAULT 0,
    `per_unit_volume` VARCHAR(255) NULL,
    `afn_inbound_working_quantity` INTEGER NULL DEFAULT 0,
    `afn_inbound_shipped_quantity` INTEGER NULL DEFAULT 0,
    `afn_inbound_receiving_quantity` INTEGER NULL DEFAULT 0,
    `afn_researching_quantity` INTEGER NULL DEFAULT 0,
    `afn_reserved_future_supply` INTEGER NULL DEFAULT 0,
    `afn_future_supply_buyable` INTEGER NULL DEFAULT 0,
    `created_at` BIGINT NULL,
    `updated_at` BIGINT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `user_id` INTEGER NULL,

    PRIMARY KEY (`ai_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `crons_events_log` (
    `cel_id` BIGINT NOT NULL AUTO_INCREMENT,
    `cel_cron_name` VARCHAR(255) NULL,
    `cel_cron_type` INTEGER NULL,
    `cel_event_type` INTEGER NULL,
    `cel_message` TEXT NULL,
    `cel_event_data` LONGTEXT NULL,
    `cel_start_time` INTEGER NULL,
    `cel_end_time` INTEGER NULL,
    `cel_user_id` INTEGER NULL,
    `created_at` INTEGER NULL,
    `updated_at` INTEGER NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `cel_status` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`cel_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `financial_data` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `brand_id` INTEGER NULL,
    `usp_id` INTEGER NULL,
    `marketplace_id` VARCHAR(100) NULL,
    `datetime_n` DATE NULL,
    `date_time` VARCHAR(50) NULL,
    `settlement_id` VARCHAR(100) NULL,
    `type` VARCHAR(100) NULL,
    `order_id` VARCHAR(100) NULL,
    `sku` VARCHAR(100) NULL,
    `description` TEXT NULL,
    `quantity` INTEGER NULL DEFAULT 0,
    `marketplace` VARCHAR(100) NULL,
    `account_type` VARCHAR(100) NULL,
    `fulfillment` VARCHAR(100) NULL,
    `order_city` VARCHAR(100) NULL,
    `order_state` VARCHAR(100) NULL,
    `order_postal` VARCHAR(100) NULL,
    `tax_collection_model` VARCHAR(100) NULL,
    `product_sales` FLOAT NULL DEFAULT 0,
    `product_sales_tax` FLOAT NULL DEFAULT 0,
    `shipping_credits` FLOAT NULL DEFAULT 0,
    `shipping_credits_tax` FLOAT NULL DEFAULT 0,
    `gift_wrap_credits` FLOAT NULL DEFAULT 0,
    `giftwrap_credits_tax` FLOAT NULL DEFAULT 0,
    `promotional_rebates` FLOAT NULL DEFAULT 0,
    `promotional_rebates_tax` FLOAT NULL DEFAULT 0,
    `marketplace_withheld_tax` FLOAT NULL DEFAULT 0,
    `selling_fees` FLOAT NULL DEFAULT 0,
    `fba_fees` FLOAT NULL DEFAULT 0,
    `other_transaction_fees` FLOAT NULL DEFAULT 0,
    `other` FLOAT NULL DEFAULT 0,
    `total` FLOAT NULL DEFAULT 0,
    `created_at` BIGINT NULL,
    `updated_at` BIGINT NULL,

    INDEX `idx-financial_data-brand_id`(`brand_id`),
    INDEX `idx-financial_data-datetime_n`(`datetime_n`),
    INDEX `idx-financial_data-sku`(`sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `get_amazon_fulfilled_shipments_data_general` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `system_event_process_id` INTEGER NULL,
    `brand_id` INTEGER NULL,
    `amazon_order_id` VARCHAR(100) NULL,
    `merchant_order_id` VARCHAR(100) NULL,
    `shipment_id` VARCHAR(100) NULL,
    `shipment_item_id` VARCHAR(100) NULL,
    `amazon_order_item_id` VARCHAR(100) NULL,
    `merchant_order_item_id` VARCHAR(100) NULL,
    `purchase_date` VARCHAR(100) NULL,
    `payments_date` VARCHAR(100) NULL,
    `shipment_date` VARCHAR(100) NULL,
    `reporting_date` VARCHAR(100) NULL,
    `buyer_email` VARCHAR(100) NULL,
    `buyer_name` VARCHAR(50) NULL,
    `buyer_phone_number` VARCHAR(50) NULL,
    `sku` VARCHAR(100) NULL,
    `product_name` TEXT NULL,
    `quantity_shipped` INTEGER NULL,
    `currency` VARCHAR(10) NULL,
    `item_price` FLOAT NULL DEFAULT 0,
    `item_tax` FLOAT NULL DEFAULT 0,
    `shipping_price` FLOAT NULL DEFAULT 0,
    `shipping_tax` FLOAT NULL DEFAULT 0,
    `gift_wrap_price` FLOAT NULL DEFAULT 0,
    `gift_wrap_tax` FLOAT NULL DEFAULT 0,
    `ship_service_level` VARCHAR(50) NULL,
    `recipient_name` VARCHAR(100) NULL,
    `ship_address_1` VARCHAR(255) NULL,
    `ship_address_2` VARCHAR(255) NULL,
    `ship_address_3` VARCHAR(255) NULL,
    `ship_city` VARCHAR(50) NULL,
    `ship_state` VARCHAR(50) NULL,
    `ship_postal_code` VARCHAR(50) NULL,
    `ship_country` VARCHAR(10) NULL,
    `ship_phone_number` VARCHAR(20) NULL,
    `bill_address_1` VARCHAR(255) NULL,
    `bill_address_2` VARCHAR(255) NULL,
    `bill_address_3` VARCHAR(255) NULL,
    `bill_city` VARCHAR(50) NULL,
    `bill_state` VARCHAR(50) NULL,
    `bill_postal_code` VARCHAR(10) NULL,
    `bill_country` VARCHAR(50) NULL,
    `item_promotion_discount` FLOAT NULL DEFAULT 0,
    `ship_promotion_discount` FLOAT NULL DEFAULT 0,
    `carrier` VARCHAR(20) NULL,
    `tracking_number` VARCHAR(100) NULL,
    `estimated_arrival_date` VARCHAR(100) NULL,
    `fulfillment_center_id` VARCHAR(50) NULL,
    `fulfillment_channel` VARCHAR(50) NULL,
    `sales_channel` VARCHAR(50) NULL,
    `marketplace_id` VARCHAR(50) NULL,
    `marketplace` VARCHAR(50) NULL,
    `created_at` BIGINT NULL,
    `updated_at` BIGINT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `user_id` INTEGER NULL,
    `usp_id` INTEGER NULL,
    `status` INTEGER NULL DEFAULT 0,

    INDEX `idx-shipments_data_general-amazon_order_id`(`amazon_order_id`),
    INDEX `idx-shipments_data_general-brand_id`(`brand_id`),
    INDEX `idx-shipments_data_general-sku`(`sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `get_fba_estimated_fba_fees_txt_data` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `system_event_process_id` INTEGER NULL,
    `brand_id` INTEGER NULL,
    `sku` VARCHAR(50) NULL,
    `fnsku` VARCHAR(50) NULL,
    `asin` VARCHAR(50) NULL,
    `product_name` TEXT NULL,
    `product_group` VARCHAR(100) NULL,
    `brand` VARCHAR(100) NULL,
    `fulfilled_by` VARCHAR(50) NULL,
    `your_price` FLOAT NULL DEFAULT 0,
    `sales_price` FLOAT NULL DEFAULT 0,
    `longest_side` FLOAT NULL DEFAULT 0,
    `median_side` FLOAT NULL DEFAULT 0,
    `shortest_side` FLOAT NULL DEFAULT 0,
    `length_and_girth` FLOAT NULL DEFAULT 0,
    `unit_of_dimension` FLOAT NULL DEFAULT 0,
    `item_package_weight` FLOAT NULL DEFAULT 0,
    `unit_of_weight` VARCHAR(30) NULL,
    `product_size_tier` VARCHAR(30) NULL,
    `currency` VARCHAR(10) NULL,
    `estimated_fee_total` FLOAT NULL DEFAULT 0,
    `estimated_referral_fee_per_unit` FLOAT NULL DEFAULT 0,
    `estimated_variable_closing_fee` FLOAT NULL DEFAULT 0,
    `estimated_order_handling_fee_per_order` VARCHAR(30) NULL,
    `estimated_pick_pack_fee_per_unit` VARCHAR(30) NULL,
    `estimated_weight_handling_fee_per_unit` VARCHAR(30) NULL,
    `expected_fulfillment_fee_per_unit` FLOAT NULL DEFAULT 0,
    `marketplace_id` VARCHAR(100) NULL,
    `marketplace` VARCHAR(100) NULL,
    `created_at` BIGINT NULL,
    `updated_at` BIGINT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `user_id` INTEGER NULL,
    `usp_id` INTEGER NULL,
    `status` INTEGER NULL DEFAULT 0,

    INDEX `idx-fba_fees_txt-asin`(`asin`),
    INDEX `idx-fba_fees_txt-brand_id`(`brand_id`),
    INDEX `idx-fba_fees_txt-sku`(`sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `get_fba_fulfillment_current_inventory_data` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `system_event_process_id` INTEGER NULL,
    `brand_id` INTEGER NULL,
    `shipment_date` VARCHAR(50) NULL,
    `fnsku` VARCHAR(50) NULL,
    `sku` VARCHAR(50) NULL,
    `product_name` TEXT NULL,
    `quantity` INTEGER NULL DEFAULT 0,
    `fulfillment_center_id` VARCHAR(50) NULL,
    `detailed_disposition` VARCHAR(100) NULL,
    `country` VARCHAR(30) NULL,
    `marketplace_id` VARCHAR(100) NULL,
    `marketplace` VARCHAR(100) NULL,
    `created_at` BIGINT NULL,
    `updated_at` BIGINT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `user_id` INTEGER NULL,
    `usp_id` INTEGER NULL,
    `status` INTEGER NULL DEFAULT 0,

    INDEX `idx-current_inventory-brand_id`(`brand_id`),
    INDEX `idx-current_inventory-sku`(`sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `get_flat_file_open_listings_data` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `system_event_process_id` INTEGER NULL,
    `brand_id` INTEGER NULL,
    `sku` VARCHAR(100) NULL,
    `asin` VARCHAR(100) NULL,
    `price` FLOAT NULL DEFAULT 0,
    `quantity` INTEGER NULL,
    `business_price` FLOAT NULL DEFAULT 0,
    `quantity_price_type` VARCHAR(50) NULL,
    `quantity_lower_bound_1` FLOAT NULL DEFAULT 0,
    `quantity_price_1` FLOAT NULL DEFAULT 0,
    `quantity_lower_bound_2` FLOAT NULL DEFAULT 0,
    `quantity_price_2` FLOAT NULL DEFAULT 0,
    `quantity_lower_bound_3` FLOAT NULL DEFAULT 0,
    `quantity_price_3` FLOAT NULL DEFAULT 0,
    `quantity_lower_bound_4` FLOAT NULL DEFAULT 0,
    `quantity_price_4` FLOAT NULL DEFAULT 0,
    `quantity_lower_bound_5` INTEGER NULL DEFAULT 0,
    `quantity_price_5` FLOAT NULL DEFAULT 0,
    `progressive_price_type` VARCHAR(50) NULL,
    `progressive_lower_bound_1` FLOAT NULL DEFAULT 0,
    `progressive_price_1` FLOAT NULL DEFAULT 0,
    `progressive_lower_bound_2` FLOAT NULL DEFAULT 0,
    `progressive_price_2` FLOAT NULL DEFAULT 0,
    `progressive_lower_bound_3` FLOAT NULL DEFAULT 0,
    `progressive_price_3` FLOAT NULL DEFAULT 0,
    `marketplace_id` VARCHAR(100) NULL,
    `marketplace` VARCHAR(100) NULL,
    `created_at` BIGINT NULL,
    `updated_at` BIGINT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `user_id` INTEGER NULL,
    `usp_id` INTEGER NULL,
    `status` INTEGER NULL DEFAULT 0,

    INDEX `idx-open_listings-asin`(`asin`),
    INDEX `idx-open_listings-brand_id`(`brand_id`),
    INDEX `idx-open_listings-sku`(`sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `get_xml_all_orders_data_by_last_update_general` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `system_event_process_id` INTEGER NULL,
    `brand_id` INTEGER NULL,
    `amazon_order_id` VARCHAR(100) NULL,
    `merchant_order_id` VARCHAR(100) NULL,
    `purchase_date` VARCHAR(100) NULL,
    `last_updated_date` VARCHAR(100) NULL,
    `order_status` VARCHAR(20) NULL,
    `fulfillment_channel` VARCHAR(20) NULL,
    `sales_channel` VARCHAR(50) NULL,
    `ship_service_level` VARCHAR(50) NULL,
    `city` VARCHAR(50) NULL,
    `state` VARCHAR(50) NULL,
    `postal_code` VARCHAR(50) NULL,
    `country` VARCHAR(50) NULL,
    `is_business_order` VARCHAR(50) NULL,
    `amazon_order_item_id` VARCHAR(100) NULL,
    `sku` VARCHAR(100) NULL,
    `asin` VARCHAR(100) NULL,
    `item_status` VARCHAR(50) NULL,
    `product_name` TEXT NULL,
    `quantity` INTEGER NULL,
    `type` VARCHAR(255) NULL,
    `amount` FLOAT NULL DEFAULT 0,
    `marketplace_id` VARCHAR(100) NULL,
    `marketplace` VARCHAR(100) NULL,
    `created_at` BIGINT NULL,
    `updated_at` BIGINT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `user_id` INTEGER NULL,
    `usp_id` INTEGER NULL,
    `status` INTEGER NULL DEFAULT 0,

    INDEX `idx-update_general-amazon_order_id`(`amazon_order_id`),
    INDEX `idx-update_general-brand_id`(`brand_id`),
    INDEX `idx-update_general-sku`(`sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `get_xml_all_orders_data_by_order_date_general` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `system_event_process_id` INTEGER NULL,
    `brand_id` INTEGER NULL,
    `amazon_order_id` VARCHAR(100) NULL,
    `merchant_order_id` VARCHAR(100) NULL,
    `purchase_date` VARCHAR(100) NULL,
    `last_updated_date` VARCHAR(100) NULL,
    `order_status` VARCHAR(20) NULL,
    `fulfillment_channel` VARCHAR(20) NULL,
    `sales_channel` VARCHAR(50) NULL,
    `ship_service_level` VARCHAR(50) NULL,
    `city` VARCHAR(50) NULL,
    `state` VARCHAR(50) NULL,
    `postal_code` VARCHAR(50) NULL,
    `country` VARCHAR(50) NULL,
    `is_business_order` VARCHAR(50) NULL,
    `amazon_order_item_id` VARCHAR(100) NULL,
    `sku` VARCHAR(100) NULL,
    `asin` VARCHAR(100) NULL,
    `item_status` VARCHAR(50) NULL,
    `product_name` TEXT NULL,
    `quantity` INTEGER NULL,
    `type` VARCHAR(300) NULL,
    `amount` FLOAT NULL DEFAULT 0,
    `marketplace_id` VARCHAR(100) NULL,
    `marketplace` VARCHAR(100) NULL,
    `created_at` BIGINT NULL,
    `updated_at` BIGINT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `user_id` INTEGER NULL,
    `usp_id` INTEGER NULL,
    `status` INTEGER NULL DEFAULT 0,

    INDEX `idx-date_general-amazon_order_id`(`amazon_order_id`),
    INDEX `idx-date_general-brand_id`(`brand_id`),
    INDEX `idx-date_general-sku`(`sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menu` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `parent_menu_id` INTEGER NULL,
    `title` VARCHAR(255) NULL,
    `is_main` TINYINT NULL,

    INDEX `FK_submenu_id`(`parent_menu_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `migration` (
    `version` VARCHAR(180) NOT NULL,
    `apply_time` INTEGER NULL,

    PRIMARY KEY (`version`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_report_data` (
    `ord_id` BIGINT NOT NULL AUTO_INCREMENT,
    `usp_id` INTEGER NULL,
    `amazon_order_id` VARCHAR(50) NULL,
    `merchant_order_id` VARCHAR(50) NULL,
    `purchase_date` VARCHAR(50) NULL,
    `brand_id` INTEGER NULL,
    `order_report_date` VARCHAR(50) NULL,
    `last_updated_date` VARCHAR(50) NULL,
    `order_status` VARCHAR(20) NULL,
    `fulfillment_channel` VARCHAR(20) NULL,
    `sales_channel` VARCHAR(20) NULL,
    `order_channel` VARCHAR(20) NULL,
    `url` VARCHAR(100) NULL,
    `ship_service_level` VARCHAR(20) NULL,
    `product_name` VARCHAR(255) NULL,
    `sku` VARCHAR(50) NULL,
    `asin` VARCHAR(50) NULL,
    `item_status` VARCHAR(20) NULL,
    `quantity` INTEGER NULL DEFAULT 0,
    `currency` VARCHAR(15) NULL,
    `item_cog` FLOAT NOT NULL DEFAULT 0.00,
    `item_price` FLOAT NULL DEFAULT 0.00,
    `item_tax` FLOAT NULL DEFAULT 0.00,
    `shipping_price` FLOAT NULL DEFAULT 0.00,
    `shipping_tax` FLOAT NULL DEFAULT 0.00,
    `gift_wrap_price` FLOAT NULL DEFAULT 0.00,
    `gift_wrap_tax` FLOAT NULL DEFAULT 0.00,
    `item_promotion_discount` FLOAT NULL DEFAULT 0.00,
    `ship_promotion_discount` FLOAT NULL DEFAULT 0.00,
    `ship_city` VARCHAR(50) NULL,
    `ship_state` VARCHAR(50) NULL,
    `ship_postal_code` VARCHAR(20) NULL,
    `ship_country` VARCHAR(10) NULL,
    `promotion_ids` VARCHAR(255) NULL,
    `is_business_order` VARCHAR(20) NULL,
    `purchase_order_number` VARCHAR(50) NULL,
    `price_designation` VARCHAR(100) NULL,
    `principle_charge_amount` FLOAT NULL DEFAULT 0.00,
    `tax_charge_amount` FLOAT NULL DEFAULT 0.00,
    `gift_wrap_charge_amount` FLOAT NULL DEFAULT 0.00,
    `gift_wrap_tax_charge_amount` FLOAT NULL DEFAULT 0.00,
    `shipping_charge_amount` FLOAT NULL DEFAULT 0.00,
    `shipping_tax_charge_amount` FLOAT NULL DEFAULT 0.00,
    `fba_per_order_fulfillment_fee_amount` FLOAT NULL DEFAULT 0.00,
    `fba_per_unit_fulfillment_fee_amount` FLOAT NULL DEFAULT 0.00,
    `fba_weight_based_fee_amount` FLOAT NULL DEFAULT 0.00,
    `commission_fee_amount` FLOAT NULL DEFAULT 0.00,
    `fixed_closing_fee_amount` FLOAT NULL DEFAULT 0.00,
    `giftwrap_chargeback_fee_amount` FLOAT NULL DEFAULT 0.00,
    `sales_tax_collect_fee_amount` FLOAT NULL DEFAULT 0.00,
    `shipping_chargeback_fee_amount` FLOAT NULL DEFAULT 0.00,
    `variable_closing_fee_amount` FLOAT NULL DEFAULT 0.00,
    `marketplace_id` VARCHAR(100) NULL,
    `marketplace` VARCHAR(100) NULL,
    `ord_date` DATE NULL,
    `order_total` FLOAT NULL,
    `number_of_items_shipped` INTEGER NULL DEFAULT 0,
    `number_of_items_unshipped` INTEGER NULL DEFAULT 0,
    `payment_execution_detail` VARCHAR(255) NULL,
    `payment_method` VARCHAR(100) NULL,
    `shipment_service_level_category` VARCHAR(100) NULL,
    `easy_ship_shipment_status` VARCHAR(255) NULL,
    `cba_displayable_shipping_label` VARCHAR(255) NULL,
    `order_type` VARCHAR(100) NULL,
    `earliest_ship_date` VARCHAR(100) NULL,
    `latest_ship_date` VARCHAR(100) NULL,
    `earliest_delivery_date` VARCHAR(100) NULL,
    `latest_delivery_date` VARCHAR(100) NULL,
    `is_prime` VARCHAR(100) NULL,
    `is_premium_order` VARCHAR(100) NULL,
    `is_global_express_enabled` VARCHAR(100) NULL,
    `replaced_order_id` VARCHAR(255) NULL,
    `is_replacement_order` VARCHAR(100) NULL,
    `promise_response_due_date` VARCHAR(100) NULL,
    `is_estimated_ship_date_set` VARCHAR(100) NULL,
    `is_sold_by_ab` VARCHAR(255) NULL,
    `assigned_ship_from_location_address` VARCHAR(255) NULL,
    `fulfillment_instruction` VARCHAR(255) NULL,
    `updated_by` INTEGER NULL,
    `created_by` INTEGER NULL,
    `created_at` BIGINT NULL,
    `updated_at` BIGINT NULL,
    `user_id` INTEGER NULL,
    `ord_status` INTEGER NULL,

    INDEX `amazon_order_id`(`amazon_order_id`),
    INDEX `order_status`(`order_status`),
    INDEX `sku`(`sku`),
    PRIMARY KEY (`ord_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_report_data` (
    `prd_id` BIGINT NOT NULL AUTO_INCREMENT,
    `usp_id` INTEGER NULL,
    `prd_date` DATE NULL,
    `brand_id` INTEGER NULL,
    `item_name` TEXT NULL,
    `item_description` TEXT NULL,
    `status` VARCHAR(50) NULL,
    `listing_id` VARCHAR(100) NULL,
    `seller_sku` VARCHAR(100) NULL,
    `price` FLOAT NULL,
    `quantity` INTEGER NULL,
    `open_date` VARCHAR(100) NULL,
    `image_url` VARCHAR(255) NULL,
    `item_is_marketplace` VARCHAR(255) NULL,
    `product_id_type` VARCHAR(255) NULL,
    `zshop_shipping_fee` VARCHAR(255) NULL,
    `item_note` VARCHAR(255) NULL,
    `item_condition` VARCHAR(255) NULL,
    `zshop_category1` VARCHAR(255) NULL,
    `zshop_browse_path` VARCHAR(255) NULL,
    `zshop_storefront_feature` VARCHAR(255) NULL,
    `asin1` VARCHAR(100) NULL,
    `asin2` VARCHAR(100) NULL,
    `asin3` VARCHAR(100) NULL,
    `will_ship_internationally` VARCHAR(255) NULL,
    `expedited_shipping` VARCHAR(255) NULL,
    `zshop_boldface` VARCHAR(255) NULL,
    `product_id` VARCHAR(255) NULL,
    `bid_for_featured_placement` VARCHAR(255) NULL,
    `add_delete` VARCHAR(255) NULL,
    `pending_quantity` VARCHAR(255) NULL,
    `fulfillment_channel` VARCHAR(255) NULL,
    `merchant_shipping_group` VARCHAR(255) NULL,
    `marketplace_id` VARCHAR(100) NULL,
    `marketplace` VARCHAR(100) NULL,
    `created_at` BIGINT NULL,
    `updated_at` BIGINT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `user_id` INTEGER NULL,

    PRIMARY KEY (`prd_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rds_credentials` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `size` VARCHAR(255) NULL,
    `hostname` VARCHAR(255) NOT NULL,
    `username` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `is_default` BOOLEAN NULL DEFAULT false,
    `created_at` BIGINT NULL,
    `updated_at` BIGINT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `regions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `region_name` VARCHAR(100) NULL,
    `aws_access_key` VARCHAR(255) NULL,
    `aws_secret_key` VARCHAR(255) NULL,
    `region_endpoint` VARCHAR(255) NULL,
    `created_at` BIGINT NULL,
    `updated_at` BIGINT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `r_status` INTEGER NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `report_log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `report_type` VARCHAR(200) NULL,
    `report_document_id` VARCHAR(255) NULL,
    `report_id` VARCHAR(200) NULL,
    `report_schedule_id` INTEGER NULL,
    `processing_status` VARCHAR(200) NULL,
    `report_current_status` VARCHAR(200) NULL,
    `data_start_time` VARCHAR(200) NULL,
    `data_end_time` VARCHAR(200) NULL,
    `processing_start_time` VARCHAR(200) NULL,
    `processing_end_time` VARCHAR(200) NULL,
    `is_done` INTEGER NOT NULL DEFAULT 0,
    `marketplace_id` VARCHAR(100) NULL,
    `marketplace` VARCHAR(100) NULL,
    `created_time` VARCHAR(200) NULL,
    `report_request_status` INTEGER NOT NULL DEFAULT 0,
    `created_at` BIGINT NULL,
    `updated_at` BIGINT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `status` INTEGER NOT NULL DEFAULT 0,

    INDEX `report_id`(`report_id`),
    INDEX `report_type`(`report_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `returns_report_data` (
    `rrd_id` BIGINT NOT NULL AUTO_INCREMENT,
    `usp_id` INTEGER NULL,
    `return_date` VARCHAR(255) NULL,
    `order_id` VARCHAR(255) NULL,
    `brand_id` INTEGER NULL,
    `sku` VARCHAR(255) NULL,
    `asin` VARCHAR(100) NULL,
    `fnsku` VARCHAR(255) NULL,
    `item_cog` FLOAT NULL DEFAULT 0.00,
    `refunded_amount` FLOAT NULL,
    `refunded_tax_amount` FLOAT NULL DEFAULT 0.00,
    `refunded_fba_fees` FLOAT NULL DEFAULT 0.00,
    `refunded_comission_fees` FLOAT NULL DEFAULT 0.00,
    `product_name` VARCHAR(255) NULL,
    `quantity` INTEGER NULL DEFAULT 0,
    `fulfillment_center_id` VARCHAR(255) NULL,
    `detailed_disposition` VARCHAR(255) NULL,
    `reason` VARCHAR(255) NULL,
    `status` VARCHAR(255) NULL,
    `license_plate_number` VARCHAR(255) NULL,
    `customer_comments` VARCHAR(255) NULL,
    `return_formated_date` DATE NULL,
    `marketplace_id` VARCHAR(100) NULL,
    `marketplace` VARCHAR(100) NULL,
    `is_refund_updated` TINYINT NULL DEFAULT 0,
    `created_at` BIGINT NULL,
    `updated_at` BIGINT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `user_id` INTEGER NULL,

    INDEX `order_id`(`order_id`),
    INDEX `return_date`(`return_date`),
    PRIMARY KEY (`rrd_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `server_credentials` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `ip_address` VARCHAR(255) NULL,
    `public_ip_address` VARCHAR(255) NULL,
    `instance_type` VARCHAR(255) NULL,
    `platform` VARCHAR(255) NULL,
    `is_default` BOOLEAN NULL DEFAULT false,
    `created_at` BIGINT NULL,
    `updated_at` BIGINT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sidebar_menu` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `parent_menu_id` INTEGER NULL,
    `title` VARCHAR(255) NULL,
    `is_main` BOOLEAN NULL,

    INDEX `parent_menu_id`(`parent_menu_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_event_processes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_data_scheduler_id` INTEGER NULL,
    `event_date` DATE NULL,
    `event_name` VARCHAR(255) NULL,
    `event_type` VARCHAR(255) NULL,
    `event_status` VARCHAR(255) NULL,
    `event_details` TEXT NULL,
    `priority` INTEGER NULL,
    `retry_count` INTEGER NULL DEFAULT 0,
    `is_dependent` INTEGER NULL,
    `execution_time` VARCHAR(50) NULL,
    `marketplace` VARCHAR(100) NULL,
    `marketplace_id` VARCHAR(100) NULL,
    `status` INTEGER NULL DEFAULT 0,
    `note` TEXT NULL,
    `created_at` BIGINT NULL,
    `updated_at` BIGINT NULL,

    INDEX `idx-system_event_processes-event_date`(`event_date`),
    INDEX `idx-system_event_processes-event_name`(`event_name`),
    INDEX `idx-system_event_processes-event_type`(`event_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_events_log` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `event_name` VARCHAR(255) NULL,
    `event_type` VARCHAR(255) NULL,
    `error_code` VARCHAR(50) NULL,
    `error_message` VARCHAR(255) NULL,
    `error_data` TEXT NULL,
    `ip_address` VARCHAR(20) NULL,
    `url` VARCHAR(255) NULL,
    `created_at` BIGINT NULL,
    `updated_at` BIGINT NULL,

    INDEX `idx-system_events_log-user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_events_log_old` (
    `sel_id` BIGINT NOT NULL AUTO_INCREMENT,
    `sel_type` INTEGER NULL,
    `sel_data` LONGTEXT NULL,
    `sel_short_data` VARCHAR(250) NULL,
    `sel_message` TEXT NULL,
    `sel_url` TEXT NULL,
    `sel_ip` VARCHAR(100) NULL,
    `sel_user_id` INTEGER NULL,
    `created_at` BIGINT NULL,
    `updated_at` BIGINT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `sel_status` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`sel_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_advertising_credentials` (
    `uac_id` INTEGER NOT NULL AUTO_INCREMENT,
    `uac_user_id` INTEGER NULL,
    `uac_seller_id` VARCHAR(255) NULL,
    `uac_marketplace_id` VARCHAR(255) NULL,
    `uac_usp_id` INTEGER NULL,
    `uac_profile_id` VARCHAR(255) NULL,
    `uac_country_code` VARCHAR(255) NULL,
    `uac_currency_code` VARCHAR(255) NULL,
    `uac_daily_budget` VARCHAR(255) NULL,
    `uac_time_zone` VARCHAR(255) NULL,
    `uac_client_id` TEXT NULL,
    `uac_client_secret` TEXT NULL,
    `uac_return_url` VARCHAR(255) NULL,
    `uac_access_token` TEXT NULL,
    `uac_refresh_token` TEXT NULL,
    `uac_token_type` VARCHAR(255) NULL,
    `uac_region` VARCHAR(50) NULL,
    `uac_access_token_exprity` VARCHAR(255) NULL,
    `uac_advertising_response` TEXT NULL,
    `created_at` INTEGER NULL,
    `updated_at` INTEGER NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `uac_status` INTEGER NULL DEFAULT 0,

    PRIMARY KEY (`uac_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_mws_credentials` (
    `um_id` INTEGER NOT NULL AUTO_INCREMENT,
    `umc_user_id` INTEGER NOT NULL,
    `um_marketplace_name` VARCHAR(255) NOT NULL,
    `um_marketplace_id` VARCHAR(100) NOT NULL,
    `um_service_url` TEXT NULL,
    `um_seller_id` TEXT NOT NULL,
    `um_mws_auth_token` TEXT NOT NULL,
    `um_aws_access_key_id` TEXT NULL,
    `um_secret_key` TEXT NULL,
    `created_at` BIGINT NULL,
    `updated_at` BIGINT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `um_status` INTEGER NOT NULL DEFAULT 0,

    INDEX `umc_user_id`(`umc_user_id`),
    PRIMARY KEY (`um_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_sp_credentials` (
    `usp_id` INTEGER NOT NULL AUTO_INCREMENT,
    `usp_user_id` INTEGER NOT NULL,
    `usp_marketplace_name` VARCHAR(255) NOT NULL,
    `usp_marketplace_id` VARCHAR(100) NOT NULL,
    `seller_account_name` VARCHAR(150) NULL,
    `region_id` INTEGER NULL,
    `usp_region` VARCHAR(255) NULL,
    `usp_refresh_token` TEXT NOT NULL,
    `usp_client_id` VARCHAR(255) NULL,
    `usp_client_secret` VARCHAR(255) NULL,
    `usp_access_key` VARCHAR(255) NULL,
    `usp_secret_key` VARCHAR(255) NULL,
    `usp_role_arn` VARCHAR(255) NULL,
    `usp_country_code` VARCHAR(10) NULL,
    `usp_currency_code` VARCHAR(10) NULL,
    `usp_domain_name` VARCHAR(100) NULL,
    `created_at` BIGINT NULL,
    `updated_at` BIGINT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `usp_status` INTEGER NOT NULL DEFAULT 0,

    INDEX `usp_user_id`(`usp_user_id`),
    PRIMARY KEY (`usp_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `central_report_log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `brand_id` INTEGER NOT NULL,
    `data_start_time` VARCHAR(200) NULL,
    `data_end_time` VARCHAR(200) NULL,
    `report_type` VARCHAR(512) NOT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,
    `file_url` TEXT NULL,
    `status` VARCHAR(256) NOT NULL,
    `error` TEXT NULL,

    INDEX `central_report_log_Brands_id_fk`(`brand_id`),
    INDEX `central_report_log_created_at_index`(`created_at`),
    INDEX `central_report_log_report_type_index`(`report_type`),
    INDEX `central_report_log_status_index`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_BrandCategoriesToBrands` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_BrandCategoriesToBrands_AB_unique`(`A`, `B`),
    INDEX `_BrandCategoriesToBrands_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PermissionsTousers` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_PermissionsTousers_AB_unique`(`A`, `B`),
    INDEX `_PermissionsTousers_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Brands` ADD CONSTRAINT `Brands_account_manager_id_fkey` FOREIGN KEY (`account_manager_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_monthly_breakdown` ADD CONSTRAINT `product_monthly_breakdown_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brands`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_weekly_breakdown` ADD CONSTRAINT `product_weekly_breakdown_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brands`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `weekly_customer_acquistion` ADD CONSTRAINT `weekly_customer_acquistion_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brands`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `monthly_customer_acquistion` ADD CONSTRAINT `monthly_customer_acquistion_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brands`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_acquisition_ltv` ADD CONSTRAINT `customer_acquisition_ltv_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brands`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `monthly_product_breakdown` ADD CONSTRAINT `monthly_product_breakdown_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brands`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `weekly_product_breakdown` ADD CONSTRAINT `weekly_product_breakdown_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brands`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Forecast` ADD CONSTRAINT `Forecast_brandsId_fkey` FOREIGN KEY (`brandsId`) REFERENCES `Brands`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AllBrandsSum` ADD CONSTRAINT `AllBrandsSum_brandsId_fkey` FOREIGN KEY (`brandsId`) REFERENCES `Brands`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Configuration` ADD CONSTRAINT `Configuration_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brands`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserBrand` ADD CONSTRAINT `UserBrand_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brands`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserBrand` ADD CONSTRAINT `UserBrand_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `menu` ADD CONSTRAINT `FK_submenu_id` FOREIGN KEY (`parent_menu_id`) REFERENCES `menu`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sidebar_menu` ADD CONSTRAINT `sidebar_menu_ibfk_1` FOREIGN KEY (`parent_menu_id`) REFERENCES `sidebar_menu`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `central_report_log` ADD CONSTRAINT `central_report_log_Brands_id_fk` FOREIGN KEY (`brand_id`) REFERENCES `Brands`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `_BrandCategoriesToBrands` ADD CONSTRAINT `_BrandCategoriesToBrands_A_fkey` FOREIGN KEY (`A`) REFERENCES `BrandCategories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_BrandCategoriesToBrands` ADD CONSTRAINT `_BrandCategoriesToBrands_B_fkey` FOREIGN KEY (`B`) REFERENCES `Brands`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PermissionsTousers` ADD CONSTRAINT `_PermissionsTousers_A_fkey` FOREIGN KEY (`A`) REFERENCES `Permissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PermissionsTousers` ADD CONSTRAINT `_PermissionsTousers_B_fkey` FOREIGN KEY (`B`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

