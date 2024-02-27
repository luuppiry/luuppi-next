import jwt from 'jsonwebtoken';
import NextAuth from 'next-auth';
import AzureB2C from 'next-auth/providers/azure-ad-b2c';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    AzureB2C({
      clientId: process.env.AZURE_P_CLIENT_ID,
      clientSecret: process.env.AZURE_P_CLIENT_SECRET,
      issuer: `https://${process.env.AZURE_TENANT_ID}.ciamlogin.com/${process.env.AZURE_TENANT_ID}/v2.0`,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.azureId = token.id as string;
      }
      return session;
    },
    async jwt({ token, account }) {
      if (account) {
        const idToken = account.id_token;
        if (!idToken) return token;
        const decoded = jwt.decode(idToken) as { email: string; oid: string };
        token.email = decoded.email;
        token.id = decoded.oid;
      }
      return token;
    },
  },
});
