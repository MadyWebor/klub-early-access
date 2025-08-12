// app/(protected)/wait-list/setup/[mode]/page.tsx
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { nextOnboardingPath } from "@/lib/onboarding";
import WaitListSetup from "./UI";

type Mode = "course" | "content" | "price";

export default async function WaitListSetupPage({
  params,
}: {
  params: { mode: Mode };
}) {
  const mode = params.mode; // <-- server-side params

  // (If your (protected) layout already checks auth, you can drop this)
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/signin");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingStatus: true },
  });

  const target = nextOnboardingPath(user?.onboardingStatus);
  const expected = `/wait-list/setup/${mode}`;
  if (target !== expected) redirect(target);

  return <WaitListSetup  />;
}
