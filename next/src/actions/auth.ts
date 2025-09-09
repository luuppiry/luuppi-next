'use server';
import { signIn as authSignIn, signOut as authSignOut } from '@/auth';
import { redirect } from 'next/navigation';

const createLogoutUrl = () => {
  const tenantId = process.env.AZURE_TENANT_ID!;
  const clientId = process.env.AZURE_P_CLIENT_ID!;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;

  return `https://${tenantId}.ciamlogin.com/${tenantId}/oauth2/logout?client_id=${clientId}&post_logout_redirect_uri=${baseUrl}`;
};

export const signIn = async () => authSignIn('azure-ad-b2c');

export const signOut = async () => {
  await authSignOut({ redirect: false });
  redirect(createLogoutUrl());
};
