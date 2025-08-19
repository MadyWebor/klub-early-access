// utils/onboarding.ts

export type OnboardingStatus = "profile" | "course" | "content" | "price" | "completed";

export const STEP_PATHS: Record<OnboardingStatus, { path: string; allowed: OnboardingStatus[] }> = {
  profile: {
    path: '/profile',
    allowed: ['profile'],
  },
  course: {
    path: "/wait-list/setup/course",
    allowed: ['profile', 'course'],
  },
  content: {
    path: "/wait-list/setup/content",
    allowed: ['profile', 'course', 'content'],
  },
  price: {
    path: "/wait-list/setup/price",
    allowed: ['profile', 'course', 'content', 'price'],
  },
  completed: {
    path: "/dashboard",
    allowed: ['profile', 'course', 'content', 'price', 'completed'],
  },
};

/**
 * Determine allowed path based on user's onboarding status.
 *
 * @param userStatus Current onboarding status from DB
 * @param requestedStep Step/path the user is trying to access
 * @returns string | null → null if allowed, redirect path if not allowed
 */
export function getAllowedOnboardingPath(
  userStatus: OnboardingStatus,
  requestedStep: OnboardingStatus
): string | null {
  // completed → allowed everywhere
  if (userStatus === "completed") return null;

  const step = STEP_PATHS[userStatus];

  // check if current userStatus is in allowed array of requestedStep
  if (!step.allowed.includes(requestedStep)) {
    // redirect to user's current step
    return STEP_PATHS[userStatus].path;
  }

  return null; // allowed
}
