/*
  Warnings:

  - Made the column `finalAmount` on table `CarService` required. This step will fail if there are existing NULL values in that column.

*/
-- Update all finalAmount to 0
UPDATE "CarService" SET "finalAmount" = 0;

-- AlterTable
ALTER TABLE "CarService" ALTER COLUMN "finalAmount" SET NOT NULL;
