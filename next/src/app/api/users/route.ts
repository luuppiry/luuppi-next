import { auth } from '@/auth';
import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { logger } from '@/libs/utils/logger';
import { Role, RolesOnUsers, User } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export interface GetUsersErrorResponse {
  message: string;
  isError: true;
}

type UserWithRole = User & { roles: (RolesOnUsers & { role: Role })[] };

export interface GetUsersSuccessResponse {
  users: UserWithRole[];
  total: number;
  isError: false;
}

export type GetUsersResponse = GetUsersErrorResponse | GetUsersSuccessResponse;

const MAX_PAGE_SIZE = 50;
const SUPPORTED_LANGUAGES = ['fi', 'en'] as const;

export async function GET(
  request: NextRequest,
): Promise<NextResponse<GetUsersResponse>> {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');
  const search = searchParams.get('search') || '';
  const lang = searchParams.get('lang') || 'fi';
  const dictionary = await getDictionary(lang as 'fi' | 'en');

  if (isNaN(page) || page < 1) {
    logger.error('Invalid page:', page);
    return NextResponse.json(
      { message: dictionary.api.server_error, isError: true },
      { status: 400 },
    );
  }

  if (isNaN(pageSize) || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
    logger.error('Invalid page size:', pageSize);
    return NextResponse.json(
      {
        message: dictionary.api.server_error,
        isError: true,
      },
      { status: 400 },
    );
  }

  if (!SUPPORTED_LANGUAGES.includes(lang as any)) {
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

  const where = search
    ? {
        OR: [
          { email: { contains: search, mode: 'insensitive' as const } },
          { username: { contains: search, mode: 'insensitive' as const } },
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  try {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { email: 'asc' },
        include: {
          roles: {
            include: { role: true },
          },
          registrations: {
            where: {
              deletedAt: null,
              OR: [
                { paymentCompleted: true },
                { reservedUntil: { gte: new Date() } },
              ],
            },
            include: {
              answers: true,
              payments: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({ users, total, isError: false });
  } catch (error) {
    logger.error('Error fetching users:', error);
    return NextResponse.json(
      { message: dictionary.api.server_error, isError: true },
      { status: 500 },
    );
  }
}
