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
  const [isEventNow, setIsEventNow] = useState(false);

  useEffect(() => {
    const isEventNow =
      new Date(event.start) <= new Date() && new Date(event.end) >= new Date();

    const isEventToday =
      new Date(event.start).toDateString() === new Date().toDateString();

    const isEventTomorrow =
      new Date(event.start).toDateString() ===
      new Date(new Date().setDate(new Date().getDate() + 1)).toDateString();

    setIsEventNow(isEventNow);
    setIsToday(isEventToday);
    setIsTomorrow(isEventTomorrow);
  }, [event]);

  if (!isToday && !isTomorrow && !isEventNow) return null;

  const getEventStatus = () => {
    if (isEventNow) return dictionary.general.ongoing;
    if (isToday) return dictionary.general.today;
    if (isTomorrow) return dictionary.general.tomorrow;
  };

  const badgeText = getEventStatus();

  return (
    <span
      className={`badge badge-accent absolute left-1/2 z-20 -translate-x-1/2 -translate-y-2 transform border-none font-bold text-white ${isEventNow && 'animate-gradient ongoing-event bg-gradient-to-r from-accent-400 to-accent-600'}`}
    >
      {badgeText}!
    </span>
  );
}
