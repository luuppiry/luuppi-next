'use client';
import { Event } from '@/models/event';
import { Dictionary } from '@/models/locale';

interface TodayBadgeProps {
  dictionary: Dictionary;
  event: Event;
}

export default function TodayBadge({ dictionary, event }: TodayBadgeProps) {
  const isToday =
    new Date(event.start).toDateString() === new Date().toDateString();
  if (!isToday) return null;

  return (
    <span className="badge badge-accent absolute left-1/2 z-20 -translate-x-1/2 -translate-y-2 transform font-bold text-white">
      {dictionary.general.today}!
    </span>
  );
}
