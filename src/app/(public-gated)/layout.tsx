import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { nextOnboardingPath } from "@/lib/onboarding";

export default async function PublicGatedLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return <>{children}</>;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingStatus: true },
  });

  redirect(nextOnboardingPath(user?.onboardingStatus));
}