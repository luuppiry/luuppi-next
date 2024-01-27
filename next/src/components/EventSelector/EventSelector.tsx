'use client';
import { useEffect, useState } from 'react';
import EventCalendar from '../EventCalendar/EventCalendar';
import EventsList from '../EventsList/EventsList';
import './EventSelector.css';

export default function EventSelector({
  events,
}: {
  events: {
    title: string;
    start: Date;
    end: Date;
  }[];
}) {
  const [selectedView, setSelectedView] = useState<'calendar' | 'list'>(
    'calendar',
  );

  useEffect(() => {
    // If under 1280px, change to day view
    if (window.innerWidth < 1280) {
      setSelectedView('list');
    }
  }, [selectedView]);

  const toggleView = () => {
    if (selectedView === 'calendar') {
      setSelectedView('list');
    } else {
      setSelectedView('calendar');
    }
  };
  return (
    <>
      <div className="tabs-boxed tabs mb-8" role="tablist">
        <button
          className={`tab text-xl font-bold ${selectedView === 'calendar' && 'tab-active'}`}
          role="tab"
          onClick={toggleView}
        >
          Kalenteri
        </button>
        <button
          className={`tab text-xl font-bold ${selectedView === 'list' && 'tab-active'}`}
          role="tab"
          onClick={toggleView}
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
