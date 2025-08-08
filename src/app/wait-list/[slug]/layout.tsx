import type { Metadata } from "next";
import { Fustat } from "next/font/google"; // ✅ Only Fustat now

// Load Fustat font
const fustat = Fustat({
  variable: "--font-fustat",
  weight: ["400", "500", "600", "700"], // Adjust weights if needed
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "klub-waitlist | Creator",
  description: "Wait-list of Creator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`${fustat.variable} antialiased w-screen h-screen overflow-hidden`}
      style={{ fontFamily: "var(--font-fustat), sans-serif" }}
    >
      {children}
    </div>
  );
}
