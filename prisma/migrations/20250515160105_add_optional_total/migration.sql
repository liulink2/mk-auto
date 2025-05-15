-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('SERVICE', 'PARTS');

-- AlterTable
ALTER TABLE "CarService" ALTER COLUMN "carDetails" DROP NOT NULL,
ALTER COLUMN "ownerName" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Supply" ADD COLUMN     "total" DECIMAL(65,30);

-- CreateTable
CREATE TABLE "CarServiceItem" (
    "id" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "carServiceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarServiceItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CarServiceItem" ADD CONSTRAINT "CarServiceItem_carServiceId_fkey" FOREIGN KEY ("carServiceId") REFERENCES "CarService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
