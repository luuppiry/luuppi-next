/*
  Warnings:

  - You are about to drop the column `country` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `postalCode` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `streetAddress` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EventRegistration" ALTER COLUMN "reservedUntil" SET DEFAULT now() + interval '60 minutes';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "country",
DROP COLUMN "postalCode",
DROP COLUMN "streetAddress";
