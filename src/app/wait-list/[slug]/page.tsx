import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import WaitListPageWrapper from "./Wrapper";
import { WaitListData } from "./types"; // WaitListData type

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicWaitlistPage({ params }: PageProps) {
  const key = (await params).slug?.trim();
  if (!key) notFound();

  const w = await prisma.waitlist.findFirst({
    where: { slug: key, published: true },
    select: {
      id: true,
      title: true,
      courseBio: true,
      about: true,
      slug: true,
      trustedBy: true,
      thumbnailUrl: true,
      bannerVideoUrl: true,
      currency: true,
      priceAmount: true,
      buttonLabel: true,
      launchDate: true,
      owner: {
        select: {
          fullName: true,
          name: true,
          username: true,
          handle: true,
          image: true,
        },
      },
      media: {
        orderBy: { displayOrder: "asc" },
        select: { kind: true, url: true },
      },
      benefits: {
        orderBy: { displayOrder: "asc" },
        select: { text: true },
      },
      socials: {
        select: {
          websiteUrl: true,
          youtubeUrl: true,
          instagramUrl: true,
          linkedinUrl: true,
          facebookUrl: true,
          xUrl: true,
        },
      },
      faqs: {
        orderBy: { displayOrder: "asc" },
        select: { question: true, answer: true },
      },
    },
  });

  if (!w) notFound();

  const ownerName = w.owner?.fullName || w.owner?.name || w.owner?.username || w.owner?.handle || "Creator";

  const slides = w.media.map((m) => ({
    type: m.kind === "VIDEO" ? ("video" as const) : ("image" as const),
    src: m.url,
  }));
  if (!slides.length && w.thumbnailUrl) slides.push({ type: "image", src: w.thumbnailUrl });

  const safeHandle = (url?: string | null) => {
    if (!url) return "";
    try {
      const u = new URL(url);
      return u.pathname.replace(/^\//, "") || u.host || url;
    } catch {
      return url;
    }
  };

  const socials = [
    w.socials?.instagramUrl && { label: "Instagram", handle: safeHandle(w.socials.instagramUrl), icon: "/insta.png", href: w.socials.instagramUrl },
    w.socials?.facebookUrl && { label: "Facebook", handle: safeHandle(w.socials.facebookUrl), icon: "/facebook.png", href: w.socials.facebookUrl },
    w.socials?.linkedinUrl && { label: "LinkedIn", handle: safeHandle(w.socials.linkedinUrl), icon: "/linkedin.png", href: w.socials.linkedinUrl },
    w.socials?.xUrl && { label: "X", handle: safeHandle(w.socials.xUrl), icon: "/x.png", href: w.socials.xUrl },
    w.socials?.youtubeUrl && { label: "YouTube", handle: safeHandle(w.socials.youtubeUrl), icon: "/youtube.png", href: w.socials.youtubeUrl },
    w.socials?.websiteUrl && { label: "Website", handle: safeHandle(w.socials.websiteUrl), icon: "/link.png", href: w.socials.websiteUrl },
  ].filter(Boolean) as { label: string; handle: string; icon: string; href: string }[];

  const data: WaitListData = {
    id: w.id,
    ownerName,
    ownerImage: w.owner?.image || "/user.jpg",
    buttonLabel: w.buttonLabel || (w.priceAmount != null ? `Join for ₹${(w.priceAmount).toFixed(0)}` : "Join"),
    features: w.benefits.map((b) => b.text),
    socials,
    faqs: w.faqs.map((f) => ({ q: f.question, a: f.answer })),
    slides,
    bannerVideoUrl: w.bannerVideoUrl || undefined,
    titleOverride: w.title,
    subTextOverride: w.courseBio || undefined,
    launchDate: w.launchDate ? w.launchDate.toISOString() : undefined,
    aboutOverride: w.about || undefined,
    trustedBy: w.trustedBy || 0,
    currency: w.currency || undefined,
    priceAmount: w.priceAmount || undefined,
    slug: w.slug ?? '',
  };

  return <WaitListPageWrapper serverData={data} />;
}
