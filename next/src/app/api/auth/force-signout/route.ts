import { signOut } from '@/auth';
import {} from 'next-auth';

// Simple sign out route if we want to sign out user
// from server component. Server components does not allow
// modifying cookies, so we can redirect them to this api route as
// a workaround.
export async function GET() {
  await signOut();
}
