// src/app/api/uploads/commit/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { MediaKind as PrismaMediaKind } from "@prisma/client";

const Base = z.object({
  key: z.string().min(1),
  publicUrl: z.string().url(),
});

const UserImageBody = Base.extend({
  target: z.literal("user.image"),
  kind: z.literal("IMAGE"),
});

const WaitlistMediaBody = Base.extend({
  target: z.literal("waitlist.media"),
  kind: z.enum(["IMAGE", "VIDEO"]),
  waitlistId: z.string(),
});

const Body = z.union([UserImageBody, WaitlistMediaBody]);

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: { message: "Unauthorized" } }, { status: 401 });
  }

  try {
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { message: parsed.error.issues[0]?.message ?? "Invalid payload" } },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (data.target === "user.image") {
      const user = await prisma.user.update({
        where: { id: session.user.id },
        data: { image: data.publicUrl },
        select: { id: true, image: true },
      });
      return NextResponse.json({ ok: true, updated: { user } });
    }

    if (data.target === "waitlist.media") {
      const wl = await prisma.waitlist.findUnique({
        where: { id: data.waitlistId },
        select: { ownerId: true },
      });
      if (!wl || wl.ownerId !== session.user.id) {
        return NextResponse.json({ ok: false, error: { message: "Not allowed" } }, { status: 403 });
      }

      // simple displayOrder: max+1
      const last = await prisma.waitlistMedia.findFirst({
        where: { waitlistId: data.waitlistId },
        orderBy: { displayOrder: "desc" },
        select: { displayOrder: true },
      });
      const displayOrder = (last?.displayOrder ?? 0) + 1;

      const prismaKind: PrismaMediaKind = data.kind; // "IMAGE" | "VIDEO"
      const media = await prisma.waitlistMedia.create({
        data: {
          waitlistId: data.waitlistId,
          kind: prismaKind,
          url: data.publicUrl,
          displayOrder,
        },
        select: { id: true, kind: true, url: true, waitlistId: true, displayOrder: true },
      });

      return NextResponse.json({ ok: true, created: { media } });
    }

    return NextResponse.json({ ok: false, error: { message: "Invalid target" } }, { status: 400 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Commit failed";
    return NextResponse.json({ ok: false, error: { message } }, { status: 500 });
  }
}
