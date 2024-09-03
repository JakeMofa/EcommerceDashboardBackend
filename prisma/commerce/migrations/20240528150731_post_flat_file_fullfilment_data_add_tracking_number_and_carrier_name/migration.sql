/*
  Warnings:

  - You are about to drop the column `carrierNumber` on the `post_flat_file_fullfilment_data` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `post_flat_file_fullfilment_data` DROP COLUMN `carrierNumber`,
    ADD COLUMN `carrierName` VARCHAR(191) NULL,
    ADD COLUMN `trackingNumber` VARCHAR(191) NULL;
