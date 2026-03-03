import { Event } from '@/models/event';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { SelectedViewContext } from '@/providers/EventSelectorProvider';
import { useContext, useMemo, useState } from 'react';
import { BiArrowToLeft, BiArrowToRight } from 'react-icons/bi';
import ViewEventsDialog from './ViewEventsDialog/ViewEventsDialog';

const DAY_CUT_OFF = 6;

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

  // Always start with Monday regardless of locale
  daysOfWeek.push(daysOfWeek.shift());

  return daysOfWeek;
};

const formatToDateKey = (dateString: string | Date) => {
  const d = new Date(dateString);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function groupEventsWithLanes(
  events: Event[],
): Record<string, { event: Event; lane: number }[]> {
  const sorted = [...events].sort((a, b) => {
    const aStart = new Date(a.start).getTime();
    const bStart = new Date(b.start).getTime();
    if (aStart !== bStart) return aStart - bStart;

    const aEnd = new Date(a.end || a.start).getTime();
    const bEnd = new Date(b.end || b.start).getTime();
    return bEnd - aEnd;
  });

  const result: Record<string, { event: Event; lane: number }[]> = {};

  for (const event of sorted) {
    if (!event.start) continue;

    const start = new Date(event.start);
    const end = event.end ? new Date(event.end) : new Date(event.start);

    const visualEnd = new Date(end);
    const endsBeforeCutoff = end.getHours() < DAY_CUT_OFF;
    const spansMultipleDays =
      end.getDate() !== start.getDate() || end.getMonth() !== start.getMonth();

    if (endsBeforeCutoff && spansMultipleDays) {
      visualEnd.setDate(visualEnd.getDate() - 1);
    }

    const eventDates: string[] = [];
    const temp = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate(),
    );

    while (temp <= visualEnd) {
      eventDates.push(formatToDateKey(temp));
      temp.setDate(temp.getDate() + 1);
    }

    let lane = 0;
    while (true) {
      const isLaneBusy = eventDates.some((dateKey) => {
        const dayOccupants = result[dateKey] || [];
        return dayOccupants.some((item) => item.lane === lane);
      });

      if (!isLaneBusy) break;
      lane++;
    }

    for (const dateKey of eventDates) {
      if (!result[dateKey]) result[dateKey] = [];
      result[dateKey].push({ event, lane });
    }
  }
  return result;
}

interface MobileCalendarProps {
  lang: SupportedLanguage;
  events: Event[];
  dictionary: Dictionary;
}

const generateMonthGrid = (
  year: number,
  month: number,
): (number | null)[][] => {
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Always use Monday as first day of week (adjust Sunday from 0 to 6)
  const adjustedFirstDay = (firstDayOfMonth + 6) % 7;

  const grid: (number | null)[][] = [];
  let dayCounter = 1;

  const rows = Math.ceil((adjustedFirstDay + daysInMonth) / 7);

  for (let i = 0; i < rows; i++) {
    const week: (number | null)[] = [];
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
    () => generateMonthGrid(currentYear, currentMonth),
    [currentYear, currentMonth],
  );
  const groupedEvents = useMemo(() => groupEventsWithLanes(events), [events]);

  const openDayEventsDialog = (date: string) => {
    const dayEvents = groupedEvents[date];
    setSelectedEvents(dayEvents ? dayEvents.map((item) => item.event) : []);
  };

  const handleClose = () => {
    setSelectedEvents([]);
  };

  return (
    <div className="w-full bg-white py-4 dark:bg-base-100">
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
          if (day === null) {
            return (
              <div
                key={idx}
                className="min-h-[4rem] w-full rounded-lg bg-gray-50 dark:bg-background-100"
              />
            );
          }

          const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayEvents = groupedEvents[dateKey] || [];

          const MAX_VISIBLE_LANES = 3;
          const slots = Array(MAX_VISIBLE_LANES).fill(null);
          dayEvents.forEach((item) => {
            if (item.lane < MAX_VISIBLE_LANES) {
              slots[item.lane] = item.event;
            }
          });

          const overflowCount = dayEvents.filter(
            (item) => item.lane >= MAX_VISIBLE_LANES,
          ).length;

          const isToday =
            day === todayDate &&
            currentMonth === todayMonth &&
            currentYear === todayYear;
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          yesterday.setHours(23, 59, 59, 999);

          const isPast = new Date(dateKey) < yesterday;

          const hasEvents = dayEvents.length > 0;

          const dayOfWeekIndex = idx % 7;

          return (
            <button
              key={idx}
              className={`relative flex min-h-[4rem] w-full flex-col items-center rounded-lg py-1 text-center transition-all duration-300 ease-in-out dark:bg-background-100 ${
                isToday
                  ? 'bg-[#fffadf] font-bold dark:bg-yellow-800/30'
                  : 'bg-gray-50'
              } ${hasEvents && 'hover:bg-gray-200 focus:bg-gray-200 dark:hover:bg-primary-200 dark:focus:bg-primary-200'}`}
              disabled={!hasEvents}
              onClick={() => openDayEventsDialog(dateKey)}
            >
              <span className={`text-sm ${isPast ? 'text-gray-400' : ''}`}>
                {day || ''}
              </span>

              {hasEvents && (
                <div className="mt-1 flex w-full flex-col gap-1">
                  {slots.map((event, laneIndex) => {
                    if (!event)
                      return <div key={laneIndex} className="h-1.5 w-full" />;

                    const startKey = formatToDateKey(event.start);
                    const continuesLeft = dateKey !== startKey;
                    const isRowStart = dayOfWeekIndex === 0;

                    const realEnd = event.end
                      ? new Date(event.end)
                      : new Date(event.start);

                    const isPreviousDate =
                      realEnd.getHours() < DAY_CUT_OFF &&
                      realEnd.getDate() !== new Date(event.start).getDate();

                    const visualEndKey = isPreviousDate
                      ? formatToDateKey(
                          new Date(realEnd.getTime() - 6 * 60 * 60 * 1000),
                        )
                      : formatToDateKey(realEnd);

                    const extendsLeft = continuesLeft && !isRowStart;
                    const extendsRight =
                      dateKey !== visualEndKey && dayOfWeekIndex !== 6;

                    let lineClasses = `h-1.5 ${isPast ? 'bg-gray-300 dark:bg-gray-600' : 'bg-secondary-400'}`;

                    if (!extendsLeft && !extendsRight) {
                      lineClasses +=
                        ' w-[calc(100%-0.5rem)] rounded-full mx-auto';
                    } else if (!extendsLeft && extendsRight) {
                      lineClasses +=
                        ' w-[calc(100%+0.25rem)] rounded-l-full ml-1';
                    } else if (extendsLeft && !extendsRight) {
                      lineClasses +=
                        ' w-[calc(100%+0.25rem)] rounded-r-full -ml-2';
                    } else {
                      lineClasses += ' w-[calc(100%+1rem)] -ml-2';
                    }

                    return (
                      <div
                        key={`${event.id || laneIndex}-${dateKey}`}
                        className={lineClasses}
                      />
                    );
                  })}

                  {overflowCount > 0 && (
                    <span className="mt-0.5 text-[10px] leading-none text-gray-500">
                      +{overflowCount}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
