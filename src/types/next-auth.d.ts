import NextAuth, { DefaultSession } from "next-auth";
import { OnboardingStatus } from "@/lib/onboarding";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      onboardingStatus?: OnboardingStatus;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    onboardingStatus?: OnboardingStatus;
  }
}
