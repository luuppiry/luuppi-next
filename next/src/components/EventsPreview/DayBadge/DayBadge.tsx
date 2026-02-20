'use client';
import { Event } from '@/models/event';
import { Dictionary } from '@/models/locale';
import { useSyncExternalStore } from 'react';

interface DayBadgeProps {
  dictionary: Dictionary;
  event: Event;
}

function useNow(intervalMs = 60_000) {
  return useSyncExternalStore(
    (callback) => {
      const id = setInterval(callback, intervalMs);
      return () => clearInterval(id);
    },
    () => Math.floor(Date.now() / intervalMs) * intervalMs,
    () => null,
  );
}

export default function DayBadge({ dictionary, event }: DayBadgeProps) {
  const now = useNow();

  if (now === null) return null;

  const start = new Date(event.start);
  const end = new Date(event.end);
  const nowDate = new Date(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isEventNow = start <= nowDate && end >= nowDate;
  const isToday = start.toDateString() === nowDate.toDateString();
  const isTomorrow = start.toDateString() === tomorrow.toDateString();

  if (!isToday && !isTomorrow && !isEventNow) return null;

  const getEventStatus = () => {
    if (isEventNow) return dictionary.general.ongoing;
    if (isToday) return dictionary.general.today;
    if (isTomorrow) return dictionary.general.tomorrow;
  };

  const badgeText = getEventStatus();

  return (
    <span
      className={`badge badge-accent absolute left-1/2 z-20 -translate-x-1/2 -translate-y-2 transform border-none font-bold text-white ${
        isEventNow &&
        'animate-gradient ongoing-event bg-gradient-to-r from-accent-400 to-accent-600'
      }`}
    >
      {badgeText}!
    </span>
  );
}
