-- AlterTable
ALTER TABLE "EventRegistration" ADD COLUMN "pickupCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "EventRegistration_pickupCode_key" ON "EventRegistration"("pickupCode");

-- CreateIndex
CREATE INDEX "EventRegistration_pickupCode_idx" ON "EventRegistration"("pickupCode");
