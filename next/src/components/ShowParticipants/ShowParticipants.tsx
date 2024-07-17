import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { SupportedLanguage } from '@/models/locale';
import { cache } from 'react';
import ShowParticipantsModal from './ShowParticipantsDialog/ShowParticipantsDialog';

export const revalidate = 60; // revalidate the data at most every 60 seconds

const getEventRegistrations = cache(async (eventId: number) => {
  const registrations = await prisma.eventRegistration.findMany({
    where: {
      eventId,
      deletedAt: null,
      OR: [
        {
          reservedUntil: {
            gte: new Date(),
          },
        },
        {
          paymentCompleted: true,
        },
      ],
      event: {
        endDate: {
          gte: new Date(),
        },
      },
    },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    distinct: ['entraUserUuid'],
  });

  return registrations;
});

interface ShowParticipantsProps {
  eventId: number;
  lang: SupportedLanguage;
}

export default async function ShowParticipants({
  eventId,
  lang,
}: ShowParticipantsProps) {
  const dictionary = await getDictionary(lang);
  const registrations = await getEventRegistrations(eventId);
  const participants = registrations
    .map((registration) => registration.user.username)
    .filter((participant) => Boolean(participant)) as string[];

  return (
    Boolean(registrations.length) && (
      <ShowParticipantsModal
        dictionary={dictionary}
        participants={participants}
      />
    )
  );
}
