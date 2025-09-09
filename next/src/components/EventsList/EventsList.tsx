import { longDateFormat } from '@/libs/constants';
import { firstLetterToUpperCase } from '@/libs/utils/first-letter-uppercase';
import { formatDateRangeLong } from '@/libs/utils/format-date-range';
import { Event } from '@/models/event';
import Link from 'next/link';
import { IoTicketSharp } from 'react-icons/io5';

interface EventListProps {
  events: Event[];
  showPastEvents: boolean;
  lang: string;
}

export default function EventsList({
  events,
  showPastEvents,
  lang,
}: EventListProps) {
  const groupEventsByDate = (events: Event[]) => {
    const groupedEvents = events.reduce(
      (acc, event) => {
        if (!event.start) return acc;
        const dateStr = event.start.toDateString();
        if (!acc[dateStr]) {
          acc[dateStr] = {
            date: event.start,
            events: [],
          };
        }
        acc[dateStr].events.push(event);
        return acc;
      },
      {} as Record<string, { date: Date; events: typeof events }>,
    );
    return groupedEvents;
  };

  const getEvents = (showAll: boolean) => {
    const sortedEvents = events
      .filter((e) => e.end && e.start)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
    if (showAll) {
      return groupEventsByDate(sortedEvents);
    }
    const filtered = sortedEvents.filter((event) => event.end > new Date());
    return groupEventsByDate(filtered);
  };

  return (
    <div className="flex flex-col gap-12">
      {Object.values(getEvents(showPastEvents)).map((group) => (
        <div key={group.date.toDateString()} className="flex flex-col gap-2">
          <h2 className="text-xl font-bold">
            {firstLetterToUpperCase(
              group.date.toLocaleDateString(
                lang,
                showPastEvents
                  ? { ...longDateFormat, year: 'numeric' }
                  : longDateFormat,
              ),
            )}
          </h2>
          <div className="flex flex-col gap-4">
            {group.events.map((event) => (
              <Link
                key={
                  event.start.toISOString() +
                  event.end.toISOString() +
                  event.title
                }
                className="flex gap-4 rounded-lg bg-background-50 transition-all delay-300 ease-in-out"
                href={`/${lang}/events/${event.id}`}
                id={event.start.toDateString() + event.title}
              >
                <span className="w-1 shrink-0 rounded-l-lg bg-secondary-400" />
                <div className="flex flex-col py-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold max-md:text-base">
                      {event.title}
                    </h3>
                    {event.hasTickets && <IoTicketSharp className="inline" />}
                  </div>
                  <div className="flex gap-2">
                    {formatDateRangeLong(
                      new Date(event.start),
                      new Date(event.end),
                      lang,
                    )}
                  </div>
                  <p className="line-clamp-3 max-w-xl pr-4 text-sm text-gray-500 max-md:text-xs max-sm:break-all">
                    {event.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
