/*
  Warnings:

  - You are about to alter the column `orderBudget` on the `dsp_data` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `dsp_data` MODIFY `orderBudget` DOUBLE NULL;
