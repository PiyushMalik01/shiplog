import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ShipLog — AI-Powered Changelog & Roadmap",
  description: "Turn messy developer notes into polished, user-facing changelogs in seconds with AI.",
  keywords: ["changelog", "roadmap", "AI", "SaaS", "indie maker"],
  openGraph: {
    title: "ShipLog",
    description: "Ship faster. Communicate better.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="font-sans bg-background text-primary antialiased">
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
