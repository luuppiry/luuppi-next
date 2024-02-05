import EventSelector from '@/components/EventSelector/EventSelector';
import { getDictionary } from '@/dictionaries';
import getLuuppiEvents from '@/lib/get-legacy-events';
import { SupportedLanguage } from '@/models/locale';

interface EventsProps {
  params: { lang: SupportedLanguage };
}

export default async function Events({ params }: EventsProps) {
  const dictionary = await getDictionary(params.lang);
  const events = await getLuuppiEvents();
  return (
    <>
      <h1 className="mb-14">{dictionary.navigation.events}</h1>
      <EventSelector
        dictionary={dictionary}
        events={events}
        lang={params.lang}
      />
    </>
  );
}
