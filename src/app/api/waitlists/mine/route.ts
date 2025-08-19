// app/api/waitlists/mine/route.ts
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: { message: 'Unauthorized' } }, { status: 401 });
  }

  // find latest waitlist owned by user, else create
  const existing = await prisma.waitlist.findFirst({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: 'desc' },
    select: { id: true },
  });

  if (existing) return NextResponse.json({ ok: true, waitlist: existing });

  const created = await prisma.waitlist.create({
    data: { ownerId: session.user.id, title: '', slug: null },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, waitlist: created });
}
