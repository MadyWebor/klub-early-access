// lib/onboarding.ts
export type OnboardingStatus = "profile" | "course" | "content" | "price" | "completed";

export function nextOnboardingPath(status?: OnboardingStatus | null) {
  if (!status) return "/profile"; // ← start here if missing
  switch (status) {
    case "profile":  return "/profile";
    case "course":   return "/wait-list/setup/course";
    case "content":  return "/wait-list/setup/content";
    case "price":    return "/wait-list/setup/price";
    case "completed": return "/dashboard";
  }
}