import type { User } from '@prisma/client';

type RequiredField = keyof Pick<User, 'firstName' | 'lastName' | 'domicle'>;
const requiredFields = [
  'firstName',
  'lastName',
  'domicle',
] as const satisfies RequiredField[];

/**
 * Valid member under Associations Act Section 11
 * https://www.prh.fi/en/companiesandorganisations/yhdistysrekisteri/act.html
 */
export const isValidMember = (
  user: unknown,
): user is Record<RequiredField, string> => {
  if (typeof user !== 'object' || user === null || Array.isArray(user))
    return false;

  const record = user as Record<string, unknown>;
  return requiredFields.every((key) => typeof record[key] === 'string');
};
