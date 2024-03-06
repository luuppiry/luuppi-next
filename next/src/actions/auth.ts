'use server';
import { signIn as authSignIn, signOut as authSignOut } from '@/auth';
import { redirect } from 'next/navigation';

export const signIn = async () => authSignIn('azure-ad-b2c');
export const signOut = async () => {
  await authSignOut({ redirect: false });
  const logoutUrl = `https://${process.env.AZURE_TENANT_ID}.ciamlogin.com/${process.env.AZURE_TENANT_ID}/oauth2/logout?client_id=${process.env.AZURE_P_CLIENT_ID}&post_logout_redirect_uri=${process.env.NEXT_PUBLIC_BASE_URL}`;
  redirect(logoutUrl);
};
