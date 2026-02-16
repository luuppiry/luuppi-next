'use client';
import Tooltip from '@/components/Tooltip/Tooltip';
import { Event } from '@/models/event';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { SelectedViewContext } from '@/providers/EventSelectorProvider';
import type { CalendarListeners } from '@fullcalendar/core';
import fiLocale from '@fullcalendar/core/locales/fi';
import dayGridPlugin from '@fullcalendar/daygrid';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useRef, useState } from 'react';
import { HiOutlineClipboardDocumentList } from 'react-icons/hi2';
import './EventCalendar.css';

interface EventCalendarProps {
  events: Event[];
  lang: SupportedLanguage;
  dictionary: Dictionary;
}

export default function EventCalendar({
  events,
  lang,
  dictionary,
}: EventCalendarProps) {
  const [isSmallDesktop, setIsSmallDesktop] = useState(false);

  const ctx = useContext(SelectedViewContext);
  const router = useRouter();

  // Hacky solution to fix overlapping events styling
  const calendarRef = useRef<FullCalendar>(null);

  // Don't rely on user timezone and always use Finland
  const currentDate = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Europe/Helsinki' }),
  );

  const handleEventClick: CalendarListeners['eventClick'] = (e) => {
    const eventUrl = `/${lang}/events/${events.find((event) => event.id === e.event.id)?.slug}`;

    if (e.jsEvent.metaKey || e.jsEvent.ctrlKey) {
      window.open(eventUrl, '_blank');
      return;
    }

    router.push(eventUrl);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsSmallDesktop(window.innerWidth < 1280);
      calendarRef?.current?.getApi().updateSize();
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      className={`${ctx.desktopCalendarFullSize ? 'fixed left-0 top-0 z-50 h-screen w-screen' : ''}`}
    >
      <div
        className={`${ctx.desktopCalendarFullSize ? 'flex h-full w-full bg-white p-6 dark:bg-background-50' : ''}`}
      >
        <FullCalendar
          ref={calendarRef}
          aspectRatio={isSmallDesktop ? 0.8 : 1.35}
          buttonText={
            lang === 'fi'
              ? {
                  today: 'Tänään',
                  month: 'Kuukausi',
                  week: 'Viikko',
                }
              : {
                  today: 'Today',
                  month: 'Month',
                  week: 'Week',
                }
          }
          customButtons={{
            toggleSize: {
              text: ctx.desktopCalendarFullSize
                ? dictionary.general.zoom_calendar_off
                : dictionary.general.zoom_calendar_on,
              click: () =>
                ctx.setDesktopCalendarFullSize(!ctx.desktopCalendarFullSize),
            },
          }}
          datesSet={(args) => {
            const visibleStart = new Date(args.start);

            if (visibleStart.getDate() === 1) {
              ctx.setActiveCalendarMonth(
                new Date(
                  visibleStart.getFullYear(),
                  visibleStart.getMonth(),
                  1,
                ),
              );
            } else {
              ctx.setActiveCalendarMonth(
                new Date(
                  visibleStart.getFullYear(),
                  visibleStart.getMonth() + 1,
                  1,
                ),
              );
            }
          }}
          dayHeaderFormat={
            isSmallDesktop
              ? {
                  weekday: 'short',
                  day: 'numeric',
                  omitCommas: true,
                }
              : {
                  weekday: 'long',
                }
          }
          dayMaxEventRows={4}
          dayMaxEvents={4}
          eventClick={handleEventClick}
          eventContent={function (arg) {
            return (
              <Tooltip content={arg.event.title}>
                <p className="overflow-hidden pl-[2px] text-left text-xs">
                  {arg.timeText}{' '}
                  <span className="font-bold dark:font-normal">
                    {arg.event.title
                      .toLowerCase()
                      .includes(dictionary.general.opens) && (
                      <HiOutlineClipboardDocumentList className="mr-1 inline-block text-blue-600" />
                    )}
                    {arg.event.title}
                  </span>
                </p>
              </Tooltip>
            );
          }}
          eventOrderStrict={true}
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: false,
            hour12: false,
          }}
          events={events.map((event) => {
            // Force multi-day events to display as block elements since `nextDayThreshold`
            // prevents FullCalendar from automatically detecting them as multi-day.
            if (event.start.getDate() != event.end.getDate()) {
              (event as Event & { display: string }).display = 'block';
            }

            return event;
          })}
          firstDay={1}
          headerToolbar={
            isSmallDesktop
              ? {
                  left: 'title',
                  center: 'prev,next today',
                  right: 'dayGridMonth toggleSize',
                }
              : {
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek toggleSize',
                }
          }
          height={ctx.desktopCalendarFullSize ? '100%' : undefined}
          initialDate={currentDate}
          initialView={'dayGridMonth'}
          locale={lang === 'fi' ? fiLocale : ''}
          nextDayThreshold="06:00"
          plugins={[dayGridPlugin, timeGridPlugin]}
          slotLabelFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: false,
            hour12: false,
          }}
          titleFormat={{
            year: 'numeric',
            month: 'long',
          }}
          weekends
        />
      </div>
    </div>
  );
}
