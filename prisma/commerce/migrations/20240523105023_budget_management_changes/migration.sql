/*
  Warnings:

  - You are about to drop the column `spend` on the `budgets` table. All the data in the column will be lost.
  - You are about to drop the column `tagId` on the `walmart_calendar` table. All the data in the column will be lost.
  - You are about to drop the column `walmart_campaignId` on the `walmart_tag` table. All the data in the column will be lost.
  - Made the column `brandId` on table `walmart_calendar` required. This step will fail if there are existing NULL values in that column.
  - Made the column `brandId` on table `walmart_campaign` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `walmart_calendar` DROP FOREIGN KEY `walmart_calendar_brandId_fkey`;

-- DropForeignKey
ALTER TABLE `walmart_calendar` DROP FOREIGN KEY `walmart_calendar_tagId_fkey`;

-- DropForeignKey
ALTER TABLE `walmart_calendar_period` DROP FOREIGN KEY `walmart_calendar_period_calendarId_fkey`;

-- DropForeignKey
ALTER TABLE `walmart_campaign` DROP FOREIGN KEY `walmart_campaign_brandId_fkey`;

-- DropForeignKey
ALTER TABLE `walmart_tag` DROP FOREIGN KEY `walmart_tag_brandId_fkey`;

-- DropForeignKey
ALTER TABLE `walmart_tag` DROP FOREIGN KEY `walmart_tag_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `walmart_tag` DROP FOREIGN KEY `walmart_tag_walmart_campaignId_fkey`;

-- AlterTable
ALTER TABLE `budgets` DROP COLUMN `spend`,
    ADD COLUMN `over_spend_status` ENUM('ACTIVE', 'OVER_SPEND') NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE `walmart_calendar` DROP COLUMN `tagId`,
    MODIFY `brandId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `walmart_calendar_period` MODIFY `budget_change` DOUBLE NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `walmart_campaign` ADD COLUMN `walmart_calendarId` INTEGER NULL,
    MODIFY `brandId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `walmart_tag` DROP COLUMN `walmart_campaignId`;

-- CreateTable
CREATE TABLE `budget_log` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `spend` DOUBLE NOT NULL DEFAULT 0,
    `date` DATETIME(3) NOT NULL,
    `budgetsId` INTEGER NOT NULL,

    UNIQUE INDEX `budget_log_date_budgetsId_key`(`date`, `budgetsId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_walmart_calendarTowalmart_tag` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_walmart_calendarTowalmart_tag_AB_unique`(`A`, `B`),
    INDEX `_walmart_calendarTowalmart_tag_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_walmart_campaignTowalmart_tag` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_walmart_campaignTowalmart_tag_AB_unique`(`A`, `B`),
    INDEX `_walmart_campaignTowalmart_tag_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `budget_log` ADD CONSTRAINT `budget_log_budgetsId_fkey` FOREIGN KEY (`budgetsId`) REFERENCES `budgets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `walmart_calendar` ADD CONSTRAINT `walmart_calendar_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brands`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `walmart_calendar_period` ADD CONSTRAINT `walmart_calendar_period_calendarId_fkey` FOREIGN KEY (`calendarId`) REFERENCES `walmart_calendar`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `walmart_tag` ADD CONSTRAINT `walmart_tag_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brands`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `walmart_tag` ADD CONSTRAINT `walmart_tag_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `walmart_campaign` ADD CONSTRAINT `walmart_campaign_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brands`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `walmart_campaign` ADD CONSTRAINT `walmart_campaign_walmart_calendarId_fkey` FOREIGN KEY (`walmart_calendarId`) REFERENCES `walmart_calendar`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_walmart_calendarTowalmart_tag` ADD CONSTRAINT `_walmart_calendarTowalmart_tag_A_fkey` FOREIGN KEY (`A`) REFERENCES `walmart_calendar`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_walmart_calendarTowalmart_tag` ADD CONSTRAINT `_walmart_calendarTowalmart_tag_B_fkey` FOREIGN KEY (`B`) REFERENCES `walmart_tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_walmart_campaignTowalmart_tag` ADD CONSTRAINT `_walmart_campaignTowalmart_tag_A_fkey` FOREIGN KEY (`A`) REFERENCES `walmart_campaign`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_walmart_campaignTowalmart_tag` ADD CONSTRAINT `_walmart_campaignTowalmart_tag_B_fkey` FOREIGN KEY (`B`) REFERENCES `walmart_tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
