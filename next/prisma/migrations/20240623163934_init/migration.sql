-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "entraUserUuid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "strapiRoleUuid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolesOnUsers" (
    "strapiRoleUuid" TEXT NOT NULL,
    "entraUserUuid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "RolesOnUsers_pkey" PRIMARY KEY ("strapiRoleUuid","entraUserUuid")
);

-- CreateTable
CREATE TABLE "EventRegistration" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "strapiRoleUuid" TEXT NOT NULL,
    "paymentCompleted" BOOLEAN NOT NULL DEFAULT false,
    "reservedUntil" TIMESTAMP(3) NOT NULL DEFAULT now() + interval '60 minutes',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "entraUserUuid" TEXT NOT NULL,

    CONSTRAINT "EventRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_entraUserUuid_key" ON "User"("entraUserUuid");

-- CreateIndex
CREATE UNIQUE INDEX "Role_strapiRoleUuid_key" ON "Role"("strapiRoleUuid");

-- CreateIndex
CREATE INDEX "EventRegistration_eventId_idx" ON "EventRegistration"("eventId");

-- AddForeignKey
ALTER TABLE "RolesOnUsers" ADD CONSTRAINT "RolesOnUsers_strapiRoleUuid_fkey" FOREIGN KEY ("strapiRoleUuid") REFERENCES "Role"("strapiRoleUuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolesOnUsers" ADD CONSTRAINT "RolesOnUsers_entraUserUuid_fkey" FOREIGN KEY ("entraUserUuid") REFERENCES "User"("entraUserUuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_strapiRoleUuid_fkey" FOREIGN KEY ("strapiRoleUuid") REFERENCES "Role"("strapiRoleUuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_entraUserUuid_fkey" FOREIGN KEY ("entraUserUuid") REFERENCES "User"("entraUserUuid") ON DELETE CASCADE ON UPDATE CASCADE;
