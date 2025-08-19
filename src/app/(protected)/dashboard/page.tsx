// app/(protected)/dashboard/page.tsx
export const runtime = "nodejs";           // Prisma needs Node runtime on Netlify
export const dynamic = "force-dynamic";    // avoid static caching of auth state

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Dashboard from "./UI";

function money(amount?: number | null, currency = "INR") {
  if (amount == null) return null;
  return {
    amount,
    currency,
    formatted: new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount / 100),
  };
}

// Helpers for dates
const iso = (d: Date) => d.toISOString();                    // required fields
const isoOpt = (d?: Date | null) => (d ? d.toISOString() : null); // optional fields

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/signin"); // guard

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      username: true,
      fullName: true,
      handle: true,
      bio: true,
      onboardingStatus: true,
      progress: { select: { profileDone: true, courseDone: true, contentDone: true, priceDone: true } },
      waitlists: {
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnailUrl: true,
          courseBio: true,
          about: true,
          bannerVideoUrl: true,
          currency: true,
          priceAmount: true,
          launchDate: true,
          buttonLabel: true,
          published: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { subscribers: true } },
          subscribers: {
            orderBy: { createdAt: "desc" },
            take: 100,
            select: {
              id: true,
              fullName: true,
              email: true,
              priceAmount: true,
              currency: true,
              status: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  if (!me) redirect("/signin");

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://your-domain.com";

  const payload = {
    user: {
      id: me.id,
      name: me.name,
      email: me.email,
      image: me.image,
      username: me.username,
      fullName: me.fullName,
      handle: me.handle,
      bio: me.bio,
      onboardingStatus: me.onboardingStatus,
      progress: me.progress ?? { profileDone: false, courseDone: false, contentDone: false, priceDone: false },
    },
    waitlists: me.waitlists.map((w) => ({
      id: w.id,
      title: w.title,
      slug: w.slug,
      publicUrl: w.slug ? `${baseUrl}/wait-list/${w.slug}` : `${baseUrl}/wait-list/${w.id}`,
      thumbnailUrl: w.thumbnailUrl,
      courseBio: w.courseBio,
      about: w.about,
      bannerVideoUrl: w.bannerVideoUrl,
      price: money(w.priceAmount, w.currency ?? "INR"),
      currency: w.currency ?? "INR",
      launchDate: isoOpt(w.launchDate),     // string | null
      buttonLabel: w.buttonLabel,
      published: w.published,
      publishedAt: isoOpt(w.publishedAt),   // string | null
      createdAt: iso(w.createdAt),          // string (non-nullable)
      updatedAt: iso(w.updatedAt),          // string (non-nullable)
      counts: { subscribers: w._count.subscribers },
      subscribers: w.subscribers.map((s) => ({
        id: s.id,
        fullName: s.fullName,
        email: s.email,
        status: s.status,
        createdAt: iso(s.createdAt),        // string (non-nullable)
        price: money(s.priceAmount, s.currency ?? w.currency ?? "INR"),
      })),
    })),
  };

  return <Dashboard initialData={payload} />;
}
