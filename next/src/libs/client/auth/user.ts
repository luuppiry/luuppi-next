import { User } from '@microsoft/microsoft-graph-types';

/**
 * Get entra user profile
 * @param token Access token
 */
export const getProfile = async (token: string): Promise<User | null> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/user`,
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
};

export const updateEmail = async (
  token: string,
  email: string,
): Promise<boolean> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/user/email`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    },
  );
  return response.ok;
};
