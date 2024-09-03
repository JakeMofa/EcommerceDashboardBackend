/*
  Warnings:

  - A unique constraint covering the columns `[brandId,name]` on the table `walmart_tag` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `walmart_tag_brandId_name_key` ON `walmart_tag`(`brandId`, `name`);
