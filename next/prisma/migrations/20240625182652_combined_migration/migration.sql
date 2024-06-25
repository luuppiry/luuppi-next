-- AlterTable
ALTER TABLE "EventRegistration" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "paidPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "reservedUntil" SET DEFAULT now() + interval '60 minutes';
