/*
  Warnings:

  - You are about to drop the column `fromDate` on the `restock_data` table. All the data in the column will be lost.
  - You are about to drop the column `tomDate` on the `restock_data` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `restock_data__date_idx` ON `restock_data`;

-- AlterTable
ALTER TABLE `restock_data` DROP COLUMN `fromDate`,
    DROP COLUMN `tomDate`,
    ADD COLUMN `report_date` DATETIME(0) NULL;

-- CreateIndex
CREATE INDEX `restock_data__date_idx` ON `restock_data`(`report_date`);
