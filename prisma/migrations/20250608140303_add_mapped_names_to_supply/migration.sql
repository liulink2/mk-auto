-- AlterTable
ALTER TABLE "Supply" ADD COLUMN     "mappedNames" TEXT[] DEFAULT ARRAY[]::TEXT[];
