// middleware.ts
export { default } from "next-auth/middleware";
export const config = {
  matcher: ["/profile", "/dashboard", "/wait-list/setup/:path*","/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};