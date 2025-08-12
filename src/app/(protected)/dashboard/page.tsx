'use server';
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { nextOnboardingPath } from "@/lib/onboarding"
import Dashboard from "./UI";
export default async function DashboardPage () {

    const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { onboardingStatus: true },
  });
  const target = nextOnboardingPath(user?.onboardingStatus);
  if (target !== "/dashboard") redirect(target);
  

  return<Dashboard />
}
