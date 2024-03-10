import 'server-only';
import { logger } from '../utils/logger';

/**
 * Add a user to a group
 * @param token Access token
 * @param userId User ID
 * @returns Returns the user if it exists, null if it does not, and null if an error occurred
 */
export const addGraphAPIUserToGroup = async (
  token: string,
  userId: string,
  groupId: string,
) => {
  try {
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/groups/${groupId}/members/$ref`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          '@odata.id': `https://graph.microsoft.com/v1.0/users/${userId}`,
        }),
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
