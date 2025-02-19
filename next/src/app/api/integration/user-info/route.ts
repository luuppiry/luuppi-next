import prisma from '@/libs/db/prisma';
import { logger } from '@/libs/utils/logger';
import { NextRequest, NextResponse } from 'next/server';

interface UserInfoResponse {
  user: {
    id: number;
    entraUserUuid: string;
    firstName: string | null;
    lastName: string | null;
  };
}

interface UserInfoError {
  error: string;
}

/**
 * This is integration endpoint for Lärpäke which is in separate repository.
 */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<UserInfoResponse | UserInfoError>> {
  try {
    const auth = request.headers.get('authorization');
    if (!auth || auth !== process.env.INTEGRATION_API_SECRET) {
      logger.error('Unauthorized revalidate request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('userId');

    const uuidRegex = new RegExp(
      '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
    );
    if (!query || !uuidRegex.test(query)) {
      return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        entraUserUuid: query,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        entraUserUuid: user.entraUserUuid,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    logger.error('Error while fetching user info', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
