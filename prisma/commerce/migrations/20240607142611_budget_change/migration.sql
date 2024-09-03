/*
  Warnings:

  - You are about to drop the column `campaign_id` on the `budgets` table. All the data in the column will be lost.
  - You are about to drop the column `date_type` on the `budgets` table. All the data in the column will be lost.
  - You are about to drop the column `end_date` on the `budgets` table. All the data in the column will be lost.
  - You are about to drop the column `month` on the `budgets` table. All the data in the column will be lost.
  - You are about to drop the column `over_spend_status` on the `budgets` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `budgets` table. All the data in the column will be lost.
  - You are about to drop the column `week` on the `budgets` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `budgets` table. All the data in the column will be lost.
  - You are about to drop the column `end_date` on the `walmart_calendar` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `walmart_calendar` table. All the data in the column will be lost.
  - You are about to drop the column `walmart_calendarId` on the `walmart_campaign` table. All the data in the column will be lost.
  - You are about to drop the column `spend` on the `walmart_tag` table. All the data in the column will be lost.
  - You are about to drop the `budget_log` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[walmart_tagId,brandId,date]` on the table `budgets` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `date` to the `budgets` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `budget_log` DROP FOREIGN KEY `budget_log_budgetsId_fkey`;

-- DropForeignKey
ALTER TABLE `budgets` DROP FOREIGN KEY `budgets_campaign_id_fkey`;

-- DropForeignKey
ALTER TABLE `walmart_campaign` DROP FOREIGN KEY `walmart_campaign_walmart_calendarId_fkey`;

-- AlterTable
ALTER TABLE `budgets` DROP COLUMN `campaign_id`,
    DROP COLUMN `date_type`,
    DROP COLUMN `end_date`,
    DROP COLUMN `month`,
    DROP COLUMN `over_spend_status`,
    DROP COLUMN `start_date`,
    DROP COLUMN `week`,
    DROP COLUMN `year`,
    ADD COLUMN `brandId` INTEGER NULL,
    ADD COLUMN `date` DATETIME(3) NOT NULL,
    ADD COLUMN `period_type` ENUM('DAILY', 'WEEKLY', 'MONTHLY') NOT NULL DEFAULT 'DAILY';

-- AlterTable
ALTER TABLE `walmart_calendar` DROP COLUMN `end_date`,
    DROP COLUMN `start_date`;

-- AlterTable
ALTER TABLE `walmart_campaign` DROP COLUMN `walmart_calendarId`;

-- AlterTable
ALTER TABLE `walmart_tag` DROP COLUMN `spend`;

-- DropTable
DROP TABLE `budget_log`;

-- CreateIndex
CREATE INDEX `FK_budgets_period_type` ON `budgets`(`period_type`);

-- CreateIndex
CREATE UNIQUE INDEX `budgets_walmart_tagId_brandId_date_key` ON `budgets`(`walmart_tagId`, `brandId`, `date`);

-- AddForeignKey
ALTER TABLE `budgets` ADD CONSTRAINT `budgets_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brands`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
