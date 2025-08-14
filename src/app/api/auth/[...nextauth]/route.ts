// app/api/auth/[...nextauth]/route.ts
export const runtime = "nodejs";
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // your file above
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
