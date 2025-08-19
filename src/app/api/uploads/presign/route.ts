// src/app/api/uploads/presign/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3, buildPublicUrl } from "@/lib/storage";
import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const mimeToExt: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/ogg": "ogv",
};
function ensureExt(filename: string, contentType: string) {
  if (filename.includes(".")) return filename;
  const ext = mimeToExt[contentType] || "bin";
  return `${filename}.${ext}`;
}

const Base = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
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
  // Require auth to avoid open presign abuse
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

    const { filename: rawName, contentType } = parsed.data;
    const filename = ensureExt(rawName, contentType);

    if (parsed.data.target === "user.image" && !contentType.startsWith("image/")) {
      return NextResponse.json(
        { ok: false, error: { message: "Profile image must be image/*" } },
        { status: 400 }
      );
    }
    if (
      parsed.data.target === "waitlist.media" &&
      !(contentType.startsWith("image/") || contentType.startsWith("video/"))
    ) {
      return NextResponse.json(
        { ok: false, error: { message: "Waitlist media must be image/* or video/*" } },
        { status: 400 }
      );
    }

    const bucket = process.env.S3_BUCKET;
    if (!bucket) {
      return NextResponse.json({ ok: false, error: { message: "S3_BUCKET not configured" } }, { status: 500 });
    }

    const safeName = filename.replace(/[^\w.\-]+/g, "_").slice(-80);
    const key = [
      "uploads",
      parsed.data.kind.toLowerCase(),        // image|video
      new Date().toISOString().slice(0, 10), // YYYY-MM-DD
      session.user.id,                       // trace to user
      randomUUID(),
      safeName,
    ].join("/");

    const putCmd = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    });

    const uploadUrl = await getSignedUrl(s3, putCmd, { expiresIn: 600 }); // 10m
    const publicUrl = buildPublicUrl(key);

    return NextResponse.json({
      ok: true,
      uploadUrl,
      key,
      publicUrl,
      context:
        parsed.data.target === "user.image"
          ? { target: "user.image" as const, kind: "IMAGE" as const, waitlistId: null }
          : {
              target: "waitlist.media" as const,
              kind: parsed.data.kind,
              waitlistId: parsed.data.waitlistId,
            },
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to presign";
    return NextResponse.json({ ok: false, error: { message } }, { status: 500 });
  }
}
