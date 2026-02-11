'use server';
import { auth } from '@/auth';
import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { redisClient } from '@/libs/db/redis';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { logger } from '@/libs/utils/logger';
import { generatePickupCode } from '@/libs/utils/pickup-code';
import { SupportedLanguage } from '@/models/locale';
import { APIResponseCollection } from '@/types/types';
import { revalidateTag } from 'next/cache';

const options = {
  noRoleId: process.env.NEXT_PUBLIC_NO_ROLE_ID!,
};

export async function reservationCreate(
  eventDocumentId: string,
  eventId: number,
  amount: number,
  lang: SupportedLanguage,
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

    // Check if the joint quota is sold out
    const isJointQuotaSoldOut = await redisClient.get(
      `event-sold-out:${eventId}:joint-quota`,
    );
    if (isJointQuotaSoldOut) {
      logger.info(`Cache hit: Event ${eventId} joint quota is sold out`);
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

  const strapiUrl = `/api/events?filters[id][$eq]=${eventId}&populate=Registration.TicketTypes.Role&populate=Registration.RoleToGive`;
  const strapiEvents = await getStrapiData<
    APIResponseCollection<'api::event.event'>
  >(lang, strapiUrl, [`event-${eventId}`], true);

  const strapiEvent = strapiEvents?.data.at(0);

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
    (type) => type.Role?.RoleId === targetedRole.strapiRoleUuid,
  );

  // Validate that the user has a role that can reserve tickets
  if (!ownQuota) {
    return {
      message: dictionary.api.unauthorized,
      isError: true,
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

      if (
        strapiEvent.Registration?.JointQuota &&
        typeof strapiEvent.Registration.TicketsTotal !== 'undefined'
      ) {
        if (
          eventRegistrations.length >= strapiEvent.Registration.TicketsTotal
        ) {
          return {
            message: dictionary.api.sold_out,
            isError: true,
          };
        }
      }

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
          `Event ${eventId} is sold out for role ${strapiRoleUuid}. Setting sold out in redis for 3 minutes.`,
        );
        await redisClient.set(
          `event-sold-out:${eventId}:${strapiRoleUuid}`,
          'true',
          'EX',
          180, // 3 minutes
        );
        revalidateTag(`get-cached-event-registrations:${eventId}`);
      }

      // Check if joint quota is now sold out
      if (
        strapiEvent.Registration?.JointQuota &&
        typeof strapiEvent.Registration.TicketsTotal !== 'undefined' &&
        amount + eventRegistrations.length >=
          strapiEvent.Registration.TicketsTotal
      ) {
        logger.info(`Event ${eventId} joint quota is sold out.`);
        await redisClient.set(
          `event-sold-out:${eventId}:joint-quota`,
          'true',
          'EX',
          180,
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

      // Generate a unique pickup code
      const requiresPickup = strapiEvent.Registration?.RequiresPickup ?? false;
      let pickupCode = '';
      if (requiresPickup) {
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

        const eventRegistrationsFormattedWithPickupCode = Array.from({
          length: amount,
        }).map(() => ({
          eventDocumentId,
          eventId,
          entraUserUuid,
          strapiRoleUuid,
          reservedUntil: new Date(Date.now() + 60 * 60 * 1000), // 60 minutes from now
          price: ownQuota.Price,
          pickupCode: pickupCode,
        }));

        // Create event registrations. This is the actual reservation.
        await prisma.eventRegistration.createMany({
          data: eventRegistrationsFormattedWithPickupCode,
        });
      } else {
        const eventRegistrationsFormatted = Array.from({ length: amount }).map(
          () => ({
            eventDocumentId,
            eventId,
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
