import { auth } from '@/auth';
import prisma from '@/libs/db/prisma';
import { NextResponse } from 'next/server';
import { cacheTag, cacheLife } from 'next/cache';

async function getProfileCompletion(entraUserUuid: string) {
  'use cache';
  cacheTag(`get-cached-user:${entraUserUuid}`);
  cacheLife('max');

  const localUser = await prisma.user.findFirst({
    where: { entraUserUuid },
  });

  if (!localUser) {
    return null;
  }

  const requiredFields: Array<keyof typeof localUser> = [
    'firstName',
    'lastName',
    'domicle',
  ];

  const missingFields = requiredFields.filter((key) => !localUser?.[key]);

  return { isComplete: !missingFields.length };
}

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await getProfileCompletion(session.user.entraUserUuid);

  if (!result) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(result);
}
