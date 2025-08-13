// app/api/health/route.ts
import { prisma } from "@/lib/db";
export async function GET() {
  await prisma.$queryRaw`SELECT 1`;
  return new Response("ok");
}
