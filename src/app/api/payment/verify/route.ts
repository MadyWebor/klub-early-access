import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
const payment = await prisma.payment.findFirst({
  where: { orderId: razorpay_order_id },
});

    if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

    // Verify signature
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Update payment as captured
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "CAPTURED", capturedAt: new Date() },
    });

    await prisma.subscriber.update({
      where: { id: payment.subscriberId },
      data: { status: "PAID" },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
