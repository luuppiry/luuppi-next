import { auth } from '@/auth';
import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { logger } from '@/libs/utils/logger';
import { Role, RolesOnUsers, User } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export interface GetRolesErrorResponse {
  message: string;
  isError: true;
}

type RoleWithUsers = Role & {
  users: (RolesOnUsers & { user: User })[];
};

export interface GetRolesSuccessResponse {
  roles: RoleWithUsers[];
  total: number;
  isError: false;
}

export type GetRolesResponse = GetRolesErrorResponse | GetRolesSuccessResponse;

const MAX_PAGE_SIZE = 50;
const DEFAULT_PAGE_SIZE = 30;
const SUPPORTED_LANGUAGES = ['fi', 'en'] as const;

export async function GET(
  request: NextRequest,
): Promise<NextResponse<GetRolesResponse>> {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = Math.min(
    parseInt(searchParams.get('pageSize') || `${DEFAULT_PAGE_SIZE}`),
    MAX_PAGE_SIZE,
  );
  const search = searchParams.get('search') || '';
  const lang = searchParams.get('lang') || 'en';

  const dictionary = await getDictionary(
    lang as (typeof SUPPORTED_LANGUAGES)[number],
  );

  if (
    !SUPPORTED_LANGUAGES.includes(lang as (typeof SUPPORTED_LANGUAGES)[number])
  ) {
    logger.error('Unsupported language:', lang);
    return NextResponse.json(
      { message: dictionary.api.server_error, isError: true },
      { status: 400 },
    );
  }

  const session = await auth();

  const user = session?.user;

  if (!user || !user.isLuuppiHato) {
    logger.error('User not found in session');
    return NextResponse.json(
      { message: dictionary.api.unauthorized, isError: true },
      { status: 401 },
    );
  }

  const hasHatoRole = await prisma.rolesOnUsers.findFirst({
    where: {
      entraUserUuid: user.entraUserUuid,
      strapiRoleUuid: process.env.NEXT_PUBLIC_LUUPPI_HATO_ID!,
      OR: [{ expiresAt: { gte: new Date() } }, { expiresAt: null }],
    },
  });

  if (!hasHatoRole) {
    logger.error('User does not have the required role');
    return NextResponse.json(
      { message: dictionary.api.unauthorized, isError: true },
      { status: 401 },
    );
  }

  // Build where clause with permission filtering
  const isSuperAdmin = process.env.XXX_SUPER_ADMIN_XXX?.includes(
    user.entraUserUuid,
  );

  // Combine search and permission filters using AND
  const filters: Array<Record<string, unknown>> = [];
  if (search) {
    filters.push({
      strapiRoleUuid: { contains: search, mode: 'insensitive' as const },
    });
  }
  if (!isSuperAdmin) {
    filters.push({
      strapiRoleUuid: { not: process.env.NEXT_PUBLIC_LUUPPI_HATO_ID },
    });
  }

  const where = filters.length > 0 ? { AND: filters } : {};

  try {
    const [allRoles, total] = await Promise.all([
      prisma.role.findMany({
        where,
        take: pageSize,
        skip: (page - 1) * pageSize,
        include: {
          users: {
            include: {
              user: true,
            },
          },
        },
      }),
      prisma.role.count({ where }),
    ]);

    // Sort by number of active users (descending), then alphabetically by strapiRoleUuid
    const sortedRoles = allRoles.sort((a, b) => {
      const userCountDiff = b.users.length - a.users.length;
      if (userCountDiff !== 0) return userCountDiff;
      return a.strapiRoleUuid.localeCompare(b.strapiRoleUuid);
    });

    return NextResponse.json({
      roles: sortedRoles,
      total,
      isError: false,
    });
  } catch (error) {
    logger.error('Failed to fetch roles:', error);
    return NextResponse.json(
      { message: dictionary.api.server_error, isError: true },
      { status: 500 },
    );
  }
}
