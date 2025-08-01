import { auth } from '@/auth';
import { getDictionary } from '@/dictionaries';
import { getCachedEventRegistrations } from '@/libs/db/queries/get-cached-event-registrations';
import { getCachedUser } from '@/libs/db/queries/get-cached-user';
import { SupportedLanguage } from '@/models/locale';
import { APIResponse } from '@/types/types';
import { BiErrorCircle } from 'react-icons/bi';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import { IoWarningOutline } from 'react-icons/io5';
import Ticket from './Ticket';

interface TicketAreaProps {
  lang: SupportedLanguage;
  event: APIResponse<'api::event.event'>;
}

export default async function TicketArea({ lang, event }: TicketAreaProps) {
  const session = await auth();
  const dictionary = await getDictionary(lang);

  const ticketTypes = event.data.attributes.Registration?.TicketTypes;

  const localUserPromise = session?.user?.entraUserUuid
    ? getCachedUser(session.user.entraUserUuid)
    : null;

  const eventRegistrationsPromise = getCachedEventRegistrations(event.data.id);

  const [localUser, eventRegistrations] = await Promise.all([
    localUserPromise,
    eventRegistrationsPromise,
  ]);

  const strapiRoleUuids =
    localUser?.roles.map((role) => role.role.strapiRoleUuid) ?? [];
  const eventRolesWithWeights =
    ticketTypes?.map((ticketType) => ({
      strapiRoleUuid: ticketType.Role?.data?.attributes?.RoleId,
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
    const userPurchases = localUser.registrations.filter(
      (registration) => registration.eventId === event.data.id,
    );
    const userPurchasesWithRole = userPurchases.filter(
      (registration) => registration.strapiRoleUuid === roleUuid,
    );
    return userPurchasesWithRole.length >= maxAmount;
  };

  const hasUnpaidReservations = (roleUuid: string) => {
    if (!eventRegistrations || !localUser) return false;
    const userPurchases = localUser.registrations.filter(
      (registration) => registration.eventId === event.data.id,
    );
    const userPurchasesWithRole = userPurchases.filter(
      (registration) => registration.strapiRoleUuid === roleUuid,
    );
    return userPurchasesWithRole.some(
      (registration) => !registration.paymentCompleted,
    );
  };

  const ownQuota = ticketTypes?.find(
    (type) =>
      type.Role?.data?.attributes?.RoleId === targetedRole.strapiRoleUuid,
  );

  const isSoldOutOwnQuota = ownQuota
    ? isSoldOut(ownQuota.TicketsTotal, ownQuota.Role?.data?.attributes?.RoleId!)
    : false;

  const hasUnpaidReservationsOwnQuota = ownQuota
    ? hasUnpaidReservations(ownQuota.Role?.data?.attributes?.RoleId!)
    : false;

  const hasBoughtMaxTicketsOwnQuota = ownQuota
    ? hasBoughtMaxTickets(
        ownQuota.Role?.data?.attributes?.RoleId!,
        ownQuota.TicketsAllowedToBuy,
      )
    : false;

  const isRegistrationOpenOwnQuota = ownQuota
    ? isRegistrationOpen(new Date(ownQuota.RegistrationEndsAt))
    : false;

  const ticketTypesFormatted = ticketTypes
    ?.filter((type) => Boolean(type.Role?.data?.attributes?.RoleId))
    ?.map((ticketType) => ({
      name: ticketType[lang === 'en' ? 'NameEn' : 'NameFi'],
      location:
        event.data.attributes[lang === 'en' ? 'LocationEn' : 'LocationFi'],
      price: ticketType.Price,
      role: ticketType.Role?.data?.attributes?.RoleId,
      registrationStartsAt: new Date(ticketType.RegistrationStartsAt),
      registrationEndsAt: new Date(ticketType.RegistrationEndsAt),
      isOwnQuota: isOwnQuota(ticketType.Role?.data?.attributes?.RoleId!),
      maxTicketsPerUser: ticketType.TicketsAllowedToBuy,
    }))
    .sort((a, b) =>
      a.isOwnQuota === b.isOwnQuota ? 0 : a.isOwnQuota ? -1 : 1,
    );

  // Add configuration validation
  const getConfigurationErrors = () => {
    const errors: string[] = [];

    // Check for missing roles
    const quotasWithoutRoles = ticketTypes?.filter(
      (type) => !type.Role?.data?.attributes?.RoleId,
    );
    if (quotasWithoutRoles?.length) {
      errors.push(
        `${quotasWithoutRoles.length} quota(s) missing role configuration`,
      );
    }

    // Check for invalid registration dates
    ticketTypes?.forEach((type) => {
      const startsAt = new Date(type.RegistrationStartsAt);
      const endsAt = new Date(type.RegistrationEndsAt);
      if (startsAt >= endsAt) {
        errors.push(
          `Invalid registration dates for ${type[lang === 'en' ? 'NameEn' : 'NameFi']}: registration ends before it starts`,
        );
      }
    });

    // Check for duplicate weights
    const weights = ticketTypes?.map((type) => type.Weight);
    const duplicateWeights = weights?.filter(
      (weight, index) => weights.indexOf(weight) !== index,
    );
    if (duplicateWeights?.length) {
      errors.push(
        `Multiple quotas have same weight(s): ${duplicateWeights.join(', ')}`,
      );
    }

    // Check question edit deadline
    const questionEditUntil =
      event.data.attributes.Registration?.AllowQuestionEditUntil;
    const registrationEndDates = ticketTypes?.map(
      (type) => new Date(type.RegistrationEndsAt),
    );
    if (
      questionEditUntil &&
      registrationEndDates?.some((date) => new Date(questionEditUntil) < date)
    ) {
      errors.push('Question edit deadline is set before registration ends');
    }

    return errors;
  };

  const configErrors = getConfigurationErrors();

  if (configErrors.length || !ticketTypesFormatted?.length) {
    return (
      <div className="alert rounded-lg bg-red-200 text-sm text-red-800">
        <BiErrorCircle size={24} />
        <div className="flex flex-col">
          <span className="font-semibold">
            {configErrors.length > 0
              ? 'Configuration Error(s)'
              : dictionary.pages_events.no_tickets}
          </span>
          {configErrors.length > 0 && (
            <ul className="ml-4 mt-1 list-disc">
              {configErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  const getErrors = () => {
    const errors = [];
    if (!session?.user)
      errors.push({
        message: dictionary.pages_events.login_required,
        level: 'error',
      });
    if (session?.user && !ownQuota) {
      errors.push({
        message: dictionary.pages_events.no_quota,
        level: 'error',
      });
    }
    if (isSoldOutOwnQuota && ownQuota)
      errors.push({
        message: dictionary.pages_events.sold_out_info,
        level: 'warn',
      });
    if (hasBoughtMaxTicketsOwnQuota && ownQuota)
      errors.push({
        message: dictionary.pages_events.max_tickets_bought,
        level: 'info',
      });
    if (!isRegistrationOpenOwnQuota && ownQuota)
      errors.push({
        message: dictionary.pages_events.registration_closed,
        level: 'info',
      });
    if (hasUnpaidReservationsOwnQuota && ownQuota)
      errors.push({
        message: dictionary.pages_events.unpaid_reservations,
        level: 'warn',
      });
    return errors;
  };

  const errors = getErrors();

  return ticketTypesFormatted.length > 0 ? (
    <>
      {errors.map((error, i) => (
        <div
          key={error.message}
          className={`alert rounded-lg text-sm ${
            error.level === 'warn'
              ? 'bg-yellow-200/50 text-yellow-800'
              : error.level === 'info'
                ? 'bg-blue-200 text-blue-800'
                : 'bg-red-200 text-sm text-red-800'
          } ${i === errors.length - 1 ? 'mb-8' : 'mb-4'}`}
        >
          {error.level === 'error' && <BiErrorCircle size={24} />}
          {error.level === 'warn' && <IoWarningOutline size={24} />}
          {error.level === 'info' && (
            <IoIosInformationCircleOutline size={24} />
          )}
          {error.message}
        </div>
      ))}
      <div className="flex flex-col gap-4">
        {ticketTypesFormatted?.map((ticket, index) => (
          <Ticket
            key={`${ticket.name}-${index}`}
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
            targetedRole={targetedRole.strapiRoleUuid}
            ticket={ticket}
          />
        ))}
      </div>
    </>
  ) : (
    <div className="alert rounded-lg bg-blue-200 text-blue-800">
      <BiErrorCircle size={24} />
      {dictionary.pages_events.no_tickets}
    </div>
  );
}
