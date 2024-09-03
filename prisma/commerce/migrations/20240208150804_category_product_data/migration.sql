-- CreateTable
CREATE TABLE `categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NULL,
    `code` VARCHAR(100) NULL,
    `created_at` BIGINT NULL,
    `updated_at` BIGINT NULL,
    `deleted_at` BIGINT NULL,
    `deleted_by` INTEGER NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `parent_id` INTEGER NULL,
    `brandId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `category_product_data` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `category` VARCHAR(150) NULL,
    `asin` VARCHAR(100) NULL,
    `sku` VARCHAR(100) NULL,
    `product_title` VARCHAR(250) NULL,
    `product_status` VARCHAR(50) NULL,
    `created_at` BIGINT NULL,
    `updated_at` BIGINT NULL,
    `deleted_at` BIGINT NULL,
    `deleted_by` INTEGER NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `brandId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brands`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `category_product_data` ADD CONSTRAINT `category_product_data_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brands`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
