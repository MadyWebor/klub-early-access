// src/app/api/subscribers/route.ts
export const runtime = "nodejs";

import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // if you're on next-auth v5 wrapper, see comment below
import Razorpay from "razorpay";
import { v4 as uuidv4 } from "uuid";

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

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const { email, waitlistId, priceAmount, currency } = await req.json();

    if (!email || !waitlistId || !priceAmount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1️⃣ Create or get subscriber
    const subscriber = await prisma.subscriber.upsert({
      where: { waitlistId_email: { waitlistId, email } },
      update: {},
      create: {
        email,
        // fullName,
        waitlistId,
        priceAmount,
        currency,
      },
    });

    // 2️⃣ Create Razorpay Order
    const options = {
      amount: priceAmount, // in paise
      currency: currency || "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    let payment = await prisma.payment.findUnique({
      where: { subscriberId: subscriber.id },
    });

    if (!payment) {
      payment = await prisma.payment.create({
        data: {
          waitlistId,
          subscriberId: subscriber.id,
          provider: "RAZORPAY",
          amount: priceAmount,
          currency: currency || "INR",
          status: "CREATED",
          orderId: order.id,
        },
      });
    }

    return NextResponse.json({ subscriber, payment, order });
  } catch (err: unknown) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

