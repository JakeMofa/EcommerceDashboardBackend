-- CreateTable
CREATE TABLE `restock_data` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `brandId` INTEGER NOT NULL,
    `country` VARCHAR(191) NULL,
    `productName` VARCHAR(191) NULL,
    `fnSku` VARCHAR(191) NULL,
    `merchantSku` VARCHAR(191) NULL,
    `asin` VARCHAR(191) NULL,
    `condition` VARCHAR(191) NULL,
    `supplier` VARCHAR(191) NULL,
    `supplierPartNo` VARCHAR(191) NULL,
    `currencyCode` VARCHAR(191) NULL,
    `price` DOUBLE NULL,
    `salesLast30Days` DOUBLE NULL,
    `unitsSoldLast30Days` INTEGER NULL,
    `totalUnits` INTEGER NULL,
    `inbound` INTEGER NULL,
    `available` INTEGER NULL,
    `fcTransfer` INTEGER NULL,
    `fcProcessing` INTEGER NULL,
    `customOrder` INTEGER NULL,
    `unFulFillable` INTEGER NULL,
    `working` INTEGER NULL,
    `shipped` INTEGER NULL,
    `receiving` INTEGER NULL,
    `fulfilledBy` VARCHAR(191) NULL,
    `totalDaysOfSupply` INTEGER NULL,
    `daysOfSupplyAtAmazonFulfillmentNetwork` INTEGER NULL,
    `alert` VARCHAR(191) NULL,
    `recommendedReplenishmentQty` INTEGER NULL,
    `recommendedShipDate` VARCHAR(191) NULL,
    `recommendedAction` VARCHAR(191) NULL,
    `unitStorageSize` VARCHAR(191) NULL,
    `fromDate` DATETIME(0) NULL,
    `tomDate` DATETIME(0) NULL,

    INDEX `restock_data__date_idx`(`fromDate`, `tomDate`),
    INDEX `restock_data__asin_idx`(`asin`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `restock_data` ADD CONSTRAINT `restock_data_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brands`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
