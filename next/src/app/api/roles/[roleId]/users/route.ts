import { auth } from '@/auth';
import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { logger } from '@/libs/utils/logger';
import { RolesOnUsers, User } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export interface GetRoleUsersErrorResponse {
  message: string;
  isError: true;
}

type UserWithRoleInfo = User & {
  roleInfo: RolesOnUsers | null;
};

export interface GetRoleUsersSuccessResponse {
  users: UserWithRoleInfo[];
  total: number;
  isError: false;
}

export type GetRoleUsersResponse =
  | GetRoleUsersErrorResponse
  | GetRoleUsersSuccessResponse;

const MAX_PAGE_SIZE = 50;
const SUPPORTED_LANGUAGES = ['fi', 'en'] as const;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> },
): Promise<NextResponse<GetRoleUsersResponse>> {
  const { roleId } = await params;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = Math.min(
    parseInt(searchParams.get('pageSize') || '30'),
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

  // Verify role exists
  const role = await prisma.role.findUnique({
    where: { strapiRoleUuid: roleId },
  });

  if (!role) {
    return NextResponse.json(
      { message: dictionary.api.role_not_found, isError: true },
      { status: 404 },
    );
  }

  const searchWhere = search
    ? {
        OR: [
          { email: { contains: search, mode: 'insensitive' as const } },
          { username: { contains: search, mode: 'insensitive' as const } },
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const SUPER_ADMINS = process.env.XXX_SUPER_ADMIN_XXX!.split(',');
  const restrictedRole = SUPER_ADMINS.includes(user.entraUserUuid)
    ? ''
    : process.env.NEXT_PUBLIC_LUUPPI_HATO_ID;

  try {
    const [usersWithRole, totalWithRole] = await Promise.all([
      prisma.user.findMany({
        where: {
          ...searchWhere,
          roles: {
            some: {
              AND: {
                strapiRoleUuid: roleId,
                NOT: {
                  strapiRoleUuid: restrictedRole,
                },
              },
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { email: 'asc' },
      }),
      prisma.user.count({
        where: {
          ...searchWhere,
          roles: {
            some: {
              AND: {
                strapiRoleUuid: roleId,
                NOT: {
                  strapiRoleUuid: restrictedRole,
                },
              },
            },
          },
        },
      }),
    ]);

    // Get role info for each user in a single batched query
    const userUuids = usersWithRole.map((u) => u.entraUserUuid);

    const roleInfos = userUuids.length
      ? await prisma.rolesOnUsers.findMany({
          where: {
            entraUserUuid: { in: userUuids },
            strapiRoleUuid: roleId,
          },
        })
      : [];

    const roleInfoByUserId = new Map<string, RolesOnUsers>();
    for (const roleInfo of roleInfos) {
      if (!roleInfoByUserId.has(roleInfo.entraUserUuid)) {
        roleInfoByUserId.set(roleInfo.entraUserUuid, roleInfo);
      }
    }

    const usersWithRoleInfo = usersWithRole.map((u) => ({
      ...u,
      roleInfo: roleInfoByUserId.get(u.entraUserUuid) ?? null,
    }));
    return NextResponse.json({
      users: usersWithRoleInfo,
      total: totalWithRole,
      isError: false,
    });
  } catch (error) {
    logger.error('Failed to fetch users for role:', error);
    return NextResponse.json(
      { message: dictionary.api.server_error, isError: true },
      { status: 500 },
    );
  }
}
