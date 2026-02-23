import { auth } from '@/auth';
import { getCachedEventRegistrations } from '@/libs/db/queries/get-cached-event-registrations';
import { getCachedUser } from '@/libs/db/queries/get-cached-user';
import { SupportedLanguage } from '@/models/locale';
import { APIResponseData } from '@/types/types';
import { FaQuestion } from 'react-icons/fa';
import { IoTicket } from 'react-icons/io5';

export default async function RegistrationEndsOwnQuota({
  event,
  lang,
  dictionary,
}: {
  event: APIResponseData<'api::event.event'>;
  lang: SupportedLanguage;
  dictionary: any;
}) {
  const session = await auth();
  const ticketTypes = event.Registration?.TicketTypes;

  const localUserPromise = session?.user?.entraUserUuid
    ? getCachedUser(session.user.entraUserUuid)
    : null;

  const eventRegistrationsPromise = getCachedEventRegistrations(
    event.documentId,
  );

  const [localUser, eventRegistrations] = await Promise.all([
    localUserPromise,
    eventRegistrationsPromise,
  ]);

  const strapiRoleUuids =
    localUser?.roles.map((role) => role.role.strapiRoleUuid) ?? [];
  const eventRolesWithWeights =
    ticketTypes?.map((ticketType) => ({
      strapiRoleUuid: ticketType.Role?.RoleId,
      weight: ticketType.Weight,
    })) ?? [];

  const hasDefaultRoleWeight = eventRolesWithWeights.find(
    (role) => role.strapiRoleUuid === process.env.NEXT_PUBLIC_NO_ROLE_ID!,
  );

  const targetedRole = strapiRoleUuids.reduce(
    (acc, strapiRoleUuid) => {
      const roleWeight =
        eventRolesWithWeights.find(
          (role) => role.strapiRoleUuid === strapiRoleUuid,
        )?.weight ?? 0;
      return roleWeight > acc.weight
        ? { strapiRoleUuid: strapiRoleUuid, weight: roleWeight }
        : acc;
    },
    {
      strapiRoleUuid: process.env.NEXT_PUBLIC_NO_ROLE_ID!,
      weight: hasDefaultRoleWeight?.weight ?? 0,
    },
  );

  const ownQuota = ticketTypes?.find(
    (type) => type.Role?.RoleId === targetedRole.strapiRoleUuid,
  );

  const isOwnQuota = (role: string) => {
    if (!session?.user) return false;
    return targetedRole.strapiRoleUuid === role;
  };

  const isSoldOut = (total: number, roleUuid: string) => {
    if (!eventRegistrations) return false;
    const totalRegistrationWithRole = eventRegistrations.filter(
      (registration) => registration.purchaseRole.strapiRoleUuid === roleUuid,
    ).length;
    return totalRegistrationWithRole >= total;
  };

  const registrationEndsOwnQuota = ticketTypes?.reduce((latestDate, ticket) => {
    const ticketIsOwnQuota = ticket.Role && isOwnQuota(ticket.Role!.RoleId!);
    const isSoldOutOwnQuota = ownQuota
      ? isSoldOut(ownQuota.TicketsTotal, ownQuota.Role?.RoleId!)
      : false;

    if (!ticketIsOwnQuota || isSoldOutOwnQuota) {
      return latestDate;
    }

    const currentDate = new Date(ticket.RegistrationEndsAt);
    return !latestDate || currentDate > latestDate ? currentDate : latestDate;
  }, null! as Date);

  return (
    registrationEndsOwnQuota && (
      <div className="flex items-center">
        <div className="mr-2 flex items-center justify-center rounded-full bg-primary-400 p-2 text-white">
          <IoTicket className="shrink-0 text-2xl" />
        </div>
        <div className="flex w-full items-center justify-between">
          <p className="line-clamp-2">
            {
              dictionary.pages_events[
                ownQuota?.Price ? 'ticket_sales_ends' : 'registration_ends'
              ]
            }{' '}
            {new Intl.DateTimeFormat(lang, {
              day: '2-digit',
              month: 'short',
              hour: 'numeric',
              minute: 'numeric',
            }).format(registrationEndsOwnQuota)}
          </p>

          <span
            className="tooltip tooltip-left flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full bg-secondary-400 text-white"
            data-tip={
              dictionary.pages_events[
                ownQuota?.Price
                  ? 'ticket_sales_ends_explanation'
                  : 'registration_ends_explanation'
              ]
            }
          >
            <FaQuestion size={12} />
          </span>
        </div>
      </div>
    )
  );
}
