/*
  Warnings:

  - Made the column `last_log_in` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "last_log_in" SET NOT NULL;
