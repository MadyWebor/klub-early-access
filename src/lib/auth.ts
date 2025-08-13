import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { reqEnv } from "./reqEnv";

export const authOptions: NextAuthOptions = {
  // force a helpful error if secret/envs are missing
  secret: reqEnv("NEXTAUTH_SECRET"),

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
      clientId: reqEnv("GOOGLE_CLIENT_ID"),
      clientSecret: reqEnv("GOOGLE_CLIENT_SECRET"),
    }),
  ],

  events: {
    async createUser({ user }) {
      // idempotent to avoid rare race on callback
      await prisma.onboardingProgress.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id },
      });
      await prisma.user.update({
        where: { id: user.id },
        data: { onboardingStatus: "profile" },
      });
    },
  },

  callbacks: {
    async jwt({ token, user }) { if (user) (token as any).userId = user.id; return token; },
    async session({ session, token }) { if (session.user && (token as any).userId) session.user.id = (token as any).userId; return session; },
  },
};
