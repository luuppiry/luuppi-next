'use server';
import { auth } from '@/auth';
import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { logger } from '@/libs/utils/logger';
import { isValidPickupCode } from '@/libs/utils/pickup-code';
import { SupportedLanguage } from '@/models/locale';

export async function togglePickupStatus(
  lang: SupportedLanguage,
  registrationIdOrCode: number | string,
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

  // Determine if we're looking up by ID or pickup code
  let whereClause: {
    id?: number;
    pickupCode?: string;
    deletedAt: null;
    paymentCompleted: true;
  };

  if (typeof registrationIdOrCode === 'string') {
    const code = registrationIdOrCode.toUpperCase().trim();

    if (!isValidPickupCode(code)) {
      return {
        message: dictionary.api.invalid_pickup_code ?? 'Invalid pickup code format',
        isError: true,
      };
    }

    whereClause = {
      pickupCode: code,
      deletedAt: null,
      paymentCompleted: true,
    };
  } else {
    if (!registrationIdOrCode || isNaN(registrationIdOrCode) || registrationIdOrCode < 1) {
      return {
        message: dictionary.api.invalid_request,
        isError: true,
      };
    }

    whereClause = {
      id: registrationIdOrCode,
      deletedAt: null,
      paymentCompleted: true,
    };
  }

  try {
    const registration = await prisma.eventRegistration.findFirst({
      where: whereClause,
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
        event: {
          select: {
            nameFi: true,
            nameEn: true,
          },
        },
      },
    });

    if (!registration) {
      return {
        message: dictionary.api.registration_not_found ?? 'Registration not found',
        isError: true,
      };
    }

    await prisma.eventRegistration.update({
      where: {
        id: registration.id,
      },
      data: {
        pickedUp,
      },
    });

    const eventName = lang === 'fi' ? registration.event.nameFi : registration.event.nameEn;

    return {
      message: dictionary.general.success,
      isError: false,
      data: {
        registrationId: registration.id,
        username: registration.user.username,
        email: registration.user.email,
        eventName,
        pickedUp,
      },
    };
  } catch (error) {
    logger.error('Failed to update pickup status', error);
    return {
      message: dictionary.api.internal_server_error,
      isError: true,
    };
  }
}
