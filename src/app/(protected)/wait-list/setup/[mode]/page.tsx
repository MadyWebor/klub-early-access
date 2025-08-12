// app/(protected)/wait-list/setup/[mode]/page.tsx
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth"; // or use `auth()` if on next-auth v5
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { nextOnboardingPath } from "@/lib/onboarding";
import WaitListSetup from "./UI";

type Mode = "course" | "content" | "price";

export default async function WaitListSetupPage({
  params,
}: {
  params: Promise<{ mode: Mode }>;
}) {
  const { mode } = await params; // 👈 await the params

  // If you're still on next-auth v4:
  const session = await getServerSession(authOptions);

  // If you're on next-auth v5, prefer:
  // const session = await auth();

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
