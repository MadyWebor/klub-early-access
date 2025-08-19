// src/app/api/waitlists/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: { message: "Unauthorized" } }, { status: 401 });
  }

  // create empty waitlist (no slug/title yet)
  const waitlist = await prisma.waitlist.create({
    data: {
      ownerId: session.user.id,
      title: "",
      slug: null,
    },
    select: { id: true, ownerId: true, title: true, slug: true, createdAt: true },
  });

  return NextResponse.json({ ok: true, waitlist });
}
