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
  metadataBase: new URL("https://games-hub.coreyburns.ca"),
  title: {
    default: "Games Hub — Instant Browser Arcade",
    template: "%s | Games Hub",
  },
  description:
    "A premium collection of lightweight, instant-play browser games. Zero install, zero friction, just pure fun. Featuring classics like Snake, 2048, and Brick Breaker.",
  keywords: [
    "Games Hub",
    "Browser Games",
    "Arcade",
    "Next.js Games",
    "Snake",
    "2048",
    "Brick Breaker",
    "Online Arcade",
    "Retro Games",
    "Free Online Games",
    "Corey Burns",
  ],
  authors: [{ name: "Corey Burns" }],
  creator: "Corey Burns",
  publisher: "Corey Burns",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Games Hub — Instant Browser Arcade",
    description:
      "Pick your challenge and play instantly in your browser. No downloads, just pure gaming.",
    url: "https://games-hub.coreyburns.ca",
    siteName: "Games Hub",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Games Hub — Instant Browser Arcade",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Games Hub — Instant Browser Arcade",
    description:
      "Pick your challenge and play instantly in your browser. No downloads, just pure gaming.",
    images: ["/og-image.png"],
    creator: "@coreyburns",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires this
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Games Hub",
              url: "https://games-hub.coreyburns.ca",
              description: "A premium collection of lightweight, instant-play browser games.",
              author: {
                "@type": "Person",
                name: "Corey Burns",
              },
              potentialAction: {
                "@type": "SearchAction",
                target: "https://games-hub.coreyburns.ca/?search={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
