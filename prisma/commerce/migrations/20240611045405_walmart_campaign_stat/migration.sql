-- CreateTable
CREATE TABLE `walmart_campaign_stat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `spend` DOUBLE NOT NULL,
    `impressions` INTEGER NULL,
    `clicks` INTEGER NULL,
    `campaign_id` INTEGER NOT NULL,

    UNIQUE INDEX `walmart_campaign_stat_campaign_id_date_key`(`campaign_id`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `walmart_campaign_stat` ADD CONSTRAINT `walmart_campaign_stat_campaign_id_fkey` FOREIGN KEY (`campaign_id`) REFERENCES `walmart_campaign`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;
