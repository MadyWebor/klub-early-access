// app/(protected)/profile/page.tsx
export const runtime = "nodejs";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Profile from "./UI";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/signin");

  // Optional: ensure user exists (and fail safe)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true },
  });
  if (!user) redirect("/signin");

  // No onboarding redirect here → user can always edit profile
  return <Profile />;
}