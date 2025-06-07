-- AlterTable
ALTER TABLE "CarService" ADD COLUMN "odo" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "CarService" ADD COLUMN "isInvoiceIssued" BOOLEAN NOT NULL DEFAULT false;

-- Remove the default value after adding the columns
ALTER TABLE "CarService" ALTER COLUMN "odo" DROP DEFAULT;
