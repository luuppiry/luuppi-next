'use client';
import { Event } from '@/models/event';
import { SupportedLanguage } from '@/models/locale';
import fiLocale from '@fullcalendar/core/locales/fi';
import dayGridPlugin from '@fullcalendar/daygrid';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import './EventCalendar.css';

interface EventCalendarProps {
  events: Event[];
  lang: SupportedLanguage;
}

export default function EventCalendar({ events, lang }: EventCalendarProps) {
  const [isSmallDesktop, setIsSmallDesktop] = useState(false);

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
      datesSet={() => {
        setTimeout((): void => {
          calendarRef?.current?.getApi().updateSize();
        }, 0);
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
              right: 'dayGridMonth,timeGridWeek',
            }
          : {
              left: 'title',
              center: 'prev,next today',
              right: 'dayGridMonth',
            }
      }
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
  );
}
