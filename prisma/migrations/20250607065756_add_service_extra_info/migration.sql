-- CreateTable
CREATE TABLE "ServiceExtraInfo" (
    "id" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "serviceNames" TEXT[],
    "extraInfo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceExtraInfo_pkey" PRIMARY KEY ("id")
);
