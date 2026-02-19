import { auth } from '@/auth';
import prisma from '@/libs/db/prisma';
import { getQuestion } from '@/libs/strapi/get-question';
import { getSelectChoice } from '@/libs/strapi/get-select-choice';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { logger } from '@/libs/utils/logger';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { APIResponse } from '@/types/types';
import { redirect } from 'next/navigation';
import { PiCheckCircle, PiCircle } from 'react-icons/pi';

interface AdminEventRegistrationsListProps {
  dictionary: Dictionary;
  eventId: number;
  lang: SupportedLanguage;
  requiresPickup: boolean;
}

export default async function AdminEventRegistrationsList({
  dictionary,
  eventId,
  lang,
  requiresPickup,
}: AdminEventRegistrationsListProps) {
  const session = await auth();

  if (!session?.user || !session.user.isLuuppiHato) {
    logger.error('User not found in session or does not have required role');
    redirect(`/${lang}`);
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      registrations: {
        where: { deletedAt: null, paymentCompleted: true },
        include: { user: true, answers: true },
        orderBy: { user: { email: 'asc' } },
      },
    },
  });

  if (!event) {
    return (
      <div className="card card-body bg-base-100 text-base-content">
        <p className="text-sm text-error">{dictionary.general.error}</p>
      </div>
    );
  }

  const strapiEvent = await getStrapiData<APIResponse<'api::event.event'>>(
    lang,
    `/api/events/${event.eventDocumentId}?populate[Registration][populate][0]=QuestionsText&populate[Registration][populate][1]=QuestionsSelect&populate[Registration][populate][2]=QuestionsCheckbox`,
    [`event-${eventId}`],
    true,
  );

  const registrations = event.registrations;

  if (!registrations.length) {
    return (
      <div className="card card-body bg-base-100 text-base-content">
        <p className="text-sm">{dictionary.general.no_registrations}</p>
      </div>
    );
  }

  // Collect all unique question keys across registrations
  const questionKeys = Array.from(
    new Set(
      registrations.flatMap((r) =>
        r.answers.map(
          (a) =>
            getQuestion(strapiEvent?.data, lang, a.question, a.type) ??
            a.question,
        ),
      ),
    ),
  );

  const pickedUpCount = registrations.filter((r) => r.pickedUp).length;

  return (
    <div className="card card-body bg-base-100 text-base-content">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {dictionary.general.registrations}
        </h2>
        {requiresPickup && (
          <span className="badge badge-primary">
            {dictionary.pages_admin.picked_up}: {pickedUpCount} /{' '}
            {registrations.length}
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          {questionKeys.length > 0 && (
            <colgroup>
              <col />
              {questionKeys.map((key) => (
                <col key={key} className="bg-base-200/60" />
              ))}
              {requiresPickup && <col />}
            </colgroup>
          )}
          <thead>
            <tr>
              <th>{dictionary.general.preferredFullName}</th>
              {questionKeys.length > 0 && (
                <th
                  className="text-primary/70 max-w-44 text-pretty break-words border-l-2 border-base-content/10"
                  colSpan={questionKeys.length}
                >
                  {dictionary.pages_admin.registration_answers}
                </th>
              )}
              {requiresPickup && (
                <th>
                  <span className="flex justify-center">
                    {dictionary.pages_admin.picked_up}
                  </span>
                </th>
              )}
            </tr>
            {questionKeys.length > 0 && (
              <tr>
                <th />
                {questionKeys.map((key, i) => (
                  <th
                    key={key}
                    className={`text-xs font-medium text-base-content/60 ${
                      i === 0 ? 'border-l-2 border-base-content/10' : ''
                    }`}
                  >
                    {key}
                  </th>
                ))}
                {requiresPickup && <th />}
              </tr>
            )}
          </thead>
          <tbody className="[&>*:nth-child(odd)]:bg-base-200/40">
            {registrations.map((registration) => {
              const firstname = (
                registration.user.preferredFullName ||
                registration.user.firstName
              )
                ?.split(' ')
                .at(0);
              const lastname = registration.user.lastName;
              const fullName =
                firstname && lastname ? `${firstname} ${lastname}` : null;

              const answersMap = Object.fromEntries(
                registration.answers.map((a) => [
                  getQuestion(strapiEvent?.data, lang, a.question, a.type) ??
                    a.question,
                  a.type === 'SELECT'
                    ? getSelectChoice(
                        strapiEvent?.data,
                        lang,
                        a.question,
                        a.answer,
                      )
                    : a.answer,
                ]),
              );

              return (
                <tr key={registration.id}>
                  <td>{fullName || registration.user.email}</td>
                  {questionKeys.map((key, i) => (
                    <td
                      key={key}
                      className={`max-w-44 text-pretty break-words bg-base-200/30 ${
                        i === 0 ? 'border-l-2 border-base-content/10' : ''
                      }`}
                    >
                      {answersMap[key] || '-'}
                    </td>
                  ))}
                  {requiresPickup && (
                    <td>
                      <div className="flex items-center justify-center">
                        {registration.pickedUp ? (
                          <PiCheckCircle className="text-success" size={20} />
                        ) : (
                          <PiCircle
                            className="text-base-content/40"
                            size={20}
                          />
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
