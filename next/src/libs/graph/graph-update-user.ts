import { User } from '@microsoft/microsoft-graph-types';
import 'server-only';
import { logger } from '../utils/logger';

/**
 * Update a user in the Microsoft Graph API
 * @param token Access token
 * @param userId User ID
 * @param updatedFields Fields to update
 * @returns Returns true if the user was updated, false if an error occurred
 */
export const updateGraphAPIUser = async (
  token: string,
  userId: string,
  updatedFields: Partial<User | { [key: string]: any }>,
): Promise<boolean> => {
  const changeEmptyStringToNull = (obj: any) => {
    for (const key in obj) {
      if (obj[key] === '') {
        obj[key] = null;
      }
    }
    return obj;
  };
  try {
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/users/${userId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...changeEmptyStringToNull(updatedFields),
        }),
      },
    );

    if (!response.ok) {
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Graph API error', error);
    return false;
  }
};
