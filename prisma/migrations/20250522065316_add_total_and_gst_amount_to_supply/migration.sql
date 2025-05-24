/*
  Warnings:

  - Added the required column `discountAmount` to the `CarService` table without a default value. This is not possible if the table is not empty.
  - Added the required column `finalAmount` to the `CarService` table without a default value. This is not possible if the table is not empty.
  - Made the column `gstAmount` on table `Supply` required. This step will fail if there are existing NULL values in that column.
  - Made the column `totalAmount` on table `Supply` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "CarService" ADD COLUMN     "discountAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "finalAmount" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Supply" ALTER COLUMN "gstAmount" SET NOT NULL,
ALTER COLUMN "totalAmount" SET NOT NULL;
