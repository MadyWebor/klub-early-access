// src/app/api/profile/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
// import type { Prisma } from "@prisma/client";
import { Prisma } from "@prisma/client"; // <-- not "import type"
import {
  ProfileCreateSchema,
  ProfileUpdateSchema,
  handleFromFullName,
  RESERVED_HANDLES,
} from "@/lib/validators/profile";
import { ensureUniqueHandle } from "@/lib/handle";

function bad(status: number, message: string, field?: string) {
  return NextResponse.json({ ok: false, error: { message, field } }, { status });
}

// ------- GET /api/profile ----------------------------------------------------
export async function GET() {
  const session = await getServerSession(authOptions);
  const sUser = session?.user;
  if (!sUser) return bad(401, "Not authenticated");

  const where = sUser.id ? { id: sUser.id } : sUser.email ? { email: sUser.email } : null;
  if (!where) return bad(400, "No user identity in session");

  const user = await prisma.user.findFirst({
    where,
    select: {
      id: true,
      email: true,
      image: true,
      name: true,
      handle: true,
      bio: true,
      onboardingStatus: true,
      progress: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) return bad(404, "User not found");
  return NextResponse.json({ ok: true, profile: user });
}

// ------- POST /api/profile ---------------------------------------------------
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return bad(401, "Not authenticated");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return bad(400, "Invalid JSON body");
  }

  const parsed = ProfileCreateSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return bad(400, issue.message, issue.path[0]?.toString());
  }

  const { fullName, bio, image } = parsed.data;
  let handle = parsed.data.handle ?? handleFromFullName(fullName);

  if (RESERVED_HANDLES.has(handle)) {
    return bad(409, "This username is reserved. Please choose another.", "handle");
  }

  handle = await ensureUniqueHandle(handle, userId);

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          fullName,
          handle,
          bio: bio?.length ? bio : null,
          image: image ?? undefined,
          onboardingStatus: "course",
        },
        select: {
          id: true,
          email: true,
          image: true,
          fullName: true,
          handle: true,
          bio: true,
          onboardingStatus: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      await tx.onboardingProgress.upsert({
        where: { userId },
        create: { userId, profileDone: true },
        update: { profileDone: true },
      });

      return user;
    });

    return NextResponse.json({
      ok: true,
      profile: updated,
      next: "/wait-list/setup/course",
    });
  } catch (e: unknown) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      const target = e.meta?.target;
      const isHandle =
        (typeof target === "string" && target === "handle") ||
        (Array.isArray(target) && target.includes("handle"));

      if (isHandle) {
        return bad(409, "This username is taken. Please choose another.", "handle");
      }
    }
    throw e;
  }
}

// ------- PATCH /api/profile --------------------------------------------------
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return bad(401, "Not authenticated");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return bad(400, "Invalid JSON body");
  }

  const parsed = ProfileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return bad(400, issue.message, issue.path[0]?.toString());
  }

  const data = parsed.data as {
    fullName?: string;
    handle?: string;
    bio?: string;
    image?: string;
  };

  if (data.handle) {
    if (RESERVED_HANDLES.has(data.handle)) {
      return bad(409, "This username is reserved. Please choose another.", "handle");
    }
    data.handle = await ensureUniqueHandle(data.handle, userId);
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const current = await tx.user.findUnique({
        where: { id: userId },
        select: { onboardingStatus: true },
      });

      const user = await tx.user.update({
        where: { id: userId },
        data: {
          ...("fullName" in data ? { fullName: data.fullName } : {}),
          ...("handle" in data ? { handle: data.handle } : {}),
          ...("bio" in data ? { bio: data.bio && data.bio.length ? data.bio : null } : {}),
          ...("image" in data ? { image: data.image } : {}),
          ...(current?.onboardingStatus === "profile" ? { onboardingStatus: "course" } : {}),
        },
        select: {
          id: true,
          email: true,
          image: true,
          fullName: true,
          handle: true,
          bio: true,
          onboardingStatus: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (current?.onboardingStatus === "profile") {
        await tx.onboardingProgress.upsert({
          where: { userId },
          create: { userId, profileDone: true },
          update: { profileDone: true },
        });
      }
      return user;
    });

    return NextResponse.json({ ok: true, profile: updated });
  } catch (e: unknown) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      const target = e.meta?.target;
      const isHandle =
        (typeof target === "string" && target === "handle") ||
        (Array.isArray(target) && target.includes("handle"));

      if (isHandle) {
        return bad(409, "This username is taken. Please choose another.", "handle");
      }
    }
    throw e;
  }
}
