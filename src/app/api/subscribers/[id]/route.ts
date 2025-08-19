// src/app/api/subscribers/[id]/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
// import { auth } from "@/app/auth"; // if on v5 wrapper

type Params = { params: { id: string } };

export async function DELETE(_req: Request, context: unknown) {

   const { id } = await (context as { params: { id: string } }).params;

  // const session = await auth(); // for next-auth v5 wrapper
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  // Ensure the subscriber belongs to a waitlist owned by the user
  const sub = await prisma.subscriber.findUnique({
    where: { id: id },
    select: { id: true, waitlistId: true },
  });
  if (!sub) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const wl = await prisma.waitlist.findFirst({
    where: { id: sub.waitlistId, ownerId: session.user.id },
    select: { id: true },
  });
  if (!wl) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  await prisma.subscriber.delete({ where: { id: id } });
  return NextResponse.json({ ok: true });
}
