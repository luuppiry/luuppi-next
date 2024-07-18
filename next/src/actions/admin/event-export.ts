'use server';
import { auth } from '@/auth';
import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { logger } from '@/libs/utils/logger';
import { SupportedLanguage } from '@/models/locale';

export async function eventExport(lang: SupportedLanguage, eventId: number) {
  const dictionary = await getDictionary(lang);

  const session = await auth();
  const user = session?.user;

  if (!user || !user.isLuuppiHato) {
    logger.error('User not found in session');
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

  if (!eventId || isNaN(eventId) || eventId < 1) {
    return {
      message: dictionary.api.invalid_event,
      isError: true,
    };
  }

  const event = await prisma.event.findUnique({
    where: {
      id: eventId,
    },
    include: {
      registrations: {
        where: {
          deletedAt: null,
          paymentCompleted: true,
        },
        include: {
          user: true,
          answers: true,
        },
      },
    },
  });

  if (!event) {
    return {
      message: dictionary.api.invalid_event,
      isError: true,
    };
  }

  // Format nice json object to be converted to CSV
  const eventRegistrations = event.registrations.map((registration) => {
    const answers = registration.answers.map((answer) => ({
      question: answer.question,
      answer: answer.answer,
    }));

    // Flatten the answers to be in the same object because all users have the same questions
    const answersObject = answers.reduce(
      (acc, answer) => {
        acc[answer.question] = answer.answer;
        return acc;
      },
      {} as Record<string, string>,
    );

    const baseData = {
      username: registration.user.username ?? '',
      email: registration.user.email,
      'first-name': registration.user.firstName ?? '',
      'last-name': registration.user.lastName ?? '',
      'preferred-name': registration.user.preferredFullName ?? '',
      paid: registration.price,
      quota: registration.strapiRoleUuid,
    };

    return {
      ...baseData,
      ...answersObject,
    };
  });

  const mostKeysObject = eventRegistrations.reduce((acc, registration) => {
    if (Object.keys(registration).length > Object.keys(acc).length) {
      return registration;
    }
    return acc;
  }, {} as any);

  // Create the CSV
  const csv = eventRegistrations.reduce(
    (acc, registration) => {
      const row = Object.values(registration).join(',');
      return `${acc}\n${row}`;
    },
    `${Object.keys(mostKeysObject)
      .map((key) => key.toUpperCase())
      .join(',')}`,
  );

  return {
    message: dictionary.general.success,
    isError: false,
    data: csv,
  };
}
