export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // make sure this exports your NextAuth options
import type { MediaKind as PrismaMediaKind } from "@prisma/client";

// ---- BODY SCHEMA (discriminated by target/kind) ----
const Base = z.object({
  key: z.string(),
  publicUrl: z.string().url(),
});

const UserImageBody = Base.extend({
  target: z.literal("user.image"),
  kind: z.literal("IMAGE"), // only IMAGE is valid for profile avatar
});

const WaitlistMediaBody = Base.extend({
  target: z.literal("waitlist.media"),
  kind: z.enum(["IMAGE", "VIDEO"]), // FILE is NOT allowed in WaitlistMedia
  waitlistId: z.string(), // required when target is waitlist.media
});

const Body = z.union([UserImageBody, WaitlistMediaBody]);

export async function POST(req: NextRequest) {
  // Session
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { ok: false, error: { message: "Unauthorized" } },
      { status: 401 }
    );
  }

  try {
    const json = await req.json();
    const parsed = Body.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { message: parsed.error.issues[0]?.message ?? "Invalid payload" } },
        { status: 400 }
      );
    }

    // Narrowed type thanks to zod union above
    const data = parsed.data;

    // --- Update user image ---
    if (data.target === "user.image") {
      const user = await prisma.user.update({
        where: { id: session.user.id },
        data: { image: data.publicUrl },
        select: { id: true, image: true },
      });
      return NextResponse.json({ ok: true, updated: { user } });
    }

    // --- Create waitlist media (IMAGE | VIDEO only) ---
    if (data.target === "waitlist.media") {
      // Ownership guard
      const wl = await prisma.waitlist.findUnique({
        where: { id: data.waitlistId },
        select: { ownerId: true },
      });
      if (!wl || wl.ownerId !== session.user.id) {
        return NextResponse.json(
          { ok: false, error: { message: "Not allowed" } },
          { status: 403 }
        );
      }

      // TS-safe narrowing to Prisma enum (no "FILE" possible here)
      const prismaKind: PrismaMediaKind = data.kind; // "IMAGE" | "VIDEO"

      const media = await prisma.waitlistMedia.create({
        data: {
          waitlistId: data.waitlistId,
          kind: prismaKind,
          url: data.publicUrl,
        },
        select: { id: true, kind: true, url: true, waitlistId: true },
      });

      return NextResponse.json({ ok: true, created: { media } });
    }

    // Fallback (should never hit because union covers cases)
    return NextResponse.json(
      { ok: false, error: { message: "Invalid target" } },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { message: err?.message || "Commit failed" } },
      { status: 500 }
    );
  }
}
