-- CreateTable
CREATE TABLE `ArchiveRecord` (
    `id` VARCHAR(191) NOT NULL,
    `entityType` VARCHAR(191) NOT NULL,
    `itemName` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `date` DATETIME(3) NULL,
    `location` VARCHAR(191) NULL,
    `image` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL,
    `reporterName` VARCHAR(191) NULL,
    `reporterEmail` VARCHAR(191) NULL,
    `claimerName` VARCHAR(191) NULL,
    `reason` VARCHAR(191) NULL,
    `deletedBy` VARCHAR(191) NULL,
    `deletedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ArchiveRecord_entityType_deletedAt_idx`(`entityType`, `deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SystemQuery` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `severity` VARCHAR(191) NOT NULL DEFAULT 'medium',
    `category` VARCHAR(191) NOT NULL DEFAULT 'bug',
    `status` VARCHAR(191) NOT NULL DEFAULT 'Open',
    `reporterId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SystemQuery_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `SystemQuery_reporterId_createdAt_idx`(`reporterId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SystemQuery` ADD CONSTRAINT `SystemQuery_reporterId_fkey` FOREIGN KEY (`reporterId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
