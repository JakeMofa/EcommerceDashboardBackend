/*
  Warnings:

  - Added the required column `created_at` to the `budgets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `budgets` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `budgets` DROP FOREIGN KEY `budgets_campaign_id_fkey`;

-- DropForeignKey
ALTER TABLE `walmart_campaign` DROP FOREIGN KEY `walmart_campaign_brandId_fkey`;

-- AlterTable
ALTER TABLE `budgets` ADD COLUMN `walmart_tagId` INTEGER NULL,
    MODIFY `campaign_id` INTEGER NULL,
    DROP COLUMN `created_at`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL,
    DROP COLUMN `updated_at`,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `walmart_campaign` MODIFY `brandId` INTEGER NULL;

-- CreateTable
CREATE TABLE `walmart_calendar` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(512) NOT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `status` ENUM('ACTIVE', 'PAUSED', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `type` ENUM('CALENDAR', 'DAYPART') NOT NULL DEFAULT 'CALENDAR',
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `budget_change` DOUBLE NOT NULL DEFAULT 0,
    `brandId` INTEGER NULL,
    `tagId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `walmart_calendar_period` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `budget_change` DOUBLE NOT NULL,
    `calendarId` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `walmart_tag` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(512) NOT NULL,
    `spend` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('ACTIVE', 'PAUSED', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `brandId` INTEGER NOT NULL,
    `walmart_campaignId` INTEGER NULL,
    `user_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `budgets` ADD CONSTRAINT `budgets_campaign_id_fkey` FOREIGN KEY (`campaign_id`) REFERENCES `walmart_campaign`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `budgets` ADD CONSTRAINT `budgets_walmart_tagId_fkey` FOREIGN KEY (`walmart_tagId`) REFERENCES `walmart_tag`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `walmart_calendar` ADD CONSTRAINT `walmart_calendar_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brands`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `walmart_calendar` ADD CONSTRAINT `walmart_calendar_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `walmart_tag`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `walmart_calendar_period` ADD CONSTRAINT `walmart_calendar_period_calendarId_fkey` FOREIGN KEY (`calendarId`) REFERENCES `walmart_calendar`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `walmart_tag` ADD CONSTRAINT `walmart_tag_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brands`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `walmart_tag` ADD CONSTRAINT `walmart_tag_walmart_campaignId_fkey` FOREIGN KEY (`walmart_campaignId`) REFERENCES `walmart_campaign`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `walmart_tag` ADD CONSTRAINT `walmart_tag_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `walmart_campaign` ADD CONSTRAINT `walmart_campaign_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brands`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
