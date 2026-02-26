-- AlterTable
ALTER TABLE "EventRegistration" ADD COLUMN     "strapiTicketUid" TEXT,
ALTER COLUMN "reservedUntil" SET DEFAULT now() + interval '60 minutes';
