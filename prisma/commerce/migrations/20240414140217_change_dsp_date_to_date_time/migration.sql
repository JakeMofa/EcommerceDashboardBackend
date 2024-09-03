/*
  Warnings:

  - You are about to drop the column `date` on the `dsp_data` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `dsp_data_date_index` ON `dsp_data`;

-- AlterTable
ALTER TABLE `dsp_data` DROP COLUMN `date`;
