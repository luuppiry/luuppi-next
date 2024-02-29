import { getDictionary } from '@/dictionaries';
import { Event } from '@/models/event';
import { SupportedLanguage } from '@/models/locale';
import Link from 'next/link';

interface ViewEventsDialogProps {
  events: Event[];
  onClose: () => void;
  lang: SupportedLanguage;
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
}

export default function ViewEventsDialog({
  events,
  onClose,
  lang,
  dictionary,
}: ViewEventsDialogProps) {
  if (!events) return null;

  return (
    <dialog
      className={`modal modal-bottom sm:modal-middle ${events && events.length > 0 ? 'modal-open' : ''}`}
    >
      <div className="modal-box">
        <h2 className="mb-2 text-lg font-bold">
          {new Intl.DateTimeFormat(lang, {
            month: 'long',
            year: 'numeric',
            day: 'numeric',
          }).format(events[0]?.start)}{' '}
        </h2>
        {events && events.length > 0 && (
          <>
            {events.map((event) => (
              <Link
                key={event.id}
                className="mb-4 block rounded-lg bg-background-50/50 p-4"
                href={`/${lang}/events/${event.id}`}
              >
                <h3 className="text-lg font-bold">{event.title}</h3>
                <p className="line-clamp-3 text-sm">{event.description}</p>
              </Link>
            ))}
          </>
        )}
        <div className="modal-action">
          <form method="dialog">
            <button className="btn" onClick={onClose}>
              {dictionary.general.close}
            </button>
          </form>
        </div>
      </div>
      <label className="modal-backdrop" onClick={onClose}>
        Close
      </label>
    </dialog>
  );
}
