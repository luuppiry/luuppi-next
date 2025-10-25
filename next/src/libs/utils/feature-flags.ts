import { Session } from 'next-auth';

export const FF_DARK_MODE = 'dark_mode' as const;

type FeatureFlag = typeof FF_DARK_MODE;

const FEATURE_ROLE_MAP: Record<
  FeatureFlag,
  (session: Session | null) => boolean
> = {
  [FF_DARK_MODE]: (session) => session?.user?.isLuuppiHato || false,
};

export function hasFeatureAccess(
  feature: FeatureFlag,
  session: Session | null,
): boolean {
  const checker = FEATURE_ROLE_MAP[feature];
  return checker ? checker(session) : false;
}
