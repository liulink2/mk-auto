/*
  Warnings:

  - Added the required column `month` to the `Supply` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `Supply` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Supply" ADD COLUMN "month" INTEGER;
ALTER TABLE "Supply" ADD COLUMN "year" INTEGER;

-- Update existing records
UPDATE "Supply" SET 
  "month" = date_part('month', "suppliedDate")::integer,
  "year" = date_part('year', "suppliedDate")::integer;

-- Make columns required
ALTER TABLE "Supply" ALTER COLUMN "month" SET NOT NULL;
ALTER TABLE "Supply" ALTER COLUMN "year" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Supply_month_year_idx" ON "Supply"("month", "year");
