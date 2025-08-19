// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

export type OnboardingStatus =
  | "profile"
  | "course"
  | "content"
  | "price"
  | "completed";

const STEP_ORDER: OnboardingStatus[] = [
  "profile",
  "course",
  "content",
  "price",
  "completed",
];

const PATHS: Record<OnboardingStatus, string> = {
  profile: "/profile",
  course: "/wait-list/setup/course",
  content: "/wait-list/setup/content",
  price: "/wait-list/setup/price",
  completed: "/dashboard",
};

// Which paths this middleware should run on
export const config = {
  matcher: [
    "/profile",
    "/wait-list/setup/:path*",
    "/dashboard",
  ],
};

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Read user's last known step from cookie (default to 'profile' if missing)
  const cookieStatus =
    (req.cookies.get("onboardingStatus")?.value as OnboardingStatus | undefined) ??
    "profile";

  // Identify which step the current path belongs to (if any)
  const mode = STEP_ORDER.find((s) => pathname.startsWith(PATHS[s]));

  // If path is not part of the onboarding flow → allow
  if (!mode) return NextResponse.next();

  // If the user is "completed", allow everything
  if (cookieStatus === "completed") return NextResponse.next();

  const currentStep = STEP_ORDER.indexOf(mode);
  const userStep = STEP_ORDER.indexOf(cookieStatus);

  // Prevent skipping ahead: if trying to access a step after the cookie's step,
  // send them to the highest step they are allowed to access.
  if (currentStep > userStep) {
    const target = PATHS[STEP_ORDER[userStep]];
    if (pathname !== target) {
      return NextResponse.redirect(new URL(target, req.url));
    }
  }

  return NextResponse.next();
}
