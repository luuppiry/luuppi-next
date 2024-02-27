import { User } from '@microsoft/microsoft-graph-types';
import 'server-only';

/**
 * Get a user from the Microsoft Graph API
 * @param token Access token
 * @param userId User ID
 * @returns Returns the user if it exists, null if it does not, and null if an error occurred
 */
export const getGraphAPIUser = async (
  token: string,
  userId: string,
): Promise<User | null> => {
  try {
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/users/${userId}`,
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
    return null;
  }
};
