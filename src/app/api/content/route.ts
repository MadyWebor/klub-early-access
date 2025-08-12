export const runtime = "nodejs";

import { auth } from "@/app/auth";
import { prisma } from "@/app/lib/db";
import { ContentSchema } from "@/app/lib/zod";
import { updateUserOnboardingStatus } from "@/app/lib/nextStep";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = ContentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { bannerVideoUrl, media, benefits, socials, faqs } = parsed.data;

  // active waitlist
  const wl = await prisma.waitlist.findFirst({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  if (!wl) return NextResponse.json({ error: "Create course first" }, { status: 400 });

  // Upserts
  await prisma.waitlist.update({
    where: { id: wl.id },
    data: {
      bannerVideoUrl: bannerVideoUrl ?? null,
    },
  });

  if (Array.isArray(media)) {
    // clear and reinsert simple approach (or switch to diffing if needed)
    await prisma.waitlistMedia.deleteMany({ where: { waitlistId: wl.id } });
    await prisma.waitlistMedia.createMany({
      data: media.map((m, idx) => ({
        waitlistId: wl.id,
        kind: m.kind,
        url: m.url,
        displayOrder: m.displayOrder ?? idx,
      })),
    });
  }

  if (Array.isArray(benefits)) {
    await prisma.waitlistBenefit.deleteMany({ where: { waitlistId: wl.id } });
    await prisma.waitlistBenefit.createMany({
      data: benefits.map((b, idx) => ({
        waitlistId: wl.id,
        text: b,
        displayOrder: idx,
      })),
    });
  }

  if (socials) {
    await prisma.waitlistSocial.upsert({
      where: { waitlistId: wl.id },
      update: socials,
      create: { waitlistId: wl.id, ...socials },
    });
  }

  if (Array.isArray(faqs)) {
    await prisma.waitlistFaq.deleteMany({ where: { waitlistId: wl.id } });
    await prisma.waitlistFaq.createMany({
      data: faqs.map((f, idx) => ({
        waitlistId: wl.id,
        question: f.question,
        answer: f.answer,
        displayOrder: f.displayOrder ?? idx,
      })),
    });
  }

  // mark contentDone if we have at least one media/benefit/faq
  const counts = await prisma.waitlist.findUnique({
    where: { id: wl.id },
    select: {
      media: { select: { id: true } },
      benefits: { select: { id: true } },
      faqs: { select: { id: true } },
    },
  });

  const contentDone =
    (counts?.media.length ?? 0) > 0 ||
    (counts?.benefits.length ?? 0) > 0 ||
    (counts?.faqs.length ?? 0) > 0;

  await prisma.onboardingProgress.update({
    where: { userId: session.user.id },
    data: { contentDone },
  });

  const nextStep = await updateUserOnboardingStatus(session.user.id);
  return NextResponse.json({ ok: true, nextStep });
}
