import { getDictionary } from '@/dictionaries';
import { getEventRegistrations } from '@/libs/db/queries/get-cached-registrations';
import { SupportedLanguage } from '@/models/locale';
import { PHASE_PRODUCTION_BUILD } from 'next/constants';
import ShowParticipantsModal from './ShowParticipantsDialog/ShowParticipantsDialog';

export const revalidate = 60; // revalidate the data at most every 60 seconds

interface ShowParticipantsProps {
  eventId: number;
  lang: SupportedLanguage;
}

export default async function ShowParticipants({
  eventId,
  lang,
}: ShowParticipantsProps) {
  // FIXME: Somewhat hacky way to not require database connection during build
  if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) {
    return;
  }

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
