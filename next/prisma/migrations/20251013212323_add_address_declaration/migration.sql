-- AlterTable
ALTER TABLE "EventRegistration" ALTER COLUMN "reservedUntil" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "country" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "streetAddress" TEXT;

-- AlterTable
ALTER TABLE "_EventRegistrationToPayment" ADD CONSTRAINT "_EventRegistrationToPayment_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_EventRegistrationToPayment_AB_unique";

-- CreateTable
CREATE TABLE "AddressDeclaration" (
    "id" SERIAL NOT NULL,
    "entraUserUuid" TEXT NOT NULL,
    "year" SMALLINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AddressDeclaration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AddressDeclaration_entraUserUuid_year_key" ON "AddressDeclaration"("entraUserUuid", "year");

-- CreateIndex
CREATE INDEX "EventRegistration_eventId_deletedAt_paymentCompleted_idx" ON "EventRegistration"("eventId", "deletedAt", "paymentCompleted");

-- CreateIndex
CREATE INDEX "EventRegistration_entraUserUuid_eventId_idx" ON "EventRegistration"("entraUserUuid", "eventId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- AddForeignKey
ALTER TABLE "AddressDeclaration" ADD CONSTRAINT "AddressDeclaration_entraUserUuid_fkey" FOREIGN KEY ("entraUserUuid") REFERENCES "User"("entraUserUuid") ON DELETE CASCADE ON UPDATE CASCADE;
