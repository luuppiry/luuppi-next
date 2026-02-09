/*
  Warnings:

  - A unique constraint covering the columns `[eventDocumentId]` on the table `Event` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "EventRegistration" DROP CONSTRAINT "EventRegistration_eventId_fkey";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "eventDocumentId" TEXT,
ALTER COLUMN "eventId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "EventRegistration" ADD COLUMN     "eventDocumentId" TEXT,
ALTER COLUMN "reservedUntil" SET DEFAULT now() + interval '60 minutes',
ALTER COLUMN "eventId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Event_eventDocumentId_key" ON "Event"("eventDocumentId");

-- CreateIndex
CREATE INDEX "EventRegistration_eventDocumentId_idx" ON "EventRegistration"("eventDocumentId");

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("eventId") ON DELETE SET NULL ON UPDATE CASCADE;
