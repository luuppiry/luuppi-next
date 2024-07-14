// Simple sign out route if we want to sign out user
// from server component. Server components does not allow
// modifying cookies, so we can redirect them to this api route as a workaround.
import { signOut } from '@/auth';
import { redirect } from 'next/navigation';

// a workaround.
export async function GET() {
  await signOut({ redirect: false });
  const logoutUrl = `https://${process.env.AZURE_TENANT_ID}.ciamlogin.com/${process.env.AZURE_TENANT_ID}/oauth2/logout?client_id=${process.env.AZURE_P_CLIENT_ID}&post_logout_redirect_uri=${process.env.NEXT_PUBLIC_BASE_URL}`;
  redirect(logoutUrl);
}
