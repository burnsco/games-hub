import { Helmet } from "react-helmet-async";
import { Outlet } from "react-router-dom";
import NavBar from "./components/NavBar";
import { SITE_URL } from "./site";

export default function RootLayout() {
  return (
    <>
      <Helmet>
        <meta
          name="description"
          content="A premium collection of lightweight, instant-play browser games. Zero install, zero friction, just pure fun. Featuring classics like Snake, 2048, and Brick Breaker."
        />
        <meta
          name="keywords"
          content="Games Hub, Browser Games, Arcade, Snake, Brick Breaker, Online Arcade, Retro Games, Free Online Games, Corey Burns"
        />
        <meta name="author" content="Corey Burns" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Games Hub" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@coreyburns" />
        <meta name="twitter:image" content={`${SITE_URL}/og-image.png`} />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <NavBar />
      <Outlet />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires this
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Games Hub",
            url: SITE_URL,
            description: "A premium collection of lightweight, instant-play browser games.",
            author: {
              "@type": "Person",
              name: "Corey Burns",
            },
            potentialAction: {
              "@type": "SearchAction",
              target: `${SITE_URL}/?search={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />
    </>
  );
}
