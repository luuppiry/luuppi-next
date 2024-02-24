'use client';
import { logger } from '@/libs';
import { IPublicClientApplication } from '@azure/msal-browser';

export const getSilentToken = async (
  instance: IPublicClientApplication,
): Promise<string> => {
  try {
    const authResult = await instance.acquireTokenSilent({
      scopes: [process.env.NEXT_PUBLIC_BACKEND_SCOPE!],
    });

    return authResult.accessToken;
  } catch (error) {
    logger.error('Failed to get silent token', error);
    throw error;
  }
};
