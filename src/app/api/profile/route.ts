export const runtime = "nodejs";

import { auth } from "@/app/auth";
import { prisma } from "@/app/lib/db";
import { ProfileSchema } from "@/app/lib/zod";
import { updateUserOnboardingStatus } from "@/app/lib/nextStep";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = ProfileSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { fullName, handle, bio, image } = parsed.data;

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        fullName, handle, bio,
        ...(image ? { image } : {}),
      },
    });
    await prisma.onboardingProgress.update({
      where: { userId: session.user.id },
      data: { profileDone: true },
    });
    const nextStep = await updateUserOnboardingStatus(session.user.id);
    return NextResponse.json({ ok: true, nextStep });
  } catch (e: any) {
    if (e.code === "P2002" && e.meta?.target?.includes("handle")) {
      return NextResponse.json({ error: "Username is already taken" }, { status: 409 });
    }
    throw e;
  }
}
