import { auth } from '@/auth';
import prisma from '@/libs/db/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const localUser = await prisma.user.findFirst({
    where: { entraUserUuid: session.user.entraUserUuid },
  });

  if (!localUser) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const requiredFields: Array<keyof typeof localUser> = [
    'firstName',
    'lastName',
    'domicle',
  ];

  const missingFields = requiredFields.filter((key) => !localUser?.[key]);

  return NextResponse.json({ isComplete: !missingFields.length });
}
