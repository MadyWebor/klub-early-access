import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";


// Load Poppins font only
const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"], // Add more if needed
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "klub-waitlist | Creator Signin",
  description: "Signin for creator.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} antialiased`}
        style={{ fontFamily: "var(--font-poppins), sans-serif" }}
      >
        <div className="w-screen h-screen overflow-hidden">
          {children}
          <Toaster position="top-center" reverseOrder={false} />
        </div>
      </body>
    </html>
  );
}
