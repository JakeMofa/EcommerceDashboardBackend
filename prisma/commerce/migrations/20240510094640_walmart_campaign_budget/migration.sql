-- DropForeignKey
ALTER TABLE `budgets`
DROP FOREIGN KEY `budgets_brandId_fkey`;

-- DropIndex
DROP INDEX `budgets_campaign_id_idx` ON `budgets`;

-- AlterTable
ALTER TABLE `budgets`
DROP COLUMN `brandId`,
ADD COLUMN `spend` DOUBLE NOT NULL DEFAULT 0,
MODIFY `budget` DOUBLE NOT NULL,
MODIFY `status` ENUM ('ACTIVE', 'PAUSED', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE
  `walmart_campaign` (
    `id` INTEGER NOT NULL,
    `spend` INTEGER NOT NULL DEFAULT 0,
    `name` VARCHAR(512) NOT NULL,
    `campaign_type` VARCHAR(256) NULL,
    `targeting_type` VARCHAR(256) NULL,
    `status` VARCHAR(512) NULL,
    `budget_type` VARCHAR(512) NULL,
    `start_date` DATETIME (3) NOT NULL,
    `end_date` DATETIME (3) NOT NULL,
    `total_budget` DOUBLE NOT NULL,
    `daily_budget` DOUBLE NOT NULL,
    `rollover` BOOLEAN NULL,
    `brandId` INTEGER NOT NULL,
    PRIMARY KEY (`id`)
  ) DEFAULT CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `budgets` ADD CONSTRAINT `budgets_campaign_id_fkey` FOREIGN KEY (`campaign_id`) REFERENCES `walmart_campaign` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `walmart_campaign` ADD CONSTRAINT `walmart_campaign_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brands` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;