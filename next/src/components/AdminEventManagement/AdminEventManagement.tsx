import { auth } from '@/auth';
import { AdminSearchEventForm } from '@/components/AdminEventManagement/AdminSearchEventForm/AdminSearchEventForm';
import { shortDateFormat } from '@/libs/constants';
import prisma from '@/libs/db/prisma';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { firstLetterToUpperCase } from '@/libs/utils/first-letter-uppercase';
import { logger } from '@/libs/utils/logger';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { APIResponseCollection, StrapiCacheTag } from '@/types/types';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import qs from 'qs';
import { IoTicket } from 'react-icons/io5';
import AdminExportEventButton from './AdminExportEventButton/AdminExportEventButton';

const MAX_SEARCH_RESULTS = 10;

interface AdminEventManagementProps {
  dictionary: Dictionary;
  lang: SupportedLanguage;
  searchParams?: {
    search?: string;
  };
}

export default async function AdminEventManagement({
  dictionary,
  lang,
  searchParams,
}: AdminEventManagementProps) {
  const session = await auth();

  if (!session?.user || !session.user.isLuuppiHato) {
    logger.error('User not found in session or does not have required role');
    redirect(`/${lang}`);
  }

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const searchTerm = searchParams?.search?.trim();

  const whereClause = searchTerm
    ? {
        OR: [
          {
            nameFi: {
              contains: searchTerm,
              mode: 'insensitive' as const,
            },
          },
          {
            nameEn: {
              contains: searchTerm,
              mode: 'insensitive' as const,
            },
          },
        ],
      }
    : {
        endDate: {
          gte: threeMonthsAgo,
        },
      };

  const eventData = await prisma.event.findMany({
    where: whereClause,
    include: {
      registrations: {
        where: {
          deletedAt: null,
          paymentCompleted: true,
        },
        include: {
          user: true,
          answers: true,
        },
      },
    },
    orderBy: {
      startDate: 'desc',
    },
    take: searchTerm ? MAX_SEARCH_RESULTS : undefined,
  });

  // Fetch Strapi data for all displayed events to get RequiresPickup field
  const eventIds = eventData.map((event) => event.eventDocumentId);
  const strapiEventsQuery = qs.stringify({
    filters: { documentId: { $in: eventIds } },
    fields: ['documentId'],
    populate: {
      Registration: {
        fields: ['RequiresPickup'],
        filters: {
          RequiresPickup: { $eq: true },
        },
      },
    },
  });

  const strapiEvents = await getStrapiData<
    APIResponseCollection<'api::event.event'>
  >(
    lang,
    `/api/events?${strapiEventsQuery}`,
    eventIds.map((id) => `event-${id}` satisfies StrapiCacheTag),
    true,
  );

  const strapiEventsMap = new Map(
    strapiEvents?.data?.map((event) => [
      event.documentId,
      event.Registration,
    ]) ?? [],
  );

  const eventLanguageFormatted = eventData
    // For search results, don't filter by registrations count
    .filter((event) => searchTerm || event.registrations.length)
    .map((event) => {
      const strapiRegistration = strapiEventsMap.get(event.eventDocumentId) as
        | { RequiresPickup?: boolean }
        | undefined;
      const requiresPickup = strapiRegistration?.RequiresPickup ?? false;
      return {
        id: event.id,
        eventDocumentId: event.eventDocumentId,
        name: lang === 'fi' ? event.nameFi : event.nameEn,
        startDate: new Date(event.startDate),
        registrations: event.registrations.length,
        pickedUpCount: event.registrations.filter((r) => r.pickedUp).length,
        requiresPickup,
      };
    });

  return (
    <div className="card card-body">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h2 className="mb-4 text-lg font-semibold">
          {dictionary.pages_admin.event_management}
        </h2>

        <AdminSearchEventForm
          dictionary={dictionary}
          lang={lang}
          searchTerm={searchTerm}
        />
      </div>

      {eventLanguageFormatted?.length ? (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th />
                <th>{dictionary.general.event}</th>
                <th>{dictionary.general.starts_at}</th>
                <th>{dictionary.general.registrations}</th>
                <th>
                  <span className="flex justify-end">
                    {dictionary.general.actions}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="[&>*:nth-child(odd)]:bg-primary-50">
              {eventLanguageFormatted?.map((event, index) => (
                <tr key={event.id}>
                  <th>{index + 1}</th>
                  <td className="truncate">
                    <Link
                      className="link"
                      href={`/admin/event/${event.eventDocumentId}`}
                    >
                      {event.name}
                    </Link>
                  </td>
                  <td className="truncate">
                    {firstLetterToUpperCase(
                      event.startDate.toLocaleString(lang, shortDateFormat),
                    )}
                  </td>
                  <td>
                    <span
                      className={`badge ${event.registrations > 0 ? 'badge-primary' : 'badge-ghost'}`}
                    >
                      {event.registrations}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-end justify-end gap-1">
                      {event.requiresPickup && (
                        <Link
                          aria-label={dictionary.general.view}
                          className="btn btn-circle btn-ghost btn-primary btn-sm"
                          href={`/${lang}/admin/event/${event.eventDocumentId}`}
                        >
                          <IoTicket
                            className="text-gray-800 dark:text-background-950"
                            size={24}
                          />
                        </Link>
                      )}
                      <AdminExportEventButton
                        disabled={!event.registrations}
                        eventId={event.id}
                        lang={lang}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm">
          {searchTerm
            ? dictionary.general.no_event_search_results
            : dictionary.general.no_events}
        </p>
      )}
    </div>
  );
}
