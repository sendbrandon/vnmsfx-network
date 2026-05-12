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
  ];
}
