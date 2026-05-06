import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub,
    Google,
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      // Prioritize email as the most stable identifier across sign-ins
      const stableId = token.email || token.sub;
      if (stableId) {
        session.user.id = stableId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
});
