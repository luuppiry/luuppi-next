'use client';
import { getDictionary } from '@/dictionaries';
import { Event } from '@/models/event';
import { SupportedLanguage } from '@/models/locale';
import { useEffect, useState } from 'react';
import EventCalendar from '../EventCalendar/EventCalendar';
import EventsList from '../EventsList/EventsList';
import './EventSelector.css';

interface EventSelectorProps {
  events: Event[];
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
  lang: SupportedLanguage;
}

export default function EventSelector({
  events,
  lang,
  dictionary,
}: EventSelectorProps) {
  const [selectedView, setSelectedView] = useState<'calendar' | 'list'>(
    'calendar',
  );

  useEffect(() => {
    if (window.innerWidth < 1280) {
      setSelectedView('list');
    }
  }, []);

  const setView = (view: 'calendar' | 'list') => {
    setSelectedView(view);
  };
  return (
    <>
      <div className="tabs-boxed tabs mb-8" role="tablist">
        <button
          className={`tab text-lg font-bold ${selectedView === 'calendar' && 'tab-active'}`}
          role="tab"
          onClick={() => setView('calendar')}
        >
          {dictionary.pages_events.calendar}
        </button>
        <button
          className={`tab text-lg font-bold ${selectedView === 'list' && 'tab-active'}`}
          role="tab"
          onClick={() => setView('list')}
        >
          {dictionary.pages_events.event_feed}
        </button>
      </div>
      {selectedView === 'calendar' ? (
        <EventCalendar events={events} lang={lang} />
      ) : (
        <EventsList events={events} />
      )}
    </>
  );
}
