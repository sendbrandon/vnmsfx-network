import type { Work } from "../components/NowPlayingBoard";

const SITE_URL = "https://vnmsfx.com";

export function buildShowSchema(show: Work) {
  const showUrl = `${SITE_URL}/${show.slug}`;
  const seasonNumber = show.meta?.match(/S(\d+)/i)?.[1] ?? "1";

  const episodes =
    show.episodes?.map((ep) => {
      const epUrl = `${SITE_URL}${ep.video}`;
      const posterUrl = `${SITE_URL}${ep.poster}`;
      return {
        "@type": "TVEpisode",
        episodeNumber: ep.episodeNumber,
        name: ep.title,
        description: ep.body,
        url: showUrl,
        image: posterUrl,
        partOfSeason: {
          "@type": "TVSeason",
          seasonNumber: Number(seasonNumber),
        },
        partOfSeries: {
          "@type": "TVSeries",
          name: show.title,
          url: showUrl,
        },
        video: {
          "@type": "VideoObject",
          name: ep.title,
          description: ep.body,
          thumbnailUrl: [posterUrl],
          uploadDate: "2026-05-13",
          contentUrl: epUrl,
          embedUrl: showUrl,
          publisher: {
            "@type": "Organization",
            name: "VNMSFX",
            url: SITE_URL,
            logo: {
              "@type": "ImageObject",
              url: `${SITE_URL}/brand/vnmsfx-logo-black.png`,
            },
          },
          inLanguage: "en",
          isFamilyFriendly: true,
        },
      };
    }) ?? [];

  return {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    name: show.title,
    alternateName: show.title.toUpperCase(),
    url: showUrl,
    description: show.body,
    image: `${SITE_URL}${show.poster}`,
    numberOfEpisodes: episodes.length,
    numberOfSeasons: 1,
    genre: ["Comedy", "Short-form", "AI Video"],
    inLanguage: "en",
    productionCompany: {
      "@type": "Organization",
      name: "VNMSFX",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "VNMSFX",
      url: SITE_URL,
    },
    containsSeason: {
      "@type": "TVSeason",
      seasonNumber: Number(seasonNumber),
      numberOfEpisodes: episodes.length,
      episode: episodes,
    },
  };
}
