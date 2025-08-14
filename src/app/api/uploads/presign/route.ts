export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3, buildPublicUrl } from "@/lib/storage";
import { randomUUID } from "crypto";

// ---- Helper: minimal mime -> extension map
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
  const hasDot = filename.includes(".");
  if (hasDot) return filename;
  const ext = mimeToExt[contentType] || "bin";
  return `${filename}.${ext}`;
}

// ---- Schema: discriminate by target
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
  waitlistId: z.string(), // required when target is waitlist.media
});

const Body = z.union([UserImageBody, WaitlistMediaBody]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = Body.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { message: parsed.error.issues[0]?.message ?? "Invalid payload" } },
        { status: 400 }
      );
    }

    const { filename: rawName, contentType } = parsed.data;
    const filename = ensureExt(rawName, contentType);

    // Basic contentType guards
    if (parsed.data.target === "user.image" && !contentType.startsWith("image/")) {
      return NextResponse.json(
        { ok: false, error: { message: "Profile image must be an image/* file" } },
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

    const bucket = process.env.S3_BUCKET as string | undefined;
    if (!bucket) {
      return NextResponse.json(
        { ok: false, error: { message: "S3_BUCKET not configured" } },
        { status: 500 }
      );
    }

    // Safe key
    const safeName = filename.replace(/[^\w.\-]+/g, "_").slice(-80);
    const key = [
      "uploads",
      parsed.data.kind.toLowerCase(), // "image" | "video"
      new Date().toISOString().slice(0, 10), // YYYY-MM-DD
      randomUUID(),
      safeName,
    ].join("/");

    const putCmd = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      // ACL: "public-read", // only if your bucket uses ACLs and you want public objects
    });

    const uploadUrl = await getSignedUrl(s3, putCmd, { expiresIn: 600 }); // 10 minutes
    const publicUrl = buildPublicUrl(key);

    // Echo context back to client so it can /commit later
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
              kind: parsed.data.kind, // "IMAGE" | "VIDEO"
              waitlistId: parsed.data.waitlistId,
            },
    });
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : typeof e === "string" ? e : "Failed to presign";
    return NextResponse.json({ ok: false, error: { message } }, { status: 500 });
  }
}
