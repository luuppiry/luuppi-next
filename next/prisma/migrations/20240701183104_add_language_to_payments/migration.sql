-- CreateEnum
CREATE TYPE "Language" AS ENUM ('EN', 'FI');

-- AlterTable
ALTER TABLE "EventRegistration" ALTER COLUMN "reservedUntil" SET DEFAULT now() + interval '60 minutes';

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'FI';
