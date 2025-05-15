-- CreateTable
CREATE TABLE "CarService" (
    "id" TEXT NOT NULL,
    "carPlate" TEXT NOT NULL,
    "carDetails" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "phoneNo" TEXT NOT NULL,
    "carInDateTime" TIMESTAMP(3) NOT NULL,
    "carOutDateTime" TIMESTAMP(3),
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "paidInCash" DOUBLE PRECISION NOT NULL,
    "paidInCard" DOUBLE PRECISION NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CarService_year_month_idx" ON "CarService"("year", "month");
