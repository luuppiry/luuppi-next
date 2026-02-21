'use server';
import { signIn as authSignIn, signOut as authSignOut } from '@/auth';
import { redirect } from 'next/navigation';
import { refresh, revalidatePath } from 'next/cache';

export const signIn = async () => {
  if (process.env.NODE_ENV === 'development' && process.env.DEV_MOCK_USER) {
    await authSignIn('credentials', {
      email: process.env.DEV_MOCK_USER,
      redirect: false,
    });

    revalidatePath('/', 'layout');
    refresh();
    return redirect('/');
  }

  await authSignIn('azure-ad-b2c');
};

export const signOut = async () => {
  if (process.env.NODE_ENV === 'development' && process.env.DEV_MOCK_USER) {
    await authSignOut({ redirect: false });

    revalidatePath('/', 'layout');
    refresh();
    return redirect('/');
  }

  await authSignOut({ redirect: false });
  const logoutUrl = `https://${process.env.AZURE_TENANT_ID}.ciamlogin.com/${process.env.AZURE_TENANT_ID}/oauth2/logout?client_id=${process.env.AZURE_P_CLIENT_ID}&post_logout_redirect_uri=${process.env.NEXT_PUBLIC_BASE_URL}`;
  redirect(logoutUrl);
};
