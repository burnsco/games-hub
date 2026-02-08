import type { MetadataRoute } from "next";
import { games } from "./data/games";

const DOMAIN = "https://games-hub.coreyburns.ca";

export default function sitemap(): MetadataRoute.Sitemap {
  const gameUrls = games.map((game) => ({
    url: `${DOMAIN}${game.path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: DOMAIN,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: `${DOMAIN}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    ...gameUrls,
  ];
}
