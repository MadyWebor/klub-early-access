export const runtime = "nodejs";

import { auth } from "@/app/auth";
import { prisma } from "@/app/lib/db";
import { PricingSchema } from "@/app/lib/zod";
import { ensureUniqueSlug } from "@/app/lib/slug";
import { updateUserOnboardingStatus } from "@/app/lib/nextStep";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = PricingSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { currency, priceAmount, launchDate, buttonLabel, publish } = parsed.data;

  // active waitlist
  const wl = await prisma.waitlist.findFirst({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  if (!wl) return NextResponse.json({ error: "Create course first" }, { status: 400 });

  let slug = wl.slug;
  if (!slug) slug = await ensureUniqueSlug(); // fallback short id

  const updated = await prisma.waitlist.update({
    where: { id: wl.id },
    data: {
      currency,
      priceAmount,
      launchDate: launchDate ? new Date(launchDate) : null,
      buttonLabel: buttonLabel ?? null,
      slug,
      ...(publish ? { published: true, publishedAt: new Date() } : {}),
    },
  });

  await prisma.onboardingProgress.update({
    where: { userId: session.user.id },
    data: { priceDone: (updated.priceAmount ?? 0) > 0 },
  });

  const nextStep = await updateUserOnboardingStatus(session.user.id);

  return NextResponse.json({
    ok: true,
    nextStep,
    slug: updated.slug,
    redirectTo: nextStep === "completed" ? `/wait-list/${updated.slug}` : undefined,
  });
}