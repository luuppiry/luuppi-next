/*
  Warnings:

  - You are about to drop the column `eventId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `eventId` on the `EventRegistration` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "EventRegistration" DROP CONSTRAINT "EventRegistration_eventId_fkey";

-- DropIndex
DROP INDEX "Event_eventId_key";

-- DropIndex
DROP INDEX "EventRegistration_entraUserUuid_eventId_idx";

-- DropIndex
DROP INDEX "EventRegistration_eventDocumentId_idx";

-- DropIndex
DROP INDEX "EventRegistration_eventId_deletedAt_paymentCompleted_idx";

-- DropIndex
DROP INDEX "EventRegistration_eventId_idx";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "eventId";

-- AlterTable
ALTER TABLE "EventRegistration" DROP COLUMN "eventId",
ALTER COLUMN "reservedUntil" SET DEFAULT now() + interval '60 minutes';

-- CreateIndex
CREATE INDEX "EventRegistration_eventDocumentId_deletedAt_paymentComplete_idx" ON "EventRegistration"("eventDocumentId", "deletedAt", "paymentCompleted");

-- CreateIndex
CREATE INDEX "EventRegistration_entraUserUuid_eventDocumentId_idx" ON "EventRegistration"("entraUserUuid", "eventDocumentId");

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_eventDocumentId_fkey" FOREIGN KEY ("eventDocumentId") REFERENCES "Event"("eventDocumentId") ON DELETE RESTRICT ON UPDATE CASCADE;
