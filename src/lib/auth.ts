import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },

  // Custom pages (optional)
  pages: {
    signIn: "/signin",            // your login UI
    // signOut: "/dashboard",      // NOTE: this is a *page*, not a redirect. Usually omit.
    error: "/auth/error",
    verifyRequest: "/auth/verify", // used only if you add Email provider
    newUser: "/profile",           // first successful sign-in only
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET ?? process.env.AUTH_GOOGLE_SECRET ?? "",
    }),
  ],

  // Runs once for a brand-new user
  events: {
    async createUser({ user }) {
      await prisma.onboardingProgress.create({ data: { userId: user.id } });
      await prisma.user.update({
        where: { id: user.id },
        data: { onboardingStatus: "profile" },
      });
    },
  },

callbacks: {
  async jwt({ token, user }) {
    if (user) token.userId = (user as any).id;
    return token;
  },
  async session({ session, token }) {
    if (token?.userId) {
      (session.user as any) = { ...(session.user || {}), id: token.userId as string };
    }
    return session;
  },
},
};
