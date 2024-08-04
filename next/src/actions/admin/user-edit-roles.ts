'use server';
import { auth } from '@/auth';
import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { logger } from '@/libs/utils/logger';
import { SupportedLanguage } from '@/models/locale';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function userEditRoles(
  roles: {
    strapiRoleUuid: string;
    expiresAt: Date | null;
  }[],
  lang: SupportedLanguage,
  userToEditEntraUuid: string,
) {
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

  const hasHatoRole = await prisma.rolesOnUsers.findFirst({
    where: {
      entraUserUuid: user.entraUserUuid,
      strapiRoleUuid: process.env.NEXT_PUBLIC_LUUPPI_HATO_ID!,
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

  if (!hasHatoRole) {
    logger.error('User does not have the required role');
    return {
      message: dictionary.api.unauthorized,
      isError: true,
    };
  }

  const strapiRoleUuids = roles.map((role) => role.strapiRoleUuid);

  // Only lowercase chars (with äö), numbers and - allowed
  const regex = /^[a-z0-9äö-]+$/;
  const invalidRoles = strapiRoleUuids.some((role) => !regex.test(role));

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

  const illegalRoles = [
    process.env.NEXT_PUBLIC_LUUPPI_HATO_ID!,
    process.env.NEXT_PUBLIC_NO_ROLE_ID!,
  ];

  const includesIllegalRoles = strapiRoleUuids.some((role) =>
    illegalRoles.includes(role),
  );

  // Check if roles contain illegal roles, meaning roles that should not
  // be assigned by the user
  if (includesIllegalRoles) {
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
