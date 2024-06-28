import { cancelReservation } from '@/actions/cancel-reservation';
import { auth } from '@/auth';
import SubmitButton from '@/components/SubmitButton/SubmitButton';
import { getDictionary } from '@/dictionaries';
import { longDateFormat, shortTimeFormat } from '@/libs/constants';
import prisma from '@/libs/db/prisma';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { firstLetterToUpperCase } from '@/libs/utils/first-letter-uppercase';
import { logger } from '@/libs/utils/logger';
import { SupportedLanguage } from '@/models/locale';
import { APIResponse } from '@/types/types';
import { redirect } from 'next/navigation';
import { BiErrorCircle } from 'react-icons/bi';

interface OwnEventsProps {
  params: { lang: SupportedLanguage };
}

export default async function OwnEvents({ params }: OwnEventsProps) {
  const dictionary = await getDictionary(params.lang);
  const cancelReservationAction = cancelReservation.bind(null, params.lang);

  const session = await auth();
  if (!session?.user) {
    logger.error('Error getting user');
    redirect(`/${params.lang}`);
  }

  const userEventRegistrations = await prisma.eventRegistration.findMany({
    where: {
      entraUserUuid: session.user.entraUserUuid,
      deletedAt: null,
      OR: [
        {
          reservedUntil: {
            gte: new Date(),
          },
        },
        {
          paymentCompleted: true,
        },
      ],
    },
    include: {
      user: true,
    },
  });

  const hasUnpaidRegistrations = userEventRegistrations.some(
    (registration) =>
      !registration.paymentCompleted &&
      registration.reservedUntil >= new Date() &&
      registration.deletedAt === null,
  );

  const uniqueEventIds = Array.from(
    new Set(userEventRegistrations.map((registration) => registration.eventId)),
  );

  const strapiEventDataPromise = (await Promise.all(
    uniqueEventIds
      .map(async (eventId) => {
        const url = `/api/events/${eventId}`;
        const strapiEvent = await getStrapiData<
          APIResponse<'api::event.event'>
        >(params.lang, url, [`event-${eventId}`], true);
        return strapiEvent;
      })
      .filter((event) => event),
  )) as APIResponse<'api::event.event'>[];

  const strapiEventData = await Promise.all(strapiEventDataPromise);

  const registrationsWithStrapiData = userEventRegistrations
    .map((registration) => {
      const eventData = strapiEventData.find(
        (event) => event.data.id === registration.eventId,
      );
      return {
        ...registration,
        strapiData: {
          name: eventData?.data.attributes[
            params.lang === 'fi' ? 'NameFi' : 'NameEn'
          ],
          description:
            eventData?.data.attributes[
              params.lang === 'fi' ? 'DescriptionFi' : 'DescriptionEn'
            ],
          location:
            eventData?.data.attributes[
              params.lang === 'fi' ? 'LocationFi' : 'LocationEn'
            ],
          startDate: new Date(eventData?.data.attributes.StartDate!),
          endDate: new Date(eventData?.data.attributes.EndDate!),
        },
      };
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className="relative">
      <h1 className="mb-12">{dictionary.navigation.own_events}</h1>
      {hasUnpaidRegistrations && (
        <div className="alert mb-4 rounded-lg bg-red-200 text-sm text-red-800">
          <BiErrorCircle size={24} />
          {dictionary.pages_events.unpaid_reservations_info}
        </div>
      )}
      {registrationsWithStrapiData.length === 0 && (
        <div className="alert rounded-lg bg-blue-200 text-blue-800">
          <BiErrorCircle size={24} />
          {dictionary.pages_events.no_reservations}
        </div>
      )}
      <div className="flex w-full flex-col gap-4">
        {registrationsWithStrapiData.map((registration) => (
          <div
            key={registration.id}
            className="flex gap-4 rounded-lg bg-background-50/50 backdrop-blur-sm"
          >
            <span className="w-1 shrink-0 rounded-l-lg bg-secondary-400" />
            <div className="flex w-full justify-between gap-4 p-4 max-md:flex-col">
              <div className="flex flex-1 flex-col gap-2">
                <h2 className="flex items-center gap-2 text-lg font-semibold max-md:text-base">
                  <span className="max-w-xs truncate">
                    {registration.strapiData.name}
                  </span>
                  <span className="text-xs">(#{registration.id})</span>
                </h2>
                <h2 className="flex items-center gap-4 text-xl font-semibold max-md:text-lg">
                  <span>{registration.paidPrice?.toFixed(2)} €</span>
                  <span
                    className={`badge max-md:badge-sm ${
                      registration.paymentCompleted
                        ? 'badge-success'
                        : registration.deletedAt
                          ? 'badge-neutral'
                          : 'badge-warning'
                    }`}
                  >
                    {registration.paymentCompleted
                      ? dictionary.pages_events.paid
                      : dictionary.pages_events.reserved}
                  </span>
                </h2>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm">
                    {firstLetterToUpperCase(
                      registration.createdAt.toLocaleString(
                        params.lang,
                        longDateFormat,
                      ),
                    )}{' '}
                    {registration.createdAt.toLocaleString(
                      params.lang,
                      shortTimeFormat,
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-end gap-2">
                {registration.reservedUntil >= new Date() &&
                  !registration.paymentCompleted &&
                  registration.deletedAt === null && (
                    <form action={cancelReservationAction}>
                      <input
                        name="registrationId"
                        type="hidden"
                        value={registration.id}
                      />
                      <SubmitButton
                        className="btn-outline max-md:hidden"
                        size="sm"
                        text={dictionary.pages_events.cancel_reservation}
                        variant="error"
                      />
                    </form>
                  )}
                {registration.reservedUntil >= new Date() &&
                  !registration.paymentCompleted &&
                  registration.deletedAt === null && (
                    <button className="btn btn-primary btn-sm max-md:btn-xs">
                      {dictionary.pages_events.pay}
                    </button>
                  )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="luuppi-pattern absolute -left-48 -top-10 -z-50 h-[701px] w-[801px] max-md:left-0 max-md:h-full max-md:w-full max-md:rounded-none" />
    </div>
  );
}
