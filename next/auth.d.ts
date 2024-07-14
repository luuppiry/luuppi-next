/* eslint-disable no-unused-vars */
import 'next-auth';

declare module 'next-auth' {
  interface User {
    entraUserUuid: string;
    isLuuppiHato: boolean;
    isLuuppiMember: boolean;
    username: string;
    tokenVersion: number;
  }

  interface Session extends DefaultSession {
    user?: User;
  }
}
