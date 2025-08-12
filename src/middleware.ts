// middleware.ts
export { default } from "next-auth/middleware";
export const config = {
  matcher: ["/profile", "/dashboard", "/wait-list/setup/:path*"],
};