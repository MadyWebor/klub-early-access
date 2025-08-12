import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "klub-waitlist | Creator wait-list setup",
    description: "Waitlist setup for creator.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return children;
}
