'use server';
import { auth } from '@/auth';
import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { logger } from '@/libs/utils/logger';
import { Dictionary } from '@/models/locale';
import { revalidatePath, revalidateTag } from 'next/cache';

const CONFIG = {
  HATO_ROLE_ID: process.env.NEXT_PUBLIC_LUUPPI_HATO_ID!,
  NO_ROLE_ID: process.env.NEXT_PUBLIC_NO_ROLE_ID!,
  SUPER_ADMINS: process.env.XXX_SUPER_ADMIN_XXX!.split(','),
  ROLE_UUID_REGEX: /^[a-z0-9äö_-]+$/,
} as const;

type RoleEditResult = {
  message: string;
  isError: boolean;
};

type RoleInput = {
  strapiRoleUuid: string;
  expiresAt: Date | null;
};

export async function userEditRoles(
  roles: RoleInput[],
  lang: string,
  userToEditEntraUuid: string,
): Promise<RoleEditResult> {
  const dictionary = await getDictionary(lang);

  const session = await auth();
  const user = session?.user;

  if (!user) {
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

  const validationError = validateRoles(roles, dictionary);
  if (validationError) {
    return validationError;
  }

  const strapiRoleUuids = roles.map((role) => role.strapiRoleUuid);

  const rolesMatch = await prisma.role.findMany({
    where: {
      strapiRoleUuid: {
        in: strapiRoleUuids,
      },
    },
  });

  if (rolesMatch.length !== strapiRoleUuids.length) {
    logger.error('Some roles not found');
    return {
      message: dictionary.api.invalid_roles,
      isError: true,
    };
  }

  const illegalRoles = CONFIG.SUPER_ADMINS.includes(user.entraUserUuid)
    ? []
    : [CONFIG.HATO_ROLE_ID, CONFIG.NO_ROLE_ID];

  if (strapiRoleUuids.some((role) => illegalRoles.includes(role))) {
    logger.error('Roles contains illegal role');
    return {
      message: dictionary.api.invalid_roles,
      isError: true,
    };
  }

  const userToEdit = await prisma.user.findFirst({
    where: {
      entraUserUuid: userToEditEntraUuid,
    },
    include: {
      roles: true,
    },
  });

  if (!userToEdit) {
    return {
      isError: true,
      message: dictionary.api.user_not_found,
    };
  }

  await prisma.$transaction(async (prisma) => {
    // Everything else is deletable except the illegal roles
    await prisma.rolesOnUsers.deleteMany({
      where: {
        entraUserUuid: userToEditEntraUuid,
        role: {
          strapiRoleUuid: {
            notIn: illegalRoles,
          },
        },
      },
    });

    await prisma.rolesOnUsers.createMany({
      data: strapiRoleUuids.map((role) => ({
        entraUserUuid: userToEditEntraUuid,
        strapiRoleUuid: role,
        expiresAt: roles.find((r) => r.strapiRoleUuid === role)?.expiresAt,
      })),
    });
  });

  revalidateTag(`get-cached-user:${userToEdit.entraUserUuid}`);
  revalidatePath('/[lang]/events/[slug]', 'page');
  revalidatePath('/[lang]/profile', 'page');

  return {
    isError: false,
    message: dictionary.api.user_roles_updated,
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

function validateRoles(
  roles: RoleInput[],
  dictionary: Dictionary,
): RoleEditResult | null {
  const strapiRoleUuids = roles.map((role) => role.strapiRoleUuid);
  const invalidRoles = strapiRoleUuids.some(
    (role) => !CONFIG.ROLE_UUID_REGEX.test(role),
  );
  const invalidExpirationDates = roles.some(
    (role) => role.expiresAt && role.expiresAt < new Date(),
  );

  if (invalidExpirationDates) {
    logger.error('Invalid expiration dates');
    return {
      message: dictionary.api.invalid_roles,
      isError: true,
    };
  }

  if (invalidRoles) {
    logger.error('Invalid roles');
    return {
      message: dictionary.api.invalid_roles,
      isError: true,
    };
  }

  return null;
}
