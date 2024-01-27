import EventSelector from '@/components/EventSelector/EventSelector';
import removeHtml from '@/lib/remove-html';
import { Event } from '@/models/event';
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

export default async function Events() {
  const events = await getLuuppiEvents();
  return (
    <section className="mx-auto max-w-screen-xl px-4 py-20">
      <h1 className="mb-14 text-5xl font-extrabold max-md:text-4xl">Events</h1>
      <EventSelector events={events} />
    </section>
  );
}
