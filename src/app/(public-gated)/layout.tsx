export const runtime = "nodejs";

import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { nextOnboardingPath } from "@/lib/onboarding";
import { safeGetSession } from "@/lib/safeSession";

export default async function PublicGatedLayout({ children }: { children: React.ReactNode }) {
  const session = await safeGetSession();
  if (!session?.user?.id) return <>{children}</>;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingStatus: true },
  });

  if (user) redirect(nextOnboardingPath(user?.onboardingStatus));

  return <>{children}</>;
}