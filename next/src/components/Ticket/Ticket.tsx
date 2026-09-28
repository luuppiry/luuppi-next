'use client';
import { reservationCreate } from '@/actions/reservation-create';
import { useCountdown } from './useCountdown';
import { firstLetterToUpperCase } from '@/libs/utils/first-letter-uppercase';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BuyTicketsButton } from './BuyTicketsButton';
import ErrorDialog from './ErrorDialog';
import TicketAmountDialog from './TicketAmountDialog';

interface TicketProps {
  ticket: {
    uid?: string;
    name: string;
    location: string;
    price: number;
    registrationStartsAt: Date;
    registrationEndsAt: Date;
    role: string | undefined | null;
    maxTicketsPerUser: number;
  };
  eventStartsAt: Date;
  lang: SupportedLanguage;
  dictionary: Dictionary;
  disabled?: boolean;
  isOwnQuota?: boolean;
  targetedRole?: string;
  eventDocumentId: string;
}

export default function Ticket({
  ticket,
  eventStartsAt,
  lang,
  dictionary,
  disabled = false,
  isOwnQuota = false,
  eventDocumentId,
  targetedRole,
}: TicketProps) {
  const { started, ...countdown } = useCountdown(ticket.registrationStartsAt);

  const [amount, setAmount] = useState(1);
  const [amountModalOpen, setAmountModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [routeRefreshedOnce, setRouteRefreshedOnce] = useState(false);
  const [response, setResponse] = useState<{
    message: string;
    isError: boolean;
  } | null>(null);
  const router = useRouter();
  const hasSelectableAmount = ticket.maxTicketsPerUser > 1;

  const handleSubmit = async () => {
    if (!ticket.uid || !ticket.role) {
      setResponse({ message: dictionary.api.invalid_event, isError: true });
      return;
    }
    setLoading(true);
    try {
      const res = await reservationCreate(
        eventDocumentId,
        amount,
        lang,
        ticket.role,
        targetedRole,
        ticket.uid,
      );
      setAmountModalOpen(false);

      if (res.reloadCache && !routeRefreshedOnce) {
        setRouteRefreshedOnce(true);
        router.refresh();
      } else if (res.isError) {
        setResponse(res);
      } else {
        router.push(`/${lang}/own-events`);
        router.refresh();
      }
    } catch {
      setResponse({ message: dictionary.api.server_error, isError: true });
    } finally {
      setLoading(false);
    }
  };

  const startLabel =
    dictionary.pages_events[
      ticket.price ? 'ticket_sales_start' : 'registration_starts'
    ];
  const startDate = ticket.registrationStartsAt.toLocaleDateString(lang, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Helsinki',
  });

  return (
    <>
      <TicketAmountDialog
        amount={amount}
        dictionary={dictionary}
        loading={loading}
        maxAmount={ticket.maxTicketsPerUser}
        open={amountModalOpen}
        setAmount={setAmount}
        submit={() => handleSubmit()}
        onClose={() => setAmountModalOpen(false)}
      />
      <ErrorDialog
        dictionary={dictionary}
        open={!!response}
        response={response!}
        onClose={() => setResponse(null)}
      />
      <div
        className={`indicator flex w-full gap-4 rounded-lg bg-background-50 ${disabled ? 'opacity-40 grayscale' : ''}`}
      >
        {isOwnQuota && (
          <span className="badge indicator-item badge-primary badge-sm indicator-center">
            {dictionary.pages_events.your_quota}
          </span>
        )}
        <span className="w-1 shrink-0 rounded-l-lg bg-secondary-400" />
        <DateBlock date={eventStartsAt} lang={lang} />
        <span className="w-0.5 shrink-0 rounded-l-lg bg-gray-400/10" />

        <div className="flex w-full flex-col justify-center gap-1 p-4">
          <p className="break-all text-lg font-semibold max-md:text-base">
            {ticket.name}
          </p>
          <div className="flex justify-between">
            <p className="line-clamp-1 break-all text-sm">{ticket.location}</p>
            <p className="badge badge-primary badge-lg whitespace-nowrap max-md:badge-md">
              {ticket.price.toFixed(2)} €
            </p>
          </div>

          {started ? (
            <BuyTicketsButton
              dictionary={dictionary}
              disabled={disabled}
              isFreeTicket={ticket.price === 0}
              loading={loading}
              onClick={
                hasSelectableAmount
                  ? () => setAmountModalOpen(true)
                  : handleSubmit
              }
            />
          ) : (
            <div className="mt-2">
              <p>{startLabel}</p>
              {countdown.days === 0 && (
                <Countdown dictionary={dictionary} values={countdown} />
              )}
              <p className="font-semibold">{startDate}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const formatDate = (d: Date, lang: string, opts: Intl.DateTimeFormatOptions) =>
  firstLetterToUpperCase(d.toLocaleDateString(lang, opts));

function DateBlock({ date, lang }: { date: Date; lang: SupportedLanguage }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 max-md:px-0">
      <p className="text-4xl font-semibold text-accent-400 max-md:text-2xl dark:text-accent-700">
        {date.toLocaleDateString(lang, { day: '2-digit' })}
      </p>
      <p className="truncate text-lg font-semibold max-md:text-base">
        {formatDate(date, lang, { month: 'short', year: 'numeric' })}
      </p>
      <p className="text-sm">{formatDate(date, lang, { weekday: 'long' })}</p>
    </div>
  );
}

const TIME_UNITS = ['days', 'hours', 'minutes', 'seconds'] as const;

function Countdown({
  values,
  dictionary,
}: {
  values: Record<(typeof TIME_UNITS)[number], number>;
  dictionary: Dictionary;
}) {
  return (
    <div className="mb-1 flex gap-5">
      {TIME_UNITS.map((unit) => (
        <div key={unit} className="text-sm">
          <span className="countdown font-mono text-2xl max-md:text-lg">
            {/* @ts-expect-error not supported */}
            <span style={{ '--value': values[unit] }} />
          </span>
          <span className="sm:hidden">
            {dictionary.general[`${unit}_short`]}
          </span>
          <span className="max-sm:hidden">{dictionary.general[unit]}</span>
        </div>
      ))}
    </div>
  );
}
