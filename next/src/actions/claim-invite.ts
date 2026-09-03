'use server';

import { auth } from '@/auth';
import { isRateLimited, updateRateLimitCounter } from '@/libs/rate-limiter';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { logger } from '@/libs/utils/logger';
import { APIResponseCollection } from '@/types/types';
import prisma from '@/libs/db/prisma';
import { redirect } from 'next/navigation';
import { getDictionary } from '@/dictionaries';

const options = { cacheKey: 'invite' };

export async function claimInvite(id: string, lang: string) {
  const session = await auth();
  const dictionary = await getDictionary(lang);

  if (!session?.user?.entraUserUuid) {
    throw new Error('Unauthorized');
  }

  const entraUserUuid = session.user.entraUserUuid;

  const isLimited = await isRateLimited(entraUserUuid, options.cacheKey, 10);
  if (isLimited) {
    logger.error(`User is being rate limited: ${entraUserUuid}`);
    return {
      message: dictionary.api.ratelimit,
      isError: true,
    };
  }
  await updateRateLimitCounter(entraUserUuid, options.cacheKey);

  const strapiUrl = `/api/invites?populate=RoleToGive&populate=Event&filters[Slug][$eq]=${id}`;
  const invites = await getStrapiData<
    APIResponseCollection<'api::invite.invite'>
  >(lang, strapiUrl, [`invite-${id}`], true);

  const invite = invites?.data.at(0);
  const role = invite?.RoleToGive?.RoleId;
  const isExpired = invite?.Expires && new Date(invite.Expires) < new Date();

  if (!invite || !role || isExpired) {
    return {
      message: dictionary.pages_invite.invalid_invite,
      isError: true,
    };
  }

  if (
    [
      process.env.NEXT_PUBLIC_NO_ROLE_ID!,
      process.env.NEXT_PUBLIC_LUUPPI_MEMBER_ID!,
      process.env.NEXT_PUBLIC_LUUPPI_HATO_ID!,
    ].includes(role)
  ) {
    logger.error(`Trying to add restricted role via invite ${invite.id}`);
    return {
      message: dictionary.pages_invite.invalid_role,
      isError: true,
    };
  }

  try {
    await prisma.rolesOnUsers.upsert({
      where: {
        strapiRoleUuid_entraUserUuid: {
          entraUserUuid,
          strapiRoleUuid: role,
        },
      },
      update: { expiresAt: invite.Expires },
      create: {
        strapiRoleUuid: role,
        entraUserUuid,
        expiresAt: invite.Expires,
      },
    });

    logger.info(`User ${entraUserUuid} claimed role ${role} via invite ${id}`);
  } catch (error) {
    logger.error(`Failed to assign role via invite ${id}`, error);
    return {
      message: dictionary.pages_invite.failed_to_claim,
      isError: true,
    };
  }

  const redirectPath = invite.Event?.Slug
    ? `/${lang}/events/${invite.Event.Slug}`
    : `/${lang}`;

  redirect(redirectPath, 'replace');
}
