import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { reqEnv } from "./reqEnv";

export const authOptions = {
  secret: reqEnv("NEXTAUTH_SECRET"),
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [GoogleProvider({ clientId: reqEnv("GOOGLE_CLIENT_ID"), clientSecret: reqEnv("GOOGLE_CLIENT_SECRET") })],
  events: {
    async createUser({ user }) {
      try {
        await prisma.onboardingProgress.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id } });
        await prisma.user.update({ where: { id: user.id }, data: { onboardingStatus: "profile" } });
      } catch (err) {
        console.error("createUser failed", err); // don’t rethrow
      }
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("signIn callback", { provider: account?.provider, email: user?.email });
      return true;
    },
    async jwt({ token }) { return token; },
    async session({ session, token }) {
      if (session.user && token?.sub) (session.user as { id: string }).id = token.sub;
      return session;
    },
  },
  debug: true,
  logger: {
    error(code, meta) { console.error("AUTH ERROR", code, meta); },
    warn(code) { console.warn("AUTH WARN", code); },
    debug(code, meta) { console.log("AUTH DEBUG", code, meta); },
  },
} satisfies NextAuthOptions;
