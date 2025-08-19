// src/app/api/waitlists/slug/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const value = (url.searchParams.get("value") || "").toLowerCase();
  const ok = /^[a-z0-9-]{3,}$/.test(value) && !/^[-]|[-]$/.test(value);
  if (!ok) {
    return NextResponse.json({ ok: true, available: false, reason: "invalid" });
  }
  const exists = await prisma.waitlist.findFirst({ where: { slug: value }, select: { id: true } });
  return NextResponse.json({ ok: true, available: !exists });
}
