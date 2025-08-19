export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { safeGetSession } from "@/lib/safeSession";

export default async function PublicGatedLayout({ children }: { children: React.ReactNode }) {
  const session = await safeGetSession();
  if (!session?.user?.id) return <>{children}</>;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingStatus: true },
  });
  if (!user) return <>{children}</>;

  const urls = {
    profile: "/profile",
    course: "/wait-list/setup/course",
    content: "/wait-list/setup/content",
    price: "/wait-list/setup/price",
    completed: "/dashboard",
  };

  redirect(urls[user.onboardingStatus]);
}
