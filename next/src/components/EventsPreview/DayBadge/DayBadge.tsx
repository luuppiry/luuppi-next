'use client';
import { Event } from '@/models/event';
import { Dictionary } from '@/models/locale';

interface DayBadgeProps {
  dictionary: Dictionary;
  event: Event;
}

export default function DayBadge({ dictionary, event }: DayBadgeProps) {
  const isToday =
    new Date(event.start).toDateString() === new Date().toDateString();

  const isTomorrow =
    new Date(event.start).toDateString() ===
    new Date(new Date().setDate(new Date().getDate() + 1)).toDateString();

  if (!isToday && !isTomorrow) return null;

  return (
    <span
      className="badge badge-accent absolute left-1/2 z-20 -translate-x-1/2 -translate-y-2 transform font-bold text-white"
      suppressHydrationWarning
    >
      {isToday ? dictionary.general.today : dictionary.general.tomorrow}!
    </span>
  );
}
