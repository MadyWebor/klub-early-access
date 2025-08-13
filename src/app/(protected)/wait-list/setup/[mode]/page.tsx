// 'use server'
// app/(protected)/wait-list/setup/[mode]/page.tsx
export const runtime = "nodejs";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { nextOnboardingPath } from "@/lib/onboarding";
import WaitListSetup from "./UI";

type Mode = "course" | "content" | "price";
type Props = { params: { mode: Mode } };



export default async function WaitListSetupPage({ params }: Props) {
  const { mode } = params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/signin");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingStatus: true },
  });

  const target = nextOnboardingPath(user?.onboardingStatus);
  const expected = `/wait-list/setup/${mode}`;
  if (target !== expected) redirect(target);

  return <WaitListSetup />;
}
