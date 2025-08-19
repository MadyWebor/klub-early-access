export const runtime = 'nodejs';

import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { setOnboardingCookie } from '@/lib/onboarding';

// ──────────────────────────────────────────────────────────────
// Validation
// ──────────────────────────────────────────────────────────────
const PriceSchema = z.object({
  currency: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/),
  priceAmount: z.number().int().positive(), // minor units
  launchDate: z.string().date().or(
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
  ),
  buttonLabel: z.string().trim().min(1),
  publish: z.boolean().optional().default(false),
});

// ──────────────────────────────────────────────────────────────
// GET  /api/waitlists/[id]/price
// ──────────────────────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json(
      { ok: false, error: { message: 'Unauthorized' } },
      { status: 401 }
    );

  const w = await prisma.waitlist.findUnique({
    where: { id: params.id },
    select: {
      ownerId: true,
      currency: true,
      priceAmount: true,
      launchDate: true,
      buttonLabel: true,
      published: true,
    },
  });

  if (!w || w.ownerId !== session.user.id)
    return NextResponse.json(
      { ok: false, error: { message: 'Not found' } },
      { status: 404 }
    );

  return NextResponse.json({
    ok: true,
    price: {
      currency: w.currency,
      priceAmount: w.priceAmount,
      launchDate: w.launchDate?.toISOString() ?? null,
      buttonLabel: w.buttonLabel ?? null,
      published: w.published,
    },
  });
}

// ──────────────────────────────────────────────────────────────
// PATCH  /api/waitlists/[id]/price
// Body: { currency, priceAmount, launchDate, buttonLabel, publish? }
// - updates price info
// - when publish=true → marks published, completes onboarding
// ──────────────────────────────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json(
      { ok: false, error: { message: 'Unauthorized' } },
      { status: 401 }
    );

  const waitlist = await prisma.waitlist.findUnique({
    where: { id: params.id },
    select: { ownerId: true },
  });
  if (!waitlist || waitlist.ownerId !== session.user.id)
    return NextResponse.json(
      { ok: false, error: { message: 'Not found' } },
      { status: 404 }
    );

  const body = await req.json();
  const parsed = PriceSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'Invalid payload';
    return NextResponse.json({ ok: false, error: { message: msg } }, { status: 400 });
  }

  const { currency, priceAmount, launchDate, buttonLabel, publish } =
    parsed.data;

  const data = {
    currency,
    priceAmount,
    launchDate: new Date(launchDate),
    buttonLabel,
    // published fields set below if publish === true
  } as const;

  if (publish) {
    await prisma.$transaction([
      prisma.waitlist.update({
        where: { id: params.id },
        data: { ...data, published: true, publishedAt: new Date() },
      }),
      prisma.onboardingProgress.upsert({
        where: { userId: session.user.id },
        update: { priceDone: true },
        create: { userId: session.user.id, priceDone: true },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: { onboardingStatus: 'completed' },
      }),
    ]);
    const res = NextResponse.json({ ok: true, status: 'published' });
    return setOnboardingCookie(res, 'completed');
  } else {
    await prisma.$transaction([
      prisma.waitlist.update({ where: { id: params.id }, data }),
      prisma.onboardingProgress.upsert({
        where: { userId: session.user.id },
        update: { priceDone: true },
        create: { userId: session.user.id, priceDone: true },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: { onboardingStatus: 'price' },
      }),
    ]);
    const res = NextResponse.json({ ok: true, status: 'saved' });
    return setOnboardingCookie(res, 'price');
  }
}
