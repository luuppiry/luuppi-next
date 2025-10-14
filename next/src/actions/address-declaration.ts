'use server';
import { auth } from '@/auth';
import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { isRateLimited, updateRateLimitCounter } from '@/libs/rate-limiter';
import { logger } from '@/libs/utils/logger';
import { SupportedLanguage } from '@/models/locale';
import { revalidatePath } from 'next/cache';

const options = {
  cacheKey: 'address-declaration',
};

export async function addressDeclaration(
  lang: SupportedLanguage,
  formData: FormData,
) {
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

  const targetYear = getDeclarationYear();
  const roles = localUser?.roles.map((role) => role.role.strapiRoleUuid) ?? [];

  const isLuuppiMember = roles.includes(
    process.env.NEXT_PUBLIC_LUUPPI_MEMBER_ID!,
  );

  const fields: Record<
    string,
    { value: FormDataEntryValue | null; regex: RegExp; required?: boolean }
  > = {
    streetAddress: {
      value: formData.get('streetAddress'),
      regex: /^.{2,70}$/,
      required: isLuuppiMember,
    },
    postalCode: {
      value: formData.get('postalCode'),
      regex: /^.{2,10}$/,
      required: isLuuppiMember,
    },
    domicle: {
      value: formData.get('domicle'),
      regex: /^.{2,35}$/,
      required: isLuuppiMember,
    },
    country: {
      value: formData.get('country'),
      regex: /^.{2,35}$/,
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

  if (
    (fieldsToUpdate.streetAddress ||
      fieldsToUpdate.postalCode ||
      fieldsToUpdate.domicle ||
      fieldsToUpdate.country) &&
    !isLuuppiMember
  ) {
    logger.error(
      'Tried to update stress adress, postal code, domicle or country without being a member of Luuppi',
    );
    return {
      message: dictionary.api.unauthorized,
      isError: true,
    };
  }

  if (formData.get('declaration') === 'on' && isLuuppiMember) {
    await prisma.addressDeclaration.upsert({
      where: {
        entraUserUuid_year: {
          entraUserUuid: session.user.entraUserUuid,
          year: targetYear,
        },
      },
      update: {},
      create: {
        entraUserUuid: session.user.entraUserUuid,
        year: targetYear,
      },
    });
  }

  await prisma.user.update({
    where: {
      entraUserUuid: session.user.entraUserUuid,
    },
    data: {
      streetAddress: fieldsToUpdate.streetAddress,
      postalCode: fieldsToUpdate.postalCode,
      domicle: fieldsToUpdate.domicle,
      country: fieldsToUpdate.country,
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

function getDeclarationYear(d = new Date()): number {
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  return month >= 9 ? year : year - 1;
}
