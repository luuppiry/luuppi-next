import jwt from 'jsonwebtoken';
import NextAuth from 'next-auth';
import AzureB2C from 'next-auth/providers/azure-ad-b2c';
import 'server-only';
import prisma from './libs/db/prisma';
import { logger } from './libs/utils/logger';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers:
    process.env.NODE_ENV === 'development' && process.env.DEV_MOCK_USER
      ? [(await import('./local-auth')).DevOnlyCredentialsProvider]
      : [
          AzureB2C({
            clientId: process.env.AZURE_P_CLIENT_ID,
            clientSecret: process.env.AZURE_P_CLIENT_SECRET,
            authorization: {
              url: `https://${process.env.AZURE_TENANT_ID}.ciamlogin.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/authorize`,
              params: {
                code_challenge_method: undefined,
                code_challenge: undefined,
              },
            },
            issuer: `https://${process.env.AZURE_TENANT_ID}.ciamlogin.com/${process.env.AZURE_TENANT_ID}/v2.0`,
            token: {
              url: `https://${process.env.AZURE_TENANT_ID}.ciamlogin.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`,
              grant_type: 'authorization_code',
            },
          }),
        ],
  pages: {
    error: '/auth/error',
  },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.entraUserUuid = token.id as string;
        session.user.isLuuppiHato = token.isLuuppiHato as boolean;
        session.user.isLuuppiMember = token.isLuuppiMember as boolean;
        session.user.name = token.username as string;
      }

      // Forces user to sign in again if token version is outdated.
      // Useful for forcing users to sign in again after updating token version if
      // major changes have been made to the token structure.
      if (!token.version || token.version !== process.env.TOKEN_VERSION) {
        throw new Error('Token version mismatch');
      }

      // This should never happen, but just in case
      if (!session.user.entraUserUuid) {
        throw new Error('Malformed token');
      }

      return session;
    },
    async jwt({ token, account, user }) {
      if (account && account.provider !== 'credentials') {
        const idToken = account.id_token;
        if (!idToken) return token;
        let decoded: null | { email: string; oid: string } = null;
        try {
          decoded = jwt.decode(idToken) as { email: string; oid: string };
        } catch (e) {
          logger.error('Error decoding JWT', e);
        }
        if (!decoded) return token;
        token.email = decoded.email;
        token.id = decoded.oid;

        // Update user to local database
        const localUser = await prisma.user.upsert({
          where: {
            entraUserUuid: decoded.oid,
          },
          update: {
            email: decoded.email,
            roles: {
              connectOrCreate: {
                where: {
                  strapiRoleUuid_entraUserUuid: {
                    entraUserUuid: decoded.oid,
                    strapiRoleUuid: process.env.NEXT_PUBLIC_NO_ROLE_ID!,
                  },
                },
                create: {
                  role: {
                    connect: {
                      strapiRoleUuid: process.env.NEXT_PUBLIC_NO_ROLE_ID!,
                    },
                  },
                },
              },
            },
          },
          create: {
            entraUserUuid: decoded.oid,
            email: decoded.email,
            roles: {
              create: {
                role: {
                  connect: {
                    strapiRoleUuid: process.env.NEXT_PUBLIC_NO_ROLE_ID!,
                  },
                },
              },
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
          localUser.roles.some((role) => role.role.strapiRoleUuid === roleUuid);

        token.isLuuppiHato = hasRole(process.env.NEXT_PUBLIC_LUUPPI_HATO_ID!);
        token.isLuuppiMember = hasRole(
          process.env.NEXT_PUBLIC_LUUPPI_MEMBER_ID!,
        );
        token.username = localUser.username;
        token.version = process.env.TOKEN_VERSION;
      }

      // Mock credentials (dev only)
      if (
        account?.provider === 'credentials' &&
        user &&
        process.env.NODE_ENV === 'development'
      ) {
        const jwt = (await import('./local-auth')).createDevOnlyJWT({
          user,
          token,
        });

        return await jwt;
      }

      return token;
    },
  },
});
