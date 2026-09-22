import { auth } from '@/auth';
import TableZoomControl from '@/components/AdminEventRegistrationsTable/TableZoomControl';
import {
  buildFilterHref,
  buildRegistrationFilter,
  getTicketColor,
  normalizeFilters,
} from '@/components/AdminEventRegistrationsTable/utils';
import prisma from '@/libs/db/prisma';
import { getQuestion } from '@/libs/strapi/get-question';
import { getSelectChoice } from '@/libs/strapi/get-select-choice';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { logger } from '@/libs/utils/logger';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { APIResponse } from '@/types/types';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import qs from 'qs';
import RegistrationsTableRow from './TableRow';

interface AdminEventRegistrationsListProps {
  dictionary: Dictionary;
  eventId: number;
  lang: SupportedLanguage;
  requiresPickup: boolean;
  filters?: string | string[];
}

export default async function AdminEventRegistrationsList({
  dictionary,
  eventId,
  lang,
  requiresPickup,
  filters,
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
        where: {
          deletedAt: null,
          paymentCompleted: true,
          ...buildRegistrationFilter(filters),
        },
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

  const activeFilters = normalizeFilters(filters);
  const isPickedUpFilterActive = activeFilters.get('picked_up') === 'true';
  const activeTicketId = activeFilters.get('ticket');
  const hasActiveFilters = [...activeFilters.keys()].length > 0;

  const baseUrl = `/${lang}/admin/event/${event.eventDocumentId}`;

  function filterHref(overrides: Record<string, string | null>) {
    const query = buildFilterHref(activeFilters, overrides);
    return query ? `${baseUrl}?${query}` : baseUrl;
  }

  const pickedUpHref = filterHref({
    picked_up: isPickedUpFilterActive ? null : 'true',
  });

  const query = qs.stringify({
    populate: {
      Registration: {
        populate: [
          'QuestionsText',
          'QuestionsSelect',
          'QuestionsCheckbox',
          'TicketTypes',
        ],
      },
    },
  });

  const strapiEvent = await getStrapiData<APIResponse<'api::event.event'>>(
    lang,
    `/api/events/${event.eventDocumentId}?${query}`,
    [`event-${eventId}`],
    true,
  );

  const registrations = event.registrations;

  if (!registrations.length) {
    return (
      <div className="card card-body ...">
        {hasActiveFilters ? (
          <>
            <p className="text-sm">{dictionary.general.no_registrations}</p>
            <Link
              className="btn btn-primary btn-xs mt-4 w-fit"
              href={baseUrl}
              prefetch={false}
            >
              {dictionary.pages_admin.clear_filters}
            </Link>
          </>
        ) : (
          <p className="text-sm">{dictionary.general.no_registrations}</p>
        )}
      </div>
    );
  }

  const cutoff = new Date(event.endDate);
  cutoff.setDate(cutoff.getDate() + 7);
  const answersHidden = !requiresPickup && new Date() > cutoff;

  // Collect all unique question keys across registrations (hidden for past events)
  const questionKeys = answersHidden
    ? []
    : Array.from(
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
  const numOfTickets = strapiEvent?.data.Registration?.TicketTypes.length;

  // Tickets in form of { [id]: NameFi | NameEn }
  const tickets: Record<string, string> = Object.fromEntries(
    strapiEvent?.data.Registration?.TicketTypes.map((ticket) => [
      ticket.uid,
      ticket[lang === 'fi' ? 'NameFi' : 'NameEn'],
    ]) ?? [],
  );

  const ticketCounts: Record<string, number> = registrations.reduce<
    Record<string, number>
  >((counts, reg) => {
    if (reg.strapiTicketUid) {
      counts[reg.strapiTicketUid] = (counts[reg.strapiTicketUid] ?? 0) + 1;
    }
    return counts;
  }, {});

  type RegistrationWithRelations = (typeof registrations)[number];
  const userGroups = registrations.reduce<
    Map<string, RegistrationWithRelations[]>
  >((map, reg) => {
    const existing = map.get(reg.entraUserUuid);
    if (existing) {
      existing.push(reg);
    } else {
      map.set(reg.entraUserUuid, [reg]);
    }
    return map;
  }, new Map());

  return (
    <div className="card card-body text-base-content" id="registrations-table">
      <div className="mb-4 flex select-none flex-wrap items-center justify-between">
        <h2 className="text-lg font-semibold">
          {dictionary.general.registrations}
        </h2>
        <div className="flex items-center gap-4">
          {requiresPickup && (
            <Link
              className="badge badge-primary"
              href={pickedUpHref}
              prefetch={false}
            >
              {dictionary.pages_admin.picked_up}: {pickedUpCount} /{' '}
              {registrations.length}
            </Link>
          )}
          <TableZoomControl />
        </div>
      </div>

      {(numOfTickets ?? 0) > 1 && (
        <div className="-mt-4 flex flex-wrap items-center gap-2 overflow-x-auto text-xs">
          {Object.entries(tickets).map(([id, ticket], i) => {
            const isActive = activeTicketId === id;
            return (
              <Link
                key={i}
                className="badge text-nowrap rounded-full border hover:bg-white/10"
                href={filterHref({ ticket: isActive ? null : id })}
                prefetch={false}
                style={{
                  borderColor: getTicketColor(ticket),
                  ...(isActive
                    ? { background: getTicketColor(ticket), color: 'black' }
                    : {}),
                }}
              >
                <span
                  className="mr-2 inline-block h-2 w-2 rounded-full"
                  style={{
                    background: isActive ? 'black' : getTicketColor(ticket),
                  }}
                />
                {ticket}
                {hasActiveFilters && (ticketCounts[id] ?? 0) === 0
                  ? ''
                  : `: ${ticketCounts[id] ?? 0}`}
              </Link>
            );
          })}

          {hasActiveFilters && (
            <Link
              className="badge badge-ghost rounded-full border"
              href={baseUrl}
              prefetch={false}
            >
              {dictionary.pages_admin.clear_filters}
            </Link>
          )}
        </div>
      )}

      <div className="overflow-x-auto rounded-md">
        <table className="table [&_*]:![font-size:inherit] [&_td]:!px-[1em] [&_td]:!py-[0.75em] [&_th]:!px-[1em] [&_th]:!py-[0.75em]">
          {questionKeys.length > 0 && (
            <colgroup>
              <col />

              {questionKeys.map((key) => (
                <col key={key} />
              ))}
              {requiresPickup && <col />}
            </colgroup>
          )}
          <thead>
            <tr>
              <th>{dictionary.general.preferredFullName}</th>
              {questionKeys.length > 0 && (
                <th
                  className="border-l-2 border-base-content/10"
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
                    className={`max-w-20 whitespace-normal break-words font-medium text-base-content/60 ${
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
          <tbody className="[&>*:nth-child(odd)]:bg-base-200">
            {Array.from(userGroups.values()).map((group) => {
              const user = group[0].user;
              const firstname = (user.preferredFullName || user.firstName)
                ?.split(' ')
                .at(0);
              const lastname = user.lastName;
              const fullName =
                firstname && lastname ? `${firstname} ${lastname}` : null;

              const sortedGroup = [...group].sort((a, b) => {
                const nameA = a.strapiTicketUid
                  ? (tickets[a.strapiTicketUid] ?? '')
                  : '';
                const nameB = b.strapiTicketUid
                  ? (tickets[b.strapiTicketUid] ?? '')
                  : '';
                return nameA.localeCompare(nameB, lang);
              });

              const ticketNames = sortedGroup
                .map((r) =>
                  r.strapiTicketUid ? tickets[r.strapiTicketUid] : undefined,
                )
                .filter((t): t is string => Boolean(t));

              const registrationDetails = sortedGroup.map((reg) => ({
                id: reg.id,
                ticketName: reg.strapiTicketUid
                  ? (tickets[reg.strapiTicketUid] ?? '-')
                  : '-',
                pickedUp: reg.pickedUp,
                answers: Object.fromEntries(
                  reg.answers.map((a) => [
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
                ),
              }));

              return (
                <RegistrationsTableRow
                  key={group[0].entraUserUuid}
                  dictionary={dictionary}
                  displayName={fullName ?? ''}
                  email={user.email}
                  lang={lang}
                  pickedUpLabel={dictionary.pages_admin.picked_up}
                  questionKeys={questionKeys}
                  registrations={registrationDetails}
                  requiresPickup={requiresPickup}
                  showTickets={(numOfTickets ?? 0) > 1}
                  tickets={ticketNames}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
