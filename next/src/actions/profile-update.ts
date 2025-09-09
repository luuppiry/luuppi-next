'use server';
import { auth } from '@/auth';
import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { isRateLimited, updateRateLimitCounter } from '@/libs/rate-limiter';
import { logger } from '@/libs/utils/logger';
import { Dictionary } from '@/models/locale';
import { revalidatePath } from 'next/cache';

const CONFIG = {
  CACHE_KEY: 'update-profile',
  RATE_LIMIT: 10,
  USERNAME_REGEX: /^(?!.*[-_]{2})[a-zA-Z0-9äÄöÖåÅ_-]{3,30}$/,
  NAME_REGEX: /^.{2,70}$/,
  LASTNAME_REGEX: /^.{2,35}$/,
  DOMICLE_REGEX: /^.{2,35}$/,
  PREFERRED_NAME_REGEX: /^[a-zA-ZäÄöÖåÅ\-\s]{2,100}$/,
  MAJOR_REGEX:
    /^(COMPUTER_SCIENCE|MATHEMATICS|STATISTICAL_DATA_ANALYSIS|OTHER)$/,
} as const;

type ProfileUpdateResult = {
  message: string;
  isError: boolean;
  field?: string;
};

type FieldValidation = {
  value: FormDataEntryValue | null;
  regex: RegExp;
  required?: boolean;
};

export async function profileUpdate(
  lang: string,
  formData: FormData,
): Promise<ProfileUpdateResult> {
  const dictionary = await getDictionary(lang);
  const session = await auth();

  if (!session?.user) {
    logger.error('User not found in session');
    return {
      message: dictionary.api.unauthorized,
      isError: true,
    };
  }

  const isLimited = await isRateLimited(
    session.user.entraUserUuid,
    CONFIG.CACHE_KEY,
    CONFIG.RATE_LIMIT,
  );
  if (isLimited) {
    logger.error('User is being rate limited');
    return {
      message: dictionary.api.ratelimit,
      isError: true,
    };
  }

  await updateRateLimitCounter(session.user.entraUserUuid, CONFIG.CACHE_KEY);

  const localUser = await prisma.user.findFirst({
    where: {
      entraUserUuid: session.user.entraUserUuid,
    },
    include: {
      roles: {
        include: {
          role: true,
        },
        where: {
          OR: [
            {
              expiresAt: {
                gte: new Date(),
              },
            },
            {
              expiresAt: null,
            },
          ],
        },
      },
    },
  });

  const roles = localUser?.roles.map((role) => role.role.strapiRoleUuid) ?? [];

  const isLuuppiMember = roles.includes(
    process.env.NEXT_PUBLIC_LUUPPI_MEMBER_ID!,
  );

  const fields: Record<string, FieldValidation> = {
    username: {
      value: formData.get('username'),
      regex: CONFIG.USERNAME_REGEX,
    },
    firstName: {
      value: formData.get('firstName'),
      regex: CONFIG.NAME_REGEX,
      required: isLuuppiMember,
    },
    lastName: {
      value: formData.get('lastName'),
      regex: CONFIG.LASTNAME_REGEX,
      required: isLuuppiMember,
    },
    domicle: {
      value: formData.get('domicle'),
      regex: CONFIG.DOMICLE_REGEX,
      required: isLuuppiMember,
    },
    preferredFullName: {
      value: formData.get('preferredFullName'),
      regex: CONFIG.PREFERRED_NAME_REGEX,
    },
    major: {
      value: formData.get('major'),
      regex: CONFIG.MAJOR_REGEX,
      required: isLuuppiMember,
    },
  };

  const errors = Object.entries(fields)
    .map(([fieldName, { value, regex, required }]) =>
      validateField(
        value?.toString() ?? null,
        regex,
        dictionary,
        fieldName,
        required,
      ),
    )
    .filter((error) => error !== null);

  if (errors.length > 0) {
    return errors[0] as { message: string; isError: boolean; field: string };
  }

  const fieldsToUpdate = Object.fromEntries(
    Object.entries(fields).map(([fieldName, { value }]) => [
      fieldName,
      value ? value.toString() : null,
    ]),
  );

  if ((fieldsToUpdate.major || fieldsToUpdate.domicle) && !isLuuppiMember) {
    logger.error(
      'Tried to update major or domicle without being a member of Luuppi',
    );
    return {
      message: dictionary.api.unauthorized,
      isError: true,
    };
  }

  await prisma.user.update({
    where: {
      entraUserUuid: session.user.entraUserUuid,
    },
    data: {
      lastName: fieldsToUpdate.lastName,
      firstName: fieldsToUpdate.firstName,
      username: fieldsToUpdate.username,
      preferredFullName: fieldsToUpdate.preferredFullName,
      major:
        (fieldsToUpdate.major as
          | 'COMPUTER_SCIENCE'
          | 'MATHEMATICS'
          | 'STATISTICAL_DATA_ANALYSIS'
          | 'OTHER') || 'OTHER',
      domicle: fieldsToUpdate.domicle,
    },
  });

  revalidatePath('/[lang]/profile', 'page');

  return {
    message: dictionary.api.profile_updated,
    isError: false,
  };
}

function validateField(
  fieldValue: string | null,
  regex: RegExp,
  dictionary: Dictionary,
  fieldName: string,
  required?: boolean,
): ProfileUpdateResult | null {
  const fieldNameSnakeCase = fieldName.replace(/([A-Z])/g, '_$1').toLowerCase();
  const invalidKey = `invalid_${fieldNameSnakeCase}` as keyof Dictionary['api'];

  if (required && !fieldValue) {
    return {
      message: dictionary.api[invalidKey] || dictionary.api.server_error,
      isError: true,
      field: fieldName,
    };
  }

  if (fieldValue && !regex.test(fieldValue)) {
    return {
      message: dictionary.api[invalidKey] || dictionary.api.server_error,
      isError: true,
      field: fieldName,
    };
  }
  return null;
}
