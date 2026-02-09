/*
  Warnings:

  - Made the column `eventId` on table `Event` required. This step will fail if there are existing NULL values in that column.
  - Made the column `eventId` on table `EventRegistration` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "EventRegistration" DROP CONSTRAINT "EventRegistration_eventId_fkey";

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "eventId" SET NOT NULL;

-- AlterTable
ALTER TABLE "EventRegistration" ALTER COLUMN "reservedUntil" SET DEFAULT now() + interval '60 minutes',
ALTER COLUMN "eventId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("eventId") ON DELETE RESTRICT ON UPDATE CASCADE;
