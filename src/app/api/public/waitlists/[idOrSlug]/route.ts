import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function isProbableId(s: string) {
  return /^[a-z0-9]+$/i.test(s) && s.length >= 6;
}

function safeHandle(url?: string | null) {
  if (!url) return "";
  try {
    const u = new URL(url);
    return u.pathname.replace(/^\//, "") || u.host || url;
  } catch {
    return url;
  }
}

export async function GET(
  req: Request,
  context: { params: { idOrSlug: string } }
) {
  const key = context.params.idOrSlug;

  const waitlist = await prisma.waitlist.findFirst({
    where: isProbableId(key)
      ? { id: key, published: true }
      : { slug: key, published: true },
    select: {
      id: true,
      title: true,
      courseBio: true,
      about: true,
      slug: true,
      thumbnailUrl: true,
      bannerVideoUrl: true,
      currency: true,
      priceAmount: true,
      launchDate: true,
      buttonLabel: true,
      published: true,
      publishedAt: true,
      owner: {
        select: { fullName: true, image: true, username: true, handle: true, name: true },
      },
      media: { orderBy: { displayOrder: "asc" }, select: { kind: true, url: true } },
      benefits: { orderBy: { displayOrder: "asc" }, select: { text: true } },
      socials: {
        select: {
          websiteUrl: true, youtubeUrl: true, instagramUrl: true,
          linkedinUrl: true, facebookUrl: true, xUrl: true,
        },
      },
      faqs: { orderBy: { displayOrder: "asc" }, select: { question: true, answer: true } },
    },
  });

  if (!waitlist) {
    return NextResponse.json({ ok: false, message: "Waitlist not found or not published." }, { status: 404 });
  }

  const ownerName =
    waitlist.owner?.fullName ||
    waitlist.owner?.name ||
    waitlist.owner?.username ||
    waitlist.owner?.handle ||
    "Creator";

  const slides = waitlist.media.map((m) => ({
    type: m.kind === "VIDEO" ? ("video" as const) : ("image" as const),
    src: m.url,
  }));
  if (!slides.length && waitlist.thumbnailUrl) {
    slides.push({ type: "image" as const, src: waitlist.thumbnailUrl });
  }

  const socials = [
    waitlist.socials?.instagramUrl && { label: "Instagram", handle: safeHandle(waitlist.socials.instagramUrl), icon: "/insta.png", href: waitlist.socials.instagramUrl! },
    waitlist.socials?.facebookUrl  && { label: "Facebook",  handle: safeHandle(waitlist.socials.facebookUrl),  icon: "/facebook.png", href: waitlist.socials.facebookUrl! },
    waitlist.socials?.linkedinUrl  && { label: "LinkedIn",  handle: safeHandle(waitlist.socials.linkedinUrl),  icon: "/linkedin.png", href: waitlist.socials.linkedinUrl! },
    waitlist.socials?.xUrl         && { label: "X",         handle: safeHandle(waitlist.socials.xUrl),         icon: "/x.png",       href: waitlist.socials.xUrl! },
    waitlist.socials?.youtubeUrl   && { label: "YouTube",   handle: safeHandle(waitlist.socials.youtubeUrl),   icon: "/youtube.png", href: waitlist.socials.youtubeUrl! },
    waitlist.socials?.websiteUrl   && { label: "Website",   handle: safeHandle(waitlist.socials.websiteUrl),   icon: "/link.png",    href: waitlist.socials.websiteUrl! },
  ].filter(Boolean);

  return NextResponse.json({
    ok: true,
    id: waitlist.id,
    slug: waitlist.slug,
    title: waitlist.title,
    courseBio: waitlist.courseBio,
    about: waitlist.about,
    owner: { name: ownerName, image: waitlist.owner?.image || "/user.jpg" },
    bannerVideoUrl: waitlist.bannerVideoUrl,
    currency: waitlist.currency,
    priceAmount: waitlist.priceAmount,
    buttonLabel:
      waitlist.buttonLabel ||
      (waitlist.priceAmount != null ? `Join for ₹${(waitlist.priceAmount / 100).toFixed(0)}` : "Join"),
    launchDate: waitlist.launchDate,
    publishedAt: waitlist.publishedAt,
    slides,
    features: waitlist.benefits.map((b) => b.text),
    socials,
    faqs: waitlist.faqs.map((f) => ({ q: f.question, a: f.answer })),
  });
}
