-- CreateTable
CREATE TABLE "PlanDetail" (
    "id" TEXT NOT NULL,
    "key" "Plan" NOT NULL,
    "name" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "numericPrice" DOUBLE PRECISION NOT NULL,
    "frequency" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "features" TEXT[],
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlanDetail_key_key" ON "PlanDetail"("key");
