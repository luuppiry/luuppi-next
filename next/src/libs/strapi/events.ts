import { auth } from '@/auth';
import prisma from '@/libs/db/prisma';
import { Dictionary } from '@/models/locale';
import { APIResponseData } from '@/types/types';

const luuppiMember = process.env.NEXT_PUBLIC_LUUPPI_MEMBER_ID!;
const luuppiNonMember = process.env.NEXT_PUBLIC_NO_ROLE_ID!;

/**
 * Helper function to extract role IDs from user roles
 * @param roles - User roles from Prisma
 * @returns Array of role IDs
 */
const extractRoleIds = (
  roles: Array<{ role: { strapiRoleUuid: string } }>,
): string[] => {
  return roles
    .map((r) => r.role?.strapiRoleUuid)
    .filter((id): id is string => Boolean(id));
};

// Incase an event has a Registeration for luuppi-members or non-members ("default"), add a duplicate event
// to show the opening time in the calendar
export const addEventRegisterationOpensAtInfo = <T>(
  acc: T[],
  event: APIResponseData<'api::event.event'>,
  // eslint-disable-next-line no-unused-vars
  formatEvent: (event: APIResponseData<'api::event.event'>) => T,
  dictionary: Dictionary,
) => {
  if (!event?.attributes?.Registration?.TicketTypes) {
    return [...acc, formatEvent(event)];
  }

  const memberSaleStartsAt = event.attributes.Registration?.TicketTypes.find(
    (type) => {
      const roleId = type?.Role?.data?.attributes?.RoleId;
      return roleId && [luuppiMember, luuppiNonMember].includes(roleId);
    },
  );

  if (!memberSaleStartsAt?.RegistrationStartsAt) {
    return [...acc, formatEvent(event)];
  }

  return [
    ...acc,
    formatEvent(event),
    formatEvent({
      ...event,
      attributes: {
        ...event.attributes,
        StartDate: new Date(memberSaleStartsAt.RegistrationStartsAt),
        EndDate: new Date(memberSaleStartsAt.RegistrationStartsAt),
        NameEn: `${event.attributes['NameEn']} ${dictionary.general.opens}`,
        NameFi: `${event.attributes['NameFi']} ${dictionary.general.opens}`,
      },
    }),
  ];
};

/**
 * Checks if an event should be visible to a specific user based on ShowInCalendar flag
 * and VisibleOnlyForRoles configuration.
 * 
 * @param event - The event data from Strapi
 * @param userRoleIds - Array of role IDs the user has (optional, for performance)
 * @returns Promise<boolean> - True if the event should be visible, false otherwise
 */
export const isEventVisible = async (
  event: APIResponseData<'api::event.event'>,
  userRoleIds?: string[],
): Promise<boolean> => {
  // If ShowInCalendar is explicitly set to false, hide the event
  if (event.attributes.ShowInCalendar === false) {
    return false;
  }

  // If no specific roles are required, show to everyone
  const visibleForRoles = event.attributes.VisibleOnlyForRoles?.data;
  if (!visibleForRoles || visibleForRoles.length === 0) {
    return true;
  }

  // If userRoleIds weren't passed, we need to fetch them
  if (!userRoleIds) {
    const session = await auth();
    if (!session?.user) {
      // Not logged in, can't see role-restricted events
      return false;
    }

    const user = await prisma.user.findUnique({
      where: {
        entraUserUuid: session.user.entraUserUuid,
      },
      include: {
        roles: {
          include: {
            role: true,
          },
          where: {
            OR: [
              {
                expiresAt: {
                  gte: new Date(),
                },
              },
              {
                expiresAt: null,
              },
            ],
          },
        },
      },
    });

    if (!user) {
      return false;
    }

    userRoleIds = extractRoleIds(user.roles);
  }

  // Check if user has any of the required roles
  const requiredRoleIds = visibleForRoles
    .map((r) => r.attributes?.RoleId)
    .filter((id): id is string => Boolean(id));
  return requiredRoleIds.some((requiredRole) => userRoleIds!.includes(requiredRole));
};

/**
 * Filters an array of events based on visibility rules.
 * Optimized to fetch user session and roles only once.
 * 
 * @param events - Array of event data from Strapi
 * @returns Promise<Array> - Filtered array of events
 */
export const filterVisibleEvents = async (
  events: APIResponseData<'api::event.event'>[],
): Promise<APIResponseData<'api::event.event'>[]> => {
  // Get user session and roles once
  const session = await auth();
  let userRoleIds: string[] | undefined = undefined;

  if (session?.user) {
    const user = await prisma.user.findUnique({
      where: {
        entraUserUuid: session.user.entraUserUuid,
      },
      include: {
        roles: {
          include: {
            role: true,
          },
          where: {
            OR: [
              {
                expiresAt: {
                  gte: new Date(),
                },
              },
              {
                expiresAt: null,
              },
            ],
          },
        },
      },
    });

    if (user) {
      userRoleIds = extractRoleIds(user.roles);
    }
  }

  // Check visibility for all events with the same user role data
  const visibilityChecks = await Promise.all(
    events.map(async (event) => ({
      event,
      visible: await isEventVisible(event, userRoleIds),
    })),
  );

  return visibilityChecks
    .filter((check) => check.visible)
    .map((check) => check.event);
};
