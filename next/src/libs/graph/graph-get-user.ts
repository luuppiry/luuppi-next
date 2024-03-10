import { ExtendedUser } from '@/models/user';
import 'server-only';
import { logger } from '../utils/logger';

/**
 * Get a user from the Microsoft Graph API
 * @param token Access token
 * @param userId User ID
 * @returns Returns the user if it exists, null if it does not, and null if an error occurred
 */
export const getGraphAPIUser = async (
  token: string,
  userId: string,
): Promise<ExtendedUser | null> => {
  try {
    const response = await fetch(
      `https://graph.microsoft.com/beta/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    logger.error('Graph API error', error);
    return null;
  }
};
