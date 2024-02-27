/* eslint-disable no-unused-vars */
import 'next-auth';

declare module 'next-auth' {
  interface User {
    azureId: string;
  }

  interface Session extends DefaultSession {
    user?: User;
  }
}
