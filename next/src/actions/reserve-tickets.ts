'use server';
import { auth } from '@/auth';
import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { logger } from '@/libs/utils/logger';
import { SupportedLanguage } from '@/models/locale';
import { APIResponse } from '@/types/types';
import { Session } from 'next-auth';

export async function reserveTickets(
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
    ['event'],
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
    session.user.azureId,
  );

  const userRoleUuids = localUser?.roles.map((role) => role.role.uuid) ?? [];
  const ticketTypes = strapiEvent.data.attributes.Registration?.TicketTypes;

  const eventRolesWithWeights =
    ticketTypes?.map((ticketType) => ({
      uuid: ticketType.Role?.data.attributes.RoleId,
      weight: ticketType.Weight,
    })) ?? [];

  const hasDefaultRoleWeight = eventRolesWithWeights.find(
    (role) => role.uuid === process.env.NEXT_PUBLIC_NO_ROLE_ID!,
  );

  const targetedRole = userRoleUuids.reduce(
    (acc, userRoleUuid) => {
      const roleWeight =
        eventRolesWithWeights.find((role) => role.uuid === userRoleUuid)
          ?.weight ?? 0;
      return roleWeight > acc.weight
        ? { uuid: userRoleUuid, weight: roleWeight }
        : acc;
    },
    {
      uuid: process.env.NEXT_PUBLIC_NO_ROLE_ID!,
      weight: hasDefaultRoleWeight?.weight ?? 0,
    },
  );

  const ownQuota = ticketTypes?.find(
    (type) => type.Role?.data.attributes.RoleId === targetedRole.uuid,
  );

  const totalRegistrationWithRole = eventRegistrations.filter(
    (registration) => registration.purchaseRole.uuid === targetedRole.uuid,
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
          registration.userId === localUser.id &&
          registration.purchaseRole.uuid === targetedRole.uuid &&
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

  await upsertDataAndRegisterEvents(session, targetedRole, eventId, amount);

  logger.info(
    `User ${session.user.azureId} reserved ${amount} tickets for event ${eventId}. User's total count of tickets for this event is now ${
      currentUserReservations.length + amount
    }`,
  );

  return {
    message: `Nyt sinulle olisi varattu ${amount} lippua tapahtumaan ja sinut ohjattaisiin maksamaan ne. Sinulla olisi 60 minuuttia aikaa maksaa liput ennen kuin varaus raukeaa.`,
    isError: false,
  };
}

async function upsertDataAndRegisterEvents(
  session: Session,
  targetedRole: { uuid: string; weight: number },
  eventId: number,
  amount: number,
) {
  await prisma.$transaction(async (prisma) => {
    const user = await prisma.user.upsert({
      where: { uuid: session.user!.azureId },
      update: {},
      create: { uuid: session.user!.azureId },
    });

    const role = await prisma.role.upsert({
      where: { uuid: targetedRole.uuid },
      update: {},
      create: { uuid: targetedRole.uuid },
    });

    await prisma.rolesOnUsers.upsert({
      where: {
        roleId_userId: {
          roleId: role.id,
          userId: user.id,
        },
      },
      update: {},
      create: {
        roleId: role.id,
        userId: user.id,
      },
    });

    const eventRegistrations = Array.from({ length: amount }).map(() => ({
      eventId,
      userId: user.id,
      purchaseRoleId: role.id,
    }));

    await prisma.eventRegistration.createMany({
      data: eventRegistrations,
    });
  });
}

async function getUserAndRegistrations(eventId: number, azureId: string) {
  const eventRegistrationsPromise = await prisma.eventRegistration.findMany({
    where: {
      eventId,
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
      uuid: azureId,
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
