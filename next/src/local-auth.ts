import { User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import 'server-only';
import prisma from './libs/db/prisma';

const DEV_USERS = Object.freeze([
  {
    entraUserUuid: 'dev-uuid-member',
    id: 'dev-uuid-member',
    isLuuppiHato: false,
    isLuuppiMember: true,
    tokenVersion: Number.parseInt(process.env.TOKEN_VERSION || '1'),
    username: 'Dev member',
    email: 'member@dev.local',
  },
  {
    entraUserUuid: 'dev-uuid-hato',
    id: 'dev-uuid-hato',
    isLuuppiHato: true,
    isLuuppiMember: true,
    tokenVersion: Number.parseInt(process.env.TOKEN_VERSION || '1'),
    username: 'Dev hato',
    email: 'hato@dev.local',
    name: 'Dev hato',
  },
  {
    entraUserUuid: 'dev-uuid-default',
    id: 'dev-uuid-default',
    isLuuppiHato: false,
    isLuuppiMember: false,
    tokenVersion: Number.parseInt(process.env.TOKEN_VERSION || '1'),
    username: 'Dev default',
    email: 'default@dev.local',
    name: 'Dev default',
  },
] satisfies User[]);

export const DevOnlyCredentialsProvider = CredentialsProvider({
  name: 'Dev Login',
  credentials: {
    email: {
      label: 'Dev User',
      type: 'select',
    },
  },
  async authorize(credentials) {
    if (process.env.NODE_ENV === 'production') {
      return null;
    }

    const email = process.env.DEV_MOCK_USER ?? credentials?.email;
    const user = DEV_USERS.find((u) => u.email === email);
    if (!user) throw new Error(`No dev user for email: ${email}`);
    return user;
  },
});

interface DevOnlyJwtOptions {
  user: User;
  token: JWT;
}

export const createDevOnlyJWT = async ({ user, token }: DevOnlyJwtOptions) => {
  const devUser = DEV_USERS.find((u) => u.email === user.email);
  if (!devUser) return token;

  token.id = devUser.id;
  token.email = devUser.email;

  const roleUuids = [
    process.env.NEXT_PUBLIC_NO_ROLE_ID!,
    devUser.isLuuppiMember ? process.env.NEXT_PUBLIC_LUUPPI_MEMBER_ID! : null,
    devUser.isLuuppiHato ? process.env.NEXT_PUBLIC_LUUPPI_HATO_ID! : null,
  ].filter(Boolean) as string[];

  const localUser = await prisma.user.upsert({
    where: { entraUserUuid: devUser.entraUserUuid },
    update: {
      email: devUser.email,
      roles: {
        connectOrCreate: roleUuids.map((roleUuid) => ({
          where: {
            strapiRoleUuid_entraUserUuid: {
              entraUserUuid: devUser.entraUserUuid,
              strapiRoleUuid: roleUuid,
            },
          },
          create: {
            role: {
              connectOrCreate: {
                where: { strapiRoleUuid: roleUuid },
                create: { strapiRoleUuid: roleUuid },
              },
            },
          },
        })),
      },
    },
    create: {
      entraUserUuid: devUser.entraUserUuid,
      email: devUser.email,
      roles: {
        create: roleUuids.map((roleUuid) => ({
          role: {
            connectOrCreate: {
              where: { strapiRoleUuid: roleUuid },
              create: { strapiRoleUuid: roleUuid },
            },
          },
        })),
      },
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

  const hasRole = (roleUuid: string) =>
    localUser.roles.some((r) => r.role.strapiRoleUuid === roleUuid);

  token.isLuuppiHato = hasRole(process.env.NEXT_PUBLIC_LUUPPI_HATO_ID!);
  token.isLuuppiMember = hasRole(process.env.NEXT_PUBLIC_LUUPPI_MEMBER_ID!);
  token.username = localUser.username ?? devUser.username;
  token.version = process.env.TOKEN_VERSION;

  return token;
};
