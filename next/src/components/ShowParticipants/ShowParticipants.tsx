import { getDictionary } from '@/dictionaries';
import { getCachedEventParticipants } from '@/libs/db/queries/get-cached-event-participants';
import { SupportedLanguage } from '@/models/locale';
import { PHASE_PRODUCTION_BUILD } from 'next/constants';
import ShowParticipantsModal from './ShowParticipantsDialog/ShowParticipantsDialog';

export const revalidate = 60; // revalidate the data at most every 60 seconds

interface ShowParticipantsProps {
  eventDocumentId: string;
  lang: SupportedLanguage;
}

export default async function ShowParticipants({
  eventDocumentId,
  lang,
}: ShowParticipantsProps) {
  // FIXME: Somewhat hacky way to not require database connection during build
  if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) {
    return;
  }

  const dictionary = await getDictionary(lang);
  const registrations = await getCachedEventParticipants(eventDocumentId);
  const participants = registrations.map(
    (registration) => registration.user.username ?? '???',
  );

  return (
    Boolean(registrations.length) && (
      <ShowParticipantsModal
        dictionary={dictionary}
        participants={participants}
      />
    )
  );
}
