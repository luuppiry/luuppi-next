'use client';
import { reservationCreate } from '@/actions/reservation-create';
import { firstLetterToUpperCase } from '@/libs/utils/first-letter-uppercase';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ErrorDialog from './ErrorDialog';
import TicketAmountDialog from './TicketAmountDialog';

interface TicketProps {
  ticket: {
    name: string;
    location: string;
    price: number;
    registrationStartsAt: Date;
    registrationEndsAt: Date;
    role: string | undefined;
    maxTicketsPerUser: number;
  };
  eventId: number;
  eventStartsAt: Date;
  lang: SupportedLanguage;
  dictionary: Dictionary;
  disabled?: boolean;
  isOwnQuota?: boolean;
}

export default function Ticket({
  ticket,
  eventStartsAt,
  lang,
  dictionary,
  disabled = false,
  isOwnQuota = false,
  eventId,
}: TicketProps) {
  const [amount, setAmount] = useState(1);
  const [amountModalOpen, setAmountModalOpen] = useState(false);
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{
    message: string;
    isError: boolean;
  } | null>(null);

  const router = useRouter();

  const registrationStarted =
    new Date().getTime() > ticket.registrationStartsAt.getTime();
  const hasSelectableAmount = ticket.maxTicketsPerUser > 1;

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = ticket.registrationStartsAt.getTime() - now;

      setDays(Math.floor(distance / (1000 * 60 * 60 * 24)));
      setHours(
        Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      );
      setMinutes(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
      setSeconds(Math.floor((distance % (1000 * 60)) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  });

  const handleSubmit = async () => {
    setLoading(true);
    const res = await reservationCreate(eventId, amount, lang);
    router.refresh();
    setAmountModalOpen(false);
    setResponse(res);
    setLoading(false);
  };

  const handlePurchaseClick = () => {
    if (hasSelectableAmount) {
      setAmountModalOpen(true);
      return;
    }
    handleSubmit();
  };

  return (
    <div key={ticket.name}>
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
      {registrationStarted ? (
        <div
          className={`indicator flex w-full gap-4 rounded-lg bg-background-50/50 backdrop-blur-sm ${disabled ? 'grayscale' : ''}`}
        >
          {isOwnQuota && (
            <span className="badge indicator-item badge-primary badge-sm indicator-center">
              {dictionary.pages_events.your_quota}
            </span>
          )}
          <span className="w-1 shrink-0 rounded-l-lg bg-secondary-400" />
          <div className="flex flex-col items-center justify-center p-4 max-md:px-0">
            <p className="text-4xl font-semibold text-accent-400 max-md:text-2xl">
              {new Date(eventStartsAt).toLocaleDateString(lang, {
                day: '2-digit',
              })}
            </p>
            <p className="truncate text-lg font-semibold max-md:text-base">
              {firstLetterToUpperCase(
                new Date(eventStartsAt).toLocaleDateString(lang, {
                  month: 'short',
                  year: 'numeric',
                }),
              )}
            </p>
            <p className="text-sm">
              {firstLetterToUpperCase(
                new Date(eventStartsAt).toLocaleDateString(lang, {
                  weekday: 'long',
                }),
              )}
            </p>
          </div>
          <span className="w-0.5 shrink-0 rounded-l-lg bg-gray-400/10" />
          <div className="flex w-full flex-col justify-center gap-1 p-4">
            <p className="line-clamp-2 text-lg font-semibold max-md:text-base">
              {ticket.name}
            </p>
            <div className="flex justify-between">
              <p className="line-clamp-1 break-all text-sm">
                {ticket.location}
              </p>
              <p className="badge badge-primary badge-lg whitespace-nowrap max-md:badge-md">
                {ticket.price.toFixed(2)} €
              </p>
            </div>
            <div>
              <button
                className="btn btn-primary btn-sm whitespace-nowrap max-md:btn-xs"
                disabled={disabled}
                onClick={handlePurchaseClick}
              >
                {loading && !hasSelectableAmount ? (
                  <div className="min-w-16">
                    <span className="loading loading-spinner loading-md" />
                  </div>
                ) : (
                  dictionary.pages_events.buy_tickets
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`indicator flex w-full gap-4 rounded-lg bg-background-50/50 backdrop-blur-sm ${disabled ? 'grayscale' : ''}`}
        >
          {isOwnQuota && (
            <span className="badge indicator-item badge-primary badge-sm indicator-center">
              {dictionary.pages_events.your_quota}
            </span>
          )}
          <span className="w-1 shrink-0 rounded-l-lg bg-secondary-400" />
          <div className="flex flex-col items-center justify-center p-4 max-md:px-0">
            <p className="text-4xl font-semibold text-accent-400 max-md:text-2xl">
              {new Date(eventStartsAt).toLocaleDateString(lang, {
                day: '2-digit',
              })}
            </p>
            <p className="truncate text-lg font-semibold max-md:text-base">
              {firstLetterToUpperCase(
                new Date(eventStartsAt).toLocaleDateString(lang, {
                  month: 'short',
                  year: 'numeric',
                }),
              )}
            </p>
            <p className="text-sm">
              {firstLetterToUpperCase(
                new Date(eventStartsAt).toLocaleDateString(lang, {
                  weekday: 'long',
                }),
              )}
            </p>
          </div>
          <span className="w-0.5 shrink-0 rounded-l-lg bg-gray-400/10" />
          <div className="flex w-full flex-col justify-center gap-1 p-4">
            <p className="line-clamp-2 text-lg font-semibold max-md:text-base">
              {ticket.name}
            </p>
            <div className="flex justify-between">
              <p className="line-clamp-1 break-all text-sm">
                {ticket.location}
              </p>
              <p className="badge badge-primary badge-lg whitespace-nowrap max-md:badge-md">
                {ticket.price.toFixed(2)} €
              </p>
            </div>
            <div className="mt-2">
              {days < 30 ? (
                <div className="flex gap-5">
                  <div className="text-sm">
                    <span className="countdown font-mono text-2xl max-md:text-lg">
                      {/* @ts-expect-error */}
                      <span style={{ '--value': days }} />
                    </span>
                    <span className="sm:hidden">
                      {dictionary.general.days_short}
                    </span>
                    <span className="max-sm:hidden">
                      {dictionary.general.days}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="countdown font-mono text-2xl max-md:text-lg">
                      {/* @ts-expect-error */}
                      <span style={{ '--value': hours }} />
                    </span>
                    <span className="sm:hidden">
                      {dictionary.general.hours_short}
                    </span>
                    <span className="max-sm:hidden">
                      {dictionary.general.hours}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="countdown font-mono text-2xl max-md:text-lg">
                      {/* @ts-expect-error */}
                      <span style={{ '--value': minutes }} />
                    </span>
                    <span className="sm:hidden">
                      {dictionary.general.minutes_short}
                    </span>
                    <span className="max-sm:hidden">
                      {dictionary.general.minutes}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="countdown font-mono text-2xl max-md:text-lg">
                      {/* @ts-expect-error */}
                      <span style={{ '--value': seconds }} />
                    </span>
                    <span className="sm:hidden">
                      {dictionary.general.seconds_short}
                    </span>
                    <span className="max-sm:hidden">
                      {dictionary.general.seconds}
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <p>{dictionary.pages_events.registration_starts}</p>
                  <p className="font-semibold">
                    {ticket.registrationStartsAt.toLocaleDateString(lang, {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
