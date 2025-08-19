export type WaitListData = {
  ownerName: string;
  ownerImage?: string;
  buttonLabel?: string;
  features: string[];
  socials: { label: string; handle: string; icon: string; href: string }[];
  faqs: { q: string; a: string }[];
  slides: { type: "image" | "video"; src: string }[];
  bannerVideoUrl?: string;
  titleOverride?: string;
  subTextOverride?: string;
  launchDate?: string;
  aboutOverride?: string;
  trustedBy?: number;
  currency?: string;
  priceAmount?: number;
  slug?: string;
};