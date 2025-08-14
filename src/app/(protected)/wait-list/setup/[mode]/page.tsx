// app/(protected)/wait-list/setup/[mode]/page.tsx
export const runtime = "nodejs";

import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import WaitListSetup from "./UI";
import { nextOnboardingPath } from "@/lib/onboarding";

// If you want, you can import PageProps from "next"
// import type { PageProps } from "next";

type Mode = "course" | "content" | "price";
// Using an inline type:
type Props = { params: Promise<{ mode: Mode }> };

// If you're on NextAuth v5, prefer: import { auth } from "@/auth";
// If you're still on v4, keep getServerSession/authOptions imports:
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function WaitListSetupPage({ params }: Props) {
  const { mode } = await params; // <-- await the params

  // NextAuth v5:
  // const session = await auth();

  // NextAuth v4:
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) redirect("/signin");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingStatus: true },
  });

  if (!user) redirect("/signin");

  const target = nextOnboardingPath(user?.onboardingStatus);
  const expected = `/wait-list/setup/${mode}`;
  if (target !== expected) redirect(target);

  return <WaitListSetup />;
}
