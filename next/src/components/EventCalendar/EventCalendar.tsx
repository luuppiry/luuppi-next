'use client';
import { Event } from '@/models/event';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { SelectedViewContext } from '@/providers/EventSelectorProvider';
import fiLocale from '@fullcalendar/core/locales/fi';
import dayGridPlugin from '@fullcalendar/daygrid';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useRef, useState } from 'react';
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

  const handleEventClick = (e: any) => {
    const eventId = e.event.id;
    router.push(`/${lang}/events/${eventId}`);
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
        className={`${ctx.desktopCalendarFullSize ? 'flex h-full w-full bg-white p-6' : ''}`}
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
          dayHeaderFormat={
            isSmallDesktop
              ? {
                  weekday: 'short',
                  day: 'numeric',
                  omitCommas: true,
                }
              : {
                  weekday: 'long',
                  day: 'numeric',
                }
          }
          dayMaxEventRows={4}
          dayMaxEvents={4}
          eventClick={handleEventClick}
          eventContent={function (arg) {
            return (
              <span className="tooltip block w-full" data-tip={arg.event.title}>
                <p className="overflow-hidden pl-[2px] text-left text-xs">
                  {arg.timeText}{' '}
                  <span className="font-bold">{arg.event.title}</span>
                </p>
              </span>
            );
          }}
          eventOrderStrict={true}
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: false,
            hour12: false,
          }}
          events={events}
          headerToolbar={
            !isSmallDesktop
              ? {
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek toggleSize',
                }
              : {
                  left: 'title',
                  center: 'prev,next today',
                  right: 'dayGridMonth toggleSize',
                }
          }
          height={ctx.desktopCalendarFullSize ? '100%' : undefined}
          initialView={'dayGridMonth'}
          locale={lang === 'fi' ? fiLocale : ''}
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
          weekends={true}
        />
      </div>
    </div>
  );
}
