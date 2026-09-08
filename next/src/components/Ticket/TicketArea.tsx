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

  const ticketTypes = event.data.Registration?.TicketTypes;
  const jointQuota = event.data.Registration?.JointQuota ?? false;
  const totalTickets = event.data.Registration?.TicketsTotal;

  const localUserPromise = session?.user?.entraUserUuid
    ? getCachedUser(session.user.entraUserUuid)
    : null;

  const eventRegistrationsPromise = getCachedEventRegistrations(
    event.data.documentId,
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

  const isOwnQuota = (role: string) => {
    if (!session?.user) return false;
    return targetedRole.strapiRoleUuid === role;
  };

  const isSoldOut = (total: number, ticketUid: string) => {
    if (!eventRegistrations) return false;
    const totalRegistrationsForTicketType = eventRegistrations.filter(
      (registration) => registration.strapiTicketUid === ticketUid,
    ).length;
    return totalRegistrationsForTicketType >= total;
  };

  const isRegistrationOpen = (registrationEndsAt: Date) =>
    new Date() < new Date(registrationEndsAt);

  const hasBoughtMaxTickets = (
    ticketUid: string,
    maxAmount: number,
  ): { isFree: boolean } | false => {
    if (!eventRegistrations || !localUser) return false;
    const userPurchases = localUser.registrations.filter(
      (registration) => registration.eventDocumentId === event.data.documentId,
    );
    const userPurchasesForTicketType = userPurchases.filter(
      (registration) => registration.strapiTicketUid === ticketUid,
    );

    return (
      userPurchasesForTicketType.length >= maxAmount && {
        isFree: !userPurchasesForTicketType.some((reg) => reg.price !== 0),
      }
    );
  };

  const hasUnpaidReservations = (
    ticketUid: string,
  ): { isFree: boolean } | false => {
    if (!eventRegistrations || !localUser) return false;
    const userPurchases = localUser.registrations.filter(
      (registration) => registration.eventDocumentId === event.data.documentId,
    );
    const userPurchasesForTicketType = userPurchases.filter(
      (registration) => registration.strapiTicketUid === ticketUid,
    );

    const notPaid = userPurchasesForTicketType.find(
      (registration) => !registration.paymentCompleted,
    );

    if (!notPaid) {
      return false;
    }

    return { isFree: notPaid.price === 0 };
  };

  const ownQuotaTicketTypes =
    ticketTypes?.filter(
      (type) => type.Role?.RoleId === targetedRole.strapiRoleUuid,
    ) ?? [];

  const ticketTypesFormatted = ticketTypes
    ?.filter((type) => Boolean(type.Role?.RoleId))
    ?.map((ticketType) => {
      const soldOut = isSoldOut(ticketType.TicketsTotal, ticketType.uid!);
      const soldOutAllQuotas =
        jointQuota && typeof totalTickets !== 'undefined'
          ? totalTickets - (eventRegistrations?.length ?? 0) <= 0
          : false;
      const boughtMax = hasBoughtMaxTickets(
        ticketType.uid!,
        ticketType.TicketsAllowedToBuy,
      );
      const unpaidReservations = hasUnpaidReservations(ticketType.uid!);
      const registrationOpen = isRegistrationOpen(
        new Date(ticketType.RegistrationEndsAt),
      );
      const isOwn = isOwnQuota(ticketType.Role?.RoleId!);

      return {
        // Ticket Component ID -- used to allow multiple quotas for a role (e.g. two tickets with role = member)
        uid: ticketType.uid,
        name: ticketType[lang === 'en' ? 'NameEn' : 'NameFi'],
        location: event.data[lang === 'en' ? 'LocationEn' : 'LocationFi'],
        price: ticketType.Price,
        role: ticketType.Role?.RoleId,
        registrationStartsAt: new Date(ticketType.RegistrationStartsAt),
        registrationEndsAt: new Date(ticketType.RegistrationEndsAt),
        isOwnQuota: isOwn,
        maxTicketsPerUser: ticketType.TicketsAllowedToBuy,

        soldOut,
        soldOutAllQuotas,
        boughtMax,
        unpaidReservations,
        registrationOpen,
      };
    })
    .sort((a, b) =>
      a.isOwnQuota === b.isOwnQuota ? 0 : a.isOwnQuota ? -1 : 1,
    );

  // Add configuration validation
  const getConfigurationErrors = () => {
    const errors: string[] = [];

    // Check for missing roles
    const quotasWithoutRoles = ticketTypes?.filter(
      (type) => !type.Role?.RoleId,
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
    const weightsByRole = new Map<string, number[]>();
    ticketTypes?.forEach((type) => {
      const roleId = type.Role?.RoleId ?? 'unknown';
      const list = weightsByRole.get(roleId) ?? [];
      list.push(type.Weight);
      weightsByRole.set(roleId, list);
    });
    const roleWeights = Array.from(weightsByRole.entries()).map(
      ([roleId, weights]) => ({ roleId, weight: weights[0] }),
    );
    const allWeights = roleWeights.map((r) => r.weight);
    const duplicateWeights = allWeights.filter(
      (weight, index) => allWeights.indexOf(weight) !== index,
    );
    if (duplicateWeights.length) {
      errors.push(
        `Multiple roles have same weight(s): ${duplicateWeights.join(', ')}`,
      );
    }

    // Check question edit deadline
    const questionEditUntil = event.data.Registration?.AllowQuestionEditUntil;
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
      <div className="alert alert-error">
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

  const getRoleLevelErrors = () => {
    const errors = [];
    if (!session?.user)
      errors.push({
        message: dictionary.pages_events.login_required,
        level: 'error',
      });
    if (session?.user && ownQuotaTicketTypes.length === 0) {
      errors.push({
        message: dictionary.pages_events.no_quota,
        level: 'error',
      });
    }
    return errors;
  };

  const roleLevelErrors = getRoleLevelErrors();

  const ticketsWithState = ticketTypesFormatted.map((ticket) => {
    const errors = [];
    if (ticket.isOwnQuota && (ticket.soldOut || ticket.soldOutAllQuotas)) {
      errors.push({
        message: dictionary.pages_events.sold_out_info,
        level: 'warn',
      });
    }
    if (ticket.isOwnQuota && ticket.boughtMax) {
      errors.push({
        message:
          dictionary.pages_events[
            ticket.boughtMax.isFree
              ? 'max_tickets_redeemed'
              : 'max_tickets_bought'
          ],
        level: 'info',
      });
    }
    if (ticket.isOwnQuota && !ticket.registrationOpen) {
      errors.push({
        message: dictionary.pages_events.registration_closed,
        level: 'info',
      });
    }
    if (ticket.isOwnQuota && ticket.unpaidReservations) {
      errors.push({
        message:
          dictionary.pages_events[
            ticket.unpaidReservations.isFree
              ? 'unredeemed_reservations'
              : 'unpaid_reservations'
          ],
        level: 'warn',
      });
    }

    const disabled = Boolean(
      !ticket.isOwnQuota ||
      ticket.soldOut ||
      ticket.soldOutAllQuotas ||
      Boolean(ticket.boughtMax) ||
      !ticket.registrationOpen,
    );

    return { ticket, disabled, errors };
  });

  return ticketTypesFormatted.length > 0 ? (
    <>
      {roleLevelErrors.map((error) => (
        <div
          key={error.message}
          className={`alert ${
            error.level === 'warn'
              ? 'alert-warning'
              : error.level === 'info'
                ? 'alert-info'
                : 'alert-error'
          } mb-4`}
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
        {ticketsWithState.map(({ ticket, disabled, errors }, index) => (
          <div key={`${ticket.name}-${index}`} className="flex flex-col gap-2">
            {errors.map((error) => (
              <div
                key={error.message}
                className={`alert ${
                  error.level === 'warn'
                    ? 'alert-warning'
                    : error.level === 'info'
                      ? 'alert-info'
                      : 'alert-error'
                }`}
              >
                {error.level === 'warn' && <IoWarningOutline size={20} />}
                {error.level === 'info' && (
                  <IoIosInformationCircleOutline size={20} />
                )}
                {error.message}
              </div>
            ))}
            <Ticket
              key={`${ticket.name}-${index}`}
              dictionary={dictionary}
              disabled={disabled}
              eventDocumentId={event.data.documentId}
              eventStartsAt={new Date(event.data.StartDate)}
              isOwnQuota={ticket.isOwnQuota}
              lang={lang}
              targetedRole={targetedRole.strapiRoleUuid}
              ticket={ticket}
            />
          </div>
        ))}
      </div>
    </>
  ) : (
    <div className="alert alert-info">
      <BiErrorCircle size={24} />
      {dictionary.pages_events.no_tickets}
    </div>
  );
}
