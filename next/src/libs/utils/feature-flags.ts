import { Session } from 'next-auth';

export const FF_DARK_MODE = 'dark_mode' as const;

const SUPER_ADMINS = process.env.XXX_SUPER_ADMIN_XXX!.split(',');

type FeatureFlag = typeof FF_DARK_MODE;

const FEATURE_ROLE_MAP: Record<
  FeatureFlag,
  (session: Session | null) => boolean
> = {
  [FF_DARK_MODE]: (session) =>
    !session?.user ? false : SUPER_ADMINS.includes(session.user.entraUserUuid),
};

export function hasFeatureAccess(
  feature: FeatureFlag,
  session: Session | null,
): boolean {
  const checker = FEATURE_ROLE_MAP[feature];
  return checker ? checker(session) : false;
}
