import 'server-only';
import { logger } from '../utils/logger';

/**
 * Verify if an email is already in use in the Microsoft Graph API
 * @param token Access token
 * @param email Email to verify
 * @returns Returns true if the email is already in use, false if it is not, and null if an error occurred
 */
export const verifyGraphAPIEmail = async (
  token: string,
  email: string,
): Promise<boolean | null> => {
  try {
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/users?$filter=mail eq '${email}'`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data.value.length > 0) {
      return true;
    }
    return false;
  } catch (error) {
    logger.error('Graph API error', error);
    return null;
  }
};
