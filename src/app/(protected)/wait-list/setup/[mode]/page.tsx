// app/(protected)/wait-list/setup/[mode]/page.tsx
export const runtime = "nodejs";
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import WaitListSetup from "./UI";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type Mode = "course" | "content" | "price";
type Props = { params: Promise<{ mode: Mode }> };

export default async function WaitListSetupPage({ params }: Props) {
  const { mode } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/signin");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingStatus: true, name:true,image:true, handle:true },
  });
  if (!user) redirect("/signin");

  return <WaitListSetup name={user.name} image={user.image} handle={user.handle} />;
}
