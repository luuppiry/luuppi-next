'use server';
import { auth } from '@/auth';
import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { isRateLimited, updateRateLimitCounter } from '@/libs/rate-limiter';
import { logger } from '@/libs/utils/logger';
import { revalidatePath } from 'next/cache';

const options = {
  cacheKey: 'update-profile',
};

export async function profileUpdate(lang: string, formData: FormData) {
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
    options.cacheKey,
    10,
  );
  if (isLimited) {
    logger.error('User is being rate limited');
    return {
      message: dictionary.api.ratelimit,
      isError: true,
    };
  } else {
    await updateRateLimitCounter(session.user.entraUserUuid, options.cacheKey);
  }

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

  const fields: Record<
    string,
    { value: FormDataEntryValue | null; regex: RegExp; required?: boolean }
  > = {
    username: {
      value: formData.get('username'),

      // Regex checks for:
      // - 3-30 characters
      // - No consecutive underscores or hyphens
      // - Only letters, numbers, underscores, hyphens, and Finnish/Swedish characters
      regex: /^(?!.*[-_]{2})[a-zA-Z0-9äÄöÖåÅ_-]{3,30}$/,
    },
    firstName: {
      value: formData.get('firstName'),
      regex: /^.{2,70}$/,
      required: isLuuppiMember,
    },
    lastName: {
      value: formData.get('lastName'),
      regex: /^.{2,35}$/,
      required: isLuuppiMember,
    },
    domicle: {
      value: formData.get('domicle'),
      regex: /^.{2,35}$/,
      required: isLuuppiMember,
    },
    preferredFullName: {
      value: formData.get('preferredFullName'),
      regex: /^[a-zA-ZäÄöÖåÅ\-\s]{2,100}$/,
    },
    major: {
      value: formData.get('major'),
      regex: /^(COMPUTER_SCIENCE|MATHEMATICS|STATISTICAL_DATA_ANALYSIS|OTHER)$/,
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
        fieldsToUpdate.major === 'COMPUTER_SCIENCE'
          ? 'COMPUTER_SCIENCE'
          : fieldsToUpdate.major === 'MATHEMATICS'
            ? 'MATHEMATICS'
            : fieldsToUpdate.major === 'STATISTICAL_DATA_ANALYSIS'
              ? 'STATISTICAL_DATA_ANALYSIS'
              : 'OTHER',
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
  dictionary: any,
  fieldName: string,
  required?: boolean,
) {
  const fieldNameSnakeCase = fieldName.replace(/([A-Z])/g, '_$1').toLowerCase();

  if (required && !fieldValue) {
    return {
      message: dictionary.api[`invalid_${fieldNameSnakeCase}`],
      isError: true,
      field: fieldName,
    };
  }

  if (fieldValue && !regex.test(fieldValue)) {
    return {
      message: dictionary.api[`invalid_${fieldNameSnakeCase}`],
      isError: true,
      field: fieldName,
    };
  }
  return null;
}
