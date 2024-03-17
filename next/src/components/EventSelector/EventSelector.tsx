'use client';
import { Event } from '@/models/event';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LuCalendarPlus } from 'react-icons/lu';
import './EventSelector.css';
const EventCalendar = dynamic(() => import('../EventCalendar/EventCalendar'));
const EventsList = dynamic(() => import('../EventsList/EventsList'));
const MobileCalendar = dynamic(
  () => import('../MobileCalendar/MobileCalendar'),
);

interface EventSelectorProps {
  events: Event[];
  dictionary: Dictionary;
  lang: SupportedLanguage;
}

export default function EventSelector({
  events,
  lang,
  dictionary,
}: EventSelectorProps) {
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [selectedView, setSelectedView] = useState<'calendar' | 'list'>(
    'calendar',
  );
  const [width, setWidth] = useState(1200);

  useEffect(() => {
    setWidth(window.innerWidth);
    window.addEventListener('resize', () => setWidth(window.innerWidth));
    return () => {
      window.removeEventListener('resize', () => setWidth(window.innerWidth));
    };
  }, []);

  const setView = (view: 'calendar' | 'list') => {
    setSelectedView(view);
  };

  const toggleShowPastEvents = () => {
    setShowPastEvents(!showPastEvents);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex w-full items-center justify-between rounded-lg bg-background-50/50 p-4 backdrop-blur-sm max-md:flex-col max-md:justify-center max-md:gap-4 max-md:px-2">
        <div className="flex w-full items-center gap-4 max-md:flex-col max-md:gap-2">
          <div
            className="tabs-boxed tabs border bg-white max-md:w-full"
            role="tablist"
          >
            <button
              className={`tab text-nowrap font-semibold ${selectedView === 'calendar' && 'tab-active'}`}
              role="tab"
              onClick={() => setView('calendar')}
            >
              {dictionary.pages_events.calendar}
            </button>
            <button
              className={`tab text-nowrap font-semibold ${selectedView === 'list' && 'tab-active'}`}
              role="tab"
              onClick={() => setView('list')}
            >
              {dictionary.pages_events.event_feed}
            </button>
          </div>
          <div className="flex  w-full items-center justify-between">
            <div className="form-control w-48">
              <label className="label cursor-pointer">
                <span className="label-text">
                  {dictionary.pages_events.show_past}
                </span>
                <input
                  checked={showPastEvents}
                  className="toggle toggle-primary"
                  disabled={selectedView === 'calendar'}
                  type="checkbox"
                  onChange={toggleShowPastEvents}
                />
              </label>
            </div>
            <Link
              className="btn btn-primary btn-sm text-white"
              href={
                lang === 'en'
                  ? 'webcal://luuppi.fi/service/ics/events.ics?lang=eng'
                  : 'webcal://luuppi.fi/service/ics/events.ics?lang=fin'
              }
              target="_blank"
            >
              <LuCalendarPlus size={24} />
              iCal
            </Link>
          </div>
        </div>
      </div>
      {selectedView === 'calendar' ? (
        <>
          {width > 960 ? (
            <EventCalendar events={events} lang={lang} />
          ) : (
            <MobileCalendar
              dictionary={dictionary}
              events={events}
              lang={lang}
            />
          )}
        </>
      ) : (
        <EventsList
          events={events}
          lang={lang}
          showPastEvents={showPastEvents}
        />
      )}
    </div>
  );
}
