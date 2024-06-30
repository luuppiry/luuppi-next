'use server';
import { auth } from '@/auth';
import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { logger } from '@/libs/utils/logger';
import { SupportedLanguage } from '@/models/locale';
import { APIResponse } from '@/types/types';
import { redirect } from 'next/navigation';

const options = {
  noRoleId: process.env.NEXT_PUBLIC_NO_ROLE_ID!,
};

export async function reservationCreate(
  eventId: number,
  amount: number,
  lang: SupportedLanguage,
) {
  const dictionary = await getDictionary(lang);
  const session = await auth();

  if (!session?.user) {
    return {
      message: dictionary.api.unauthorized,
      isError: true,
    };
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

  const [localUser, eventRegistrations] = await getUserAndRegistrations(
    eventId,
    session.user.entraUserUuid,
  );

  const strapiRoleUuids =
    localUser?.roles.map((role) => role.role.strapiRoleUuid) ?? [];
  const ticketTypes = strapiEvent.data.attributes.Registration?.TicketTypes;

  const eventRolesWithWeights =
    ticketTypes?.map((ticketType) => ({
      strapiRoleUuid: ticketType.Role?.data.attributes.RoleId,
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

  const ownQuota = ticketTypes?.find(
    (type) => type.Role?.data.attributes.RoleId === targetedRole.strapiRoleUuid,
  );

  const totalRegistrationWithRole = eventRegistrations.filter(
    (registration) =>
      registration.purchaseRole.strapiRoleUuid === targetedRole.strapiRoleUuid,
  ).length;

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

  // Validate that the event is not sold out for the user's role
  if (totalRegistrationWithRole >= ownQuota.TicketsTotal) {
    return {
      message: dictionary.api.sold_out,
      isError: true,
    };
  }

  const ticketsAvailable = ownQuota.TicketsTotal - totalRegistrationWithRole;
  const ticketsAllowedToBuy = ownQuota.TicketsAllowedToBuy;

  const currentUserReservations = localUser
    ? eventRegistrations.filter(
        (registration) =>
          registration.entraUserUuid === localUser.entraUserUuid &&
          registration.purchaseRole.strapiRoleUuid ===
            targetedRole.strapiRoleUuid &&
          (registration.reservedUntil > new Date() ||
            registration.paymentCompleted),
      )
    : [];

  // Validate that the user has not already reserved the maximum amount of tickets
  if (currentUserReservations.length >= ticketsAllowedToBuy) {
    return {
      message: dictionary.api.maximum_tickets_reached,
      isError: true,
    };
  }

  // Validate per user limit still allows the user to reserve the amount
  const canReserveAmount =
    amount + currentUserReservations.length <= ticketsAllowedToBuy;
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

  const result = await prisma
    .$transaction(async (prisma) => {
      // Lock whole table to prevent overbooking
      await prisma.$executeRaw`LOCK TABLE "EventRegistration" IN ACCESS EXCLUSIVE MODE`;

      const totalRegistrations = await prisma.eventRegistration.count({
        where: {
          eventId,
          deletedAt: null,

          // Ticket is consired reserved if one of the following is true:
          // - Reserved until is in the future
          // - Payment is completed
          // - There is a pending payment and payment is not completed
          OR: [
            {
              reservedUntil: {
                gte: new Date(),
              },
            },
            {
              paymentCompleted: true,
            },
            {
              paymentCompleted: false,
              payments: {
                some: {
                  status: 'PENDING',
                },
              },
            },
          ],
        },
      });

      const strapiRoleUuid = targetedRole.strapiRoleUuid;
      const entraUserUuid = session.user!.entraUserUuid;

      if (totalRegistrations + amount > ownQuota.TicketsTotal) {
        throw new Error(dictionary.api.sold_out);
      }

      const promisesArray: Promise<any>[] = [];

      // No local user, create one
      if (!localUser) {
        const userPromise = prisma.user.create({
          data: {
            entraUserUuid,
            roles: {
              create: {
                strapiRoleUuid,
              },
            },
          },
        });

        promisesArray.push(userPromise);
      }

      // If user has no default role, add it
      if (
        localUser &&
        !localUser.roles.find(
          (role) => role.strapiRoleUuid === options.noRoleId!,
        )
      ) {
        const rolesOnUsersPromise = prisma.rolesOnUsers.upsert({
          where: {
            strapiRoleUuid_entraUserUuid: {
              strapiRoleUuid: strapiRoleUuid,
              entraUserUuid: entraUserUuid,
            },
          },
          update: {},
          create: {
            strapiRoleUuid,
            entraUserUuid,
          },
        });

        promisesArray.push(rolesOnUsersPromise);
      }

      // Create event registrations. This is the actual reservation.
      const eventRegistrationsPromise = Array.from({ length: amount }).map(
        () => ({
          eventId,
          entraUserUuid,
          strapiRoleUuid,
          price: ownQuota.Price,
        }),
      );

      const eventsPromise = prisma.eventRegistration.createMany({
        data: eventRegistrationsPromise,
      });

      promisesArray.push(eventsPromise);

      await Promise.all(promisesArray);

      return {
        message: dictionary.general.success,
        isError: false,
      };
    })
    .catch((error) => ({
      message: error.message,
      isError: true,
    }));

  logger.info(
    `User ${session.user.entraUserUuid} reserved ${amount} tickets for event ${eventId}. User's total count of tickets for this event is now ${
      currentUserReservations.length + amount
    }`,
  );

  if (result.isError) {
    return result;
  }

  redirect(`/${lang}/own-events`);
}

async function getUserAndRegistrations(eventId: number, entraUserUuid: string) {
  const eventRegistrationsPromise = await prisma.eventRegistration.findMany({
    where: {
      eventId,
      deletedAt: null,
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

  const localUserPromise = await prisma.user.findFirst({
    where: {
      entraUserUuid,
    },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
      registrations: true,
    },
  });

  return Promise.all([localUserPromise, eventRegistrationsPromise]);
}
