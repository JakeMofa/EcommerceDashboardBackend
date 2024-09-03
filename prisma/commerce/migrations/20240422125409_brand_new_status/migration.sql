-- AlterTable
ALTER TABLE `Brands` MODIFY `status` ENUM('Pending', 'Created', 'Deleted', 'Archived', 'WaitingForApproval') NOT NULL DEFAULT 'Pending';
