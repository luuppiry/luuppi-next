'use server';

import { auth } from '@/auth';
import { getDictionary } from '@/dictionaries';
import { isRateLimited, updateRateLimitCounter } from '@/libs/rate-limiter';
import { logger } from '@/libs/utils/logger';
import { revalidatePath } from 'next/cache';

type ResponseSuccess = { message: string };
type ResponseError = ResponseSuccess & { isError: true };

type Dictionary = Awaited<ReturnType<typeof getDictionary>>;

const options = {
  cacheKey: 'email-lists',
  mailman: {
    auth:
      'Basic ' +
      Buffer.from(
        `${process.env.MAILMAN_USER}:${process.env.MAILMAN_PASSWORD}`,
      ).toString('base64'),
    baseUrl: `http://${process.env.MAILMAN_HOSTNAME}:${process.env.MAILMAN_PORT}`,
  },
};

export const unsubscribe = async (
  dictionary: Dictionary,
): Promise<ResponseSuccess | ResponseError> => {
  const session = await auth();

  if (!session?.user) {
    return {
      message: dictionary.api.unauthorized,
      isError: true,
    };
  }

  const isLimited = await isRateLimited(
    session.user.entraUserUuid,
    options.cacheKey,
    10,
  );
  if (isLimited) {
    logger.error('User is being rate limited');
    return {
      message: dictionary.api.ratelimit,
      isError: true,
    };
  } else {
    await updateRateLimitCounter(session.user.entraUserUuid, options.cacheKey);
  }

  try {
    // Find member by email
    const find = await fetch(
      `${options.mailman.baseUrl}/3.1/members/find?subscriber=${session.user.email}&list_id=loop.luuppi.fi`,
      {
        method: 'GET',
        headers: {
          Authorization: options.mailman.auth,
        },
      },
    );

    if (!find.ok) {
      /* eslint-disable quotes */
      logger.error("Couldn't find user", find.status, await find.text());

      return {
        message: dictionary.api.server_error,
        isError: true,
      };
    }

    const memberData = await find.json();
    const memberId = memberData?.entries?.at(0)?.member_id;

    if (!memberId) {
      return {
        message: dictionary.api.user_not_found,
        isError: true,
      };
    }

    // Remove member from the list
    const remove = await fetch(
      `${options.mailman.baseUrl}/3.1/members/${memberId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: options.mailman.auth,
        },
      },
    );

    if (!remove.ok) {
      logger.error('Failed to remove user', remove.status, await remove.text());

      return {
        message: dictionary.api.server_error,
        isError: true,
      };
    }

    revalidatePath('/[lang]/profile', 'page');

    return { message: dictionary.mail_list.unsubscribed };
  } catch (error) {
    logger.error('Failed to remove user', error);

    return {
      message: dictionary.api.server_error,
      isError: true,
    };
  }
};

export const subscribe = async (
  dictionary: Dictionary,
): Promise<ResponseSuccess | ResponseError> => {
  const session = await auth();

  if (!session?.user) {
    return {
      message: dictionary.api.unauthorized,
      isError: true,
    };
  }

  const isLimited = await isRateLimited(
    session.user.entraUserUuid,
    options.cacheKey,
    10,
  );
  if (isLimited) {
    logger.error('User is being rate limited');
    return {
      message: dictionary.api.ratelimit,
      isError: true,
    };
  } else {
    await updateRateLimitCounter(session.user.entraUserUuid, options.cacheKey);
  }

  try {
    // Subscribe member to the list
    const response = await fetch(`${options.mailman.baseUrl}/3.1/members`, {
      method: 'POST',
      headers: {
        Authorization: options.mailman.auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        list_id: 'loop.luuppi.fi',
        subscriber: session.user.email,
        pre_verified: true,
        pre_confirmed: true,
        pre_approved: true,
      }),
    });

    if (!response.ok) {
      logger.error(
        'Could not add user to the list',
        response.status,
        await response.text(),
      );

      return {
        message: dictionary.api.server_error,
        isError: true,
      };
    }

    revalidatePath('/[lang]/profile', 'page');

    return { message: dictionary.mail_list.subscribed };
  } catch (error) {
    logger.error('Could not add user to the list', error);

    return {
      message: dictionary.api.server_error,
      isError: true,
    };
  }
};
