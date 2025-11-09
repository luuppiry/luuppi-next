'use server';
import { auth } from '@/auth';
import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { logger } from '@/libs/utils/logger';
import { SupportedLanguage } from '@/models/locale';

export async function togglePickupStatus(
  lang: SupportedLanguage,
  registrationId: number,
  pickedUp: boolean,
) {
  const dictionary = await getDictionary(lang);

  const session = await auth();
  const user = session?.user;

  if (!user || !user.isLuuppiHato) {
    logger.error('User not found in session or does not have required role');
    return {
      message: dictionary.api.unauthorized,
      isError: true,
    };
  }

  const hasHatoRole = await prisma.rolesOnUsers.findFirst({
    where: {
      entraUserUuid: user.entraUserUuid,
      strapiRoleUuid: process.env.NEXT_PUBLIC_LUUPPI_HATO_ID!,
      OR: [
        {
          expiresAt: {
            gte: new Date(),
          },
        },
        {
          expiresAt: null,
        },
      ],
    },
  });

  if (!hasHatoRole) {
    logger.error('User does not have the required role');
    return {
      message: dictionary.api.unauthorized,
      isError: true,
    };
  }

  if (!registrationId || isNaN(registrationId) || registrationId < 1) {
    return {
      message: dictionary.api.invalid_request,
      isError: true,
    };
  }

  try {
    await prisma.eventRegistration.update({
      where: {
        id: registrationId,
        deletedAt: null,
        paymentCompleted: true,
      },
      data: {
        pickedUp,
      },
    });

    return {
      message: dictionary.general.success,
      isError: false,
    };
  } catch (error) {
    logger.error('Failed to update pickup status', error);
    return {
      message: dictionary.api.internal_server_error,
      isError: true,
    };
  }
}
