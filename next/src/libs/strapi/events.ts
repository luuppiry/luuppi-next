import { auth } from '@/auth';
import prisma from '@/libs/db/prisma';
import { logger } from '@/libs/utils/logger';
import { Dictionary } from '@/models/locale';
import { APIResponseData } from '@/types/types';

const luuppiMember = process.env.NEXT_PUBLIC_LUUPPI_MEMBER_ID!;
const luuppiNonMember = process.env.NEXT_PUBLIC_NO_ROLE_ID!;

type Event = Omit<APIResponseData<'api::event.event'>, 'id'>;

/**
 * Helper function to extract role IDs from user roles
 * @param roles - User roles from Prisma
 * @returns Array of role IDs
 */
const extractRoleIds = (
  roles: Array<{ role: { strapiRoleUuid: string } }>,
): string[] =>
  roles
    .map((r) => r.role?.strapiRoleUuid)
    .filter((id): id is string => Boolean(id));

// In case an event has a Registration for luuppi-members or non-members ("default"), add a duplicate event
// to show the opening time in the calendar
export const addEventRegisterationOpensAtInfo = <T>(
  acc: T[],
  event: Event,
  formatEvent: (event: Event) => T,
  dictionary: Dictionary,
) => {
  if (!event?.Registration?.TicketTypes) {
    return [...acc, formatEvent(event)];
  }

  const memberSaleStartsAt = event.Registration?.TicketTypes.find((type) => {
    const roleId = type?.Role?.RoleId;
    return roleId && [luuppiMember, luuppiNonMember].includes(roleId);
  });

  if (!memberSaleStartsAt?.RegistrationStartsAt) {
    return [...acc, formatEvent(event)];
  }

  return [
    ...acc,
    formatEvent(event),
    formatEvent({
      ...event,
      StartDate: new Date(memberSaleStartsAt.RegistrationStartsAt),
      EndDate: new Date(memberSaleStartsAt.RegistrationStartsAt),
      NameEn: `${event['NameEn']} ${dictionary.general.opens}`,
      NameFi: `${event['NameFi']} ${dictionary.general.opens}`,
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
  event: Event,
  userRoleIds?: string[],
): Promise<boolean> => {
  // If ShowInCalendar is not explicitly false, show to everyone (true is the default or undefined for old events)
  if (event.ShowInCalendar !== false) {
    return true;
  }

  const visibleForRoles = event.VisibleOnlyForRoles;
  let requiredRoleIds: string[];

  // Use VisibleOnlyForRoles if specified or TicketTypes as a fallback, otherwise hide the event entirely
  if (visibleForRoles && visibleForRoles.length > 0) {
    requiredRoleIds = visibleForRoles
      .map((r) => r?.RoleId)
      .filter((id): id is string => Boolean(id));
  } else {
    const ticketTypes = event.Registration?.TicketTypes;
    if (!ticketTypes || ticketTypes.length === 0) {
      // No ticket types and no visible roles - hide from everyone
      logger.error(`Event ${event.documentId} is hidden entirely - no ticket types`);
      return false;
    }

    requiredRoleIds = ticketTypes
      .map((type) => type?.Role?.RoleId)
      .filter((id): id is string => Boolean(id));

    // If no valid role IDs found in ticket types, hide the event
    if (requiredRoleIds.length === 0) {
      logger.error(
        `Event ${event.documentId} is hidden entirely - no roles for ticket types`,
      );
      return false;
    }
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
  return requiredRoleIds.some((requiredRole) =>
    userRoleIds!.includes(requiredRole),
  );
};

/**
 * Filters an array of events based on visibility rules.
 * Optimized to fetch user session and roles only once.
 *
 * @param events - Array of event data from Strapi
 * @param forcedRoles - Allows bypassing authentication for use in sitemap, ics generation, and event feed
 * @returns Promise<Array> - Filtered array of events
 */
export const filterVisibleEvents = async (
  events: Event[],
  forcedRoles?: string[],
): Promise<Event[]> => {
  if (forcedRoles?.length) {
    const visibilityChecks = await Promise.all(
      events.map(async (event) => ({
        event,
        visible: await isEventVisible(event, forcedRoles),
      })),
    );

    return visibilityChecks
      .filter((check) => check.visible)
      .map((check) => check.event);
  }

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
