-- CreateTable
CREATE TABLE `archived_inventory`
(
    `id`                             INTEGER      NOT NULL AUTO_INCREMENT,
    `system_event_process_id`        INTEGER      NULL,
    `brand_id`                       INTEGER      NULL,
    `ai_date`                        DATE         NULL,
    `marketplace_id`                 VARCHAR(100) NULL,
    `marketplace`                    VARCHAR(100) NULL,
    `sku`                            VARCHAR(100) NULL,
    `fnsku`                          VARCHAR(100) NULL,
    `asin`                           VARCHAR(50)  NULL,
    `product_name`                   TEXT         NULL,
    `condition_type`                 VARCHAR(50)  NULL,
    `your_price`                     FLOAT        NULL DEFAULT 0,
    `mfn_listing_exists`             VARCHAR(10)  NULL,
    `afn_listing_exists`             VARCHAR(10)  NULL,
    `mfn_fulfillable_quantity`       INTEGER      NULL DEFAULT 0,
    `afn_warehouse_quantity`         INTEGER      NULL DEFAULT 0,
    `afn_fulfillable_quantity`       INTEGER      NULL DEFAULT 0,
    `afn_unsellable_quantity`        INTEGER      NULL DEFAULT 0,
    `afn_reserved_quantity`          INTEGER      NULL DEFAULT 0,
    `afn_total_quantity`             INTEGER      NULL DEFAULT 0,
    `per_unit_volume`                FLOAT        NULL DEFAULT 0,
    `afn_inbound_working_quantity`   INTEGER      NULL DEFAULT 0,
    `afn_inbound_shipped_quantity`   INTEGER      NULL DEFAULT 0,
    `afn_inbound_receiving_quantity` INTEGER      NULL DEFAULT 0,
    `afn_researching_quantity`       INTEGER      NULL DEFAULT 0,
    `afn_reserved_future_supply`     INTEGER      NULL DEFAULT 0,
    `afn_future_supply_buyable`      INTEGER      NULL DEFAULT 0,
    `created_at`                     BIGINT       NULL,
    `updated_at`                     BIGINT       NULL,
    `status`                         INTEGER      NULL DEFAULT 0,
    INDEX `idx-archived_inventory-ai_date` (`ai_date`),
    INDEX `idx-archived_inventory-brand_id` (`brand_id`),
    INDEX `idx-archived_inventory-sku` (`sku`),
    INDEX `idx-archived_inventory-system_event_process_id` (`system_event_process_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `crons_events_log`
(
    `cel_id`         BIGINT       NOT NULL AUTO_INCREMENT,
    `cel_cron_name`  VARCHAR(255) NULL,
    `cel_cron_type`  INTEGER      NULL,
    `cel_event_type` INTEGER      NULL,
    `cel_message`    TEXT         NULL,
    `cel_event_data` LONGTEXT     NULL,
    `cel_start_time` INTEGER      NULL,
    `cel_end_time`   INTEGER      NULL,
    `cel_user_id`    INTEGER      NULL,
    `created_at`     INTEGER      NULL,
    `updated_at`     INTEGER      NULL,
    `created_by`     INTEGER      NULL,
    `updated_by`     INTEGER      NULL,
    `cel_status`     INTEGER      NOT NULL DEFAULT 0,
    PRIMARY KEY (`cel_id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `financial_data`
(
    `id`                       INTEGER      NOT NULL AUTO_INCREMENT,
    `system_event_process_id`  INTEGER      NULL,
    `brand_id`                 INTEGER      NULL,
    `vendor_id`                INTEGER      NULL,
    `marketplace_id`           VARCHAR(100) NULL,
    `datetime_n`               DATE         NULL,
    `date_time`                VARCHAR(50)  NULL,
    `order_date`               VARCHAR(50)  NULL,
    `settlement_id`            VARCHAR(100) NULL,
    `type`                     VARCHAR(100) NULL,
    `order_id`                 VARCHAR(100) NULL,
    `sku`                      VARCHAR(100) NULL,
    `asin`                     VARCHAR(100) NULL,
    `description`              TEXT         NULL,
    `quantity`                 INTEGER      NULL DEFAULT 0,
    `marketplace`              VARCHAR(100) NULL,
    `account_type`             VARCHAR(100) NULL,
    `fulfillment`              VARCHAR(100) NULL,
    `order_city`               VARCHAR(100) NULL,
    `order_state`              VARCHAR(100) NULL,
    `order_postal`             VARCHAR(100) NULL,
    `tax_collection_model`     VARCHAR(100) NULL,
    `product_sales`            FLOAT        NULL DEFAULT 0,
    `product_sales_tax`        FLOAT        NULL DEFAULT 0,
    `shipping_credits`         FLOAT        NULL DEFAULT 0,
    `shipping_credits_tax`     FLOAT        NULL DEFAULT 0,
    `gift_wrap_credits`        FLOAT        NULL DEFAULT 0,
    `giftwrap_credits_tax`     FLOAT        NULL DEFAULT 0,
    `promotional_rebates`      FLOAT        NULL DEFAULT 0,
    `promotional_rebates_tax`  FLOAT        NULL DEFAULT 0,
    `marketplace_withheld_tax` FLOAT        NULL DEFAULT 0,
    `selling_fees`             FLOAT        NULL DEFAULT 0,
    `fba_fees`                 FLOAT        NULL DEFAULT 0,
    `other_transaction_fees`   FLOAT        NULL DEFAULT 0,
    `other`                    FLOAT        NULL DEFAULT 0,
    `total`                    FLOAT        NULL DEFAULT 0,
    `total_sales_tax_liable`   FLOAT        NULL DEFAULT 0,
    `tcs_cgst`                 FLOAT        NULL DEFAULT 0,
    `tcs_sgst`                 FLOAT        NULL DEFAULT 0,
    `tcs_igst`                 FLOAT        NULL DEFAULT 0,
    `created_at`               BIGINT       NULL,
    `updated_at`               BIGINT       NULL,
    `status`                   INTEGER      NULL DEFAULT 0,
    INDEX `idx-financial_data-brand_id` (`brand_id`),
    INDEX `idx-financial_data-datetime_n` (`datetime_n`),
    INDEX `idx-financial_data-sku` (`sku`),
    INDEX `idx-financial_data-system_event_process_id` (`system_event_process_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `get_amazon_fulfilled_shipments_data_general`
(
    `id`                      INTEGER      NOT NULL AUTO_INCREMENT,
    `system_event_process_id` INTEGER      NULL,
    `brand_id`                INTEGER      NULL,
    `amazon_order_id`         VARCHAR(100) NULL,
    `merchant_order_id`       VARCHAR(100) NULL,
    `shipment_id`             VARCHAR(100) NULL,
    `shipment_item_id`        VARCHAR(100) NULL,
    `amazon_order_item_id`    VARCHAR(100) NULL,
    `merchant_order_item_id`  VARCHAR(100) NULL,
    `purchase_date`           VARCHAR(100) NULL,
    `payments_date`           VARCHAR(100) NULL,
    `shipment_date`           VARCHAR(100) NULL,
    `reporting_date`          VARCHAR(100) NULL,
    `buyer_email`             VARCHAR(100) NULL,
    `buyer_name`              VARCHAR(50)  NULL,
    `buyer_phone_number`      VARCHAR(50)  NULL,
    `sku`                     VARCHAR(100) NULL,
    `product_name`            TEXT         NULL,
    `quantity_shipped`        INTEGER      NULL,
    `currency`                VARCHAR(10)  NULL,
    `item_price`              FLOAT        NULL DEFAULT 0,
    `item_tax`                FLOAT        NULL DEFAULT 0,
    `shipping_price`          FLOAT        NULL DEFAULT 0,
    `shipping_tax`            FLOAT        NULL DEFAULT 0,
    `gift_wrap_price`         FLOAT        NULL DEFAULT 0,
    `gift_wrap_tax`           FLOAT        NULL DEFAULT 0,
    `ship_service_level`      VARCHAR(50)  NULL,
    `recipient_name`          VARCHAR(100) NULL,
    `ship_address_1`          VARCHAR(255) NULL,
    `ship_address_2`          VARCHAR(255) NULL,
    `ship_address_3`          VARCHAR(255) NULL,
    `ship_city`               VARCHAR(50)  NULL,
    `ship_state`              VARCHAR(50)  NULL,
    `ship_postal_code`        VARCHAR(50)  NULL,
    `ship_country`            VARCHAR(10)  NULL,
    `ship_phone_number`       VARCHAR(20)  NULL,
    `bill_address_1`          VARCHAR(255) NULL,
    `bill_address_2`          VARCHAR(255) NULL,
    `bill_address_3`          VARCHAR(255) NULL,
    `bill_city`               VARCHAR(50)  NULL,
    `bill_state`              VARCHAR(50)  NULL,
    `bill_postal_code`        VARCHAR(10)  NULL,
    `bill_country`            VARCHAR(50)  NULL,
    `item_promotion_discount` FLOAT        NULL DEFAULT 0,
    `ship_promotion_discount` FLOAT        NULL DEFAULT 0,
    `carrier`                 VARCHAR(20)  NULL,
    `tracking_number`         VARCHAR(100) NULL,
    `estimated_arrival_date`  VARCHAR(100) NULL,
    `fulfillment_center_id`   VARCHAR(50)  NULL,
    `fulfillment_channel`     VARCHAR(50)  NULL,
    `sales_channel`           VARCHAR(50)  NULL,
    `marketplace_id`          VARCHAR(50)  NULL,
    `marketplace`             VARCHAR(50)  NULL,
    `created_at`              BIGINT       NULL,
    `updated_at`              BIGINT       NULL,
    `created_by`              BIGINT       NULL,
    `updated_by`              BIGINT       NULL,
    `user_id`                 BIGINT       NULL,
    `usp_id`                  BIGINT       NULL,
    `status`                  INTEGER      NULL DEFAULT 0,
    `year`                    YEAR         NULL,
    `month`                   INTEGER      NULL,
    `week`                    INTEGER      NULL,
    `year_week`               VARCHAR(6)   NULL,
    INDEX `idx-shipments_data_general-amazon_order_id` (`amazon_order_id`),
    INDEX `idx-shipments_data_general-brand_id` (`brand_id`),
    INDEX `idx-shipments_data_general-sku` (`sku`),
    INDEX `month` (`month`),
    INDEX `week` (`week`),
    INDEX `year` (`year`),
    INDEX `get_amazon_fulfilled_shipments_data_general_year_week_index` (`year_week`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `get_fba_estimated_fba_fees_txt_data`
(
    `id`                                     INTEGER      NOT NULL AUTO_INCREMENT,
    `system_event_process_id`                INTEGER      NULL,
    `brand_id`                               INTEGER      NULL,
    `sku`                                    VARCHAR(50)  NULL,
    `fnsku`                                  VARCHAR(50)  NULL,
    `asin`                                   VARCHAR(50)  NULL,
    `product_name`                           TEXT         NULL,
    `product_group`                          VARCHAR(100) NULL,
    `brand`                                  VARCHAR(100) NULL,
    `fulfilled_by`                           VARCHAR(50)  NULL,
    `your_price`                             FLOAT        NULL DEFAULT 0,
    `sales_price`                            FLOAT        NULL DEFAULT 0,
    `longest_side`                           FLOAT        NULL DEFAULT 0,
    `median_side`                            FLOAT        NULL DEFAULT 0,
    `shortest_side`                          FLOAT        NULL DEFAULT 0,
    `length_and_girth`                       FLOAT        NULL DEFAULT 0,
    `unit_of_dimension`                      FLOAT        NULL DEFAULT 0,
    `item_package_weight`                    FLOAT        NULL DEFAULT 0,
    `unit_of_weight`                         VARCHAR(30)  NULL,
    `product_size_tier`                      VARCHAR(30)  NULL,
    `currency`                               VARCHAR(10)  NULL,
    `estimated_fee_total`                    FLOAT        NULL DEFAULT 0,
    `estimated_referral_fee_per_unit`        FLOAT        NULL DEFAULT 0,
    `estimated_variable_closing_fee`         FLOAT        NULL DEFAULT 0,
    `estimated_order_handling_fee_per_order` VARCHAR(30)  NULL,
    `estimated_pick_pack_fee_per_unit`       VARCHAR(30)  NULL,
    `estimated_weight_handling_fee_per_unit` VARCHAR(30)  NULL,
    `expected_fulfillment_fee_per_unit`      FLOAT        NULL DEFAULT 0,
    `marketplace_id`                         VARCHAR(100) NULL,
    `marketplace`                            VARCHAR(100) NULL,
    `created_at`                             BIGINT       NULL,
    `updated_at`                             BIGINT       NULL,
    `created_by`                             BIGINT       NULL,
    `updated_by`                             BIGINT       NULL,
    `user_id`                                BIGINT       NULL,
    `usp_id`                                 BIGINT       NULL,
    `status`                                 INTEGER      NULL DEFAULT 0,
    INDEX `idx-fba_fees_txt-asin` (`asin`),
    INDEX `idx-fba_fees_txt-brand_id` (`brand_id`),
    INDEX `idx-fba_fees_txt-sku` (`sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `get_fba_fulfillment_current_inventory_data`
(
    `id`                      INTEGER      NOT NULL AUTO_INCREMENT,
    `system_event_process_id` INTEGER      NULL,
    `brand_id`                INTEGER      NULL,
    `shipment_date`           VARCHAR(50)  NULL,
    `fnsku`                   VARCHAR(50)  NULL,
    `sku`                     VARCHAR(50)  NULL,
    `product_name`            TEXT         NULL,
    `quantity`                INTEGER      NULL DEFAULT 0,
    `fulfillment_center_id`   VARCHAR(50)  NULL,
    `detailed_disposition`    VARCHAR(100) NULL,
    `country`                 VARCHAR(30)  NULL,
    `marketplace_id`          VARCHAR(100) NULL,
    `marketplace`             VARCHAR(100) NULL,
    `created_at`              BIGINT       NULL,
    `updated_at`              BIGINT       NULL,
    `created_by`              BIGINT       NULL,
    `updated_by`              BIGINT       NULL,
    `user_id`                 BIGINT       NULL,
    `usp_id`                  BIGINT       NULL,
    `status`                  INTEGER      NULL DEFAULT 0,
    INDEX `idx-current_inventory-brand_id` (`brand_id`),
    INDEX `idx-current_inventory-sku` (`sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `get_flat_file_open_listings_data`
(
    `id`                        INTEGER      NOT NULL AUTO_INCREMENT,
    `system_event_process_id`   INTEGER      NULL,
    `brand_id`                  INTEGER      NULL,
    `sku`                       VARCHAR(100) NULL,
    `asin`                      VARCHAR(100) NULL,
    `price`                     FLOAT        NULL DEFAULT 0,
    `quantity`                  INTEGER      NULL,
    `business_price`            FLOAT        NULL DEFAULT 0,
    `quantity_price_type`       VARCHAR(50)  NULL,
    `quantity_lower_bound_1`    FLOAT        NULL DEFAULT 0,
    `quantity_price_1`          FLOAT        NULL DEFAULT 0,
    `quantity_lower_bound_2`    FLOAT        NULL DEFAULT 0,
    `quantity_price_2`          FLOAT        NULL DEFAULT 0,
    `quantity_lower_bound_3`    FLOAT        NULL DEFAULT 0,
    `quantity_price_3`          FLOAT        NULL DEFAULT 0,
    `quantity_lower_bound_4`    FLOAT        NULL DEFAULT 0,
    `quantity_price_4`          FLOAT        NULL DEFAULT 0,
    `quantity_lower_bound_5`    INTEGER      NULL DEFAULT 0,
    `quantity_price_5`          FLOAT        NULL DEFAULT 0,
    `progressive_price_type`    VARCHAR(50)  NULL,
    `progressive_lower_bound_1` FLOAT        NULL DEFAULT 0,
    `progressive_price_1`       FLOAT        NULL DEFAULT 0,
    `progressive_lower_bound_2` FLOAT        NULL DEFAULT 0,
    `progressive_price_2`       FLOAT        NULL DEFAULT 0,
    `progressive_lower_bound_3` FLOAT        NULL DEFAULT 0,
    `progressive_price_3`       FLOAT        NULL DEFAULT 0,
    `marketplace_id`            VARCHAR(100) NULL,
    `marketplace`               VARCHAR(100) NULL,
    `created_at`                BIGINT       NULL,
    `updated_at`                BIGINT       NULL,
    `created_by`                BIGINT       NULL,
    `updated_by`                BIGINT       NULL,
    `user_id`                   BIGINT       NULL,
    `usp_id`                    BIGINT       NULL,
    `status`                    INTEGER      NULL DEFAULT 0,
    INDEX `idx-open_listings-asin` (`asin`),
    INDEX `idx-open_listings-brand_id` (`brand_id`),
    INDEX `idx-open_listings-sku` (`sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `get_xml_all_orders_data_by_last_update_general`
(
    `id`                      INTEGER      NOT NULL AUTO_INCREMENT,
    `system_event_process_id` INTEGER      NULL,
    `brand_id`                INTEGER      NULL,
    `amazon_order_id`         VARCHAR(100) NULL,
    `merchant_order_id`       VARCHAR(100) NULL,
    `purchase_date`           VARCHAR(100) NULL,
    `last_updated_date`       VARCHAR(100) NULL,
    `order_status`            VARCHAR(20)  NULL,
    `fulfillment_channel`     VARCHAR(20)  NULL,
    `sales_channel`           VARCHAR(50)  NULL,
    `ship_service_level`      VARCHAR(50)  NULL,
    `city`                    VARCHAR(50)  NULL,
    `state`                   VARCHAR(50)  NULL,
    `postal_code`             VARCHAR(50)  NULL,
    `country`                 VARCHAR(50)  NULL,
    `is_business_order`       VARCHAR(50)  NULL,
    `amazon_order_item_id`    VARCHAR(100) NULL,
    `sku`                     VARCHAR(100) NULL,
    `asin`                    VARCHAR(100) NULL,
    `item_status`             VARCHAR(50)  NULL,
    `product_name`            TEXT         NULL,
    `quantity`                INTEGER      NULL,
    `type`                    VARCHAR(255) NULL,
    `amount`                  FLOAT        NULL DEFAULT 0,
    `marketplace_id`          VARCHAR(100) NULL,
    `marketplace`             VARCHAR(100) NULL,
    `created_at`              BIGINT       NULL,
    `updated_at`              BIGINT       NULL,
    `created_by`              BIGINT       NULL,
    `updated_by`              BIGINT       NULL,
    `user_id`                 BIGINT       NULL,
    `usp_id`                  BIGINT       NULL,
    `status`                  INTEGER      NULL DEFAULT 0,
    INDEX `idx-update_general-amazon_order_id` (`amazon_order_id`),
    INDEX `idx-update_general-brand_id` (`brand_id`),
    INDEX `idx-update_general-sku` (`sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `get_xml_all_orders_data_by_order_date_general`
(
    `id`                      INTEGER      NOT NULL AUTO_INCREMENT,
    `system_event_process_id` INTEGER      NULL,
    `brand_id`                INTEGER      NULL,
    `amazon_order_id`         VARCHAR(100) NULL,
    `merchant_order_id`       VARCHAR(100) NULL,
    `purchase_date`           VARCHAR(100) NULL,
    `last_updated_date`       VARCHAR(100) NULL,
    `order_status`            VARCHAR(20)  NULL,
    `fulfillment_channel`     VARCHAR(20)  NULL,
    `sales_channel`           VARCHAR(50)  NULL,
    `ship_service_level`      VARCHAR(50)  NULL,
    `city`                    VARCHAR(50)  NULL,
    `state`                   VARCHAR(50)  NULL,
    `postal_code`             VARCHAR(50)  NULL,
    `country`                 VARCHAR(50)  NULL,
    `is_business_order`       VARCHAR(50)  NULL,
    `amazon_order_item_id`    VARCHAR(100) NULL,
    `sku`                     VARCHAR(100) NULL,
    `asin`                    VARCHAR(100) NULL,
    `item_status`             VARCHAR(50)  NULL,
    `product_name`            TEXT         NULL,
    `quantity`                INTEGER      NULL,
    `type`                    VARCHAR(300) NULL,
    `amount`                  FLOAT        NULL DEFAULT 0,
    `marketplace_id`          VARCHAR(100) NULL,
    `marketplace`             VARCHAR(100) NULL,
    `created_at`              BIGINT       NULL,
    `updated_at`              BIGINT       NULL,
    `created_by`              BIGINT       NULL,
    `updated_by`              BIGINT       NULL,
    `user_id`                 BIGINT       NULL,
    `usp_id`                  BIGINT       NULL,
    `status`                  INTEGER      NULL DEFAULT 0,
    INDEX `idx-date_general-amazon_order_id` (`amazon_order_id`),
    INDEX `idx-date_general-brand_id` (`brand_id`),
    INDEX `idx-date_general-sku` (`sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `migration`
(
    `version`    VARCHAR(180) NOT NULL,
    `apply_time` INTEGER      NULL,
    PRIMARY KEY (`version`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `order_report_data`
(
    `id`                                   INTEGER      NOT NULL AUTO_INCREMENT,
    `system_event_process_id`              INTEGER      NULL,
    `brand_id`                             INTEGER      NULL,
    `amazon_order_id`                      VARCHAR(100) NULL,
    `merchant_order_id`                    VARCHAR(100) NULL,
    `purchase_date`                        VARCHAR(50)  NULL,
    `purchase_date_n`                      VARCHAR(20)  NULL,
    `last_updated_date`                    VARCHAR(50)  NULL,
    `order_status`                         VARCHAR(50)  NULL,
    `item_status`                          VARCHAR(50)  NULL,
    `fulfillment_channel`                  VARCHAR(50)  NULL,
    `sales_channel`                        VARCHAR(50)  NULL,
    `order_channel`                        VARCHAR(50)  NULL,
    `url`                                  VARCHAR(255) NULL,
    `ship_service_level`                   VARCHAR(50)  NULL,
    `product_name`                         VARCHAR(255) NULL,
    `sku`                                  VARCHAR(100) NULL,
    `asin`                                 VARCHAR(50)  NULL,
    `quantity`                             INTEGER      NULL DEFAULT 0,
    `currency`                             VARCHAR(15)  NULL,
    `item_cog`                             FLOAT        NULL DEFAULT 0,
    `item_price`                           FLOAT        NULL DEFAULT 0,
    `item_tax`                             FLOAT        NULL DEFAULT 0,
    `shipping_price`                       FLOAT        NULL DEFAULT 0,
    `shipping_tax`                         FLOAT        NULL DEFAULT 0,
    `gift_wrap_price`                      FLOAT        NULL DEFAULT 0,
    `gift_wrap_tax`                        FLOAT        NULL DEFAULT 0,
    `item_promotion_discount`              FLOAT        NULL DEFAULT 0,
    `ship_promotion_discount`              FLOAT        NULL DEFAULT 0,
    `ship_city`                            VARCHAR(50)  NULL,
    `ship_state`                           VARCHAR(50)  NULL,
    `ship_postal_code`                     VARCHAR(20)  NULL,
    `ship_country`                         VARCHAR(20)  NULL,
    `promotion_ids`                        VARCHAR(255) NULL,
    `is_business_order`                    VARCHAR(20)  NULL,
    `purchase_order_number`                VARCHAR(100) NULL,
    `price_designation`                    VARCHAR(100) NULL,
    `principle_charge_amount`              FLOAT        NULL DEFAULT 0,
    `tax_charge_amount`                    FLOAT        NULL DEFAULT 0,
    `gift_wrap_charge_amount`              FLOAT        NULL DEFAULT 0,
    `gift_wrap_tax_charge_amount`          FLOAT        NULL DEFAULT 0,
    `shipping_charge_amount`               FLOAT        NULL DEFAULT 0,
    `shipping_tax_charge_amount`           FLOAT        NULL DEFAULT 0,
    `fba_per_order_fulfillment_fee_amount` FLOAT        NULL DEFAULT 0,
    `fba_per_unit_fulfillment_fee_amount`  FLOAT        NULL DEFAULT 0,
    `fba_weight_based_fee_amount`          FLOAT        NULL DEFAULT 0,
    `commission_fee_amount`                FLOAT        NULL DEFAULT 0,
    `fixed_closing_fee_amount`             FLOAT        NULL DEFAULT 0,
    `giftwrap_chargeback_fee_amount`       FLOAT        NULL DEFAULT 0,
    `sales_tax_collect_fee_amount`         FLOAT        NULL DEFAULT 0,
    `shipping_chargeback_fee_amount`       FLOAT        NULL DEFAULT 0,
    `variable_closing_fee_amount`          FLOAT        NULL DEFAULT 0,
    `marketplace_id`                       VARCHAR(100) NULL,
    `marketplace`                          VARCHAR(100) NULL,
    `created_at`                           BIGINT       NULL,
    `updated_at`                           BIGINT       NULL,
    `status`                               INTEGER      NULL DEFAULT 0,
    INDEX `idx-order_report_data-amazon_order_id` (`amazon_order_id`),
    INDEX `idx-order_report_data-brand_id` (`brand_id`),
    INDEX `idx-order_report_data-order_status` (`order_status`),
    INDEX `idx-order_report_data-purchase_date` (`purchase_date`),
    INDEX `idx-order_report_data-sku` (`sku`),
    INDEX `idx-order_report_data-system_event_process_id` (`system_event_process_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `product_report_data`
(
    `id`                             INTEGER      NOT NULL AUTO_INCREMENT,
    `system_event_process_id`        INTEGER      NULL,
    `brand_id`                       INTEGER      NULL,
    `vendor_id`                      INTEGER      NULL,
    `marketplace_id`                 VARCHAR(100) NULL,
    `marketplace`                    VARCHAR(100) NULL,
    `item_name`                      TEXT         NULL,
    `item_description`               TEXT         NULL,
    `status`                         VARCHAR(50)  NULL,
    `listing_id`                     VARCHAR(100) NULL,
    `seller_sku`                     VARCHAR(100) NULL,
    `universal_sku`                  VARCHAR(100) NULL,
    `price`                          FLOAT        NULL DEFAULT 0,
    `moq`                            INTEGER      NULL,
    `inventory_multiplier`           BIGINT       NULL DEFAULT 1,
    `unit_per_case`                  BIGINT       NULL DEFAULT 0,
    `is_inventory_multiplier_manual` INTEGER      NULL DEFAULT 0,
    `is_unit_per_case_manual`        INTEGER      NULL DEFAULT 0,
    `cogs`                           FLOAT        NULL DEFAULT 0,
    `quantity`                       INTEGER      NULL DEFAULT 0,
    `sales_rank`                     INTEGER      NULL,
    `open_date`                      VARCHAR(100) NULL,
    `image_url`                      VARCHAR(255) NULL,
    `item_is_marketplace`            VARCHAR(10)  NULL,
    `product_id_type`                INTEGER      NULL,
    `zshop_shipping_fee`             VARCHAR(255) NULL,
    `item_note`                      VARCHAR(255) NULL,
    `item_condition`                 VARCHAR(255) NULL,
    `zshop_category1`                VARCHAR(255) NULL,
    `zshop_browse_path`              VARCHAR(255) NULL,
    `zshop_storefront_feature`       VARCHAR(255) NULL,
    `asin1`                          VARCHAR(100) NULL,
    `asin2`                          VARCHAR(100) NULL,
    `asin3`                          VARCHAR(100) NULL,
    `will_ship_internationally`      VARCHAR(255) NULL,
    `expedited_shipping`             VARCHAR(255) NULL,
    `zshop_boldface`                 VARCHAR(255) NULL,
    `product_id`                     VARCHAR(100) NULL,
    `bid_for_featured_placement`     VARCHAR(255) NULL,
    `add_delete`                     VARCHAR(255) NULL,
    `pending_quantity`               VARCHAR(255) NULL,
    `fulfillment_channel`            VARCHAR(100) NULL,
    `merchant_shipping_group`        VARCHAR(100) NULL,
    `source`                         VARCHAR(100) NULL,
    `created_at`                     BIGINT       NULL,
    `updated_at`                     BIGINT       NULL,
    INDEX `idx-product_report_data-asin1` (`asin1`),
    INDEX `idx-product_report_data-brand_id` (`brand_id`),
    INDEX `idx-product_report_data-seller_sku` (`seller_sku`),
    INDEX `idx-product_report_data-system_event_process_id` (`system_event_process_id`),
    INDEX `idx-product_report_data-vendor_id` (`vendor_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `report_log`
(
    `id`                    BIGINT       NOT NULL AUTO_INCREMENT,
    `report_type`           VARCHAR(200) NULL,
    `report_document_id`    VARCHAR(255) NULL,
    `report_id`             VARCHAR(200) NULL,
    `report_schedule_id`    INTEGER      NULL,
    `processing_status`     VARCHAR(200) NULL,
    `report_current_status` VARCHAR(200) NULL,
    `data_start_time`       VARCHAR(200) NULL,
    `data_end_time`         VARCHAR(200) NULL,
    `processing_start_time` VARCHAR(200) NULL,
    `processing_end_time`   VARCHAR(200) NULL,
    `is_done`               INTEGER      NOT NULL DEFAULT 0,
    `marketplace_id`        VARCHAR(100) NULL,
    `marketplace`           VARCHAR(100) NULL,
    `created_time`          VARCHAR(200) NULL,
    `report_request_status` INTEGER      NOT NULL DEFAULT 0,
    `created_at`            BIGINT       NULL,
    `updated_at`            BIGINT       NULL,
    `created_by`            INTEGER      NULL,
    `updated_by`            INTEGER      NULL,
    `status`                INTEGER      NOT NULL DEFAULT 0,
    INDEX `report_id` (`report_id`),
    INDEX `report_type` (`report_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `system_event_processes`
(
    `id`                     INTEGER      NOT NULL AUTO_INCREMENT,
    `user_data_scheduler_id` INTEGER      NULL,
    `event_date`             DATE         NULL,
    `event_name`             VARCHAR(255) NULL,
    `event_type`             VARCHAR(255) NULL,
    `event_status`           VARCHAR(255) NULL,
    `event_details`          TEXT         NULL,
    `priority`               INTEGER      NULL,
    `retry_count`            INTEGER      NULL DEFAULT 0,
    `is_dependent`           INTEGER      NULL,
    `execution_time`         VARCHAR(50)  NULL,
    `marketplace`            VARCHAR(100) NULL,
    `marketplace_id`         VARCHAR(100) NULL,
    `status`                 INTEGER      NULL DEFAULT 0,
    `note`                   TEXT         NULL,
    `created_at`             BIGINT       NULL,
    `updated_at`             BIGINT       NULL,
    `created_by`             INTEGER      NULL,
    `updated_by`             INTEGER      NULL,
    `user_id`                INTEGER      NULL,
    INDEX `idx-system_event_processes-event_date` (`event_date`),
    INDEX `idx-system_event_processes-event_name` (`event_name`),
    INDEX `idx-system_event_processes-event_type` (`event_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `system_events_log`
(
    `sel_id`         BIGINT       NOT NULL AUTO_INCREMENT,
    `sel_type`       INTEGER      NULL,
    `sel_data`       LONGTEXT     NULL,
    `sel_short_data` VARCHAR(250) NULL,
    `sel_message`    TEXT         NULL,
    `sel_url`        TEXT         NULL,
    `sel_ip`         VARCHAR(100) NULL,
    `sel_user_id`    INTEGER      NULL,
    `created_at`     BIGINT       NULL,
    `updated_at`     BIGINT       NULL,
    `created_by`     INTEGER      NULL,
    `updated_by`     INTEGER      NULL,
    `sel_status`     INTEGER      NOT NULL DEFAULT 0,
    PRIMARY KEY (`sel_id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `advertising_ad_group_report`
(
    `id`                          INTEGER      NOT NULL AUTO_INCREMENT,
    `system_event_process_id`     INTEGER      NULL,
    `brand_id`                    INTEGER      NULL,
    `report_date`                 DATE         NULL,
    `campaign_name`               VARCHAR(255) NULL,
    `campaign_id`                 VARCHAR(255) NULL,
    `group_id`                    VARCHAR(255) NULL,
    `group_name`                  VARCHAR(255) NULL,
    `impressions`                 INTEGER      NULL,
    `clicks`                      INTEGER      NULL,
    `cost`                        FLOAT        NULL DEFAULT 0,
    `attributed_conversions1d`    INTEGER      NULL DEFAULT 0,
    `attributed_conversions7d`    INTEGER      NULL DEFAULT 0,
    `attributed_conversions14d`   INTEGER      NULL DEFAULT 0,
    `attributed_conversions30d`   INTEGER      NULL DEFAULT 0,
    `attributed_units_ordered1d`  INTEGER      NULL DEFAULT 0,
    `attributed_units_ordered7d`  INTEGER      NULL DEFAULT 0,
    `attributed_units_ordered14d` INTEGER      NULL DEFAULT 0,
    `attributed_units_ordered30d` INTEGER      NULL DEFAULT 0,
    `attributed_sales1d`          FLOAT        NULL DEFAULT 0,
    `attributed_sales7d`          FLOAT        NULL DEFAULT 0,
    `attributed_sales14d`         FLOAT        NULL DEFAULT 0,
    `attributed_sales30d`         FLOAT        NULL DEFAULT 0,
    `marketplace_id`              VARCHAR(100) NULL,
    `marketplace`                 VARCHAR(100) NULL,
    `profile_id`                  VARCHAR(255) NULL,
    `created_at`                  BIGINT       NULL,
    `updated_at`                  BIGINT       NULL,
    INDEX `idx-advertising_ad_group_report-brand_id` (`brand_id`),
    INDEX `idx-advertising_ad_group_report-campaign_id` (`campaign_id`),
    INDEX `idx-advertising_ad_group_report-campaign_name` (`campaign_name`),
    INDEX `idx-advertising_ad_group_report-report_date` (`report_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `advertising_brands_ad_group_report`
(
    `id`                                                   INTEGER      NOT NULL AUTO_INCREMENT,
    `system_event_process_id`                              INTEGER      NULL,
    `brand_id`                                             INTEGER      NULL,
    `report_date`                                          DATE         NULL,
    `campaign_name`                                        VARCHAR(255) NULL,
    `campaign_id`                                          VARCHAR(255) NULL,
    `campaign_status`                                      VARCHAR(50)  NULL,
    `campaign_budget`                                      FLOAT        NULL DEFAULT 0,
    `campaign_budget_type`                                 FLOAT        NULL DEFAULT 0,
    `group_id`                                             VARCHAR(255) NULL,
    `group_name`                                           VARCHAR(255) NULL,
    `impressions`                                          INTEGER      NULL,
    `clicks`                                               INTEGER      NULL,
    `cost`                                                 FLOAT        NULL DEFAULT 0,
    `attributed_detail_page_views_clicks_14d`              INTEGER      NULL DEFAULT 0,
    `attributed_sales_14d`                                 FLOAT        NULL DEFAULT 0,
    `attributed_sales_14d_same_sku`                        FLOAT        NULL DEFAULT 0,
    `attributed_conversions_14d`                           INTEGER      NULL DEFAULT 0,
    `attributed_conversions_14d_same_sku`                  INTEGER      NULL DEFAULT 0,
    `attributed_orders_new_to_brand_14d`                   FLOAT        NULL DEFAULT 0,
    `attributed_orders_new_to_brand_percentage_14d`        FLOAT        NULL DEFAULT 0,
    `attributed_order_rate_new_to_brand_14d`               FLOAT        NULL DEFAULT 0,
    `attributed_sales_new_to_brand_14d`                    FLOAT        NULL DEFAULT 0,
    `attributed_sales_new_to_brand_percentage_14d`         FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered_new_to_brand_14d`            INTEGER      NULL DEFAULT 0,
    `attributed_units_ordered_new_to_brand_percentage_14d` INTEGER      NULL DEFAULT 0,
    `units_sold_14d`                                       INTEGER      NULL DEFAULT 0,
    `dpv_14d`                                              INTEGER      NULL DEFAULT 0,
    `marketplace_id`                                       VARCHAR(100) NULL,
    `marketplace`                                          VARCHAR(100) NULL,
    `profile_id`                                           VARCHAR(255) NULL,
    `created_at`                                           BIGINT       NULL,
    `updated_at`                                           BIGINT       NULL,
    INDEX `idx-advertising_brands_ad_group_report-brand_id` (`brand_id`),
    INDEX `idx-advertising_brands_ad_group_report-campaign_id` (`campaign_id`),
    INDEX `idx-advertising_brands_ad_group_report-campaign_name` (`campaign_name`),
    INDEX `idx-advertising_brands_ad_group_report-report_date` (`report_date`),
    INDEX `idx-advertising_brands_keywords_report-brand_id` (`brand_id`),
    INDEX `idx-advertising_brands_keywords_report-campaign_id` (`campaign_id`),
    INDEX `idx-advertising_brands_keywords_report-campaign_name` (`campaign_name`),
    INDEX `idx-advertising_brands_keywords_report-report_date` (`report_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `advertising_brands_campaigns_report`
(
    `id`                                                   INTEGER      NOT NULL AUTO_INCREMENT,
    `system_event_process_id`                              INTEGER      NULL,
    `brand_id`                                             INTEGER      NULL,
    `report_date`                                          DATE         NULL,
    `campaign_name`                                        VARCHAR(255) NULL,
    `campaign_id`                                          VARCHAR(255) NULL,
    `campaign_status`                                      VARCHAR(50)  NULL,
    `campaign_budget`                                      FLOAT        NULL DEFAULT 0,
    `campaign_budget_type`                                 VARCHAR(100) NULL,
    `campaign_rule_based_budget`                           VARCHAR(255) NULL,
    `applicable_budget_ruleId`                             VARCHAR(255) NULL,
    `applicable_budget_rule_name`                          VARCHAR(255) NULL,
    `impressions`                                          INTEGER      NULL,
    `clicks`                                               INTEGER      NULL,
    `cost`                                                 FLOAT        NULL DEFAULT 0,
    `attributed_detail_page_views_clicks_14d`              INTEGER      NULL DEFAULT 0,
    `attributed_sales_14d`                                 FLOAT        NULL DEFAULT 0,
    `attributed_sales_14d_same_sku`                        FLOAT        NULL DEFAULT 0,
    `attributed_conversions_14d`                           INTEGER      NULL DEFAULT 0,
    `attributed_conversions_14d_same_sku`                  INTEGER      NULL DEFAULT 0,
    `attributed_orders_new_to_brand_14d`                   FLOAT        NULL DEFAULT 0,
    `attributed_orders_new_to_brand_percentage_14d`        FLOAT        NULL DEFAULT 0,
    `attributed_order_rate_new_to_brand_14d`               FLOAT        NULL DEFAULT 0,
    `attributed_sales_new_to_brand_14d`                    FLOAT        NULL DEFAULT 0,
    `attributed_sales_new_to_brand_percentage_14d`         FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered_new_to_brand_14d`            INTEGER      NULL DEFAULT 0,
    `attributed_units_ordered_new_to_brand_percentage_14d` INTEGER      NULL DEFAULT 0,
    `units_sold_14d`                                       INTEGER      NULL DEFAULT 0,
    `dpv_14d`                                              INTEGER      NULL DEFAULT 0,
    `marketplace_id`                                       VARCHAR(100) NULL,
    `marketplace`                                          VARCHAR(100) NULL,
    `profile_id`                                           VARCHAR(255) NULL,
    `created_at`                                           BIGINT       NULL,
    `updated_at`                                           BIGINT       NULL,
    INDEX `idx-advertising_brands_campaigns_report-brand_id` (`brand_id`),
    INDEX `idx-advertising_brands_campaigns_report-campaign_id` (`campaign_id`),
    INDEX `idx-advertising_brands_campaigns_report-campaign_name` (`campaign_name`),
    INDEX `idx-advertising_brands_campaigns_report-report_date` (`report_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `advertising_brands_keywords_report`
(
    `id`                                                   INTEGER      NOT NULL AUTO_INCREMENT,
    `system_event_process_id`                              INTEGER      NULL,
    `brand_id`                                             INTEGER      NULL,
    `report_date`                                          DATE         NULL,
    `campaign_name`                                        VARCHAR(255) NULL,
    `campaign_id`                                          VARCHAR(255) NULL,
    `campaign_status`                                      VARCHAR(50)  NULL,
    `campaign_budget`                                      FLOAT        NULL DEFAULT 0,
    `campaign_budget_type`                                 VARCHAR(100) NULL,
    `group_id`                                             VARCHAR(255) NULL,
    `group_name`                                           VARCHAR(255) NULL,
    `keyword_id`                                           VARCHAR(255) NULL,
    `keyword_text`                                         VARCHAR(255) NULL,
    `keyword_status`                                       VARCHAR(100) NULL,
    `keyword_bid`                                          FLOAT        NULL DEFAULT 0,
    `match_type`                                           VARCHAR(100) NULL,
    `impressions`                                          INTEGER      NULL,
    `clicks`                                               INTEGER      NULL,
    `cost`                                                 FLOAT        NULL DEFAULT 0,
    `search_term_impression_rank`                          INTEGER      NULL DEFAULT 0,
    `targeting_expression`                                 VARCHAR(255) NULL,
    `targeting_text`                                       VARCHAR(255) NULL,
    `targeting_type`                                       VARCHAR(100) NULL,
    `attributed_detail_page_views_clicks_14d`              INTEGER      NULL DEFAULT 0,
    `attributed_sales_14d`                                 FLOAT        NULL DEFAULT 0,
    `attributed_sales_14d_same_sku`                        FLOAT        NULL DEFAULT 0,
    `attributed_conversions_14d`                           INTEGER      NULL DEFAULT 0,
    `attributed_conversions_14d_same_sku`                  INTEGER      NULL DEFAULT 0,
    `attributed_orders_new_to_brand_14d`                   FLOAT        NULL DEFAULT 0,
    `attributed_orders_new_to_brand_percentage_14d`        FLOAT        NULL DEFAULT 0,
    `attributed_order_rate_new_to_brand_14d`               FLOAT        NULL DEFAULT 0,
    `attributed_sales_new_to_brand_14d`                    FLOAT        NULL DEFAULT 0,
    `attributed_sales_new_to_brand_percentage_14d`         FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered_new_to_brand_14d`            INTEGER      NULL DEFAULT 0,
    `attributed_units_ordered_new_to_brand_percentage_14d` INTEGER      NULL DEFAULT 0,
    `units_sold_14d`                                       INTEGER      NULL DEFAULT 0,
    `dpv_14d`                                              INTEGER      NULL DEFAULT 0,
    `marketplace_id`                                       VARCHAR(100) NULL,
    `marketplace`                                          VARCHAR(100) NULL,
    `profile_id`                                           VARCHAR(255) NULL,
    `created_at`                                           BIGINT       NULL,
    `updated_at`                                           BIGINT       NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `advertising_brands_video_campaigns_report`
(
    `id`                                  INTEGER      NOT NULL AUTO_INCREMENT,
    `system_event_process_id`             INTEGER      NULL,
    `brand_id`                            INTEGER      NULL,
    `report_date`                         DATE         NULL,
    `campaign_name`                       VARCHAR(255) NULL,
    `campaign_id`                         VARCHAR(255) NULL,
    `campaign_status`                     VARCHAR(50)  NULL,
    `campaign_budget`                     FLOAT        NULL DEFAULT 0,
    `campaign_budget_type`                VARCHAR(100) NULL,
    `impressions`                         INTEGER      NULL,
    `clicks`                              INTEGER      NULL,
    `cost`                                FLOAT        NULL DEFAULT 0,
    `attributed_sales_14d`                FLOAT        NULL DEFAULT 0,
    `attributed_sales_14d_same_sku`       FLOAT        NULL DEFAULT 0,
    `attributed_conversions_14d`          INTEGER      NULL DEFAULT 0,
    `attributed_conversions_14d_same_sku` INTEGER      NULL DEFAULT 0,
    `marketplace_id`                      VARCHAR(100) NULL,
    `marketplace`                         VARCHAR(100) NULL,
    `profile_id`                          VARCHAR(255) NULL,
    `created_at`                          BIGINT       NULL,
    `updated_at`                          BIGINT       NULL,
    `branded_non_branded_status`          VARCHAR(50)  NULL,
    INDEX `idx-advertising_brands_video_campaigns_report-brand_id` (`brand_id`),
    INDEX `idx-advertising_brands_video_campaigns_report-campaign_id` (`campaign_id`),
    INDEX `idx-advertising_brands_video_campaigns_report-campaign_name` (`campaign_name`),
    INDEX `idx-advertising_brands_video_campaigns_report-report_date` (`report_date`),
    INDEX `idx-advertising_campaigns_report-brand_id` (`brand_id`),
    INDEX `idx-advertising_campaigns_report-campaign_id` (`campaign_id`),
    INDEX `idx-advertising_campaigns_report-campaign_name` (`campaign_name`),
    INDEX `idx-advertising_campaigns_report-report_date` (`report_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `advertising_campaigns_report`
(
    `id`                          INTEGER      NOT NULL AUTO_INCREMENT,
    `system_event_process_id`     INTEGER      NULL,
    `brand_id`                    INTEGER      NULL,
    `report_date`                 DATE         NULL,
    `campaign_name`               VARCHAR(255) NULL,
    `campaign_id`                 VARCHAR(255) NULL,
    `campaign_status`             VARCHAR(50)  NULL,
    `campaign_budget`             FLOAT        NULL DEFAULT 0,
    `bid_plus`                    INTEGER      NULL,
    `impressions`                 INTEGER      NULL,
    `clicks`                      INTEGER      NULL,
    `cost`                        FLOAT        NULL DEFAULT 0,
    `attributed_conversions1d`    FLOAT        NULL DEFAULT 0,
    `attributed_conversions7d`    FLOAT        NULL DEFAULT 0,
    `attributed_conversions14d`   FLOAT        NULL DEFAULT 0,
    `attributed_conversions30d`   FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered1d`  FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered7d`  FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered14d` FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered30d` FLOAT        NULL DEFAULT 0,
    `attributed_sales1d`          FLOAT        NULL DEFAULT 0,
    `attributed_sales7d`          FLOAT        NULL DEFAULT 0,
    `attributed_sales14d`         FLOAT        NULL DEFAULT 0,
    `attributed_sales30d`         FLOAT        NULL DEFAULT 0,
    `marketplace_id`              VARCHAR(100) NULL,
    `marketplace`                 VARCHAR(100) NULL,
    `profile_id`                  VARCHAR(255) NULL,
    `created_at`                  BIGINT       NULL,
    `updated_at`                  BIGINT       NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `advertising_display_ad_group_report`
(
    `id`                                  INTEGER      NOT NULL AUTO_INCREMENT,
    `system_event_process_id`             INTEGER      NULL,
    `brand_id`                            INTEGER      NULL,
    `report_date`                         DATE         NULL,
    `tactic_name`                         VARCHAR(100) NULL,
    `tactic_type`                         VARCHAR(100) NULL,
    `campaign_name`                       VARCHAR(255) NULL,
    `campaign_id`                         VARCHAR(255) NULL,
    `group_id`                            VARCHAR(255) NULL,
    `group_name`                          VARCHAR(255) NULL,
    `impressions`                         INTEGER      NULL,
    `clicks`                              INTEGER      NULL,
    `cost`                                FLOAT        NULL DEFAULT 0,
    `attributed_conversions1d`            FLOAT        NULL DEFAULT 0,
    `attributed_conversions7d`            FLOAT        NULL DEFAULT 0,
    `attributed_conversions14d`           FLOAT        NULL DEFAULT 0,
    `attributed_conversions30d`           FLOAT        NULL DEFAULT 0,
    `attributed_conversions_1d_same_sku`  FLOAT        NULL DEFAULT 0,
    `attributed_conversions_7d_same_sku`  FLOAT        NULL DEFAULT 0,
    `attributed_conversions_14d_same_sku` FLOAT        NULL DEFAULT 0,
    `attributed_conversions_30d_same_sku` FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered1d`          FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered7d`          FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered14d`         FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered30d`         FLOAT        NULL DEFAULT 0,
    `attributed_sales1d`                  FLOAT        NULL DEFAULT 0,
    `attributed_sales7d`                  FLOAT        NULL DEFAULT 0,
    `attributed_sales14d`                 FLOAT        NULL DEFAULT 0,
    `attributed_sales30d`                 FLOAT        NULL DEFAULT 0,
    `attributed_sales_1d_same_sku`        FLOAT        NULL DEFAULT 0,
    `attributed_sales_7d_same_sku`        FLOAT        NULL DEFAULT 0,
    `attributed_sales_14d_same_sku`       FLOAT        NULL DEFAULT 0,
    `attributed_sales_30d_same_sku`       FLOAT        NULL DEFAULT 0,
    `marketplace_id`                      VARCHAR(100) NULL,
    `marketplace`                         VARCHAR(100) NULL,
    `profile_id`                          VARCHAR(255) NULL,
    `created_at`                          BIGINT       NULL,
    `updated_at`                          BIGINT       NULL,
    INDEX `idx-advertising_display_ad_group_report-brand_id` (`brand_id`),
    INDEX `idx-advertising_display_ad_group_report-campaign_id` (`campaign_id`),
    INDEX `idx-advertising_display_ad_group_report-campaign_name` (`campaign_name`),
    INDEX `idx-advertising_display_ad_group_report-report_date` (`report_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `advertising_display_asins_report`
(
    `id`                                    INTEGER      NOT NULL AUTO_INCREMENT,
    `system_event_process_id`               INTEGER      NULL,
    `brand_id`                              INTEGER      NULL,
    `report_date`                           DATE         NULL,
    `tactic_name`                           VARCHAR(100) NULL,
    `tactic_type`                           VARCHAR(100) NULL,
    `campaign_name`                         VARCHAR(255) NULL,
    `campaign_id`                           VARCHAR(255) NULL,
    `group_id`                              VARCHAR(255) NULL,
    `group_name`                            VARCHAR(255) NULL,
    `currency`                              VARCHAR(50)  NULL,
    `asin`                                  VARCHAR(100) NULL,
    `other_asin`                            VARCHAR(100) NULL,
    `sku`                                   VARCHAR(100) NULL,
    `attributed_units_ordered1d_other_sku`  FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered7d_other_sku`  FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered14d_other_sku` FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered30d_other_sku` FLOAT        NULL DEFAULT 0,
    `attributed_sales1d_other_sku`          FLOAT        NULL DEFAULT 0,
    `attributed_sales7d_other_sku`          FLOAT        NULL DEFAULT 0,
    `attributed_sales14d_other_sku`         FLOAT        NULL DEFAULT 0,
    `attributed_sales30d_other_sku`         FLOAT        NULL DEFAULT 0,
    `marketplace_id`                        VARCHAR(100) NULL,
    `marketplace`                           VARCHAR(100) NULL,
    `profile_id`                            VARCHAR(255) NULL,
    `created_at`                            BIGINT       NULL,
    `updated_at`                            BIGINT       NULL,
    INDEX `idx-advertising_display_asins_report-brand_id` (`brand_id`),
    INDEX `idx-advertising_display_asins_report-campaign_id` (`campaign_id`),
    INDEX `idx-advertising_display_asins_report-campaign_name` (`campaign_name`),
    INDEX `idx-advertising_display_asins_report-report_date` (`report_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `advertising_display_campaigns_report`
(
    `id`                                  INTEGER      NOT NULL AUTO_INCREMENT,
    `system_event_process_id`             INTEGER      NULL,
    `brand_id`                            INTEGER      NULL,
    `report_date`                         DATE         NULL,
    `tactic_name`                         VARCHAR(100) NULL,
    `tactic_type`                         VARCHAR(100) NULL,
    `campaign_name`                       VARCHAR(255) NULL,
    `campaign_id`                         VARCHAR(255) NULL,
    `campaign_status`                     VARCHAR(50)  NULL,
    `currency`                            VARCHAR(50)  NULL,
    `impressions`                         INTEGER      NULL,
    `clicks`                              INTEGER      NULL,
    `cost`                                FLOAT        NULL DEFAULT 0,
    `attributed_conversions1d`            FLOAT        NULL DEFAULT 0,
    `attributed_conversions7d`            FLOAT        NULL DEFAULT 0,
    `attributed_conversions14d`           FLOAT        NULL DEFAULT 0,
    `attributed_conversions30d`           FLOAT        NULL DEFAULT 0,
    `attributed_conversions_1d_same_sku`  FLOAT        NULL DEFAULT 0,
    `attributed_conversions_7d_same_sku`  FLOAT        NULL DEFAULT 0,
    `attributed_conversions_14d_same_sku` FLOAT        NULL DEFAULT 0,
    `attributed_conversions_30d_same_sku` FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered1d`          FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered7d`          FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered14d`         FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered30d`         FLOAT        NULL DEFAULT 0,
    `attributed_sales1d`                  FLOAT        NULL DEFAULT 0,
    `attributed_sales7d`                  FLOAT        NULL DEFAULT 0,
    `attributed_sales14d`                 FLOAT        NULL DEFAULT 0,
    `attributed_sales30d`                 FLOAT        NULL DEFAULT 0,
    `attributed_sales_1d_same_sku`        FLOAT        NULL DEFAULT 0,
    `attributed_sales_7d_same_sku`        FLOAT        NULL DEFAULT 0,
    `attributed_sales_14d_same_sku`       FLOAT        NULL DEFAULT 0,
    `attributed_sales_30d_same_sku`       FLOAT        NULL DEFAULT 0,
    `marketplace_id`                      VARCHAR(100) NULL,
    `marketplace`                         VARCHAR(100) NULL,
    `profile_id`                          VARCHAR(255) NULL,
    `created_at`                          BIGINT       NULL,
    `updated_at`                          BIGINT       NULL,
    `branded_non_branded_status`          VARCHAR(50)  NULL,
    INDEX `idx-advertising_display_campaigns_report-brand_id` (`brand_id`),
    INDEX `idx-advertising_display_campaigns_report-campaign_id` (`campaign_id`),
    INDEX `idx-advertising_display_campaigns_report-campaign_name` (`campaign_name`),
    INDEX `idx-advertising_display_campaigns_report-report_date` (`report_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `advertising_display_product_report`
(
    `id`                                  INTEGER      NOT NULL AUTO_INCREMENT,
    `system_event_process_id`             INTEGER      NULL,
    `brand_id`                            INTEGER      NULL,
    `report_date`                         DATE         NULL,
    `tactic_name`                         VARCHAR(100) NULL,
    `tactic_type`                         VARCHAR(100) NULL,
    `campaign_name`                       VARCHAR(255) NULL,
    `campaign_id`                         VARCHAR(255) NULL,
    `group_id`                            VARCHAR(255) NULL,
    `group_name`                          VARCHAR(255) NULL,
    `ad_id`                               VARCHAR(255) NULL,
    `currency`                            VARCHAR(50)  NULL,
    `sku`                                 VARCHAR(100) NULL,
    `asin`                                VARCHAR(100) NULL,
    `impressions`                         INTEGER      NULL,
    `clicks`                              INTEGER      NULL,
    `cost`                                FLOAT        NULL DEFAULT 0,
    `attributed_conversions1d`            FLOAT        NULL DEFAULT 0,
    `attributed_conversions7d`            FLOAT        NULL DEFAULT 0,
    `attributed_conversions14d`           FLOAT        NULL DEFAULT 0,
    `attributed_conversions30d`           FLOAT        NULL DEFAULT 0,
    `attributed_conversions_1d_same_sku`  FLOAT        NULL DEFAULT 0,
    `attributed_conversions_7d_same_sku`  FLOAT        NULL DEFAULT 0,
    `attributed_conversions_14d_same_sku` FLOAT        NULL DEFAULT 0,
    `attributed_conversions_30d_same_sku` FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered1d`          FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered7d`          FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered14d`         FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered30d`         FLOAT        NULL DEFAULT 0,
    `attributed_sales1d`                  FLOAT        NULL DEFAULT 0,
    `attributed_sales7d`                  FLOAT        NULL DEFAULT 0,
    `attributed_sales14d`                 FLOAT        NULL DEFAULT 0,
    `attributed_sales30d`                 FLOAT        NULL DEFAULT 0,
    `attributed_sales_1d_same_sku`        FLOAT        NULL DEFAULT 0,
    `attributed_sales_7d_same_sku`        FLOAT        NULL DEFAULT 0,
    `attributed_sales_14d_same_sku`       FLOAT        NULL DEFAULT 0,
    `attributed_sales_30d_same_sku`       FLOAT        NULL DEFAULT 0,
    `marketplace_id`                      VARCHAR(100) NULL,
    `marketplace`                         VARCHAR(100) NULL,
    `profile_id`                          VARCHAR(255) NULL,
    `created_at`                          BIGINT       NULL,
    `updated_at`                          BIGINT       NULL,
    INDEX `idx-advertising_display_product_report-brand_id` (`brand_id`),
    INDEX `idx-advertising_display_product_report-campaign_id` (`campaign_id`),
    INDEX `idx-advertising_display_product_report-campaign_name` (`campaign_name`),
    INDEX `idx-advertising_display_product_report-report_date` (`report_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `advertising_display_targets_report`
(
    `id`                                  INTEGER      NOT NULL AUTO_INCREMENT,
    `system_event_process_id`             INTEGER      NULL,
    `brand_id`                            INTEGER      NULL,
    `report_date`                         DATE         NULL,
    `tactic_name`                         VARCHAR(100) NULL,
    `tactic_type`                         VARCHAR(100) NULL,
    `campaign_name`                       VARCHAR(255) NULL,
    `campaign_id`                         VARCHAR(255) NULL,
    `target_id`                           VARCHAR(255) NULL,
    `targeting_expression`                VARCHAR(255) NULL,
    `targeting_text`                      VARCHAR(255) NULL,
    `targeting_type`                      VARCHAR(255) NULL,
    `impressions`                         INTEGER      NULL,
    `clicks`                              INTEGER      NULL,
    `cost`                                FLOAT        NULL DEFAULT 0,
    `attributed_conversions1d`            FLOAT        NULL DEFAULT 0,
    `attributed_conversions7d`            FLOAT        NULL DEFAULT 0,
    `attributed_conversions14d`           FLOAT        NULL DEFAULT 0,
    `attributed_conversions30d`           FLOAT        NULL DEFAULT 0,
    `attributed_conversions_1d_same_sku`  FLOAT        NULL DEFAULT 0,
    `attributed_conversions_7d_same_sku`  FLOAT        NULL DEFAULT 0,
    `attributed_conversions_14d_same_sku` FLOAT        NULL DEFAULT 0,
    `attributed_conversions_30d_same_sku` FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered1d`          FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered7d`          FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered14d`         FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered30d`         FLOAT        NULL DEFAULT 0,
    `attributed_sales1d`                  FLOAT        NULL DEFAULT 0,
    `attributed_sales7d`                  FLOAT        NULL DEFAULT 0,
    `attributed_sales14d`                 FLOAT        NULL DEFAULT 0,
    `attributed_sales30d`                 FLOAT        NULL DEFAULT 0,
    `attributed_sales_1d_same_sku`        FLOAT        NULL DEFAULT 0,
    `attributed_sales_7d_same_sku`        FLOAT        NULL DEFAULT 0,
    `attributed_sales_14d_same_sku`       FLOAT        NULL DEFAULT 0,
    `attributed_sales_30d_same_sku`       FLOAT        NULL DEFAULT 0,
    `marketplace_id`                      VARCHAR(100) NULL,
    `marketplace`                         VARCHAR(100) NULL,
    `profile_id`                          VARCHAR(255) NULL,
    `created_at`                          BIGINT       NULL,
    `updated_at`                          BIGINT       NULL,
    INDEX `idx-advertising_display_targets_report-brand_id` (`brand_id`),
    INDEX `idx-advertising_display_targets_report-campaign_id` (`campaign_id`),
    INDEX `idx-advertising_display_targets_report-campaign_name` (`campaign_name`),
    INDEX `idx-advertising_display_targets_report-report_date` (`report_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `advertising_keywords_report`
(
    `id`                          INTEGER      NOT NULL AUTO_INCREMENT,
    `system_event_process_id`     INTEGER      NULL,
    `brand_id`                    INTEGER      NULL,
    `report_date`                 DATE         NULL,
    `campaign_name`               VARCHAR(255) NULL,
    `campaign_id`                 VARCHAR(255) NULL,
    `group_id`                    VARCHAR(255) NULL,
    `group_name`                  VARCHAR(255) NULL,
    `keyword_id`                  VARCHAR(255) NULL,
    `keyword_text`                VARCHAR(255) NULL,
    `match_type`                  VARCHAR(100) NULL,
    `impressions`                 INTEGER      NULL,
    `clicks`                      INTEGER      NULL,
    `cost`                        FLOAT        NULL DEFAULT 0,
    `attributed_conversions1d`    FLOAT        NULL DEFAULT 0,
    `attributed_conversions7d`    FLOAT        NULL DEFAULT 0,
    `attributed_conversions14d`   FLOAT        NULL DEFAULT 0,
    `attributed_conversions30d`   FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered1d`  FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered7d`  FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered14d` FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered30d` FLOAT        NULL DEFAULT 0,
    `attributed_sales1d`          FLOAT        NULL DEFAULT 0,
    `attributed_sales7d`          FLOAT        NULL DEFAULT 0,
    `attributed_sales14d`         FLOAT        NULL DEFAULT 0,
    `attributed_sales30d`         FLOAT        NULL DEFAULT 0,
    `marketplace_id`              VARCHAR(100) NULL,
    `marketplace`                 VARCHAR(100) NULL,
    `profile_id`                  VARCHAR(255) NULL,
    `created_at`                  BIGINT       NULL,
    `updated_at`                  BIGINT       NULL,
    INDEX `idx-advertising_keywords_report-brand_id` (`brand_id`),
    INDEX `idx-advertising_keywords_report-campaign_id` (`campaign_id`),
    INDEX `idx-advertising_keywords_report-campaign_name` (`campaign_name`),
    INDEX `idx-advertising_keywords_report-report_date` (`report_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `advertising_product_asin_report`
(
    `id`                                     INTEGER      NOT NULL AUTO_INCREMENT,
    `system_event_process_id`                INTEGER      NULL,
    `brand_id`                               INTEGER      NULL,
    `report_date`                            DATE         NULL,
    `campaign_name`                          VARCHAR(255) NULL,
    `campaign_id`                            VARCHAR(255) NULL,
    `target_id`                              VARCHAR(255) NULL,
    `targeting_text`                         VARCHAR(255) NULL,
    `targeting_type`                         VARCHAR(100) NULL,
    `ad_group_name`                          VARCHAR(255) NULL,
    `ad_group_id`                            VARCHAR(255) NULL,
    `currency`                               VARCHAR(100) NULL,
    `asin`                                   VARCHAR(100) NULL,
    `match_type`                             VARCHAR(100) NULL,
    `sku`                                    VARCHAR(100) NULL,
    `other_asin`                             VARCHAR(100) NULL,
    `attributed_units_ordered_1d`            INTEGER      NULL DEFAULT 0,
    `attributed_units_ordered_7d`            INTEGER      NULL DEFAULT 0,
    `attributed_units_ordered_14d`           INTEGER      NULL DEFAULT 0,
    `attributed_units_ordered_30d`           INTEGER      NULL DEFAULT 0,
    `attributed_units_ordered_1d_other_sku`  INTEGER      NULL DEFAULT 0,
    `attributed_units_ordered_7d_other_sku`  INTEGER      NULL DEFAULT 0,
    `attributed_units_ordered_14d_other_sku` INTEGER      NULL DEFAULT 0,
    `attributed_units_ordered_30d_other_sku` INTEGER      NULL DEFAULT 0,
    `attributed_sales_1d_other_sku`          FLOAT        NULL DEFAULT 0,
    `attributed_sales_7d_other_sku`          FLOAT        NULL DEFAULT 0,
    `attributed_sales_14d_other_sku`         FLOAT        NULL DEFAULT 0,
    `attributed_sales_30d_other_sku`         FLOAT        NULL DEFAULT 0,
    `marketplace_id`                         VARCHAR(100) NULL,
    `marketplace`                            VARCHAR(100) NULL,
    `profile_id`                             VARCHAR(255) NULL,
    `created_at`                             BIGINT       NULL,
    `updated_at`                             BIGINT       NULL,
    INDEX `idx-advertising_product_asin_report-brand_id` (`brand_id`),
    INDEX `idx-advertising_product_asin_report-campaign_id` (`campaign_id`),
    INDEX `idx-advertising_product_asin_report-campaign_name` (`campaign_name`),
    INDEX `idx-advertising_product_asin_report-report_date` (`report_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `advertising_product_report`
(
    `id`                          INTEGER      NOT NULL AUTO_INCREMENT,
    `system_event_process_id`     INTEGER      NULL,
    `brand_id`                    INTEGER      NULL,
    `report_date`                 DATE         NULL,
    `campaign_name`               VARCHAR(255) NULL,
    `campaign_id`                 VARCHAR(255) NULL,
    `group_id`                    VARCHAR(255) NULL,
    `group_name`                  VARCHAR(255) NULL,
    `sku`                         VARCHAR(100) NULL,
    `asin`                        VARCHAR(100) NULL,
    `category`                    VARCHAR(100) NULL,
    `impressions`                 INTEGER      NULL,
    `clicks`                      INTEGER      NULL,
    `cost`                        FLOAT        NULL DEFAULT 0,
    `currency`                    VARCHAR(50)  NULL,
    `attributed_conversions1d`    FLOAT        NULL DEFAULT 0,
    `attributed_conversions7d`    FLOAT        NULL DEFAULT 0,
    `attributed_conversions14d`   FLOAT        NULL DEFAULT 0,
    `attributed_conversions30d`   FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered1d`  FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered7d`  FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered14d` FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered30d` FLOAT        NULL DEFAULT 0,
    `attributed_sales1d`          FLOAT        NULL DEFAULT 0,
    `attributed_sales7d`          FLOAT        NULL DEFAULT 0,
    `attributed_sales14d`         FLOAT        NULL DEFAULT 0,
    `attributed_sales30d`         FLOAT        NULL DEFAULT 0,
    `ad_id`                       VARCHAR(100) NULL,
    `marketplace_id`              VARCHAR(100) NULL,
    `marketplace`                 VARCHAR(100) NULL,
    `profile_id`                  VARCHAR(255) NULL,
    `created_at`                  BIGINT       NULL,
    `updated_at`                  BIGINT       NULL,
    `branded_non_branded_status`  VARCHAR(50)  NULL,
    `yearweek_year`               INT          NULL,
    `yearweek_week`               INT          NULL,
    `yearmonth_year`              INT          NULL,
    `yearmonth_month`             INT          NULL,
    INDEX `idx-advertising_product_report-brand_id` (`brand_id`),
    INDEX `idx-advertising_product_report-campaign_id` (`campaign_id`),
    INDEX `idx-advertising_product_report-campaign_name` (`campaign_name`),
    INDEX `idx-advertising_product_report-report_date` (`report_date`),
    INDEX `advertising_product_report_yearweek_year_yearweek_week_index` (`yearweek_year` desc, `yearweek_week` desc),
    INDEX `advertising_product_report_yearmonth_year_yearmonth_month_index` (`yearmonth_year` desc, `yearmonth_month` desc),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `advertising_revenue_data`
(
    `id`                 INTEGER      NOT NULL AUTO_INCREMENT,
    `date`               VARCHAR(50)  NULL,
    `year`               VARCHAR(10)  NULL,
    `week`               VARCHAR(10)  NULL,
    `week_name`          VARCHAR(20)  NULL,
    `month`              VARCHAR(10)  NULL,
    `month_year_name`    VARCHAR(20)  NULL,
    `spend`              FLOAT        NULL DEFAULT 0,
    `ad_revenue`         FLOAT        NULL DEFAULT 0,
    `organic_sales`      FLOAT        NULL DEFAULT 0,
    `total_sales`        FLOAT        NULL DEFAULT 0,
    `impression`         BIGINT       NULL,
    `clicks`             BIGINT       NULL,
    `total_units_orders` BIGINT       NULL,
    `branded_spend`      FLOAT        NULL DEFAULT 0,
    `branded_sales`      FLOAT        NULL DEFAULT 0,
    `non_branded_spend`  FLOAT        NULL DEFAULT 0,
    `non_branded_sales`  FLOAT        NULL DEFAULT 0,
    `dsp_spend`          FLOAT        NULL DEFAULT 0,
    `dsp_sales`          FLOAT        NULL DEFAULT 0,
    `sync_type`          VARCHAR(255) NULL,
    `created_at`         BIGINT       NULL,
    `updated_at`         BIGINT       NULL,
    `deleted_at`         BIGINT       NULL,
    `deleted_by`         INTEGER      NULL,
    `status`             INTEGER      NULL DEFAULT 0,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `advertising_search_term_report`
(
    `id`                          INTEGER      NOT NULL AUTO_INCREMENT,
    `system_event_process_id`     INTEGER      NULL,
    `brand_id`                    INTEGER      NULL,
    `report_date`                 DATE         NULL,
    `campaign_name`               VARCHAR(255) NULL,
    `campaign_id`                 VARCHAR(255) NULL,
    `group_id`                    VARCHAR(255) NULL,
    `group_name`                  VARCHAR(255) NULL,
    `keyword_id`                  VARCHAR(255) NULL,
    `keyword_text`                VARCHAR(255) NULL,
    `match_type`                  VARCHAR(100) NULL,
    `search_query`                VARCHAR(255) NULL,
    `impressions`                 INTEGER      NULL,
    `clicks`                      INTEGER      NULL,
    `cost`                        FLOAT        NULL DEFAULT 0,
    `attributed_conversions1d`    FLOAT        NULL DEFAULT 0,
    `attributed_conversions7d`    FLOAT        NULL DEFAULT 0,
    `attributed_conversions14d`   FLOAT        NULL DEFAULT 0,
    `attributed_conversions30d`   FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered1d`  FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered7d`  FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered14d` FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered30d` FLOAT        NULL DEFAULT 0,
    `attributed_sales1d`          FLOAT        NULL DEFAULT 0,
    `attributed_sales7d`          FLOAT        NULL DEFAULT 0,
    `attributed_sales14d`         FLOAT        NULL DEFAULT 0,
    `attributed_sales30d`         FLOAT        NULL DEFAULT 0,
    `marketplace_id`              VARCHAR(100) NULL,
    `marketplace`                 VARCHAR(100) NULL,
    `profile_id`                  VARCHAR(255) NULL,
    `created_at`                  BIGINT       NULL,
    `updated_at`                  BIGINT       NULL,
    INDEX `idx-advertising_search_term_report-brand_id` (`brand_id`),
    INDEX `idx-advertising_search_term_report-campaign_id` (`campaign_id`),
    INDEX `idx-advertising_search_term_report-campaign_name` (`campaign_name`),
    INDEX `idx-advertising_search_term_report-report_date` (`report_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `advertising_targets_report`
(
    `id`                          INTEGER      NOT NULL AUTO_INCREMENT,
    `system_event_process_id`     INTEGER      NULL,
    `brand_id`                    INTEGER      NULL,
    `report_date`                 DATE         NULL,
    `campaign_name`               VARCHAR(255) NULL,
    `campaign_id`                 VARCHAR(255) NULL,
    `group_id`                    VARCHAR(255) NULL,
    `group_name`                  VARCHAR(255) NULL,
    `target_id`                   VARCHAR(255) NULL,
    `targeting_expression`        VARCHAR(255) NULL,
    `targeting_text`              VARCHAR(255) NULL,
    `targeting_type`              VARCHAR(255) NULL,
    `search_query`                VARCHAR(255) NULL,
    `impressions`                 INTEGER      NULL,
    `clicks`                      INTEGER      NULL,
    `cost`                        FLOAT        NULL DEFAULT 0,
    `attributed_conversions1d`    FLOAT        NULL DEFAULT 0,
    `attributed_conversions7d`    FLOAT        NULL DEFAULT 0,
    `attributed_conversions14d`   FLOAT        NULL DEFAULT 0,
    `attributed_conversions30d`   FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered1d`  FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered7d`  FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered14d` FLOAT        NULL DEFAULT 0,
    `attributed_units_ordered30d` FLOAT        NULL DEFAULT 0,
    `attributed_sales1d`          FLOAT        NULL DEFAULT 0,
    `attributed_sales7d`          FLOAT        NULL DEFAULT 0,
    `attributed_sales14d`         FLOAT        NULL DEFAULT 0,
    `attributed_sales30d`         FLOAT        NULL DEFAULT 0,
    `marketplace_id`              VARCHAR(100) NULL,
    `marketplace`                 VARCHAR(100) NULL,
    `profile_id`                  VARCHAR(255) NULL,
    `created_at`                  BIGINT       NULL,
    `updated_at`                  BIGINT       NULL,
    INDEX `idx-advertising_targets_report-brand_id` (`brand_id`),
    INDEX `idx-advertising_targets_report-campaign_id` (`campaign_id`),
    INDEX `idx-advertising_targets_report-campaign_name` (`campaign_name`),
    INDEX `idx-advertising_targets_report-report_date` (`report_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `asin_business_report`
(
    `astr_id`                          BIGINT       NOT NULL AUTO_INCREMENT,
    `astr_date`                        DATE         NULL,
    `astr_parent_asin`                 VARCHAR(100) NULL,
    `astr_child_asin`                  VARCHAR(100) NULL,
    `category`                         VARCHAR(100) NULL,
    `astr_tilte`                       TEXT         NULL,
    `astr_listing_sku`                 VARCHAR(255) NULL,
    `astr_master_sku`                  VARCHAR(255) NULL,
    `astr_company_id`                  INTEGER      NULL,
    `astr_brand_id`                    INTEGER      NULL,
    `astr_sessions`                    BIGINT       NULL,
    `astr_session_percentage`          FLOAT        NULL,
    `astr_page_views`                  BIGINT       NULL,
    `astr_page_view_percentage`        FLOAT        NULL,
    `astr_buy_box_percentage`          FLOAT        NULL,
    `astr_units_ordered`               INTEGER      NULL,
    `astr_units_ordered_b2b`           INTEGER      NULL,
    `unit_session_percentage`          FLOAT        NULL,
    `unit_session_percentage_b2b`      FLOAT        NULL,
    `ordered_product_sales`            FLOAT        NULL,
    `ordered_product_sales_b2b`        FLOAT        NULL,
    `total_order_items`                INTEGER      NULL,
    `total_order_items_b2b`            INTEGER      NULL,
    `browser_sessions`                 BIGINT       NULL,
    `mobile_app_sessions`              BIGINT       NULL,
    `browser_session_percentage`       FLOAT        NULL,
    `mobile_app_session_percentage`    FLOAT        NULL,
    `browser_page_views`               BIGINT       NULL,
    `mobile_app_page_views`            BIGINT       NULL,
    `browser_page_views_percentage`    FLOAT        NULL,
    `mobile_app_page_views_percentage` FLOAT        NULL,
    `report_name`                      VARCHAR(100) NULL,
    `marketplace_id`                   VARCHAR(100) NULL,
    `created_at`                       BIGINT       NULL,
    `updated_at`                       BIGINT       NULL,
    `created_by`                       INTEGER      NULL,
    `updated_by`                       INTEGER      NULL,
    `data_last_updated_date`           DATE         NULL,
    `astr_year`                        YEAR         NULL,
    `astr_month`                       INTEGER      NULL,
    `astr_week`                        INTEGER      NULL,
    INDEX `astr_brand_id` (`astr_brand_id`),
    INDEX `astr_date` (`astr_date`),
    INDEX `astr_listing_sku` (`astr_listing_sku`),
    INDEX `astr_month` (`astr_month`),
    INDEX `astr_week` (`astr_week`),
    INDEX `astr_year` (`astr_year`),
    PRIMARY KEY (`astr_id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `brand`
(
    `id`         INTEGER      NOT NULL AUTO_INCREMENT,
    `name`       VARCHAR(255) NOT NULL,
    `slug`       VARCHAR(255) NULL,
    `note`       VARCHAR(255) NULL,
    `created_at` BIGINT       NULL,
    `updated_at` BIGINT       NULL,
    `deleted_at` BIGINT       NULL,
    `deleted_by` INTEGER      NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `categories`
(
    `id`         INTEGER      NOT NULL AUTO_INCREMENT,
    `name`       VARCHAR(150) NULL,
    `code`       VARCHAR(100) NULL,
    `created_at` BIGINT       NULL,
    `updated_at` BIGINT       NULL,
    `deleted_at` BIGINT       NULL,
    `deleted_by` INTEGER      NULL,
    `status`     INTEGER      NULL DEFAULT 0,
    `parent_id`  INTEGER      NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `category_product_data`
(
    `id`             INTEGER      NOT NULL AUTO_INCREMENT,
    `category`       VARCHAR(150) NULL,
    `asin`           VARCHAR(100) NULL,
    `sku`            VARCHAR(100) NULL,
    `product_title`  VARCHAR(250) NULL,
    `product_status` VARCHAR(50)  NULL,
    `created_at`     BIGINT       NULL,
    `updated_at`     BIGINT       NULL,
    `deleted_at`     BIGINT       NULL,
    `deleted_by`     INTEGER      NULL,
    `status`         INTEGER      NULL DEFAULT 0,
    `category_id`    INTEGER      NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `extension_business_report_data`
(
    `eosd_id`                        INTEGER      NOT NULL AUTO_INCREMENT,
    `ebrd_date`                      DATE         NULL,
    `eosd_type`                      VARCHAR(200) NULL,
    `eosd_extension_version`         VARCHAR(200) NULL,
    `eosd_user_id`                   INTEGER      NULL,
    `eosd_user_email`                VARCHAR(150) NULL,
    `eosd_data_escaped`              LONGTEXT     NULL,
    `eosd_data`                      LONGTEXT     NULL,
    `eosd_response_data`             LONGTEXT     NULL,
    `seller_name_verify`             VARCHAR(100) NULL,
    `seller_marketplace_name_verify` VARCHAR(50)  NULL,
    `marketplace_id`                 VARCHAR(100) NULL,
    `marketplace_name`               VARCHAR(100) NULL,
    `created_by`                     INTEGER      NULL,
    `updated_by`                     INTEGER      NULL,
    `created_at`                     BIGINT       NULL,
    `updated_at`                     BIGINT       NULL,
    `eosd_status`                    INTEGER      NOT NULL DEFAULT 0,
    PRIMARY KEY (`eosd_id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `fba_restock_data`
(
    `id`                                                  INTEGER      NOT NULL AUTO_INCREMENT,
    `system_event_process_id`                             INTEGER      NULL,
    `date`                                                DATE         NULL,
    `country`                                             VARCHAR(255) NULL,
    `product_name`                                        VARCHAR(255) NULL,
    `fnsku`                                               VARCHAR(30)  NULL,
    `merchant_sku`                                        VARCHAR(255) NULL,
    `asin`                                                VARCHAR(30)  NULL,
    `product_condition`                                   VARCHAR(255) NULL,
    `supplier`                                            VARCHAR(255) NULL,
    `supplier_part_no`                                    VARCHAR(255) NULL,
    `currency_code`                                       VARCHAR(20)  NULL,
    `price`                                               FLOAT        NULL DEFAULT 0,
    `sales_last_30_days`                                  FLOAT        NULL DEFAULT 0,
    `units_sold_last_30_days`                             INTEGER      NULL,
    `total_units`                                         INTEGER      NULL,
    `inbound_inventory`                                   INTEGER      NULL,
    `available_inventory`                                 INTEGER      NULL,
    `reserved_fc_transfer`                                INTEGER      NULL,
    `reserved_fc_processing`                              INTEGER      NULL,
    `reserved_customer_order`                             INTEGER      NULL,
    `unfulfillable`                                       INTEGER      NULL,
    `fulfilled_by`                                        VARCHAR(255) NULL,
    `days_of_supply`                                      VARCHAR(255) NULL,
    `instock_alert`                                       VARCHAR(255) NULL,
    `marketplace_id`                                      INTEGER      NULL,
    `marketplace`                                         INTEGER      NULL,
    `recommended_replenishment_qty`                       INTEGER      NULL,
    `recommended_ship_date`                               VARCHAR(255) NULL,
    `inventory_level_thresholds_published__current_month` VARCHAR(255) NULL,
    `current_month_very_low_inventory_threshold`          VARCHAR(255) NULL,
    `current_month_minimum_inventory_threshold`           VARCHAR(255) NULL,
    `current_month_maximum_inventory_threshold`           VARCHAR(255) NULL,
    `current_month_very_high_inventory_threshold`         VARCHAR(255) NULL,
    `inventory_level_thresholds_published__next_month`    VARCHAR(255) NULL,
    `next_month_very_low_inventory_threshold`             VARCHAR(255) NULL,
    `next_month_minimum_inventory_threshold`              VARCHAR(255) NULL,
    `next_month_maximum_inventory_threshold`              VARCHAR(255) NULL,
    `next_month_very_high_inventory_threshold`            VARCHAR(255) NULL,
    `utilization`                                         VARCHAR(255) NULL,
    `maximum_shipment_quantity`                           VARCHAR(255) NULL,
    `is_latest`                                           VARCHAR(255) NULL,
    `created_at`                                          BIGINT       NULL,
    `updated_at`                                          BIGINT       NULL,
    `deleted_at`                                          BIGINT       NULL,
    `deleted_by`                                          INTEGER      NULL,
    `status`                                              INTEGER      NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `get_reserved_inventory_data`
(
    `id`                      INTEGER      NOT NULL AUTO_INCREMENT,
    `ri_date`                 DATE         NULL,
    `system_event_process_id` INTEGER      NULL,
    `brand_id`                INTEGER      NULL,
    `sku`                     VARCHAR(100) NULL,
    `fnsku`                   VARCHAR(100) NULL,
    `asin`                    VARCHAR(100) NULL,
    `product_name`            TEXT         NULL,
    `reserved_qty`            INTEGER      NULL DEFAULT 0,
    `reserved_customerorders` INTEGER      NULL DEFAULT 0,
    `reserved_fc_transfers`   INTEGER      NULL DEFAULT 0,
    `reserved_fc_processing`  INTEGER      NULL DEFAULT 0,
    `marketplace_id`          VARCHAR(100) NULL,
    `marketplace`             VARCHAR(100) NULL,
    `created_at`              BIGINT       NULL,
    `updated_at`              BIGINT       NULL,
    `status`                  INTEGER      NULL DEFAULT 0,
    INDEX `idx-reserved_inventory-asin` (`asin`),
    INDEX `idx-reserved_inventory-brand_id` (`brand_id`),
    INDEX `idx-reserved_inventory-sku` (`sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `inventory_planning_stats`
(
    `id`                               INTEGER      NOT NULL AUTO_INCREMENT,
    `log_date`                         DATE         NULL,
    `brand_id`                         INTEGER      NULL,
    `brand`                            VARCHAR(255) NULL,
    `vendor_id`                        INTEGER      NULL,
    `vendor`                           VARCHAR(255) NULL,
    `sku`                              VARCHAR(255) NULL,
    `asin`                             VARCHAR(50)  NULL,
    `item_price`                       FLOAT        NULL,
    `moq`                              INTEGER      NULL,
    `product_name`                     TEXT         NULL,
    `total_sales`                      FLOAT        NULL,
    `total_units`                      INTEGER      NULL DEFAULT 0,
    `fnsku`                            VARCHAR(255) NULL,
    `mfn_fulfillable_quantity`         INTEGER      NULL DEFAULT 0,
    `afn_warehouse_quantity`           INTEGER      NULL DEFAULT 0,
    `afn_fulfillable_quantity`         INTEGER      NULL DEFAULT 0,
    `afn_unsellable_quantity`          INTEGER      NULL DEFAULT 0,
    `afn_reserved_quantity`            INTEGER      NULL DEFAULT 0,
    `afn_total_quantity`               INTEGER      NULL DEFAULT 0,
    `afn_inbound_working_quantity`     INTEGER      NULL DEFAULT 0,
    `afn_inbound_shipped_quantity`     INTEGER      NULL DEFAULT 0,
    `afn_inbound_receiving_quantity`   INTEGER      NULL DEFAULT 0,
    `afn_researching_quantity`         INTEGER      NULL DEFAULT 0,
    `afn_reserved_future_supply`       INTEGER      NULL DEFAULT 0,
    `afn_future_supply_buyable`        INTEGER      NULL DEFAULT 0,
    `reserved_qty`                     INTEGER      NULL DEFAULT 0,
    `reserved_customerorders`          INTEGER      NULL DEFAULT 0,
    `reserved_fc_transfers`            INTEGER      NULL DEFAULT 0,
    `reserved_fc_processing`           INTEGER      NULL DEFAULT 0,
    `lead_time`                        INTEGER      NULL,
    `days_of_stock`                    INTEGER      NULL,
    `stock_alert`                      VARCHAR(50)  NULL,
    `on_order`                         INTEGER      NULL,
    `in_transit_inventory`             INTEGER      NULL,
    `replenishment_quantity`           INTEGER      NULL DEFAULT 0,
    `days_of_supply_at_amz_fulfil_ctr` BIGINT       NULL DEFAULT 0,
    `day_7_units_sold`                 BIGINT       NULL DEFAULT 0,
    `day_30_units_sold`                BIGINT       NULL DEFAULT 0,
    `day_60_units_sold`                BIGINT       NULL DEFAULT 0,
    `day_90_units_sold`                BIGINT       NULL DEFAULT 0,
    `ytd_units_sold`                   BIGINT       NULL DEFAULT 0,
    `ytd_sales`                        FLOAT        NULL DEFAULT 0,
    `month_1_supply`                   BIGINT       NULL DEFAULT 0,
    `inventory_multiplier`             BIGINT       NULL DEFAULT 0,
    `unit_per_case`                    BIGINT       NULL DEFAULT 1,
    `is_inventory_multiplier_manual`   INTEGER      NULL DEFAULT 0,
    `is_unit_per_case_manual`          INTEGER      NULL DEFAULT 0,
    `case_recommended`                 BIGINT       NULL DEFAULT 0,
    `units_to_order`                   BIGINT       NULL DEFAULT 0,
    `created_at`                       BIGINT       NULL,
    `updated_at`                       BIGINT       NULL,
    `status`                           INTEGER      NULL DEFAULT 0,
    `stockoutdayscount`                INTEGER      NULL,
    INDEX `idx-inventory_planning_stats-asin` (`asin`),
    INDEX `idx-inventory_planning_stats-brand_id` (`brand_id`),
    INDEX `idx-inventory_planning_stats-sku` (`sku`),
    INDEX `idx-inventory_planning_stats-vendor_id` (`vendor_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `packing_templates_data`
(
    `id`               INTEGER      NOT NULL AUTO_INCREMENT,
    `name`             VARCHAR(150) NULL,
    `type`             VARCHAR(50)  NULL,
    `asin`             VARCHAR(100) NULL,
    `sku`              VARCHAR(100) NULL,
    `units_per_box`    INTEGER      NULL,
    `box_length`       FLOAT        NULL,
    `box_width`        FLOAT        NULL,
    `box_height`       FLOAT        NULL,
    `box_weight`       FLOAT        NULL,
    `who_preps_units`  VARCHAR(50)  NULL,
    `who_labels_units` VARCHAR(50)  NULL,
    `prep_category`    VARCHAR(100) NULL,
    `created_at`       BIGINT       NULL,
    `updated_at`       BIGINT       NULL,
    `deleted_at`       BIGINT       NULL,
    `deleted_by`       INTEGER      NULL,
    `status`           INTEGER      NULL DEFAULT 0,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `po_template`
(
    `id`         INTEGER      NOT NULL AUTO_INCREMENT,
    `name`       VARCHAR(255) NULL,
    `ship_from`  VARCHAR(255) NULL,
    `ship_to`    VARCHAR(255) NULL,
    `created_at` BIGINT       NULL,
    `updated_at` BIGINT       NULL,
    `status`     INTEGER      NULL DEFAULT 0,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `product_prep_category_and_labeling_data`
(
    `id`                                INTEGER      NOT NULL AUTO_INCREMENT,
    `sku`                               VARCHAR(50)  NULL,
    `asin`                              VARCHAR(50)  NULL,
    `prep_category`                     VARCHAR(100) NULL,
    `apply_to_selected_or_all_template` VARCHAR(50)  NULL,
    `selected_template`                 VARCHAR(150) NULL,
    `selected_template_id`              INTEGER      NULL,
    `who_prep_units`                    VARCHAR(50)  NULL,
    `who_labels_units`                  VARCHAR(50)  NULL,
    `created_at`                        BIGINT       NULL,
    `updated_at`                        BIGINT       NULL,
    `deleted_at`                        BIGINT       NULL,
    `deleted_by`                        INTEGER      NULL,
    `status`                            INTEGER      NULL DEFAULT 0,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `purchase_order`
(
    `id`             INTEGER     NOT NULL AUTO_INCREMENT,
    `vendor_id`      INTEGER     NULL,
    `po_template_id` INTEGER     NULL,
    `po_number`      VARCHAR(20) NULL,
    `expected_date`  DATE        NULL,
    `created_date`   DATE        NULL,
    `shipment_date`  DATE        NULL,
    `delivery_date`  DATE        NULL,
    `po_status`      VARCHAR(20) NULL,
    `asin_count`     INTEGER     NULL,
    `total_units`    INTEGER     NULL,
    `notes`          TEXT        NULL,
    `created_at`     BIGINT      NULL,
    `updated_at`     BIGINT      NULL,
    `status`         INTEGER     NULL DEFAULT 0,
    INDEX `idx-purchase_order-po_template_id` (`po_template_id`),
    INDEX `idx-purchase_order-vendor_id` (`vendor_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `purchase_order_items`
(
    `id`                INTEGER      NOT NULL AUTO_INCREMENT,
    `purchase_order_id` INTEGER      NULL,
    `sku`               VARCHAR(255) NULL,
    `asin`              VARCHAR(255) NULL,
    `item_price`        FLOAT        NULL,
    `replinishment_qty` INTEGER      NULL,
    `total_cost`        FLOAT        NULL,
    `created_at`        BIGINT       NULL,
    `updated_at`        BIGINT       NULL,
    INDEX `idx-purchase_order_items-purchase_order_id` (`purchase_order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `return_report_data`
(
    `id`                      INTEGER      NOT NULL AUTO_INCREMENT,
    `system_event_process_id` INTEGER      NULL,
    `brand_id`                INTEGER      NULL,
    `marketplace_id`          VARCHAR(100) NULL,
    `marketplace`             VARCHAR(100) NULL,
    `return_date`             VARCHAR(50)  NULL,
    `order_id`                VARCHAR(100) NULL,
    `sku`                     VARCHAR(100) NULL,
    `asin`                    VARCHAR(100) NULL,
    `fnsku`                   VARCHAR(100) NULL,
    `item_cog`                FLOAT        NULL DEFAULT 0,
    `refunded_amount`         FLOAT        NULL DEFAULT 0,
    `refunded_tax_amount`     FLOAT        NULL DEFAULT 0,
    `refunded_fba_fees`       FLOAT        NULL DEFAULT 0,
    `refunded_comission_fees` FLOAT        NULL DEFAULT 0,
    `product_name`            VARCHAR(255) NULL,
    `quantity`                INTEGER      NULL DEFAULT 0,
    `fulfillment_center_id`   VARCHAR(255) NULL,
    `detailed_disposition`    VARCHAR(255) NULL,
    `reason`                  VARCHAR(255) NULL,
    `status`                  VARCHAR(255) NULL,
    `license_plate_number`    VARCHAR(255) NULL,
    `customer_comments`       TEXT         NULL,
    `return_formated_date`    DATE         NULL,
    `is_refund_updated`       INTEGER      NULL DEFAULT 0,
    `created_at`              BIGINT       NULL,
    `updated_at`              BIGINT       NULL,
    INDEX `idx-return_report_data-brand_id` (`brand_id`),
    INDEX `idx-return_report_data-order_id` (`order_id`),
    INDEX `idx-return_report_data-return_date` (`return_date`),
    INDEX `idx-return_report_data-sku` (`sku`),
    INDEX `idx-return_report_data-system_event_process_id` (`system_event_process_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `shipment_item_boxes_data`
(
    `id`                       INTEGER      NOT NULL AUTO_INCREMENT,
    `shipment_packing_data_id` INTEGER      NULL,
    `shipment_id`              VARCHAR(100) NULL,
    `sku`                      VARCHAR(255) NULL,
    `box_weight`               INTEGER      NULL,
    `box_length`               INTEGER      NULL,
    `box_width`                INTEGER      NULL,
    `box_height`               INTEGER      NULL,
    `is_stacked`               TINYINT      NULL DEFAULT 0,
    `number_of_pallets`        INTEGER      NULL DEFAULT 0,
    `created_at`               BIGINT       NULL,
    `updated_at`               BIGINT       NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `shipment_items`
(
    `id`                      INTEGER      NOT NULL AUTO_INCREMENT,
    `shipment_id`             VARCHAR(255) NULL,
    `seller_sku`              VARCHAR(255) NULL,
    `fulfillment_network_sku` VARCHAR(255) NULL,
    `quantity_shipped`        INTEGER      NULL,
    `quantity_received`       INTEGER      NULL,
    `quantity_in_case`        INTEGER      NULL,
    `release_date`            DATE         NULL,
    `prep_instruction`        VARCHAR(255) NULL,
    `prep_owner`              VARCHAR(255) NULL,
    `marketplace_id`          VARCHAR(50)  NULL,
    `created_at`              BIGINT       NULL,
    `updated_at`              BIGINT       NULL,
    `shipment_status`         VARCHAR(20)  NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `shipment_packing_data`
(
    `id`              INTEGER      NOT NULL AUTO_INCREMENT,
    `shipment_id`     VARCHAR(100) NULL,
    `sku`             VARCHAR(255) NULL,
    `asin`            VARCHAR(100) NULL,
    `product_name`    VARCHAR(255) NULL,
    `quantity`        INTEGER      NULL,
    `number_of_boxes` INTEGER      NULL,
    `created_at`      BIGINT       NULL,
    `updated_at`      BIGINT       NULL,
    `deleted_at`      BIGINT       NULL,
    `deleted_by`      INTEGER      NULL,
    `status`          INTEGER      NULL DEFAULT 0,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `shipment_tracking_data`
(
    `id`             INTEGER      NOT NULL AUTO_INCREMENT,
    `shipment_id`    VARCHAR(100) NULL,
    `workflow_id`    VARCHAR(150) NULL,
    `box_label_id`   VARCHAR(50)  NULL,
    `tracking_id`    VARCHAR(50)  NULL,
    `box_status`     VARCHAR(20)  NULL,
    `weight`         FLOAT        NULL,
    `weight_unit`    VARCHAR(20)  NULL,
    `length`         FLOAT        NULL,
    `height`         FLOAT        NULL,
    `width`          FLOAT        NULL,
    `dimension_unit` VARCHAR(20)  NULL,
    `ship_date`      DATE         NULL,
    `created_at`     BIGINT       NULL,
    `updated_at`     BIGINT       NULL,
    `deleted_at`     BIGINT       NULL,
    `deleted_by`     INTEGER      NULL,
    `status`         INTEGER      NULL DEFAULT 0,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `shipment_transport_data`
(
    `id`                INTEGER      NOT NULL AUTO_INCREMENT,
    `shipment_id`       VARCHAR(100) NULL,
    `workflow_id`       VARCHAR(150) NULL,
    `transport_header`  TEXT         NULL,
    `transport_details` TEXT         NULL,
    `transport_result`  TEXT         NULL,
    `created_at`        BIGINT       NULL,
    `updated_at`        BIGINT       NULL,
    `deleted_at`        BIGINT       NULL,
    `deleted_by`        INTEGER      NULL,
    `status`            INTEGER      NULL DEFAULT 0,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
CREATE TABLE advertising_manual_report
(
    id              int auto_increment primary key,
    report_date     date          not null,
    currency        varchar(64)   null,
    campaign_name   varchar(1024) null,
    impressions     float         null,
    clicks          float         null,
    cost_per_click  float         null,
    spend           float         null,
    total_sales_7d  float         null,
    acos            float         null,
    roas            float         null,
    total_orders_7d float         null,
    total_units_7d  float         null,
    placement       varchar(256)  null
) COLLATE = utf8mb4_unicode_ci;
CREATE INDEX `idx-advertising_manual_report-report_date-index` on advertising_manual_report (report_date);
-- CreateTable
CREATE TABLE `shipments`
(
    `id`                                INTEGER      NOT NULL AUTO_INCREMENT,
    `shipment_id`                       VARCHAR(255) NULL,
    `shipment_name`                     VARCHAR(255) NULL,
    `address_name`                      VARCHAR(255) NULL,
    `address_line1`                     VARCHAR(255) NULL,
    `address_line2`                     VARCHAR(255) NULL,
    `district_or_county`                VARCHAR(100) NULL,
    `city`                              VARCHAR(100) NULL,
    `state_or_province_code`            VARCHAR(100) NULL,
    `country_code`                      VARCHAR(50)  NULL,
    `postal_code`                       VARCHAR(50)  NULL,
    `destination_fulfillment_center_id` VARCHAR(50)  NULL,
    `shipment_status`                   VARCHAR(50)  NULL,
    `label_prep_type`                   VARCHAR(50)  NULL,
    `are_cases_required`                INTEGER      NULL,
    `confirmed_need_by_date`            VARCHAR(50)  NULL,
    `box_contents_source`               VARCHAR(255) NULL,
    `estimated_box_contents_fee`        VARCHAR(50)  NULL,
    `marketplace_id`                    VARCHAR(50)  NULL,
    `created_at`                        BIGINT       NULL,
    `updated_at`                        BIGINT       NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `shipping_from_address`
(
    `id`             INTEGER      NOT NULL AUTO_INCREMENT,
    `name`           VARCHAR(100) NULL,
    `address_line_1` VARCHAR(100) NOT NULL,
    `address_line_2` VARCHAR(100) NULL,
    `city`           VARCHAR(100) NULL,
    `state`          VARCHAR(100) NULL,
    `country`        VARCHAR(20)  NULL,
    `address_type`   VARCHAR(20)  NULL,
    `zip_postal`     VARCHAR(15)  NULL,
    `created_at`     BIGINT       NULL,
    `updated_at`     BIGINT       NULL,
    `status`         BOOLEAN      NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `shipping_plan_data`
(
    `id`                                INTEGER      NOT NULL AUTO_INCREMENT,
    `shipping_from_address_id`          INTEGER      NULL,
    `shipment_name`                     VARCHAR(255) NULL,
    `shipment_status`                   VARCHAR(50)  NULL,
    `estimated_shipping_cost`           FLOAT        NULL,
    `amazon_reference_id`               VARCHAR(255) NULL,
    `ship_to_address`                   TEXT         NULL,
    `shipment_id`                       VARCHAR(100) NULL,
    `destination_fulfillment_center_id` VARCHAR(100) NULL,
    `label_prep_type`                   VARCHAR(50)  NULL,
    `items_data`                        TEXT         NULL,
    `estimated_box_contents_fee`        TEXT         NULL,
    `ship_date`                         DATE         NULL,
    `workflow_id`                       VARCHAR(200) NULL,
    `is_label_generated`                INTEGER      NULL,
    `is_workflow_shipment_created`      INTEGER      NULL,
    `is_done`                           INTEGER      NULL DEFAULT 0,
    `shipment_response`                 TEXT         NULL,
    `created_at`                        BIGINT       NULL,
    `updated_at`                        BIGINT       NULL,
    `deleted_at`                        BIGINT       NULL,
    `deleted_by`                        INTEGER      NULL,
    `status`                            INTEGER      NULL DEFAULT 0,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `shipping_service_data`
(
    `id`                 INTEGER      NOT NULL AUTO_INCREMENT,
    `shipment_id`        VARCHAR(100) NULL,
    `shipping_method`    VARCHAR(100) NULL,
    `shipping_carrier`   VARCHAR(100) NULL,
    `shipping_mode`      VARCHAR(100) NULL,
    `carrier`            VARCHAR(100) NULL,
    `tracking_number`    VARCHAR(255) NULL,
    `freight_ready_date` DATE         NULL,
    `freight_class`      VARCHAR(50)  NULL,
    `shipment_response`  TEXT         NULL,
    `created_at`         BIGINT       NULL,
    `updated_at`         BIGINT       NULL,
    `deleted_at`         BIGINT       NULL,
    `deleted_by`         INTEGER      NULL,
    `status`             INTEGER      NULL DEFAULT 0,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `user_credentials`
(
    `id`                 INTEGER      NOT NULL AUTO_INCREMENT,
    `app_id`             INTEGER      NULL,
    `app_type`           VARCHAR(100) NULL,
    `credential_type`    VARCHAR(100) NULL,
    `credential_details` TEXT         NULL,
    `marketplace`        VARCHAR(100) NULL,
    `marketplace_id`     VARCHAR(100) NULL,
    `status`             INTEGER      NULL DEFAULT 0,
    `created_at`         BIGINT       NULL,
    `updated_at`         BIGINT       NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `user_setting`
(
    `id`                           INTEGER NOT NULL AUTO_INCREMENT,
    `default_unit_per_case`        INTEGER NULL,
    `default_inventory_multiplier` INTEGER NULL DEFAULT 1,
    `created_at`                   BIGINT  NULL,
    `updated_at`                   BIGINT  NULL,
    `deleted_at`                   BIGINT  NULL,
    `deleted_by`                   INTEGER NULL,
    `status`                       INTEGER NULL DEFAULT 0,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `user_system_event_log`
(
    `id`                      INTEGER      NOT NULL AUTO_INCREMENT,
    `system_event_process_id` INTEGER      NULL,
    `event_name`              VARCHAR(255) NULL,
    `event_type`              VARCHAR(255) NULL,
    `error_code`              VARCHAR(50)  NULL,
    `error_message`           VARCHAR(255) NULL,
    `error_data`              TEXT         NULL,
    `ip_address`              VARCHAR(20)  NULL,
    `url`                     VARCHAR(255) NULL,
    `created_at`              BIGINT       NULL,
    `updated_at`              BIGINT       NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `vendors`
(
    `id`             INTEGER      NOT NULL AUTO_INCREMENT,
    `po_template_id` INTEGER      NULL,
    `name`           VARCHAR(150) NULL,
    `phone_number`   VARCHAR(20)  NULL,
    `lead_time`      INTEGER      NULL,
    `days_of_stock`  INTEGER      NULL,
    `created_at`     BIGINT       NULL,
    `updated_at`     BIGINT       NULL,
    `status`         INTEGER      NULL DEFAULT 0,
    INDEX `idx-vendors-po_template_id` (`po_template_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `monthly_sales_and_returning_buyers`
(
    `id`                           INTEGER        NOT NULL AUTO_INCREMENT,
    `month`                        INTEGER        NULL,
    `year`                         INTEGER        NULL,
    `subsequent_month`             INTEGER        NULL,
    `subsequent_year`              INTEGER        NULL,
    `returning_buyers`             INTEGER        NULL,
    `total_sales_returning_buyers` DECIMAL(15, 2) NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `monthly_unique_buyers`
(
    `id`                  INTEGER        NOT NULL AUTO_INCREMENT,
    `month`               INTEGER        NULL,
    `year`                INTEGER        NULL,
    `date`                DATETIME(3)    NULL,
    `unique_buyers`       INTEGER        NULL,
    `repeat_buyers`       INTEGER        NULL,
    `unique_buyers_sales` DECIMAL(15, 2) null,
    `repeat_buyers_sales` DECIMAL(15, 2) null,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER
      SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
-- view: Advertising Aggregated Manual Data
CREATE OR REPLACE VIEW ads_manual_aggregated AS
SELECT main.*, product.*, brand.*, display.*, non_branded.*, branded.*
FROM (SELECT amr.report_date                                    report_date,
             ROUND(SUM(amr.impressions))                        impression,
             ROUND(SUM(amr.clicks))                             clicks,
             ROUND(SUM(amr.total_units_7d))                     unit_ordered,
             ROUND(SUM(amr.total_sales_7d), 2)                  revenue,
             ROUND(SUM(amr.spend), 2)                           spend,
             ROUND(SUM(amr.acos), 2)                            ACoS,
             ROUND(SUM(amr.roas), 2)                            ROAS,
             ROUND(SUM(amr.cost_per_click), 2)                  CPC,
             ROUND(SUM(amr.acos) * 100, 2)                      ACoS_percentage,
             ROUND(SUM(amr.spend) / SUM(amr.total_units_7d), 2) CPO
      FROM advertising_manual_report amr
      GROUP BY report_date) as main
         LEFT JOIN (SELECT amr.report_date                                    product_report_date,
                           ROUND(SUM(amr.impressions))                        product_impression,
                           ROUND(SUM(amr.clicks))                             product_clicks,
                           ROUND(SUM(amr.total_units_7d))                     product_unit_ordered,
                           ROUND(SUM(amr.total_sales_7d), 2)                  product_revenue,
                           ROUND(SUM(amr.spend), 2)                           product_spend,
                           ROUND(SUM(amr.acos), 2)                            product_ACoS,
                           ROUND(SUM(amr.roas), 2)                            product_ROAS,
                           ROUND(SUM(amr.cost_per_click), 2)                  product_CPC,
                           ROUND(SUM(amr.acos) * 100, 2)                      product_ACoS_percentage,
                           ROUND(SUM(amr.spend) / SUM(amr.total_units_7d), 2) product_CPO
                    FROM advertising_manual_report amr
                    WHERE amr.campaign_name LIKE '%SP%'
                    GROUP BY product_report_date) as product ON main.report_date = product.product_report_date
         LEFT JOIN (SELECT amr.report_date                                    display_report_date,
                           ROUND(SUM(amr.impressions))                        display_impression,
                           ROUND(SUM(amr.clicks))                             display_clicks,
                           ROUND(SUM(amr.total_units_7d))                     display_unit_ordered,
                           ROUND(SUM(amr.total_sales_7d), 2)                  display_revenue,
                           ROUND(SUM(amr.spend), 2)                           display_spend,
                           ROUND(SUM(amr.acos), 2)                            display_ACoS,
                           ROUND(SUM(amr.roas), 2)                            display_ROAS,
                           ROUND(SUM(amr.cost_per_click), 2)                  display_CPC,
                           ROUND(SUM(amr.acos) * 100, 2)                      display_ACoS_percentage,
                           ROUND(SUM(amr.spend) / SUM(amr.total_units_7d), 2) display_CPO
                    FROM advertising_manual_report amr
                    WHERE amr.campaign_name LIKE '%SD%'
                    GROUP BY display_report_date) as display ON display.display_report_date = main.report_date
         LEFT JOIN (SELECT amr.report_date                                    brand_report_date,
                           ROUND(SUM(amr.impressions))                        brand_impression,
                           ROUND(SUM(amr.clicks))                             brand_clicks,
                           ROUND(SUM(amr.total_units_7d))                     brand_unit_ordered,
                           ROUND(SUM(amr.total_sales_7d), 2)                  brand_revenue,
                           ROUND(SUM(amr.spend), 2)                           brand_spend,
                           ROUND(SUM(amr.acos), 2)                            brand_ACoS,
                           ROUND(SUM(amr.roas), 2)                            brand_ROAS,
                           ROUND(SUM(amr.cost_per_click), 2)                  brand_CPC,
                           ROUND(SUM(amr.acos) * 100, 2)                      brand_ACoS_percentage,
                           ROUND(SUM(amr.spend) / SUM(amr.total_units_7d), 2) brand_CPO
                    FROM advertising_manual_report amr
                    WHERE amr.campaign_name LIKE '%SB%'
                    GROUP BY brand_report_date) as brand ON brand.brand_report_date = main.report_date
         LEFT JOIN (SELECT amr.report_date                                    `non_branded.report_date`,
                           ROUND(SUM(amr.impressions))                        non_branded_impression,
                           ROUND(SUM(amr.clicks))                             non_branded_clicks,
                           ROUND(SUM(amr.total_units_7d))                     non_branded_unit_ordered,
                           ROUND(SUM(amr.total_sales_7d), 2)                  non_branded_revenue,
                           ROUND(SUM(amr.spend), 2)                           non_branded_spend,
                           ROUND(SUM(amr.acos), 2)                            non_branded_ACoS,
                           ROUND(SUM(amr.roas), 2)                            non_branded_ROAS,
                           ROUND(SUM(amr.cost_per_click), 2)                  non_branded_CPC,
                           ROUND(SUM(amr.acos) * 100, 2)                      non_branded_ACoS_percentage,
                           ROUND(SUM(amr.spend) / SUM(amr.total_units_7d), 2) non_branded_CPO
                    FROM advertising_manual_report amr
                    WHERE amr.campaign_name LIKE '%NB%'
                    GROUP BY `non_branded.report_date`) as non_branded
                   ON non_branded.`non_branded.report_date` = main.report_date
         LEFT JOIN (SELECT amr.report_date                                    branded_report_date,
                           ROUND(SUM(amr.impressions))                        branded_impression,
                           ROUND(SUM(amr.clicks))                             branded_clicks,
                           ROUND(SUM(amr.total_units_7d))                     branded_unit_ordered,
                           ROUND(SUM(amr.total_sales_7d), 2)                  branded_revenue,
                           ROUND(SUM(amr.spend), 2)                           branded_spend,
                           ROUND(SUM(amr.acos), 2)                            branded_ACoS,
                           ROUND(SUM(amr.roas), 2)                            branded_ROAS,
                           ROUND(SUM(amr.cost_per_click), 2)                  branded_CPC,
                           ROUND(SUM(amr.acos) * 100, 2)                      branded_ACoS_percentage,
                           ROUND(SUM(amr.spend) / SUM(amr.total_units_7d), 2) branded_CPO
                    FROM advertising_manual_report amr
                    WHERE amr.campaign_name LIKE '%B%'
                    GROUP BY report_date) as branded ON branded.branded_report_date = main.report_date;