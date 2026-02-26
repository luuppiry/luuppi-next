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

const options = {
  noRoleId: process.env.NEXT_PUBLIC_NO_ROLE_ID!,
};

export async function reservationCreate(
  eventDocumentId: string,
  amount: number,
  lang: SupportedLanguage,
  selectedQuota: string,
  userProvidedTargetedRole: string | undefined,
  ticketUid?: string,
) {
  const dictionary = await getDictionary(lang);
  const session = await auth();

  if (!session?.user) {
    return {
      message: dictionary.api.unauthorized,
      isError: true,
    };
  }

  // User provided targeted role cannot be trusted (can be manipulated by user), but this
  // prevents unnecessary database queries most of the time
  if (
    userProvidedTargetedRole &&
    typeof userProvidedTargetedRole === 'string'
  ) {
    // Check if the event is sold out for the user's role
    const isSoldOut = await redisClient.get(
      `event-sold-out:${eventDocumentId}:${userProvidedTargetedRole}`,
    );
    if (isSoldOut) {
      logger.info(
        `Cache hit: Event ${eventDocumentId} is sold out for role ${userProvidedTargetedRole}`,
      );
      return {
        message: dictionary.api.sold_out,
        isError: true,
      };
    }

    // Check if the joint quota is sold out
    const isJointQuotaSoldOut = await redisClient.get(
      `event-sold-out:${eventDocumentId}:joint-quota`,
    );
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

  const roleQuota = ticketTypes?.find(
    (type) => type.Role?.RoleId === targetedRole.strapiRoleUuid,
  );
  const targetedQuota = ticketTypes?.find(
    (type) =>
      type.Role?.RoleId === targetedRole.strapiRoleUuid &&
      ticketUid === type.uid,
  );

  logger.info('ticketTypes', JSON.stringify(ticketTypes));
  logger.info('ticketUid', ticketUid);
  logger.info('targetedRole', JSON.stringify(targetedRole));
  logger.info('roleQuota', JSON.stringify(roleQuota));
  logger.info('targetedQuota', JSON.stringify(targetedQuota));

  const ownQuota = targetedQuota ?? roleQuota;

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

  const strapiRoleUuid = targetedRole.strapiRoleUuid;
  const entraUserUuid = localUser.entraUserUuid;

  const result = await prisma
    .$transaction(async (prisma) => {
      await prisma.$executeRaw`LOCK TABLE "EventRegistration" IN ACCESS EXCLUSIVE MODE`;

      const [eventRegistrations, currentUserReservations] = await Promise.all([
        prisma.eventRegistration.findMany({
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
          select: {
            purchaseRole: {
              select: {
                strapiRoleUuid: true,
              },
            },
          },
        }),
        prisma.eventRegistration.count({
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
        }),
      ]);

      const totalRegistrationWithRole = eventRegistrations.filter(
        (registration) =>
          registration.purchaseRole.strapiRoleUuid ===
          targetedRole.strapiRoleUuid,
      ).length;

      // Validate that the event is not sold out for the user's role
      if (totalRegistrationWithRole >= ownQuota.TicketsTotal) {
        return {
          message: dictionary.api.sold_out,
          isError: true,
        };
      }

      const ticketsAvailable = strapiEvent.Registration?.JointQuota
        ? (strapiEvent.Registration.TicketsTotal ?? 0) -
          eventRegistrations.length
        : ownQuota.TicketsTotal - totalRegistrationWithRole;

      const ticketsAllowedToBuy = ownQuota.TicketsAllowedToBuy;

      // Validate that the user has not already reserved the maximum amount of tickets
      if (currentUserReservations >= ticketsAllowedToBuy) {
        return {
          message: dictionary.api.maximum_tickets_reached,
          isError: true,
        };
      }

      // Validate per user limit still allows the user to reserve the amount
      const canReserveAmount =
        amount + currentUserReservations <= ticketsAllowedToBuy;
      if (!canReserveAmount) {
        return {
          message: dictionary.api.no_room_own_limit,
          isError: true,
        };
      }

      // Validate that there are still enough tickets available
      const isAvailable = amount <= ticketsAvailable;

      if (!isAvailable) {
        return {
          message: dictionary.api.not_enough_tickets,
          isError: true,
        };
      }

      // Buys the last tickets
      if (amount + totalRegistrationWithRole >= ownQuota.TicketsTotal) {
        // Set event as sold out for this role in redis for 3 minutes
        // to prevent unnecessary database locks & backend calculations
        logger.info(
          `Event ${eventDocumentId} is sold out for role ${strapiRoleUuid}. Setting sold out in redis for 3 minutes.`,
        );
        await redisClient.set(
          `event-sold-out:${eventDocumentId}:${strapiRoleUuid}`,
          'true',
          'EX',
          180, // 3 minutes
        );
        updateTag(`get-cached-event-registrations:${eventDocumentId}`);
      }

      // Check if joint quota is now sold out
      if (
        strapiEvent.Registration?.JointQuota &&
        typeof strapiEvent.Registration.TicketsTotal !== 'undefined' &&
        amount + eventRegistrations.length >=
          strapiEvent.Registration.TicketsTotal
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

      const hasDefaultRole = localUser.roles.find(
        (role) => role.role.strapiRoleUuid === options.noRoleId!,
      );
      if (!hasDefaultRole) {
        // User should always have a default role
        logger.error(
          'User doesnt have a default role. This should never happen.',
          localUser.entraUserUuid,
        );
        throw new Error(dictionary.api.server_error);
      }

      // Generate a unique pickup code
      const requiresPickup = strapiEvent.Registration?.RequiresPickup ?? false;

      if (requiresPickup) {
        const eventRegistrationsFormattedWithPickupCode = await Promise.all(
          Array.from({ length: amount }).map(async () => {
            let pickupCode = '';
            pickupCode = generatePickupCode();
            let attempts = 0;
            const maxAttempts = 1000;

            while (attempts < maxAttempts) {
              const existing = await prisma.eventRegistration.findUnique({
                where: { pickupCode },
              });

              if (!existing) {
                break;
              }
              pickupCode = generatePickupCode();
              attempts++;
            }

            return {
              strapiTicketUid: ticketUid,
              eventDocumentId,
              entraUserUuid,
              strapiRoleUuid,
              reservedUntil: new Date(Date.now() + 60 * 60 * 1000), // 60 minutes from now
              price: ownQuota.Price,
              pickupCode,
            };
          }),
        );

        // Create event registrations. This is the actual reservation.
        await prisma.eventRegistration.createMany({
          data: eventRegistrationsFormattedWithPickupCode,
        });
      } else {
        const eventRegistrationsFormatted = Array.from({ length: amount }).map(
          () => ({
            strapiTicketUid: ticketUid,
            eventDocumentId,
            entraUserUuid,
            strapiRoleUuid,
            reservedUntil: new Date(Date.now() + 60 * 60 * 1000), // 60 minutes from now
            price: ownQuota.Price,
          }),
        );

        await prisma.eventRegistration.createMany({
          data: eventRegistrationsFormatted,
        });
      }

      logger.info(
        `User ${
          localUser.entraUserUuid
        } reserved ${amount} tickets for event ${eventDocumentId}. User's total count of tickets for this event is now ${
          currentUserReservations + amount
        }`,
      );

      return {
        message: dictionary.general.success,
        isError: false,
      };
    })
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
