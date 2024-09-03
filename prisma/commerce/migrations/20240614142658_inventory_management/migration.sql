-- CreateTable
CREATE TABLE `inventory_management` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `asin` VARCHAR(191) NOT NULL,
    `brandId` INTEGER NOT NULL,
    `multiplier` INTEGER NULL,
    `on_hand` INTEGER NULL,

    UNIQUE INDEX `inventory_management_asin_brandId_key`(`asin`, `brandId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `inventory_management` ADD CONSTRAINT `inventory_management_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brands`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
