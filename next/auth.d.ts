/* eslint-disable no-unused-vars */
import 'next-auth';

declare module 'next-auth' {
  interface User {
    entraUserUuid: string;
    isLuuppiHato: boolean;
  }

  interface Session extends DefaultSession {
    user?: User;
  }
}
