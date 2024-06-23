import { auth } from '@/auth';
import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { SupportedLanguage } from '@/models/locale';
import { APIResponse } from '@/types/types';
import { BiErrorCircle } from 'react-icons/bi';
import Ticket from './Ticket';

interface TicketAreaProps {
  lang: SupportedLanguage;
  event: APIResponse<'api::event.event'>;
}

export default async function TicketArea({ lang, event }: TicketAreaProps) {
  const session = await auth();
  const dictionary = await getDictionary(lang);

  const ticketTypes = event.data.attributes.Registration?.TicketTypes;

  const localUserPromise = session?.user
    ? await prisma.user.findFirst({
        where: {
          entraUserUuid: session?.user?.entraUserUuid!,
        },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
          registrations: true,
        },
      })
    : null;

  const eventRegistrationsPromise = await prisma.eventRegistration.findMany({
    where: {
      eventId: event.data.id,
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
      purchaseRole: true,
    },
  });

  const [localUser, eventRegistrations] = await Promise.all([
    localUserPromise,
    eventRegistrationsPromise,
  ]);

  const strapiRoleUuids =
    localUser?.roles.map((role) => role.role.strapiRoleUuid) ?? [];
  const eventRolesWithWeights =
    ticketTypes?.map((ticketType) => ({
      strapiRoleUuid: ticketType.Role?.data.attributes.RoleId,
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

  const isRegistrationOpen = (registrationEndsAt: Date) =>
    new Date() < new Date(registrationEndsAt);

  const hasBoughtMaxTickets = (roleUuid: string, maxAmount: number) => {
    if (!eventRegistrations || !localUser) return false;
    const userPurchases = eventRegistrations.filter(
      (registration) => registration.entraUserUuid === localUser?.entraUserUuid,
    );
    const userPurchasesWithRole = userPurchases.filter(
      (registration) => registration.purchaseRole.strapiRoleUuid === roleUuid,
    );
    return userPurchasesWithRole.length >= maxAmount;
  };

  const ownQuota = ticketTypes?.find(
    (type) => type.Role?.data.attributes.RoleId === targetedRole.strapiRoleUuid,
  );

  const isSoldOutOwnQuota = ownQuota
    ? isSoldOut(ownQuota.TicketsTotal, ownQuota.Role?.data.attributes.RoleId!)
    : false;

  const hasBoughtMaxTicketsOwnQuota = ownQuota
    ? hasBoughtMaxTickets(
        ownQuota.Role?.data.attributes.RoleId!,
        ownQuota.TicketsAllowedToBuy,
      )
    : false;

  const isRegistrationOpenOwnQuota = ownQuota
    ? isRegistrationOpen(new Date(ownQuota.RegistrationEndsAt))
    : false;

  const ticketTypesFormatted = ticketTypes
    ?.filter((type) => Boolean(type.Role?.data.attributes.RoleId))
    ?.map((ticketType) => ({
      name: ticketType[lang === 'en' ? 'NameEn' : 'NameFi'],
      location:
        event.data.attributes[lang === 'en' ? 'LocationEn' : 'LocationFi'],
      price: ticketType.Price,
      role: ticketType.Role?.data.attributes.RoleId,
      registrationStartsAt: new Date(ticketType.RegistrationStartsAt),
      registrationEndsAt: new Date(ticketType.RegistrationEndsAt),
      isOwnQuota: isOwnQuota(ticketType.Role?.data.attributes.RoleId!),
      maxTicketsPerUser: ticketType.TicketsAllowedToBuy,
    }))
    .sort((a, b) =>
      a.isOwnQuota === b.isOwnQuota ? 0 : a.isOwnQuota ? -1 : 1,
    );

  if (!ticketTypesFormatted?.length) return null;

  const getError = () => {
    if (!session?.user) return dictionary.pages_events.login_required;
    if (isSoldOutOwnQuota) return dictionary.pages_events.sold_out_info;
    if (hasBoughtMaxTicketsOwnQuota)
      return dictionary.pages_events.max_tickets_bought;
    if (!isRegistrationOpenOwnQuota)
      return dictionary.pages_events.registration_closed;
    return null;
  };

  const error = getError();

  return (
    <>
      {error && (
        <div className="alert mb-4 rounded-lg bg-red-200 text-sm text-red-800">
          <BiErrorCircle size={24} />
          {error}
        </div>
      )}
      <div className="flex flex-col gap-4">
        {ticketTypesFormatted?.map((ticket) => (
          <Ticket
            key={ticket.name}
            dictionary={dictionary}
            disabled={
              !ticket.isOwnQuota ||
              isSoldOutOwnQuota ||
              hasBoughtMaxTicketsOwnQuota ||
              !isRegistrationOpenOwnQuota
            }
            eventId={event.data.id}
            eventStartsAt={new Date(event.data.attributes.StartDate)}
            isOwnQuota={isOwnQuota(ticket.role!)}
            lang={lang}
            ticket={ticket}
          />
        ))}
      </div>
    </>
  );
}
