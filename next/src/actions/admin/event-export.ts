'use server';
import { auth } from '@/auth';
import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { getQuestion } from '@/libs/strapi/get-question';
import { getSelectChoice } from '@/libs/strapi/get-select-choice';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { logger } from '@/libs/utils/logger';
import { APIResponse } from '@/types/types';

function escapeCsvField(field: any): string {
  if (field === null || field === undefined) return '""';
  const stringField = String(field);
  if (
    stringField.includes(',') ||
    stringField.includes('"') ||
    stringField.includes('\n')
  ) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
}

export async function eventExport(lang: string, eventId: number) {
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
        orderBy: {
          user: {
            email: 'asc',
          },
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

  const url = `/api/events/${event.eventId}?populate=Registration.QuestionsText&populate=Registration.QuestionsSelect&populate=Registration.QuestionsCheckbox`;

  const strapiEvent = await getStrapiData<APIResponse<'api::event.event'>>(
    lang,
    url,
    [`event-${eventId}`],
    true,
  );

  if (!strapiEvent) {
    return {
      message: dictionary.api.invalid_event,
      isError: true,
    };
  }

  // Format nice json object to be converted to CSV
  const eventRegistrations = event.registrations.map((registration) => {
    const answers = registration.answers.map((answer) => ({
      question:
        getQuestion(strapiEvent.data, lang, answer.question, answer.type) ?? '',
      answer:
        answer.type === 'SELECT'
          ? getSelectChoice(
              strapiEvent.data,
              lang,
              answer.question,
              answer.answer,
            )
          : answer.answer,
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
      [dictionary.general.created_at]: registration.createdAt
        .toISOString()
        .slice(0, -5),
      [dictionary.general.username]: registration.user.username ?? '',
      [dictionary.general.email]: registration.user.email,
      [dictionary.general.firstNames]: registration.user.firstName ?? '',
      [dictionary.general.lastName]: registration.user.lastName ?? '',
      [dictionary.general.preferredFullName]:
        registration.user.preferredFullName ?? '',
      [dictionary.general.paid]: registration.price,
      [dictionary.general.quota]: registration.strapiRoleUuid,
    } as Record<string, string>;

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
      const row = Object.values(registration).map(escapeCsvField).join(',');

      // If less keys than the most keys, fill with empty strings
      if (
        Object.keys(registration).length < Object.keys(mostKeysObject).length
      ) {
        const emptyCols = Array.from(
          {
            length:
              Object.keys(mostKeysObject).length -
              Object.keys(registration).length,
          },
          () => '""',
        ).join(',');
        return `${acc}\n${row},${emptyCols}`;
      }

      return `${acc}\n${row}`;
    },
    `${Object.keys(mostKeysObject)
      .map((key) => escapeCsvField(key.toUpperCase()))
      .join(',')}`,
  );

  const startDateFormatted = new Date(event.startDate)
    .toISOString()
    .slice(0, -5);

  const eventName = lang === 'fi' ? event.nameFi : event.nameEn;
  const eventLocation = lang === 'fi' ? event.locationFi : event.locationEn;

  const keys = {
    event: dictionary.general.event.toUpperCase(),
    location: dictionary.general.location.toUpperCase(),
    date: dictionary.general.starts_at.toUpperCase(),
    registrations: dictionary.general.registrations.toUpperCase(),
    total_paid: dictionary.general.total_paid.toUpperCase(),
  };

  const totalPaid = event.registrations.reduce(
    (acc, registration) => acc + registration.price,
    0,
  );

  const metadata = `${keys.event}: ${eventName}\n${keys.location}: ${eventLocation}\n${keys.date}: ${startDateFormatted}\n${keys.registrations}: ${eventRegistrations.length}\n${keys.total_paid}: ${totalPaid}`;

  const finalCsv = `${metadata}\n\n${csv}`;

  return {
    message: dictionary.general.success,
    isError: false,
    data: finalCsv,
  };
}
