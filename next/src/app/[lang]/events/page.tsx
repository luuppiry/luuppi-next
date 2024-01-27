import EventSelector from '@/components/EventSelector/EventSelector';
import ical from 'node-ical';

interface Event {
  title: string;
  start: Date;
  end: Date;
}

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
  }));

  // Add 10 events to this day
  for (let i = 0; i < 10; i++) {
    formattedEvents.push({
      title: 'test',
      start: new Date(),
      end: new Date(new Date().getHours() + 1),
    });
  }

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
