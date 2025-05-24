-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

-- AlterTable
ALTER TABLE "CarService" ADD COLUMN     "discountType" "DiscountType",
ALTER COLUMN "discountAmount" DROP NOT NULL,
ALTER COLUMN "finalAmount" DROP NOT NULL;
