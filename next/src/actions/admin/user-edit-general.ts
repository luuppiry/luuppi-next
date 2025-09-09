'use server';
import { auth } from '@/auth';
import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { logger } from '@/libs/utils/logger';
import { Dictionary } from '@/models/locale';

const CONFIG = {
  HATO_ROLE_ID: process.env.NEXT_PUBLIC_LUUPPI_HATO_ID!,
  USERNAME_REGEX: /^(?!.*[-_]{2})[a-zA-Z0-9äÄöÖåÅ_-]{3,30}$/,
  NAME_REGEX: /^.{2,70}$/,
  LASTNAME_REGEX: /^.{2,35}$/,
  DOMICLE_REGEX: /^.{2,35}$/,
  PREFERRED_NAME_REGEX: /^[a-zA-ZäÄöÖåÅ\-\s]{2,100}$/,
  MAJOR_REGEX:
    /^(COMPUTER_SCIENCE|MATHEMATICS|STATISTICAL_DATA_ANALYSIS|OTHER)$/,
} as const;

type UserEditResult = {
  message: string;
  isError: boolean;
  field?: string;
};

type FieldValidation = {
  value: FormDataEntryValue | null;
  regex: RegExp;
  required?: boolean;
};

export async function userEditGeneral(
  formData: FormData,
  lang: string,
  userToEditEntraUuid: string,
): Promise<UserEditResult> {
  const dictionary = await getDictionary(lang);

  const session = await auth();
  const user = session?.user;

  if (!user || !user.isLuuppiHato) {
    logger.error('User not found in session');
    return {
      message: dictionary.api.unauthorized,
      isError: true,
    };
  }

  const hasHatoRole = await checkHatoRole(user.entraUserUuid);

  if (!hasHatoRole) {
    logger.error('User does not have the required role');
    return {
      message: dictionary.api.unauthorized,
      isError: true,
    };
  }

  const fields: Record<string, FieldValidation> = {
    username: {
      value: formData.get('username'),
      regex: CONFIG.USERNAME_REGEX,
    },
    firstName: {
      value: formData.get('firstName'),
      regex: CONFIG.NAME_REGEX,
    },
    lastName: {
      value: formData.get('lastName'),
      regex: CONFIG.LASTNAME_REGEX,
    },
    domicle: {
      value: formData.get('domicle'),
      regex: CONFIG.DOMICLE_REGEX,
    },
    preferredFullName: {
      value: formData.get('preferredFullName'),
      regex: CONFIG.PREFERRED_NAME_REGEX,
    },
    major: {
      value: formData.get('major'),
      regex: CONFIG.MAJOR_REGEX,
      required: true,
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

  await prisma.user.update({
    where: {
      entraUserUuid: userToEditEntraUuid,
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

  return {
    message: dictionary.api.user_updated,
    isError: false,
  };
}

async function checkHatoRole(entraUserUuid: string) {
  return await prisma.rolesOnUsers.findFirst({
    where: {
      entraUserUuid,
      strapiRoleUuid: CONFIG.HATO_ROLE_ID,
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
  });
}

function validateField(
  fieldValue: string | null,
  regex: RegExp,
  dictionary: Dictionary,
  fieldName: string,
  required?: boolean,
): UserEditResult | null {
  const fieldNameSnakeCase = fieldName.replace(/([A-Z])/g, '_$1').toLowerCase();
  const invalidKey =
    `invalid_${fieldNameSnakeCase}` as keyof typeof dictionary.api;

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
