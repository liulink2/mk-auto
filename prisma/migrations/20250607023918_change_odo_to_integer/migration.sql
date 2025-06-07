/*
  Warnings:

  - You are about to alter the column `odo` on the `CarService` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "CarService" ALTER COLUMN "odo" DROP NOT NULL,
ALTER COLUMN "odo" SET DATA TYPE INTEGER;
