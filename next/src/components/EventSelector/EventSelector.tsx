'use client';
import { Event } from '@/models/event';
import { useEffect, useState } from 'react';
import EventCalendar from '../EventCalendar/EventCalendar';
import EventsList from '../EventsList/EventsList';
import './EventSelector.css';

interface EventSelectorProps {
  events: Event[];
}

export default function EventSelector({ events }: EventSelectorProps) {
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
          Kalenteri
        </button>
        <button
          className={`tab text-lg font-bold ${selectedView === 'list' && 'tab-active'}`}
          role="tab"
          onClick={() => setView('list')}
        >
          Tapahtumavirta
        </button>
      </div>
      {selectedView === 'calendar' ? (
        <EventCalendar events={events} />
      ) : (
        <EventsList events={events} />
      )}
    </>
  );
}
