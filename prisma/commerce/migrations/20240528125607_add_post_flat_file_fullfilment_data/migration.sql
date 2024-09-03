-- CreateTable
CREATE TABLE `post_flat_file_fullfilment_data` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `brandId` INTEGER NOT NULL,
    `orderId` VARCHAR(191) NULL,
    `orderItemId` VARCHAR(191) NULL,
    `quantity` INTEGER NULL,
    `shipDate` DATETIME(0) NULL,
    `carrierCode` VARCHAR(191) NULL,
    `carrierNumber` INTEGER NULL,
    `shipMethod` VARCHAR(191) NULL,
    `shipFromSupplySourceId` VARCHAR(191) NULL,
    `report_date` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `post_flat_file_fullfilment_data` ADD CONSTRAINT `post_flat_file_fullfilment_data_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brands`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
