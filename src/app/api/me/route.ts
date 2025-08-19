// app/api/me/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, name: true, email: true, image: true,
      username: true, fullName: true, handle: true, bio: true,
      onboardingStatus: true,
      progress: { select: { profileDone: true, courseDone: true, contentDone: true, priceDone: true } },
      waitlists: {
        orderBy: { updatedAt: "desc" },
        select: {
          id: true, title: true, slug: true, thumbnailUrl: true, priceAmount: true, currency: true,
          published: true, updatedAt: true,
          _count: { select: { subscribers: true } }
        }
      }
    }
  });

  return NextResponse.json({ data: me });
}
