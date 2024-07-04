'use server';
import { auth } from '@/auth';
import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { isRateLimited, updateRateLimitCounter } from '@/libs/rate-limiter';
import { logger } from '@/libs/utils/logger';
import { SupportedLanguage } from '@/models/locale';

const options = {
  cacheKey: 'migrate-legacy-account',
  memberRole: process.env.NEXT_PUBLIC_LUUPPI_MEMBER_ID!,
};

export async function migrateLegacyAccount(
  lang: SupportedLanguage,
  formData: FormData,
) {
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
  }

  await updateRateLimitCounter(user.entraUserUuid, options.cacheKey);

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
      entraUserUuid: user.entraUserUuid,
      strapiRoleUuid: options.memberRole,
      expiresAt: endsAt,
    },
  });

  logger.info(
    `User ${user.entraUserUuid} migrated legacy account with expiresAt: ${endsAt}`,
  );

  return {
    message: dictionary.api.legacy_account_migrated,
    isError: false,
  };
}
