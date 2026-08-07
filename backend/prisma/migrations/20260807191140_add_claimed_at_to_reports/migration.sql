-- AlterTable
ALTER TABLE `archiverecord` ADD COLUMN `claimedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `founditem` ADD COLUMN `claimedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `lostitem` ADD COLUMN `claimedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `status` ENUM('active', 'suspended', 'banned', 'deleted') NOT NULL DEFAULT 'active';
