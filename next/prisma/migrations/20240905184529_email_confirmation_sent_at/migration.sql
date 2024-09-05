-- AlterTable
ALTER TABLE "EventRegistration" ALTER COLUMN "reservedUntil" SET DEFAULT now() + interval '60 minutes';

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "confirmationSentAt" TIMESTAMP(3);
