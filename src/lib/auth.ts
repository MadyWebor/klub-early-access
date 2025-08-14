import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { reqEnv } from "./reqEnv";

export const authOptions = {
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
    try {
      await prisma.onboardingProgress.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id },
      });
      await prisma.user.update({
        where: { id: user.id },
        data: { onboardingStatus: "profile" },
      });
    } catch (err) {
      console.error("createUser event failed", err);
      // do NOT rethrow
    }
  },
},
  callbacks: {
    async jwt({ token }) { return token; },
    async session({ session, token }) {
      if (session.user && token?.sub) (session.user as { id: string }).id = token.sub;
      return session;
    },
  }
} satisfies NextAuthOptions;