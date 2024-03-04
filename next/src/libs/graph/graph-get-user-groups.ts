import { Group } from '@microsoft/microsoft-graph-types';

/**
 * Get the groups that a user is a member of
 * @param token Access token
 * @param userId User ID
 * @returns Returns the user if it exists, null if it does not, and null if an error occurred
 */
export const getGraphAPIUserGroups = async (
  token: string,
  userId: string,
): Promise<{ value: Group[] } | null> => {
  try {
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/users/${userId}/memberOf`,
      {
        method: 'GET',
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
