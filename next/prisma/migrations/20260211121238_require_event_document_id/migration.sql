/*
  Warnings:

  - Made the column `eventDocumentId` on table `Event` required. This step will fail if there are existing NULL values in that column.
  - Made the column `eventDocumentId` on table `EventRegistration` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "eventDocumentId" SET NOT NULL;

-- AlterTable
ALTER TABLE "EventRegistration" ALTER COLUMN "reservedUntil" SET DEFAULT now() + interval '60 minutes',
ALTER COLUMN "eventDocumentId" SET NOT NULL;
