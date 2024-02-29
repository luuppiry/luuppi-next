'use server';
import { signIn as authSignIn, signOut as authSignOut } from '@/auth';

export const signIn = authSignIn;
export const signOut = authSignOut;
