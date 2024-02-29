'use client';
import { Event } from '@/models/event';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { useEffect, useState } from 'react';
import CopyInput from '../CopyInput/CopyInput';
import EventCalendar from '../EventCalendar/EventCalendar';
import EventsList from '../EventsList/EventsList';
import MobileCalendar from '../MobileCalendar/MobileCalendar';
import './EventSelector.css';

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
      <div className="flex w-full items-center justify-between rounded-lg bg-background-50/50 p-4 max-md:flex-col max-md:justify-center max-md:gap-4 max-md:px-2">
        <div className="flex w-full items-center gap-4 max-lg:flex-col max-lg:items-start max-lg:gap-2">
          <div
            className="tabs-boxed tabs border bg-white max-md:w-full"
            role="tablist"
          >
            <button
              className={`tab font-bold ${selectedView === 'calendar' && 'tab-active'}`}
              role="tab"
              onClick={() => setView('calendar')}
            >
              {dictionary.pages_events.calendar}
            </button>
            <button
              className={`tab font-bold ${selectedView === 'list' && 'tab-active'}`}
              role="tab"
              onClick={() => setView('list')}
            >
              {dictionary.pages_events.event_feed}
            </button>
          </div>
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
        </div>
        <CopyInput
          dictionary={dictionary}
          value={
            lang === 'en'
              ? 'https://luuppi.fi/service/ics/events.ics?lang=eng'
              : 'https://luuppi.fi/service/ics/events.ics?lang=fin'
          }
        />
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
