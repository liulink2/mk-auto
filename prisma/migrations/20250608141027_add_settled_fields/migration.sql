-- AlterTable
ALTER TABLE "CarServiceItem" ADD COLUMN     "settled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Supply" ADD COLUMN     "settled" BOOLEAN NOT NULL DEFAULT false;
