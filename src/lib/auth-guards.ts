import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

/**
 * For public pages: If logged in, send to remaining step (or /dashboard).
 * Use this at "/", "/signin", "/signup".
 */
export async function redirectAuthedToNextStepOnPublic() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return; // not logged → render page normally

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingStatus: true },
  });

  // redirect(nextOnboardingPath(user?.onboardingStatus));
}

/**
 * For protected layouts/pages: Require session and enforce step order.
 * Use once in (protected)/layout.tsx.
 */
export async function enforceAuthAndStepGate() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/signin");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingStatus: true },
  });

  if (user?.onboardingStatus !== "completed") {
    // redirect(nextOnboardingPath(user?.onboardingStatus));
  }

  // OK to render the protected content
  return { userId: session.user.id };
}
