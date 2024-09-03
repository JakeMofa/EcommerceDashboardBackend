-- CreateTable
CREATE TABLE `budgets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campaign_id` INTEGER NOT NULL,
    `daily_budget` INTEGER NULL,
    `monthly_budget` INTEGER NULL,
    `created_at` BIGINT NULL,
    `updated_at` BIGINT NULL,
    `brandsId` INTEGER NOT NULL,

    UNIQUE INDEX `budgets_campaign_id_key`(`campaign_id`),
    INDEX `budgets_campaign_id_idx`(`campaign_id`),
    UNIQUE INDEX `budgets_brandsId_campaign_id_key`(`brandsId`, `campaign_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `budgets` ADD CONSTRAINT `budgets_brandsId_fkey` FOREIGN KEY (`brandsId`) REFERENCES `Brands`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
