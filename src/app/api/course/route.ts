export const runtime = "nodejs";

import { auth } from "@/app/auth";
import { prisma } from "@/app/lib/db";
import { CourseSchema } from "@/app/lib/zod";
import { ensureUniqueSlug, slugify } from "@/app/lib/slug";
import { updateUserOnboardingStatus } from "@/app/lib/nextStep";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = CourseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { title, courseBio, about, slug, thumbnailUrl } = parsed.data;

  // We need a base string to build a slug. Prefer provided slug; else use title.
  const slugBase = (slug && slug.trim()) || (title && title.trim());
  if (!slugBase) {
    return NextResponse.json({ error: "Either slug or title is required" }, { status: 400 });
  }
  const uniqueSlug = await ensureUniqueSlug(slugify(slugBase));

  const latest = await prisma.waitlist.findFirst({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  // Only include optional fields when they're strings (avoid null/undefined type issues)
  const optionalUpdate = {
    ...(typeof courseBio === "string" ? { courseBio } : {}),
    ...(typeof about === "string" ? { about } : {}),
    ...(typeof thumbnailUrl === "string" ? { thumbnailUrl } : {}),
  };

  const wl = latest
    ? await prisma.waitlist.update({
        where: { id: latest.id },
        data: {
          title,
          // slug is optional on update (only set when user supplied a new one)
          ...(slug ? { slug: uniqueSlug } : {}),
          ...optionalUpdate,
        },
      })
    : await prisma.waitlist.create({
        data: {
          ownerId: session.user.id,
          title,
          slug: uniqueSlug, // << REQUIRED on create
          ...optionalUpdate,
        },
      });

  await prisma.onboardingProgress.update({
    where: { userId: session.user.id },
    data: { courseDone: Boolean(wl.title && wl.slug) },
  });

  const nextStep = await updateUserOnboardingStatus(session.user.id);
  return NextResponse.json({ ok: true, nextStep });
}
