// src/lib/onboardingCookie.ts
import { NextResponse } from "next/server";
import type { OnboardingStatus } from "@/middleware";

export function setOnboardingCookie(
  res: NextResponse,
  status: OnboardingStatus
) {
  res.cookies.set("onboardingStatus", status, {
    path: "/",
    httpOnly: false,    // readable by client; still sent to middleware on requests
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}