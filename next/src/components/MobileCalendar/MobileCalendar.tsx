import { Event } from '@/models/event';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { SelectedViewContext } from '@/providers/EventSelectorProvider';
import { useContext, useMemo, useState } from 'react';
import { BiArrowToLeft, BiArrowToRight } from 'react-icons/bi';
import ViewEventsDialog from './ViewEventsDialog/ViewEventsDialog';

const getDaysOfWeek = (locale: SupportedLanguage) => {
  const baseDate = new Date(Date.UTC(2021, 0, 10));
  const daysOfWeek = [];

  for (let i = 0; i < 7; i++) {
    daysOfWeek.push(
      new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(
        new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000),
      ),
    );
  }

  if (locale === 'fi') {
    daysOfWeek.push(daysOfWeek.shift());
  }

  return daysOfWeek;
};

const groupEventsByStartDate = (events: Event[]): Record<string, Event[]> =>
  events
    .filter((e) => e.start)
    .reduce(
      (acc, event) => {
        const startDate = event.start.toISOString().split('T')[0];
        if (!acc[startDate]) {
          acc[startDate] = [];
        }
        acc[startDate].push(event);
        return acc;
      },
      {} as Record<string, Event[]>,
    );

const generateMonthGrid = (
  year: number,
  month: number,
  locale: SupportedLanguage,
) => {
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const offset = locale === 'fi' ? -1 : 0;
  let adjustedFirstDay = (firstDayOfMonth + offset) % 7;
  if (adjustedFirstDay < 0) adjustedFirstDay += 7;

  let grid = [];
  let dayCounter = 1;

  const rows = Math.ceil((adjustedFirstDay + daysInMonth) / 7);

  for (let i = 0; i < rows; i++) {
    let week = [];
    for (let j = 0; j < 7; j++) {
      if ((i === 0 && j < adjustedFirstDay) || dayCounter > daysInMonth) {
        week.push(null);
      } else {
        week.push(dayCounter++);
      }
    }
    grid.push(week);
  }

  return grid;
};

interface MobileCalendarProps {
  lang: SupportedLanguage;
  events: Event[];
  dictionary: Dictionary;
}

export default function MobileCalendar({
  lang,
  events,
  dictionary,
}: MobileCalendarProps) {
  const today = new Date();
  const todayDate = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  const ctx = useContext(SelectedViewContext);
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);

  const currentYear = ctx.activeCalendarMonth.getFullYear();
  const currentMonth = ctx.activeCalendarMonth.getMonth();

  const handlePreviousMonth = () => {
    ctx.setActiveCalendarMonth(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    ctx.setActiveCalendarMonth(new Date(currentYear, currentMonth + 1, 1));
  };

  const daysOfWeek = useMemo(() => getDaysOfWeek(lang), [lang]);
  const monthGrid = useMemo(
    () => generateMonthGrid(currentYear, currentMonth, lang),
    [currentYear, currentMonth, lang],
  );
  const groupedEvents = useMemo(() => groupEventsByStartDate(events), [events]);

  const openDayEventsDialog = (date: string) => {
    const dayEvents = groupedEvents[date];
    setSelectedEvents(dayEvents);
  };

  const handleClose = () => {
    setSelectedEvents([]);
  };

  return (
    <div className="w-full bg-white py-4">
      <ViewEventsDialog
        dictionary={dictionary}
        events={selectedEvents}
        lang={lang}
        onClose={handleClose}
      />
      <div className="mb-4 flex items-center justify-between">
        <button
          className="btn btn-primary btn-sm"
          onClick={handlePreviousMonth}
        >
          <BiArrowToLeft size={26} />
        </button>
        <h2 className="font-bold">
          {new Date(currentYear, currentMonth).toLocaleDateString(lang, {
            month: 'long',
            year: 'numeric',
          })}
        </h2>
        <button className="btn btn-primary btn-sm" onClick={handleNextMonth}>
          <BiArrowToRight size={26} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-4">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center font-bold">
            {day}
          </div>
        ))}
        {monthGrid.flat().map((day, idx) => {
          const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayEvents = groupedEvents[dateKey] || [];
          const isToday =
            day === todayDate &&
            currentMonth === todayMonth &&
            currentYear === todayYear;
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          yesterday.setHours(23, 59, 59, 999);

          const isPast = new Date(dateKey) < yesterday;

          const hasEvents = dayEvents.length > 0;

          return (
            <button
              key={idx}
              className={`flex w-full flex-col items-center rounded-lg py-2 text-center transition-all duration-300 ease-in-out ${isToday ? 'bg-[#fffadf] font-bold' : 'bg-gray-50'} ${hasEvents && 'hover:bg-gray-200 focus:bg-gray-200'}`}
              disabled={!hasEvents}
              onClick={() => openDayEventsDialog(dateKey)}
            >
              {day || ''}
              {hasEvents && (
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full px-2 py-1 text-xs ${isPast ? 'bg-gray-400 text-white' : 'bg-secondary-400 text-white'}`}
                >
                  {dayEvents.length}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
