import { auth } from '@/auth';
import { shortDateFormat } from '@/libs/constants';
import prisma from '@/libs/db/prisma';
import { firstLetterToUpperCase } from '@/libs/utils/first-letter-uppercase';
import { logger } from '@/libs/utils/logger';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { redirect } from 'next/navigation';
import AdminExportEventButton from './AdminExportEventButton/AdminExportEventButton';
import Link from 'next/link';

interface AdminEventManagementProps {
  dictionary: Dictionary;
  lang: SupportedLanguage;
}

export default async function AdminEventManagement({
  dictionary,
  lang,
}: AdminEventManagementProps) {
  const session = await auth();

  if (!session?.user || !session.user.isLuuppiHato) {
    logger.error('User not found in session or does not have required role');
    redirect(`/${lang}`);
  }

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const eventData = await prisma.event.findMany({
    where: {
      endDate: {
        gte: threeMonthsAgo,
      },
    },
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
      createdAt: 'desc',
    },
  });

  const eventLanguageFormatted = eventData
    .filter((event) => event.registrations.length)
    .map((event) => ({
      id: event.id,
      eventId: event.eventId,
      name: lang === 'fi' ? event.nameFi : event.nameEn,
      startDate: new Date(event.startDate),
      registrations: event.registrations.length,
    }));

  return (
    <div className="card card-body">
      <h2 className="mb-4 text-lg font-semibold">
        {dictionary.pages_admin.event_management}
      </h2>
      {Boolean(eventLanguageFormatted?.length) ? (
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
                      href={`/admin/event/${event.eventId}`}
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
                    <span className="badge badge-primary">
                      {event.registrations}
                    </span>
                  </td>
                  <td>
                    <AdminExportEventButton
                      disabled={!event.registrations}
                      eventId={event.id}
                      lang={lang}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm">{dictionary.general.no_events}</p>
      )}
    </div>
  );
}
