import { User } from '@microsoft/microsoft-graph-types';

/**
 * Get entra user profile
 * @param token Access token
 */
export const getUser = async (token: string): Promise<User | null> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    return null;
  }
  return response.json();
};

export const sendEmailVerifyMail = async (
  token: string,
  email: string,
): Promise<boolean> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/user/email/send-verify`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    },
  );
  return response.ok;
};

export const verifyEmail = async (
  token: string,
  emailToken: string,
): Promise<boolean> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/user/email/verify-token`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ token: emailToken }),
    },
  );
  return response.ok;
};
