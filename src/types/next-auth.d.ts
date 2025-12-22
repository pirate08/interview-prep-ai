import NextAuth, { DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  // --Data returned by useSession() and getServerSession()--
  interface Session {
    user: {
      id: string;
      role: string;
      emailVerified: Date | null;

      isNewUser: boolean;
      experienceLevel?: string | null;
      selectedCourse?: string | null;
    } & DefaultSession['user'];
  }

  //   --Data stored in database for a user--
  interface User {
    id: string;
    role: string;
    emailVerified: Date | null;
    isNewUser: boolean;
    experienceLevel?: string | null;
    selectedCourse?: string | null;
  }
}

declare module 'next-auth/jwt' {
  // --Data stored inside the encrypted JWT--
  interface JWT {
    id: string;
    role: string;
    isNewUser: boolean;
    emailVerified: Date | null;
  }
}
