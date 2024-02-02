import EventSelector from '@/components/EventSelector/EventSelector';
import { getDictionary } from '@/dictionaries';
import removeHtml from '@/lib/remove-html';
import { Event } from '@/models/event';
import { SupportedLanguage } from '@/models/locale';
import ical from 'node-ical';

/**
 * Temporary function to get events from Luuppi's legacy calendar.
 * TODO: Replace this with a logic that gets events from the new calendar.
 */
const getLuuppiEvents = async (): Promise<Event[]> => {
  const res = await fetch('https://luuppi.fi/service/ics/events.ics?lang=fin');
  const data = await res.text();
  const eventsRaw = ical.parseICS(data);
  const events = Object.values(eventsRaw) as ical.VEvent[];

  const formattedEvents: Event[] = events.map((event) => ({
    title: event.summary,
    start: event.start,
    end: event.end,
    description: removeHtml(event.description) ?? '',
  }));

  return formattedEvents;
};

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
