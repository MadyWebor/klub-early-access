export type OnboardingStatus = "profile" | "course" | "content" | "price" | "completed";

export function nextOnboardingPath(status?: OnboardingStatus | null) {
  switch (status) {
    case "profile":  return "/profile";
    case "course":   return "/wait-list/setup/course";
    case "content":  return "/wait-list/setup/content";
    case "price":    return "/wait-list/setup/price";
    case "completed":
    default:         return "/dashboard";
  }
}