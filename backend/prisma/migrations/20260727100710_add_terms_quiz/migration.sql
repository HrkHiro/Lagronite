-- AlterTable
ALTER TABLE `user` ADD COLUMN `termsAgreed` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `termsAgreedAt` DATETIME(3) NULL,
    ADD COLUMN `termsQuizPassed` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `termsQuizScore` INTEGER NULL;
