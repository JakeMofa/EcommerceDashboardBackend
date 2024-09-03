-- CreateTable
CREATE TABLE `walmart_advertisers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `advertiserId` INTEGER NULL,
    `advertiserName` VARCHAR(255) NULL,
    `advertiserType` VARCHAR(50) NULL,
    `sellerId` INTEGER NULL,
    `sellerName` VARCHAR(255) NULL,
    `accountSpendLimitReached` VARCHAR(50) NULL,
    `apiAccessType` VARCHAR(50) NULL,
    `accessGrantTimeStamp` DATETIME(0) NULL,
    `reportDate` DATETIME(0) NULL,

    UNIQUE INDEX `walmart_advertisers_advertiserId_key`(`advertiserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
