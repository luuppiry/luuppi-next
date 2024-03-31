'use client';
import { Event } from '@/models/event';
import { Dictionary } from '@/models/locale';
import { useEffect, useState } from 'react';

interface DayBadgeProps {
  dictionary: Dictionary;
  event: Event;
}

export default function DayBadge({ dictionary, event }: DayBadgeProps) {
  const [isToday, setIsToday] = useState(false);
  const [isTomorrow, setIsTomorrow] = useState(false);

  useEffect(() => {
    const isEventToday =
      new Date(event.start).toDateString() === new Date().toDateString();

    const isEventTomorrow =
      new Date(event.start).toDateString() ===
      new Date(new Date().setDate(new Date().getDate() + 1)).toDateString();

    setIsToday(isEventToday);
    setIsTomorrow(isEventTomorrow);
  }, [event]);

  if (!isToday && !isTomorrow) return null;

  return (
    <span className="badge badge-accent absolute left-1/2 z-20 -translate-x-1/2 -translate-y-2 transform font-bold text-white">
      {isToday ? dictionary.general.today : dictionary.general.tomorrow}!
    </span>
  );
}
