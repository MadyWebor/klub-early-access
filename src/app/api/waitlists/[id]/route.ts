// src/app/api/waitlists/[id]/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const slugRegex = /^[a-z0-9-]{3,}$/;

const PatchSchema = z.object({
  title: z.string().min(1, "Course title is required."),
  bioHtml: z.string().min(1, "Course bio is required."),
  aboutHtml: z.string().min(1, "About course is required."),
  slug: z
    .string()
    .min(3)
    .regex(slugRegex, "Use 3+ chars: lowercase letters, numbers, and hyphens."),
  thumbnailUrl: z.string().url().optional().or(z.literal("")).nullable(),
  trustedBy: z.number().int().optional().nullable(), // ✅ added
});

// Helper: works whether Next gives params sync or as a Promise
type Ctx =
  | { params: { id: string } }
  | { params: Promise<{ id: string }> };

async function getId(ctx: Ctx): Promise<string> {
  const p = "then" in ctx.params ? await (ctx.params as Promise<{ id: string }>) : (ctx.params as { id: string });
  return p.id;
}

export async function GET(_req: NextRequest, context: unknown) {
  const { id } = (context as { params: { id: string } }).params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: { message: "Unauthorized" } }, { status: 401 });
  }

  const wl = await prisma.waitlist.findUnique({
    where: { id },
    select: {
      id: true,
      ownerId: true,
      title: true,
      courseBio: true,
      about: true,
      slug: true,
      thumbnailUrl: true,
      trustedBy: true, // ✅ added
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!wl || wl.ownerId !== session.user.id) {
    return NextResponse.json({ ok: false, error: { message: "Not found" } }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    waitlist: {
      id: wl.id,
      title: wl.title,
      bioHtml: wl.courseBio ?? "",
      aboutHtml: wl.about ?? "",
      slug: wl.slug ?? "",
      thumbnailUrl: wl.thumbnailUrl ?? "",
      trustedBy: wl.trustedBy ?? null, // ✅ added
      createdAt: wl.createdAt,
      updatedAt: wl.updatedAt,
    },
  });
}

export async function PATCH(req: NextRequest, context: unknown) {
  const { id } = (context as { params: { id: string } }).params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: { message: "Unauthorized" } }, { status: 401 });
  }

  const wl = await prisma.waitlist.findUnique({
    where: { id },
    select: { ownerId: true, slug: true },
  });
  if (!wl || wl.ownerId !== session.user.id) {
    return NextResponse.json({ ok: false, error: { message: "Not found" } }, { status: 404 });
  }

  const body = await req.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid payload";
    return NextResponse.json({ ok: false, error: { message: msg } }, { status: 400 });
  }

  const { title, bioHtml, aboutHtml, slug, thumbnailUrl, trustedBy } = parsed.data; // ✅ added

  // Slug uniqueness
  if (slug) {
    const existing = await prisma.waitlist.findFirst({
      where: { slug, NOT: { id } },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { ok: false, error: { message: "Slug already in use" } },
        { status: 409 }
      );
    }
  }

  const updated = await prisma.waitlist.update({
    where: { id },
    data: {
      title,
      courseBio: bioHtml,
      about: aboutHtml,
      slug,
      thumbnailUrl: thumbnailUrl || null,
      trustedBy: trustedBy ?? null, // ✅ added
    },
    select: {
      id: true,
      title: true,
      courseBio: true,
      about: true,
      slug: true,
      thumbnailUrl: true,
      trustedBy: true, // ✅ added
      updatedAt: true,
    },
  });

  // Onboarding progress + status
  await prisma.$transaction([
    prisma.onboardingProgress.upsert({
      where: { userId: session.user.id },
      update: { courseDone: true },
      create: { userId: session.user.id, courseDone: true },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: { onboardingStatus: "content" },
      select: { id: true },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    waitlist: {
      id: updated.id,
      title: updated.title,
      bioHtml: updated.courseBio ?? "",
      aboutHtml: updated.about ?? "",
      slug: updated.slug ?? "",
      thumbnailUrl: updated.thumbnailUrl ?? "",
      trustedBy: updated.trustedBy ?? null, // ✅ added
      updatedAt: updated.updatedAt,
    },
  });
}
