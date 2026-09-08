'use server';
import { auth } from '@/auth';
import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { redisClient } from '@/libs/db/redis';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { logger } from '@/libs/utils/logger';
import { generatePickupCode } from '@/libs/utils/pickup-code';
import { SupportedLanguage } from '@/models/locale';
import { APIResponse } from '@/types/types';
import { updateTag } from 'next/cache';
import { Prisma } from '@prisma/client';

const options = {
  noRoleId: process.env.NEXT_PUBLIC_NO_ROLE_ID!,
};

export async function reservationCreate(
  eventDocumentId: string,
  amount: number,
  lang: SupportedLanguage,
  selectedQuota: string,
  userProvidedTargetedRole: string | undefined,
  ticketUid: string,
) {
  const [dictionary, session] = await Promise.all([
    getDictionary(lang),
    auth(),
  ]);

  if (!session?.user) {
    return {
      message: dictionary.api.unauthorized,
      isError: true,
    };
  }

  if (!ticketUid) {
    return {
      message: dictionary.api.invalid_event,
      isError: true,
    };
  }

  // User provided targeted role cannot be trusted (can be manipulated by user), but this
  // prevents unnecessary database queries most of the time
  if (
    userProvidedTargetedRole &&
    typeof userProvidedTargetedRole === 'string'
  ) {
    const [isSoldOut, isJointQuotaSoldOut] = await Promise.all([
      redisClient.get(`event-sold-out:${eventDocumentId}:ticket:${ticketUid}`),
      redisClient.get(`event-sold-out:${eventDocumentId}:joint-quota`),
    ]);

    if (isSoldOut) {
      logger.info(
        `Cache hit: Event ${eventDocumentId} ticket ${ticketUid} is sold out`,
      );
      return {
        message: dictionary.api.sold_out,
        isError: true,
      };
    }

    // Check if the joint quota is sold out
    if (isJointQuotaSoldOut) {
      logger.info(
        `Cache hit: Event ${eventDocumentId} joint quota is sold out`,
      );
      return {
        message: dictionary.api.sold_out,
        isError: true,
      };
    }
  }

  if (!amount || isNaN(amount) || amount < 1) {
    return {
      message: dictionary.api.invalid_amount,
      isError: true,
    };
  }

  if (!eventDocumentId) {
    return {
      message: dictionary.api.invalid_event,
      isError: true,
    };
  }

  const strapiUrl = `/api/events/${eventDocumentId}?populate=Registration.TicketTypes.Role&populate=Registration.RoleToGive`;
  const strapiEvents = await getStrapiData<APIResponse<'api::event.event'>>(
    lang,
    strapiUrl,
    [`event-${eventDocumentId}`],
    true,
  );

  const strapiEvent = strapiEvents?.data;

  if (!strapiEvent) {
    return {
      message: dictionary.api.invalid_event,
      isError: true,
    };
  }

  // Preload user data outside transaction
  const localUser = await prisma.user.findUnique({
    where: {
      entraUserUuid: session.user.entraUserUuid,
    },
    include: {
      roles: {
        select: {
          role: {
            select: {
              strapiRoleUuid: true,
            },
          },
          expiresAt: true,
        },
        where: {
          OR: [{ expiresAt: { gte: new Date() } }, { expiresAt: null }],
        },
      },
    },
  });

  if (!localUser) {
    return {
      message: dictionary.api.unauthorized,
      isError: true,
    };
  }

  const strapiRoleUuids =
    localUser.roles.map((role) => role.role.strapiRoleUuid) ?? [];
  const ticketTypes = strapiEvent.Registration?.TicketTypes;

  const eventRolesWithWeights =
    ticketTypes?.map((ticketType) => ({
      strapiRoleUuid: ticketType.Role?.RoleId,
      weight: ticketType.Weight,
    })) ?? [];

  const hasDefaultRoleWeight = eventRolesWithWeights.find(
    (role) => role.strapiRoleUuid === options.noRoleId!,
  );

  const targetedRole = strapiRoleUuids.reduce(
    (acc, strapiRoleUuid) => {
      const roleWeight =
        eventRolesWithWeights.find(
          (role) => role.strapiRoleUuid === strapiRoleUuid,
        )?.weight ?? 0;
      return roleWeight > acc.weight
        ? { strapiRoleUuid, weight: roleWeight }
        : acc;
    },
    {
      strapiRoleUuid: options.noRoleId!,
      weight: hasDefaultRoleWeight?.weight ?? 0,
    },
  );

  // This might happen if somehow user is sending stale data
  if (targetedRole.strapiRoleUuid !== selectedQuota) {
    return {
      message: dictionary.api.server_error,
      isError: true,
      reloadCache: true,
    };
  }

  const ownQuota = ticketTypes?.find(
    (ticket) =>
      ticket.Role?.RoleId === targetedRole.strapiRoleUuid &&
      ticket.uid === ticketUid,
  );

  // Validate that the user has a role that can reserve tickets
  // Frontend needs to refresh reload cache first and only then show error (if content has been updated)
  if (!ownQuota) {
    return {
      message: dictionary.api.unauthorized,
      isError: true,
      reloadCache: true,
    };
  }

  // Validate that the registration is still open
  if (new Date(ownQuota.RegistrationEndsAt) < new Date()) {
    return {
      message: dictionary.api.registration_closed,
      isError: true,
    };
  }

  // Validate that registration is open
  if (new Date(ownQuota.RegistrationStartsAt) > new Date()) {
    return {
      message: dictionary.api.registration_not_open,
      isError: true,
    };
  }

  const hasDefaultRole = localUser.roles.find(
    (role) => role.role.strapiRoleUuid === options.noRoleId!,
  );
  if (!hasDefaultRole) {
    logger.error(
      'User doesnt have a default role. This should never happen.',
      localUser.entraUserUuid,
    );
    return { message: dictionary.api.server_error, isError: true };
  }

  const strapiRoleUuid = targetedRole.strapiRoleUuid;
  const entraUserUuid = localUser.entraUserUuid;
  const requiresPickup = strapiEvent.Registration?.RequiresPickup ?? false;
  const jointQuota = strapiEvent.Registration?.JointQuota ?? false;
  const jointQuotaTotal = strapiEvent.Registration?.TicketsTotal;

  const buildRows = () =>
    Array.from({ length: amount }).map(() => ({
      strapiTicketUid: ticketUid,
      eventDocumentId,
      entraUserUuid,
      strapiRoleUuid,
      reservedUntil: new Date(Date.now() + 60 * 60 * 1000),
      price: ownQuota.Price,
      ...(requiresPickup ? { pickupCode: generatePickupCode() } : {}),
    }));

  const MAX_INSERT_ATTEMPTS = 5;

  const result = await prisma
    .$transaction(
      async (prisma) => {
        // Advisory lock scoped to this event only. Serializes concurrent reservation attempts
        // for the same event, but does not block reads or updates, nor writes to other events.
        // ALWAYS claim the lock if you are inserting rows; reads always ok,
        // Updates are safe without the lock UNLESS they could cause a row to
        // newly satisfy the counting WHERE clause (deletedAt: null AND
        // (reservedUntil >= now() OR paymentCompleted OR pending payment)
        await prisma.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${eventDocumentId}))`;

        const [
          totalRegistrationsForTicketType,
          totalRegistrationsJoint,
          userReservationsForRole,
        ] = await Promise.all([
          prisma.eventRegistration.count({
            where: {
              eventDocumentId,
              strapiTicketUid: ticketUid,
              deletedAt: null,
              OR: [
                { reservedUntil: { gte: new Date() } },
                { paymentCompleted: true },
                {
                  paymentCompleted: false,
                  payments: { some: { status: 'PENDING' } },
                },
              ],
            },
          }),
          jointQuota
            ? prisma.eventRegistration.count({
                where: {
                  eventDocumentId,
                  deletedAt: null,
                  OR: [
                    { reservedUntil: { gte: new Date() } },
                    { paymentCompleted: true },
                    {
                      paymentCompleted: false,
                      payments: { some: { status: 'PENDING' } },
                    },
                  ],
                },
              })
            : Promise.resolve(0),
          prisma.eventRegistration.findMany({
            where: {
              eventDocumentId,
              entraUserUuid: localUser.entraUserUuid,
              purchaseRole: {
                strapiRoleUuid: targetedRole.strapiRoleUuid,
              },
              deletedAt: null,
              OR: [
                { reservedUntil: { gte: new Date() } },
                { paymentCompleted: true },
                {
                  paymentCompleted: false,
                  payments: { some: { status: 'PENDING' } },
                },
              ],
            },
            select: {
              strapiTicketUid: true,
            },
          }),
        ]);

        // Validate that the event is not sold out for the user's role
        if (totalRegistrationsForTicketType >= ownQuota.TicketsTotal) {
          return {
            message: dictionary.api.sold_out,
            isError: true,
          };
        }

        const ticketsAvailable = jointQuota
          ? (jointQuotaTotal ?? 0) - totalRegistrationsJoint
          : ownQuota.TicketsTotal - totalRegistrationsForTicketType;

        const ticketsAllowedToBuy = ownQuota.TicketsAllowedToBuy;

        const hasOtherTicketTypeInRole = userReservationsForRole.some(
          (registration) => registration.strapiTicketUid !== ticketUid,
        );

        if (hasOtherTicketTypeInRole) {
          return {
            message: dictionary.api.not_enough_tickets,
            isError: true,
          };
        }

        const currentUserReservationsForTicketType =
          userReservationsForRole.filter(
            (registration) => registration.strapiTicketUid === ticketUid,
          ).length;

        // Validate that the user has not already reserved the maximum amount of tickets
        if (currentUserReservationsForTicketType >= ticketsAllowedToBuy) {
          return {
            message: dictionary.api.maximum_tickets_reached,
            isError: true,
          };
        }

        // Validate per user limit still allows the user to reserve the amount
        const canReserveAmount =
          amount + currentUserReservationsForTicketType <= ticketsAllowedToBuy;
        if (!canReserveAmount) {
          return {
            message: dictionary.api.no_room_own_limit,
            isError: true,
          };
        }

        // Validate that there are still enough tickets available
        if (amount > ticketsAvailable) {
          return {
            message: dictionary.api.not_enough_tickets,
            isError: true,
          };
        }

        // Insert with retry-on-conflict for pickup code collisions only (rare, cheap to retry
        // a handful of times; never a sequential pre-check loop while the lock is held).
        let attempt = 0;
        let rows = buildRows();
        for (;;) {
          try {
            await prisma.eventRegistration.createMany({ data: rows });
            break;
          } catch (err) {
            const isUniqueConflict =
              err instanceof Prisma.PrismaClientKnownRequestError &&
              err.code === 'P2002';
            attempt++;
            if (!isUniqueConflict || attempt >= MAX_INSERT_ATTEMPTS) {
              throw err;
            }
            // Regenerate codes and try again
            rows = buildRows();
          }
        }

        if (amount + totalRegistrationsForTicketType >= ownQuota.TicketsTotal) {
          logger.info(
            `Event ${eventDocumentId} ticket ${ticketUid} is sold out. Setting sold out in redis for 3 minutes.`,
          );
          await redisClient.set(
            `event-sold-out:${eventDocumentId}:ticket:${ticketUid}`,
            'true',
            'EX',
            180, // 3 minutes
          );
          updateTag(`get-cached-event-registrations:${eventDocumentId}`);
        }

        // Check if joint quota is now sold out
        if (
          jointQuota &&
          typeof jointQuotaTotal !== 'undefined' &&
          amount + totalRegistrationsJoint >= jointQuotaTotal
        ) {
          logger.info(`Event ${eventDocumentId} joint quota is sold out.`);
          await redisClient.set(
            `event-sold-out:${eventDocumentId}:joint-quota`,
            'true',
            'EX',
            180,
          );

          // Revalidates cache for event registrations so that the sold out status is updated
          updateTag(`get-cached-event-registrations:${eventDocumentId}`);
        }

        logger.info(
          `User ${localUser.entraUserUuid} reserved ${amount} ${ticketUid} tickets for event ${eventDocumentId}. User's total count of this ticket type is now ${
            currentUserReservationsForTicketType + amount
          }`,
        );

        return {
          message: dictionary.general.success,
          isError: false,
        };
      },
      { timeout: 5000, maxWait: 2000 },
    )
    .catch((error) => {
      logger.error('Error creating reservation', error);
      return {
        message: dictionary.api.server_error,
        isError: true,
      };
    });

  if (result.isError) {
    return result;
  }

  updateTag(`get-cached-user:${localUser.entraUserUuid}`);

  return {
    message: dictionary.general.success,
    isError: false,
  };
}
