"use client";

import { useRef, useState } from "react";
import { ShareActions } from "./ShareActions";

const SITE_URL = "https://vnmsfx.com";

const TRAILERS = [
  {
    slug: "delivered-on-god",
    badge: "Trailer 01",
    eyebrow: "Coming soon · New VNMSFX show",
    titleLines: ["Delivered.", "On God."],
    shareTitle: "Delivered. On God.",
    src: "/videos/delivered-on-god/trailer.mp4",
    poster: "/work/delivered-on-god/poster.jpg",
    ariaLabel: "Delivered. On God coming soon trailer",
    body: "Boris, Chrome, and Roza take one cursed courier job and discover the package has better survival instincts than the crew.",
  },
  {
    slug: "one-paper-no-brakes",
    badge: "Trailer 02",
    eyebrow: "Coming soon · New VNMSFX show",
    titleLines: ["One Paper,", "No Brakes."],
    shareTitle: "One Paper, No Brakes.",
    src: "/videos/paperwork-apocalypse/trailer.mp4",
    poster: "/work/paperwork-apocalypse/poster.jpg",
    ariaLabel: "One Paper, No Brakes coming soon trailer",
    body: "A prestige action-comedy about one sacred document, several catastrophic motorcycle choices, and a fuzzy courier who has absolutely not signed the waiver.",
  },
] as const;

function getTrailerShareUrl(slug: string) {
  return `${SITE_URL}/#trailer-${slug}`;
}

export function ComingSoonShow() {
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const [unmutedIndex, setUnmutedIndex] = useState<number | null>(null);

  function setVideoRef(index: number) {
    return (node: HTMLVideoElement | null) => {
      videoRefs.current[index] = node;
    };
  }

  function toggleMute(index: number) {
    const shouldUnmute = unmutedIndex !== index;

    if (shouldUnmute) {
      document.querySelectorAll("audio").forEach((audio) => {
        audio.pause();
      });
    }

    videoRefs.current.forEach((video, videoIndex) => {
      if (!video) {
        return;
      }

      const isCurrentVideo = videoIndex === index;
      video.muted = !(shouldUnmute && isCurrentVideo);

      if (shouldUnmute && isCurrentVideo && video.paused) {
        void video.play().catch(() => undefined);
      }
    });

    setUnmutedIndex(shouldUnmute ? index : null);
  }

  return (
    <section
      id="coming-soon"
      aria-labelledby="coming-soon-title"
      className="bg-black text-cream border-y-2 border-black px-5 md:px-14 py-10 md:py-16"
    >
      <div className="mb-7 md:mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 text-[10px] md:text-[11px] font-extrabold uppercase tracking-[0.16em]">
            <span className="block h-2.5 w-2.5 bg-lime" />
            <span>New shows from the network</span>
          </div>
          <h2
            id="coming-soon-title"
            className="font-display text-[clamp(42px,8vw,98px)] leading-[0.86] uppercase tracking-normal"
          >
            Coming Soon.
          </h2>
        </div>
        <p className="font-serif italic text-[17px] md:text-[22px] leading-[1.25] max-w-[500px] md:text-right">
          Fresh fever dreams, cut loud and built for the scroll.
        </p>
      </div>

      <div className="-mx-5 md:-mx-14 overflow-x-auto px-5 md:px-14 pb-2 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-5 md:gap-7">
          {TRAILERS.map((trailer, index) => {
            const isUnmuted = unmutedIndex === index;

            return (
              <article
                key={trailer.src}
                id={`trailer-${trailer.slug}`}
                className="shrink-0 snap-center w-[88vw] sm:w-[82vw] lg:w-[72vw] xl:w-[62vw] max-w-[1120px] overflow-hidden border-2 border-cream bg-cream text-black shadow-[8px_8px_0_#C2FF3F]"
              >
                <div className="relative aspect-video bg-black border-b-2 border-cream">
                  <video
                    ref={setVideoRef(index)}
                    className="h-full w-full object-cover"
                    src={trailer.src}
                    poster={trailer.poster}
                    data-background-video="true"
                    autoPlay
                    muted={unmutedIndex !== index}
                    loop
                    playsInline
                    preload={index === 0 ? "auto" : "metadata"}
                    aria-label={trailer.ariaLabel}
                  />
                  <div className="absolute left-3 top-3 md:left-4 md:top-4 flex items-center gap-2">
                    <span
                      className={`border-2 border-black px-3 py-2 text-[10px] md:text-[11px] font-extrabold uppercase tracking-[0.12em] ${
                        index === 0 ? "bg-lime" : "bg-lavender"
                      }`}
                    >
                      {trailer.badge}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleMute(index)}
                    className="absolute top-3 right-3 md:top-4 md:right-4 bg-lime text-black px-4 py-3 text-[11px] md:text-xs font-extrabold uppercase tracking-[0.1em] border-2 border-black hover:bg-cream transition-colors"
                    aria-pressed={isUnmuted}
                  >
                    {isUnmuted ? "Mute" : "Unmute"}
                  </button>
                </div>

                <div className="grid gap-5 md:grid-cols-[minmax(0,0.95fr)_minmax(260px,0.65fr)] md:items-end p-5 md:p-7">
                  <div className="flex flex-col gap-4">
                    <span className="text-[10px] md:text-[11px] font-extrabold uppercase tracking-[0.16em]">
                      {trailer.eyebrow}
                    </span>
                    <h3 className="font-display text-[clamp(38px,7vw,86px)] leading-[0.86] uppercase tracking-normal">
                      {trailer.titleLines.map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))}
                    </h3>
                  </div>
                  <div className="flex flex-col gap-4">
                    <p className="font-serif italic text-[17px] md:text-[22px] leading-[1.22]">
                      {trailer.body}
                    </p>
                    <ShareActions
                      url={getTrailerShareUrl(trailer.slug)}
                      title={trailer.shareTitle}
                      text={`${trailer.shareTitle} coming soon from VNMSFX`}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
