'use server';
import { auth } from '@/auth';
import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { logger } from '@/libs/utils/logger';
import { SupportedLanguage } from '@/models/locale';
import { revalidatePath } from 'next/cache';

export async function roleAddUser(
  roleId: string,
  userEntraUuid: string,
  expiresAt: Date | null,
  lang: SupportedLanguage,
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

  // Check if it's a protected role
  const SUPER_ADMINS = process.env.XXX_SUPER_ADMIN_XXX!.split(',');
  const illegalRoles = SUPER_ADMINS.includes(user.entraUserUuid)
    ? []
    : [process.env.NEXT_PUBLIC_LUUPPI_HATO_ID];

  if (illegalRoles.includes(roleId)) {
    logger.error('Attempt to add to a protected role');
    return {
      message: dictionary.api.unauthorized,
      isError: true,
    };
  }

  // Validate role exists
  const role = await prisma.role.findUnique({
    where: { strapiRoleUuid: roleId },
  });

  if (!role) {
    return {
      isError: true,
      message: dictionary.api.role_not_found,
    };
  }

  // Validate user exists
  const targetUser = await prisma.user.findUnique({
    where: { entraUserUuid: userEntraUuid },
  });

  if (!targetUser) {
    return {
      isError: true,
      message: dictionary.api.user_not_found,
    };
  }

  // Check if user already has this role
  const existingRole = await prisma.rolesOnUsers.findUnique({
    where: {
      strapiRoleUuid_entraUserUuid: {
        strapiRoleUuid: roleId,
        entraUserUuid: userEntraUuid,
      },
    },
  });

  if (existingRole) {
    return {
      isError: true,
      message: dictionary.api.role_already_exists,
    };
  }

  // Add user to role
  await prisma.rolesOnUsers.create({
    data: {
      strapiRoleUuid: roleId,
      entraUserUuid: userEntraUuid,
      expiresAt,
    },
  });

  revalidatePath('/[lang]/admin', 'page');

  return {
    isError: false,
    message: dictionary.api.user_added_to_role,
  };
}

export async function roleRemoveUser(
  roleId: string,
  userEntraUuid: string,
  lang: SupportedLanguage,
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

  // Check if it's a protected role
  const SUPER_ADMINS = process.env.XXX_SUPER_ADMIN_XXX!.split(',');
  const illegalRoles = SUPER_ADMINS.includes(user.entraUserUuid)
    ? []
    : [
        process.env.NEXT_PUBLIC_LUUPPI_HATO_ID!,
        process.env.NEXT_PUBLIC_LUUPPI_MEMBER_ID!,
        process.env.NEXT_PUBLIC_NO_ROLE_ID!,
      ];

  if (
    illegalRoles.includes(roleId) ||
    roleId === process.env.NEXT_PUBLIC_NO_ROLE_ID
  ) {
    logger.error('Attempt to remove protected role');
    return {
      message: dictionary.api.unauthorized,
      isError: true,
    };
  }

  // Remove user from role
  try {
    await prisma.rolesOnUsers.delete({
      where: {
        strapiRoleUuid_entraUserUuid: {
          strapiRoleUuid: roleId,
          entraUserUuid: userEntraUuid,
        },
      },
    });

    revalidatePath('/[lang]/admin', 'page');

    return {
      isError: false,
      message: dictionary.api.user_removed_from_role,
    };
  } catch (error) {
    logger.error('Failed to remove user from role:', error);
    return {
      isError: true,
      message: dictionary.api.server_error,
    };
  }
}
