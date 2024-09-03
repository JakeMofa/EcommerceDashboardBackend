/*
Warnings:

- A unique constraint covering the columns `[walmart_tagId,brandId,date,period_type]` on the table `budgets` will be added. If there are existing duplicate values, this will fail.
- Made the column `brandId` on table `budgets` required. This step will fail if there are existing NULL values in that column.

 */
-- DropForeignKey
ALTER TABLE `budgets`
DROP FOREIGN KEY `budgets_brandId_fkey`;

ALTER TABLE `budgets`
DROP FOREIGN KEY `budgets_walmart_tagId_fkey`;

-- DropIndex
DROP INDEX `budgets_walmart_tagId_brandId_date_key` ON `budgets`;

-- AlterTable
ALTER TABLE `budgets` MODIFY `brandId` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `budgets_walmart_tagId_brandId_date_period_type_key` ON `budgets` (`walmart_tagId`, `brandId`, `date`, `period_type`);

-- AddForeignKey
ALTER TABLE `budgets` ADD CONSTRAINT `budgets_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brands` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

ALTER TABLE `budgets` ADD CONSTRAINT `budgets_walmart_tagId_fkey` FOREIGN KEY (`walmart_tagId`) REFERENCES `walmart_tag` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `budgets` RENAME INDEX `FK_budgets_period_type` TO `budgets_period_type_index`;