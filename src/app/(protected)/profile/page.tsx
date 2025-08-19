// app/(protected)/profile/page.tsx
export const runtime = "nodejs";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Profile from "./UI";
import { getAllowedOnboardingPath } from "@/lib/onboarding";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/signin");

  // Optional: ensure user exists (and fail safe)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, onboardingStatus: true },
  });
  if (!user) redirect("/signin");

  const userStatus = user.onboardingStatus;
  const requestedStep = "profile";
  const redirectPath = getAllowedOnboardingPath(userStatus, requestedStep);

  if (redirectPath) {
    redirect(redirectPath)
  } else {
    console.log("User can access this step");
  }

  // No onboarding redirect here → user can always edit profile
  return <Profile />;
}