import Link from 'next/link';

export default function EventsList({
  events,
}: {
  events: {
    title: string;
    start: Date;
    end: Date;
  }[];
}) {
  // Hide past events
  const now = new Date();
  const filteredEvents = events
    .filter((event) => event.end > now)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  // Group by date
  const groupedEvents: {
    [key: string]: {
      date: Date;
      events: {
        title: string;
        start: Date;
        end: Date;
      }[];
    };
  } = {};
  filteredEvents.forEach((event) => {
    const date = new Date(event.start);
    const dateStr = date.toDateString();
    if (!groupedEvents[dateStr]) {
      groupedEvents[dateStr] = {
        date,
        events: [],
      };
    }
    groupedEvents[dateStr].events.push(event);
  });

  const dateOptions = {
    weekday: 'long', // Full weekday name (e.g., "Monday")
    day: 'numeric', // Day of the month (e.g., 30)
    month: 'short', // Short month name (e.g., "Jan")
  } as const;

  const timeOptions = {
    hour: '2-digit',
    minute: '2-digit',
  } as const;

  return (
    <div className="flex flex-col gap-12">
      {Object.values(groupedEvents).map((group) => (
        <div key={group.date.toDateString()} className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold">
            {group.date.toLocaleDateString(undefined, dateOptions)}
          </h2>
          <div className="divider my-0" />
          <div className="flex flex-col gap-4">
            {group.events.map((event) => (
              <Link
                key={event.title}
                className="flex items-center gap-4 rounded-lg transition-all delay-300 ease-in-out hover:bg-primary-50"
                href="/"
              >
                <span className="h-16 w-1 rounded-lg bg-primary-400" />
                <div className="flex flex-col">
                  <h3 className="text-lg font-bold">{event.title}</h3>
                  <div className="flex gap-2">
                    <p>
                      {event.start.toLocaleTimeString(undefined, timeOptions)}
                    </p>
                    <p>-</p>
                    <p>
                      {event.end.toLocaleTimeString(undefined, timeOptions)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
