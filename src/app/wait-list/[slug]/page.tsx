// app/w/[idOrSlug]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import WaitList from "./UI";

// tolerate undefined & empty strings
function isProbableId(s?: string) {
    if (!s) return false;
    return /^[a-z0-9]+$/i.test(s) && s.length >= 6;
}

export default async function PublicWaitlistPage({
    params,
}: { params?: { slug?: string } }) {
    const key = params?.slug?.trim();
    if (!key) notFound(); // no slug in URL -> 404

    const w = await prisma.waitlist.findFirst({
        where: { slug: key, published: true },
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
            buttonLabel: true,
            launchDate: true,
            owner: {
                select: {
                    fullName: true, name: true, username: true, handle: true, image: true,
                },
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
    console.log(w)

    if (!w) notFound();

    const ownerName =
        w.owner?.fullName || w.owner?.name || w.owner?.username || w.owner?.handle || "Creator";

    const slides = w.media.map((m) => ({
        type: m.kind === "VIDEO" ? ("video" as const) : ("image" as const),
        src: m.url,
    }));
    if (!slides.length && w.thumbnailUrl) {
        slides.push({ type: "image" as const, src: w.thumbnailUrl });
    }

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
        w.socials?.instagramUrl && { label: "Instagram", handle: safeHandle(w.socials.instagramUrl), icon: "/insta.png", href: w.socials.instagramUrl! },
        w.socials?.facebookUrl && { label: "Facebook", handle: safeHandle(w.socials.facebookUrl), icon: "/facebook.png", href: w.socials.facebookUrl! },
        w.socials?.linkedinUrl && { label: "LinkedIn", handle: safeHandle(w.socials.linkedinUrl), icon: "/linkedin.png", href: w.socials.linkedinUrl! },
        w.socials?.xUrl && { label: "X", handle: safeHandle(w.socials.xUrl), icon: "/x.png", href: w.socials.xUrl! },
        w.socials?.youtubeUrl && { label: "YouTube", handle: safeHandle(w.socials.youtubeUrl), icon: "/youtube.png", href: w.socials.youtubeUrl! },
        w.socials?.websiteUrl && { label: "Website", handle: safeHandle(w.socials.websiteUrl), icon: "/link.png", href: w.socials.websiteUrl! },
    ].filter(Boolean) as { label: string; handle: string; icon: string; href: string }[];

    return (
        <WaitList
            ownerName={ownerName}
            ownerImage={w.owner?.image || "/user.jpg"}
            buttonLabel={
                w.buttonLabel ||
                (w.priceAmount != null ? `Join for ₹${(w.priceAmount / 100).toFixed(0)}` : "Join")
            }
            features={w.benefits.map((b) => b.text)}
            socials={socials}
            faqs={w.faqs.map((f) => ({ q: f.question, a: f.answer }))}
            slides={slides}
            bannerVideoUrl={w.bannerVideoUrl || undefined}
            titleOverride={w.title}
            subTextOverride={w.courseBio || undefined}
            launchDate={w.launchDate ? w.launchDate.toISOString() : undefined}
            aboutOverride={w.about || undefined}
        />
    );
}
