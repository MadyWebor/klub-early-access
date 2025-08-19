export const runtime = "nodejs";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { setOnboardingCookie } from "@/lib/onboarding";
import type { OnboardingStatus } from "@/middleware";


// ──────────────────────────────────────────────────────────────
// Validation for PATCH
// ──────────────────────────────────────────────────────────────
const urlField = z.string().trim().refine(v => /^https?:\/\//i.test(v), "Must be a valid URL (include http(s)://)").url();

const ContentSchema = z.object({
  media: z.array(z.string().url()).min(1, "At least one media file is required."),
  bannerVideoUrl: z.string().url("Banner video is required."),
  benefits: z.array(z.string().min(1)).min(1, "At least one benefit is required."),
  socials: z.object({
    website: urlField,
    youtube: urlField,
    instagram: urlField,
    linkedin: urlField,
    facebook: urlField,
    x: urlField,
  }),
  faqs: z.array(z.object({ question: z.string().min(1), answer: z.string().min(1) }))
       .min(1, "At least one FAQ is required."),
});

// ──────────────────────────────────────────────────────────────
// GET  /api/waitlists/[id]/content
// Returns the content the UI expects to hydrate the form
// ──────────────────────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  context:unknown
) {
  const { id } = (context as { params: { id: string } }).params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: { message: "Unauthorized" } }, { status: 401 });
  }

  const waitlist = await prisma.waitlist.findUnique({
    where: { id: id },
    select: { id: true, ownerId: true, bannerVideoUrl: true },
  });
  if (!waitlist || waitlist.ownerId !== session.user.id) {
    return NextResponse.json({ ok: false, error: { message: "Not found" } }, { status: 404 });
  }

  const [mediaRows, benefitRows, socialsRow, faqRows] = await Promise.all([
    prisma.waitlistMedia.findMany({
      where: { waitlistId: id },
      orderBy: { displayOrder: "asc" },
      select: { url: true },
    }),
    prisma.waitlistBenefit.findMany({
      where: { waitlistId: id },
      orderBy: { displayOrder: "asc" },
      select: { text: true },
    }),
    prisma.waitlistSocial.findUnique({
      where: { waitlistId: id },
      select: {
        websiteUrl: true,
        youtubeUrl: true,
        instagramUrl: true,
        linkedinUrl: true,
        facebookUrl: true,
        xUrl: true,
      },
    }),
    prisma.waitlistFaq.findMany({
      where: { waitlistId: id },
      orderBy: { displayOrder: "asc" },
      select: { question: true, answer: true },
    }),
  ]);

  const content = {
    media: mediaRows.map(m => m.url),
    bannerVideoUrl: waitlist.bannerVideoUrl ?? null,
    benefits: benefitRows.map(b => b.text),
    socials: socialsRow
      ? {
          website: socialsRow.websiteUrl ?? "",
          youtube: socialsRow.youtubeUrl ?? "",
          instagram: socialsRow.instagramUrl ?? "",
          linkedin: socialsRow.linkedinUrl ?? "",
          facebook: socialsRow.facebookUrl ?? "",
          x: socialsRow.xUrl ?? "",
        }
      : undefined,
    faqs: faqRows.map(f => ({ question: f.question, answer: f.answer })),
  };

  return NextResponse.json({ ok: true, content });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: { message: "Unauthorized" } }, { status: 401 });
  }

  const waitlist = await prisma.waitlist.findUnique({ where: { id } });
  if (!waitlist || waitlist.ownerId !== session.user.id) {
    return NextResponse.json({ ok: false, error: { message: "Not found" } }, { status: 404 });
  }

  const body = await req.json();
  const parsed = ContentSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid payload";
    return NextResponse.json({ ok: false, error: { message: msg } }, { status: 400 });
  }

  const { media, bannerVideoUrl, benefits, socials, faqs } = parsed.data;

  await prisma.$transaction([
    prisma.waitlist.update({ where: { id }, data: { bannerVideoUrl } }),
    prisma.waitlistMedia.deleteMany({ where: { waitlistId: id } }),
    prisma.waitlistMedia.createMany({
      data: media.map((url, i) => ({
        waitlistId: id,
        kind: /\.(mp4|mov|avi|webm|ogg)$/i.test(url) ? "VIDEO" : "IMAGE",
        url,
        displayOrder: i,
      })),
    }),
    prisma.waitlistBenefit.deleteMany({ where: { waitlistId: id } }),
    prisma.waitlistBenefit.createMany({
      data: benefits.map((text, i) => ({ waitlistId: id, text, displayOrder: i })),
    }),
    prisma.waitlistSocial.upsert({
      where: { waitlistId: id },
      update: {
        websiteUrl: socials.website,
        youtubeUrl: socials.youtube,
        instagramUrl: socials.instagram,
        linkedinUrl: socials.linkedin,
        facebookUrl: socials.facebook,
        xUrl: socials.x,
      },
      create: {
        waitlistId: id,
        websiteUrl: socials.website,
        youtubeUrl: socials.youtube,
        instagramUrl: socials.instagram,
        linkedinUrl: socials.linkedin,
        facebookUrl: socials.facebook,
        xUrl: socials.x,
      },
    }),
    prisma.waitlistFaq.deleteMany({ where: { waitlistId: id } }),
    prisma.waitlistFaq.createMany({
      data: faqs.map((f, i) => ({
        waitlistId: id,
        question: f.question,
        answer: f.answer,
        displayOrder: i,
      })),
    }),
    prisma.onboardingProgress.upsert({
      where: { userId: session.user.id },
      update: { contentDone: true },
      create: { userId: session.user.id, contentDone: true },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: { onboardingStatus: "price" },
    }),
  ]);

  // 👇 keep cookie in sync so middleware allows /price
  const res = NextResponse.json({ ok: true });
  return setOnboardingCookie(res, "price");
}