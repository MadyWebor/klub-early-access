// src/app/api/subscribers/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // if you're on next-auth v5 wrapper, see comment below

// If you're on NextAuth v5 `auth()` helper instead of getServerSession, you can:
// import { auth } from "@/app/auth";

const getSchema = z.object({
  waitlistId: z.string().min(1),
  page: z.string().optional(),      // optional pagination
  pageSize: z.string().optional(),  // optional pagination
});

const postSchema = z.object({
  waitlistId: z.string().min(1),
  fullName: z.string().optional(),
  email: z.string().email(),
  priceAmount: z.number().int().optional(),
  currency: z.string().optional(),
  status: z.enum(["LEAD", "PAID", "REFUNDED", "FAILED"]).optional().default("LEAD"),
});

export async function GET(req: Request) {
  // const session = await auth(); // for next-auth v5 wrapper
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const parsed = getSchema.safeParse({
    waitlistId: searchParams.get("waitlistId"),
    page: searchParams.get("page") || undefined,
    pageSize: searchParams.get("pageSize") || undefined,
  });
  if (!parsed.success) return NextResponse.json({ message: "Invalid query", issues: parsed.error.issues }, { status: 400 });

  const { waitlistId } = parsed.data;
  const page = Math.max(1, parseInt(parsed.data.page || "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(parsed.data.pageSize || "50", 10)));
  const skip = (page - 1) * pageSize;

  // Ensure the current user owns the waitlist
  const wl = await prisma.waitlist.findFirst({
    where: { id: waitlistId, ownerId: session.user.id },
    select: { id: true },
  });
  if (!wl) return NextResponse.json({ message: "Waitlist not found or forbidden" }, { status: 404 });

  const [rows, total] = await Promise.all([
    prisma.subscriber.findMany({
      where: { waitlistId },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        fullName: true,
        email: true,
        priceAmount: true,
        currency: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.subscriber.count({ where: { waitlistId } }),
  ]);

  return NextResponse.json({
    data: rows,
    page,
    pageSize,
    total,
    hasMore: skip + rows.length < total,
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "Invalid body", issues: parsed.error.issues }, { status: 400 });

  // const session = await auth(); // for next-auth v5 wrapper
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  // Only owner can create subscribers (e.g., webhook -> you might bypass with secret in a different route)
  const wl = await prisma.waitlist.findFirst({
    where: { id: parsed.data.waitlistId, ownerId: session.user.id },
    select: { id: true },
  });
  if (!wl) return NextResponse.json({ message: "Waitlist not found or forbidden" }, { status: 404 });

  // Upsert by (waitlistId, email)
  const sub = await prisma.subscriber.upsert({
    where: { waitlistId_email: { waitlistId: parsed.data.waitlistId, email: parsed.data.email } },
    create: {
      waitlistId: parsed.data.waitlistId,
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      priceAmount: parsed.data.priceAmount,
      currency: parsed.data.currency || "INR",
      status: parsed.data.status,
    },
    update: {
      fullName: parsed.data.fullName ?? undefined,
      priceAmount: parsed.data.priceAmount ?? undefined,
      currency: parsed.data.currency ?? undefined,
      status: parsed.data.status ?? undefined,
    },
  });

  return NextResponse.json({ data: sub }, { status: 201 });
}
