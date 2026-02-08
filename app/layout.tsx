import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import NavBar from "./components/NavBar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
});

export const metadata: Metadata = {
  title: "Games Hub — Instant Browser Arcade",
  description:
    "A premium collection of lightweight, instant-play browser games. Zero install, zero friction, just pure fun. Featuring classics like Snake, 2048, and more.",
  keywords: [
    "Games Hub",
    "Browser Games",
    "Arcade",
    "Next.js Games",
    "Snake",
    "2048",
    "Brick Breaker",
    "Online Arcade",
    "Corey Burns",
  ],
  authors: [{ name: "Corey Burns" }],
  openGraph: {
    title: "Games Hub — Instant Browser Arcade",
    description: "Pick your challenge and play instantly in your browser.",
    type: "website",
    siteName: "Games Hub",
  },
  twitter: {
    card: "summary_large_image",
    title: "Games Hub — Instant Browser Arcade",
    description: "Pick your challenge and play instantly in your browser.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>
        <NavBar />
        {children}
      </body>
    </html>
  );
}
