import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: "https://vnmsfx.com",
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://vnmsfx.com/portfolio",
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: "https://vnmsfx.com/gptea",
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: "https://vnmsfx.com/chrome-run",
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: "https://vnmsfx.com/signal",
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: "https://vnmsfx.com/clips",
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://vnmsfx.com/hank-beans-roar",
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://vnmsfx.com/checkpoint-chisme",
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://vnmsfx.com/rex-and-crow",
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];
}
