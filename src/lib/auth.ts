import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },

  pages: {
    signIn: "/signin",
    error: "/auth/error",
    verifyRequest: "/auth/verify",
    newUser: "/profile",
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET ?? process.env.AUTH_GOOGLE_SECRET ?? "",
    }),
  ],

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
      if (user) token.userId = user.id; // typed via module augmentation
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId) {
        session.user.id = token.userId; // typed via module augmentation
      }
      return session;
    },
  },
} satisfies NextAuthOptions;
