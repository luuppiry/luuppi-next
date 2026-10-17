import { auth } from '@/auth';
import prisma from '@/libs/db/prisma';
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
  let requiredRoleIds: string[] = [];

  // If VisibleOnlyForRoles is not set, the event is visible to anyone with the link
  if (!visibleForRoles || visibleForRoles.length === 0) {
    return true;
  }

  if (visibleForRoles && visibleForRoles.length > 0) {
    requiredRoleIds = visibleForRoles
      .map((r) => r?.RoleId)
      .filter((id): id is string => Boolean(id));
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
 */
export const filterVisibleEvents = async (
  events: Event[],
): Promise<Event[]> => {
  const visibilityChecks = await Promise.all(
    events.map(async (event) => ({
      event,
      visible: event.ShowInCalendar !== false,
    })),
  );

  return visibilityChecks
    .filter((check) => check.visible)
    .map((check) => check.event);
};
