'use server';
import { auth } from '@/auth';
import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { redisClient } from '@/libs/db/redis';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { logger } from '@/libs/utils/logger';
import { APIResponse } from '@/types/types';
import { revalidateTag } from 'next/cache';

const options = {
  noRoleId: process.env.NEXT_PUBLIC_NO_ROLE_ID!,
};

export async function reservationCreate(
  eventId: number,
  amount: number,
  lang: string,
  selectedQuota: string,
  userProvidedTargetedRole: string | undefined,
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
      `event-sold-out:${eventId}:${userProvidedTargetedRole}`,
    );
    if (isSoldOut) {
      logger.info(
        `Cache hit: Event ${eventId} is sold out for role ${userProvidedTargetedRole}`,
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

  if (!eventId || isNaN(eventId) || eventId < 1) {
    return {
      message: dictionary.api.invalid_event,
      isError: true,
    };
  }

  const strapiUrl = `/api/events/${eventId}?populate=Registration.TicketTypes.Role&populate=Registration.RoleToGive`;
  const strapiEvent = await getStrapiData<APIResponse<'api::event.event'>>(
    lang,
    strapiUrl,
    [`event-${eventId}`],
    true,
  );

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
  const ticketTypes = strapiEvent.data.Registration?.TicketTypes;

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
    (type) => type.Role?.RoleId === targetedRole.strapiRoleUuid,
  );

  const ticketsTotal = ownQuota?.TicketsTotal;
  const ticketsAllowedToBuy = ownQuota?.TicketsAllowedToBuy;

  // Validate that the user has a role that can reserve tickets
  if (!ownQuota || !ticketsTotal || !ticketsAllowedToBuy) {
    return {
      message: dictionary.api.unauthorized,
      isError: true,
    };
  }

  // Validate that the registration is still open
  if (
    ownQuota.RegistrationEndsAt &&
    new Date(ownQuota.RegistrationEndsAt) < new Date()
  ) {
    return {
      message: dictionary.api.registration_closed,
      isError: true,
    };
  }

  // Validate that registration is open
  if (
    ownQuota.RegistrationStartsAt &&
    new Date(ownQuota.RegistrationStartsAt) > new Date()
  ) {
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
            eventId,
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
            eventId,
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
      if (totalRegistrationWithRole >= ticketsTotal) {
        return {
          message: dictionary.api.sold_out,
          isError: true,
        };
      }

      const ticketsAvailable = ticketsTotal - totalRegistrationWithRole;

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
      if (amount + totalRegistrationWithRole >= ticketsTotal) {
        // Set event as sold out for this role in redis for 3 minutes
        // to prevent unnecessary database locks & backend calculations
        logger.info(
          `Event ${eventId} is sold out for role ${strapiRoleUuid}. Setting sold out in redis for 3 minutes.`,
        );
        await redisClient.set(
          `event-sold-out:${eventId}:${strapiRoleUuid}`,
          'true',
          'EX',
          180, // 3 minutes
        );

        // Revalidates cache for event registrations so that the sold out status is updated
        revalidateTag(`get-cached-event-registrations:${eventId}`);
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

      // Create event registrations. This is the actual reservation.
      const eventRegistrationsFormatted = Array.from({ length: amount }).map(
        () => ({
          eventId,
          entraUserUuid,
          strapiRoleUuid,
          price: ownQuota.Price || 0,
        }),
      );

      await prisma.eventRegistration.createMany({
        data: eventRegistrationsFormatted,
      });

      logger.info(
        `User ${
          localUser.entraUserUuid
        } reserved ${amount} tickets for event ${eventId}. User's total count of tickets for this event is now ${
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

  revalidateTag(`get-cached-user:${localUser.entraUserUuid}`);

  return {
    message: dictionary.general.success,
    isError: false,
  };
}
