"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type Episode = {
  episodeNumber: number;
  title: string;
  body: string;
  poster: string;
  video: string;
};

export type Work = {
  slug: string;
  category: string;
  meta: string;
  title: string;
  body: string;
  poster: string;
  video: string;
  // When present, the show is multi-episode and the card opens to ep01 with an episode strip.
  episodes?: Episode[];
};

type ActiveContent = {
  title: string;
  body: string;
  poster: string;
  video: string;
  category: string;
  meta: string;
  episodeLabel?: string; // "EP 02 OF 3" when applicable
};

function getActiveContent(work: Work, epIndex: number): ActiveContent {
  if (work.episodes && work.episodes[epIndex]) {
    const ep = work.episodes[epIndex];
    return {
      title: `${work.title} — ${ep.title}`,
      body: ep.body,
      poster: ep.poster,
      video: ep.video,
      category: work.category,
      meta: work.meta,
      episodeLabel: `EP ${String(ep.episodeNumber).padStart(2, "0")} OF ${work.episodes.length}`,
    };
  }
  return {
    title: work.title,
    body: work.body,
    poster: work.poster,
    video: work.video,
    category: work.category,
    meta: work.meta,
  };
}

export function NowPlayingBoard({ works }: { works: Work[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [episodeIndex, setEpisodeIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  const active = works[activeIndex];
  const content = getActiveContent(active, episodeIndex);

  // When the active video changes while we're in playing mode, autoPlay handles starting it.
  useEffect(() => {
    if (playing && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [activeIndex, episodeIndex, playing]);

  const handleCardClick = (idx: number) => {
    setActiveIndex(idx);
    setEpisodeIndex(0); // always start from ep01 when switching shows
    setPlaying(true);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      requestAnimationFrame(() => {
        playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  const handleEpisodeClick = (epIdx: number) => {
    setEpisodeIndex(epIdx);
    setPlaying(true);
  };

  return (
    <div className="flex flex-col gap-6 md:gap-10">
      {/* Player slot */}
      <div ref={playerRef} className="flex flex-col gap-4 md:gap-6 scroll-mt-14">
        <div className="relative w-full bg-black overflow-hidden" style={{ aspectRatio: "16 / 9" }}>
          {playing ? (
            <video
              key={`${active.slug}-${episodeIndex}`}
              ref={videoRef}
              src={content.video}
              poster={content.poster}
              controls
              autoPlay
              playsInline
              onEnded={() => setPlaying(false)}
              className="w-full h-full object-contain bg-black"
            >
              Your browser does not support HTML5 video.{" "}
              <a href={content.video}>Download {content.title}</a>.
            </video>
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label={`Play ${content.title}`}
              className="block absolute inset-0 group cursor-pointer"
            >
              <Image
                src={content.poster}
                alt={content.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 1100px"
                className="object-cover group-hover:scale-[1.01] transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/0 pointer-events-none" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-lime flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                  <span
                    aria-hidden
                    className="block w-0 h-0"
                    style={{
                      borderTop: "16px solid transparent",
                      borderBottom: "16px solid transparent",
                      borderLeft: "26px solid #000",
                      marginLeft: 6,
                    }}
                  />
                </span>
              </div>
            </button>
          )}
        </div>

        {/* Active info */}
        <div className="flex flex-col gap-3 md:gap-4">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] md:text-[11px] font-bold tracking-[0.14em] uppercase">
            <span className="block w-2.5 h-2.5 rounded-full bg-lime" />
            <span>{playing ? "Now Playing" : "Up next"}</span>
            <span className="opacity-60">·</span>
            <span className="opacity-80">{content.category}</span>
            {content.episodeLabel && (
              <>
                <span className="opacity-60">·</span>
                <span className="opacity-80">{content.episodeLabel}</span>
              </>
            )}
            <span className="opacity-60 hidden sm:inline">·</span>
            <span className="opacity-60 hidden sm:inline">{content.meta}</span>
          </div>
          <h3 className="font-display text-[clamp(28px,5.5vw,52px)] leading-[0.95] tracking-[-0.02em] uppercase">
            {content.title}
          </h3>
          <p className="text-[15px] md:text-base leading-[1.5] max-w-[640px]">
            {content.body}
          </p>
        </div>

        {/* Episode strip — only renders for multi-episode shows */}
        {active.episodes && active.episodes.length > 1 && (
          <EpisodeStrip
            episodes={active.episodes}
            activeIndex={episodeIndex}
            onClick={handleEpisodeClick}
            playing={playing}
          />
        )}
      </div>

      {/* Show queue: 4 equal cards */}
      <div className="border-t-[1.5px] border-black pt-6 md:pt-8">
        <div className="flex items-center justify-between mb-4 md:mb-5">
          <div className="text-[10px] md:text-[11px] font-bold tracking-[0.14em] uppercase">
            ↓ The Queue
          </div>
          <div className="text-[10px] md:text-[11px] font-bold tracking-[0.1em] uppercase opacity-60">
            {works.length} shows
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {works.map((w, i) => {
            const isActive = i === activeIndex;
            const epCount = w.episodes?.length ?? 1;
            return (
              <button
                key={w.slug}
                type="button"
                onClick={() => handleCardClick(i)}
                aria-pressed={isActive}
                aria-label={`Play ${w.title}`}
                className="flex flex-col gap-2.5 md:gap-3 text-left group cursor-pointer"
              >
                <div
                  className={`relative w-full overflow-hidden border-2 transition-all ${
                    isActive
                      ? "border-lime shadow-[0_0_0_4px_#C2FF3F33]"
                      : "border-transparent group-hover:border-black"
                  }`}
                  style={{ aspectRatio: "16 / 9" }}
                >
                  <Image
                    src={w.poster}
                    alt={w.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                    <span
                      className={`w-12 h-12 rounded-full bg-lime flex items-center justify-center transition-opacity ${
                        isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      {isActive && playing ? <PauseBars /> : <PlayTriangle size={14} />}
                    </span>
                  </div>
                  {isActive && (
                    <div className="absolute top-2 left-2 bg-lime text-black text-[9px] font-extrabold tracking-[0.12em] uppercase px-2 py-1">
                      ● {playing ? "Playing" : "Selected"}
                    </div>
                  )}
                  {epCount > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/80 text-cream text-[9px] font-extrabold tracking-[0.12em] uppercase px-2 py-1">
                      {epCount} EPS
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-[9px] md:text-[10px] font-bold tracking-[0.12em] uppercase opacity-70">
                    {w.category}
                  </div>
                  <div className="font-display text-[16px] md:text-[18px] leading-[1.05] tracking-[-0.02em] uppercase">
                    {w.title}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EpisodeStrip({
  episodes,
  activeIndex,
  onClick,
  playing,
}: {
  episodes: Episode[];
  activeIndex: number;
  onClick: (idx: number) => void;
  playing: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 pt-3 md:pt-4 border-t-[1.5px] border-black/30">
      <div className="flex items-center justify-between">
        <div className="text-[10px] md:text-[11px] font-bold tracking-[0.14em] uppercase">
          ▸ Episodes ({episodes.length})
        </div>
        <div className="text-[10px] md:text-[11px] font-bold tracking-[0.1em] uppercase opacity-60">
          Tap to play
        </div>
      </div>
      <div className="flex gap-3 md:gap-4 overflow-x-auto -mx-5 px-5 md:mx-0 md:px-0 snap-x snap-mandatory scroll-smooth pb-2">
        {episodes.map((ep, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={ep.episodeNumber}
              type="button"
              onClick={() => onClick(i)}
              aria-pressed={isActive}
              aria-label={`Play episode ${ep.episodeNumber}: ${ep.title}`}
              className="snap-start flex flex-col gap-2 text-left group cursor-pointer shrink-0 w-[180px] sm:w-[220px] md:w-[260px]"
            >
              <div
                className={`relative w-full overflow-hidden border-2 transition-all ${
                  isActive
                    ? "border-lime shadow-[0_0_0_3px_#C2FF3F33]"
                    : "border-transparent group-hover:border-black"
                }`}
                style={{ aspectRatio: "4 / 3" }}
              >
                <Image
                  src={ep.poster}
                  alt={`${ep.title} — Episode ${ep.episodeNumber}`}
                  fill
                  sizes="(max-width: 768px) 220px, 260px"
                  className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                  <span
                    className={`w-10 h-10 rounded-full bg-lime flex items-center justify-center transition-opacity ${
                      isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {isActive && playing ? <PauseBars /> : <PlayTriangle size={12} />}
                  </span>
                </div>
                <div className="absolute top-2 left-2 bg-black text-cream text-[9px] font-extrabold tracking-[0.14em] uppercase px-2 py-1">
                  EP {String(ep.episodeNumber).padStart(2, "0")}
                </div>
                {isActive && (
                  <div className="absolute top-2 right-2 bg-lime text-black text-[9px] font-extrabold tracking-[0.12em] uppercase px-2 py-1">
                    ●
                  </div>
                )}
              </div>
              <div className="font-display text-[14px] md:text-[15px] leading-[1.05] tracking-[-0.01em] uppercase">
                {ep.title}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PlayTriangle({ size = 16 }: { size?: number }) {
  return (
    <span
      aria-hidden
      className="block w-0 h-0"
      style={{
        borderTop: `${size * 0.6}px solid transparent`,
        borderBottom: `${size * 0.6}px solid transparent`,
        borderLeft: `${size}px solid #000`,
        marginLeft: 3,
      }}
    />
  );
}

function PauseBars() {
  return (
    <span aria-hidden className="flex gap-1">
      <span className="block w-1 h-3 bg-black" />
      <span className="block w-1 h-3 bg-black" />
    </span>
  );
}
