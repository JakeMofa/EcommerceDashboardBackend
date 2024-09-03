/*
  Warnings:

  - You are about to alter the column `date` on the `dsp_data` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `dsp_data` ADD COLUMN `yearweek_week` INTEGER NULL,
    ADD COLUMN `yearweek_year` INTEGER NULL,
    MODIFY `date` DATETIME NULL;

-- CreateIndex
CREATE INDEX `dsp_data_yearweek_index` ON `dsp_data`(`yearweek_week`, `yearweek_year`);
