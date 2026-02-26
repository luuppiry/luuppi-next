import { auth } from '@/auth';
import PayButton from '@/components/PayButton/PayButton';
import QuestionDialog from '@/components/QuestionDialog/QuestionDialog';
import Registration from '@/components/Registration/Registration';
import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { checkStatus } from '@/libs/payments/check-status';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { logger } from '@/libs/utils/logger';
import { SupportedLanguage } from '@/models/locale';
import QuestionProvider from '@/providers/QuestionProvider';
import { APIResponse } from '@/types/types';
import { Payment, PaymentStatus } from '@prisma/client';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import qs from 'qs';
import { BiErrorCircle } from 'react-icons/bi';

interface OwnEventsProps {
  params: Promise<{ lang: SupportedLanguage }>;
}

export default async function OwnEvents(props: OwnEventsProps) {
  const params = await props.params;
  const dictionary = await getDictionary(params.lang);

  const session = await auth();
  if (!session?.user) {
    logger.error('Error getting user');
    redirect(`/${params.lang}`);
  }

  let userEventRegistrations = await prisma.eventRegistration.findMany({
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
        {
          paymentCompleted: false,
          payments: {
            some: {
              status: 'PENDING',
            },
          },
        },
      ],
    },
    include: {
      user: true,
      answers: true,
      event: true,
      payments: true,
    },
  });

  const payments = userEventRegistrations.flatMap(
    (registration) => registration.payments,
  );

  const pendingPayments = payments.filter(
    (payment) => payment.status === 'PENDING',
  );

  const updatePaymentStatus = async (
    payment: Payment,
    status: PaymentStatus,
    paymentCompleted: boolean,
  ) => {
    logger.info('Setting pending payment status to', status);
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status,
        registration: {
          updateMany: {
            where: {},
            data: { paymentCompleted },
          },
        },
      },
    });

    userEventRegistrations = userEventRegistrations.map((registration) => {
      if (registration.payments.some((p) => p.id === payment.id)) {
        return {
          ...registration,
          paymentCompleted,
        };
      }
      return registration;
    });
  };

  const processPendingPayments = async () => {
    if (!pendingPayments.length) return;

    for await (const payment of pendingPayments) {
      const paymentStatus = await checkStatus(payment.orderId);
      if (paymentStatus && (paymentStatus.successful || paymentStatus.failed)) {
        const status = paymentStatus.successful ? 'COMPLETED' : 'CANCELLED';
        const paymentCompleted = paymentStatus.successful;
        await updatePaymentStatus(payment, status, paymentCompleted);
      }
    }
  };

  await processPendingPayments();

  const uniqueUpcomingEventIds: string[] = Array.from(
    new Set(
      userEventRegistrations
        .filter(
          (registration) => new Date(registration.event.endDate) >= new Date(),
        )
        .map((registration) => registration.eventDocumentId),
    ),
  );

  const tickets = (
    await Promise.all(
      uniqueUpcomingEventIds.map(async (eventDocumentId) => {
        const query = qs.stringify({
          populate: {
            Registration: {
              populate: ['TicketTypes'],
            },
          },
        });

        const url = `/api/events/${eventDocumentId}?${query}`;

        const events = await getStrapiData<APIResponse<'api::event.event'>>(
          params.lang,
          url,
          [`event-${eventDocumentId}`],
          true,
        );

        const event = events?.data;

        if (!event?.Registration) {
          return null;
        }

        return event.Registration.TicketTypes;
      }),
    )
  )
    .filter(Boolean)
    .flat();

  const upcomingEventQuestions = await Promise.all(
    uniqueUpcomingEventIds.map(async (eventDocumentId) => {
      const url = `/api/events/${eventDocumentId}?populate[Registration][populate][0]=QuestionsText&populate[Registration][populate][1]=QuestionsSelect&populate[Registration][populate][2]=QuestionsCheckbox`;

      const events = await getStrapiData<APIResponse<'api::event.event'>>(
        params.lang,
        url,
        [`event-${eventDocumentId}`],
        true,
      );

      const event = events?.data;

      return {
        eventDocumentId,
        text: event?.Registration?.QuestionsText ?? [],
        select: event?.Registration?.QuestionsSelect ?? [],
        checkbox: event?.Registration?.QuestionsCheckbox ?? [],
        answerableUntil: event?.Registration?.AllowQuestionEditUntil
          ? new Date(event?.Registration?.AllowQuestionEditUntil)
          : null,
      };
    }),
  );

  const registrationsFormatted = userEventRegistrations.map((registration) => ({
    name: registration.event[params.lang === 'fi' ? 'nameFi' : 'nameEn'],
    location:
      registration.event[params.lang === 'fi' ? 'locationFi' : 'locationEn'],
    startDate: registration.event.startDate,
    endDate: registration.event.endDate,
    price: registration.price,
    createdAt: registration.createdAt,
    reservedUntil: registration.reservedUntil,
    paymentCompleted: registration.paymentCompleted,
    deletedAt: registration.deletedAt,
    id: registration.id,
    ticketUid: registration.strapiTicketUid,
    eventDocumentId: registration.eventDocumentId,
    pickupCode: registration.pickupCode,
    pickedUp: registration.pickedUp,
  }));

  const paidRegistrations = registrationsFormatted
    .filter((registration) => registration.paymentCompleted)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const unpaidRegistrations = registrationsFormatted
    .filter(
      (registration) =>
        !registration.paymentCompleted &&
        registration.reservedUntil >= new Date() &&
        registration.deletedAt === null,
    )
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const isFreeTicket = !unpaidRegistrations.some((reg) => reg.price !== 0);
  const ticket = tickets.find((ticket) =>
    unpaidRegistrations.find((reg) => reg.ticketUid === ticket?.uid),
  );

  const getQuestionsForEvent = (eventDocumentId: string) =>
    upcomingEventQuestions.find(
      (eventQuestions) => eventQuestions.eventDocumentId === eventDocumentId,
    ) ?? {
      text: [],
      select: [],
      checkbox: [],
      eventDocumentId,
      answerableUntil: null,
    };

  const getAnswersForReservation = (registrationId: number) =>
    userEventRegistrations.find(
      (registration) => registration.id === registrationId,
    )?.answers ?? [];

  const unpaidRegistrationsHaveUnansweredQuestions = unpaidRegistrations.some(
    (registration) => {
      const questions = getQuestionsForEvent(registration.eventDocumentId);
      const answers = getAnswersForReservation(registration.id);

      const questionsCount =
        questions.text.length +
        questions.select.length +
        questions.checkbox.length;

      const answersCount = answers.length;

      return questionsCount > 0 && answersCount === 0;
    },
  );

  return (
    <div className="relative">
      <QuestionProvider>
        <QuestionDialog dictionary={dictionary} lang={params.lang} />
        <h1 className="mb-12">{dictionary.navigation.own_events}</h1>
        {Boolean(unpaidRegistrations.length) && (
          <div className="alert mb-4 rounded-lg bg-red-200 text-sm text-red-800">
            <BiErrorCircle size={24} />
            {
              dictionary.pages_events[
                isFreeTicket
                  ? 'unredeemed_reservations_info'
                  : 'unpaid_reservations_info'
              ]
            }
          </div>
        )}
        {userEventRegistrations.length === 0 && (
          <div className="alert rounded-lg bg-blue-200 text-blue-800">
            <BiErrorCircle size={24} />
            {dictionary.pages_events.no_reservations}
          </div>
        )}
        <div className="flex w-full flex-col gap-8">
          {Boolean(unpaidRegistrations.length) && (
            <div>
              <h2 className="mb-4 text-2xl font-bold">
                {
                  dictionary.pages_events[
                    isFreeTicket
                      ? 'unredeemed_registrations'
                      : 'unpaid_registrations'
                  ]
                }
              </h2>
              <div className="flex flex-col gap-4">
                {unpaidRegistrations.map((registration) => (
                  <Registration
                    key={registration.id}
                    answers={getAnswersForReservation(registration.id)}
                    dictionary={dictionary}
                    lang={params.lang}
                    questions={getQuestionsForEvent(
                      registration.eventDocumentId,
                    )}
                    registration={registration}
                    ticket={ticket}
                  />
                ))}
              </div>
              <PayButton
                dictionary={dictionary}
                hasUnansweredQuestions={
                  unpaidRegistrationsHaveUnansweredQuestions
                }
                isFreeTicket={isFreeTicket}
                lang={params.lang}
              />
            </div>
          )}
          {Boolean(paidRegistrations.length) && (
            <div>
              <h2 className="mb-4 text-2xl font-bold">
                {dictionary.pages_events.paid_registrations}
              </h2>
              <div className="flex flex-col gap-4">
                {paidRegistrations
                  .sort((a, b) => +b.startDate - +a.endDate)
                  .map((registration) => (
                    <Registration
                      key={registration.id}
                      answers={getAnswersForReservation(registration.id)}
                      dictionary={dictionary}
                      lang={params.lang}
                      questions={getQuestionsForEvent(
                        registration.eventDocumentId,
                      )}
                      registration={registration}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
        <div className="luuppi-pattern absolute -left-48 -top-10 -z-50 h-[701px] w-[801px] max-md:left-0 max-md:h-full max-md:w-full max-md:rounded-none" />
      </QuestionProvider>
    </div>
  );
}

export async function generateMetadata(
  props: OwnEventsProps,
): Promise<Metadata> {
  const params = await props.params;
  const dictionary = await getDictionary(params.lang);
  return {
    title: dictionary.navigation.own_events,
  };
}
