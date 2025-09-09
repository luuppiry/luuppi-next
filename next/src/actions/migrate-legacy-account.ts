'use server';
import { auth } from '@/auth';
import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { isRateLimited, updateRateLimitCounter } from '@/libs/rate-limiter';
import { logger } from '@/libs/utils/logger';
import { revalidatePath, revalidateTag } from 'next/cache';

const options = {
  cacheKey: 'migrate-legacy-account',
  memberRole: process.env.NEXT_PUBLIC_LUUPPI_MEMBER_ID!,
};

export async function migrateLegacyAccount(lang: string, formData: FormData) {
  const dictionary = await getDictionary(lang);

  const session = await auth();
  const user = session?.user;

  if (!user) {
    logger.error('User not found in session');
    return {
      message: dictionary.api.unauthorized,
      isError: true,
    };
  }

  const isLimited = await isRateLimited(
    user.entraUserUuid,
    options.cacheKey,
    5,
  );
  if (isLimited) {
    logger.error(`User is being rate limited: ${user.email}`);
    return {
      message: dictionary.api.ratelimit,
      isError: true,
    };
  } else {
    await updateRateLimitCounter(user.entraUserUuid, options.cacheKey);
  }

  const localUser = await prisma.user.findFirst({
    where: {
      entraUserUuid: user.entraUserUuid,
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

  if (!localUser) {
    logger.error('User not found in database');
    return {
      message: dictionary.api.invalid_credentials,
      isError: true,
    };
  }

  const hasMemberRole = localUser.roles.some(
    (r) => r.role.strapiRoleUuid === options.memberRole,
  );
  if (hasMemberRole) {
    logger.error('User already has member role');
    return {
      message: dictionary.api.already_member_role,
      isError: true,
    };
  }

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    logger.error('Email or password missing in form data');
    return {
      message: dictionary.api.invalid_credentials,
      isError: true,
    };
  }

  const legacyMigrateResponse = await fetch('http://legacy-mig:4444/login', {
    body: JSON.stringify({ user: email, pass: password }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!legacyMigrateResponse.ok) {
    logger.error('Error migrating legacy account');
    return {
      message: dictionary.api.invalid_credentials,
      isError: true,
    };
  }

  const legacyMigrateData = await legacyMigrateResponse.json();
  const endsAt = legacyMigrateData.endsAt
    ? new Date(legacyMigrateData.endsAt)
    : null;

  await prisma.rolesOnUsers.upsert({
    where: {
      strapiRoleUuid_entraUserUuid: {
        entraUserUuid: user.entraUserUuid,
        strapiRoleUuid: options.memberRole,
      },
    },
    update: {
      expiresAt: endsAt,
    },
    create: {
      strapiRoleUuid: options.memberRole,
      entraUserUuid: user.entraUserUuid,
    },
  });

  logger.info(
    `User ${user.entraUserUuid} migrated legacy account with expiresAt: ${endsAt}`,
  );

  revalidateTag(`get-cached-user:${user.entraUserUuid}`);
  revalidatePath('/[lang]/events/[slug]', 'page');
  revalidatePath('/[lang]/profile', 'page');

  return {
    message: dictionary.api.legacy_account_migrated,
    isError: false,
  };
}
