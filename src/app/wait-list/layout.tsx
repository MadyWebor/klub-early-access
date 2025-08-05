import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "klub-waitlist | Creator wait-list",
    description: "Waitlist for creator.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return children;
}
