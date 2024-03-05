'use server';
import { signIn as authSignIn, signOut as authSignOut } from '@/auth';

export const signIn = async () => authSignIn('azure-ad-b2c');
export const signOut = async () => authSignOut();
