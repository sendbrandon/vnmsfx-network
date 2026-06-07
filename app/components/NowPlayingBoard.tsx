"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { getDefaultHandleUrl, type InspiredBy } from "../lib/audience";
import { ShareActions } from "./ShareActions";

const SITE_URL = "https://vnmsfx.com";

export type Episode = {
  episodeNumber: number;
  title: string;
  body: string;
  poster: string;
  video: string;
  inspired_by?: InspiredBy;
};

export type Work = {
  slug: string;
  category: string;
  meta: string;
  title: string;
  body: string;
  poster: string;
  video: string;
  // When present, the show is multi-episode and displays an episode strip below the body.
  episodes?: Episode[];
  // Player aspect ratio — defaults to 16/9. Use 4/3 for puppet shows.
  aspect?: number;
  // Episode strip thumbnail aspect — defaults to 4/3.
  episodeAspect?: number;
  presentation?: "standard" | "vertical";
};

type ActiveContent = {
  title: string;
  body: string;
  poster: string;
  video: string;
  category: string;
  meta: string;
  inspired_by?: InspiredBy;
  episodeLabel?: string;
};

function getActiveContent(work: Work, epIndex: number): ActiveContent {
  if (work.episodes && work.episodes[epIndex]) {
    const ep = work.episodes[epIndex];
    return {
      title: `${work.title} — ${ep.title}`,
      body: ep.body,
      poster: ep.poster,
      video: ep.video,
      inspired_by: ep.inspired_by,
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

function getEpisodeShareUrl(work: Work, epIndex: number) {
  const url = new URL(`/${work.slug}`, SITE_URL);
  const episode = work.episodes?.[epIndex];

  if (episode) {
    url.searchParams.set("episode", String(episode.episodeNumber));
  }

  url.hash = "player";
  return url.toString();
}

function getEpisodeShareTitle(work: Work, epIndex: number) {
  const episode = work.episodes?.[epIndex];

  if (!episode) {
    return work.title;
  }

  return `${work.title} EP ${String(episode.episodeNumber).padStart(2, "0")}: ${
    episode.title
  }`;
}

export function NowPlayingBoard({ work }: { work: Work }) {
  const [episodeIndex, setEpisodeIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const content = getActiveContent(work, episodeIndex);
  const shareUrl = getEpisodeShareUrl(work, episodeIndex);
  const shareTitle = getEpisodeShareTitle(work, episodeIndex);

  useEffect(() => {
    if (!work.episodes?.length) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const showParam = params.get("show");
    const isShowPage = window.location.pathname.includes(work.slug);

    if (!isShowPage && showParam !== work.slug) {
      return;
    }

    const requestedEpisode = Number.parseInt(params.get("episode") ?? "", 10);

    if (!Number.isFinite(requestedEpisode)) {
      return;
    }

    const requestedIndex = work.episodes.findIndex(
      (episode) => episode.episodeNumber === requestedEpisode,
    );

    if (requestedIndex >= 0) {
      setEpisodeIndex(requestedIndex);
    }
  }, [work.episodes, work.slug]);

  // When the active episode changes while playing, autoPlay handles starting it.
  useEffect(() => {
    if (playing && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [episodeIndex, playing]);

  const handleEpisodeClick = (epIdx: number) => {
    setEpisodeIndex(epIdx);
    setPlaying(true);
    requestAnimationFrame(() => {
      playerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  };

  const playerAspect = work.aspect ?? 16 / 9;
  const epAspect = work.episodeAspect ?? 4 / 3;
  const isVertical = work.presentation === "vertical" || playerAspect < 0.75;

  const playerSlot = (
    <div
      ref={playerRef}
      className={`relative w-full overflow-hidden scroll-mt-20 ${
        isVertical
          ? "mx-auto max-w-[300px] shadow-[0_18px_50px_rgba(0,0,0,0.16)] sm:max-w-[340px] md:max-w-[380px] lg:max-w-[430px]"
          : ""
      }`}
      style={{ aspectRatio: String(playerAspect) }}
    >
      {playing ? (
        <video
          key={`${work.slug}-${episodeIndex}`}
          ref={videoRef}
          src={content.video}
          poster={content.poster}
          controls
          autoPlay
          playsInline
          onEnded={() => setPlaying(false)}
          className="h-full w-full object-cover bg-transparent"
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
            sizes={
              isVertical
                ? "(max-width: 768px) 300px, 430px"
                : "(max-width: 1024px) 100vw, 1100px"
            }
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
  );

  return (
    <div className="flex flex-col gap-6 md:gap-10">
      <div className="flex flex-col gap-4 md:gap-6">
        <div
          className={
            isVertical
              ? "grid gap-4 md:gap-6 lg:grid-cols-[minmax(0,0.94fr)_minmax(300px,430px)] lg:items-stretch"
              : "flex flex-col gap-4 md:gap-6"
          }
        >
          {isVertical ? (
            <div className="order-2 flex items-center justify-center lg:order-2">
              {playerSlot}
            </div>
          ) : (
            playerSlot
          )}

          <div
            className={
              isVertical
                ? "order-1 flex flex-col justify-between gap-6 border-2 border-black p-5 md:p-7 lg:order-1"
                : "flex flex-col gap-5 md:flex-row md:items-end md:justify-between"
            }
          >
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
              {content.inspired_by && (
                <InspiredByLine credit={content.inspired_by} />
              )}
            </div>
            <ShareActions
              url={shareUrl}
              title={shareTitle}
              text={`Watch ${shareTitle} on VNMSFX`}
            />
          </div>
        </div>

        {/* Episode strip — only renders for multi-episode shows */}
        {work.episodes && work.episodes.length > 1 && (
          <EpisodeStrip
            episodes={work.episodes}
            activeIndex={episodeIndex}
            onClick={handleEpisodeClick}
            playing={playing}
            aspect={epAspect}
            isVertical={isVertical}
            workTitle={work.title}
            getShareUrl={(idx) => getEpisodeShareUrl(work, idx)}
          />
        )}
      </div>
    </div>
  );
}

function InspiredByLine({ credit }: { credit: InspiredBy }) {
  const handle = credit.handle.startsWith("@")
    ? credit.handle
    : `@${credit.handle}`;
  const href = credit.url ?? getDefaultHandleUrl(handle);

  return (
    <p className="text-[12px] md:text-[13px] leading-[1.4] font-bold tracking-[0.04em] uppercase max-w-[640px]">
      <span aria-hidden>📡 </span>
      Inspired by a {credit.reportType} report from{" "}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-current/40 underline-offset-4 hover:decoration-current"
      >
        {handle}
      </a>
    </p>
  );
}

function EpisodeStrip({
  episodes,
  activeIndex,
  onClick,
  playing,
  aspect,
  isVertical,
  workTitle,
  getShareUrl,
}: {
  episodes: Episode[];
  activeIndex: number;
  onClick: (idx: number) => void;
  playing: boolean;
  aspect: number;
  isVertical: boolean;
  workTitle: string;
  getShareUrl: (idx: number) => string;
}) {
  return (
    <div className="flex flex-col gap-3 pt-3 md:pt-4 border-t-[1.5px] border-current/30">
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
          const shareTitle = `${workTitle} EP ${String(ep.episodeNumber).padStart(
            2,
            "0",
          )}: ${ep.title}`;

          return (
            <article
              key={ep.episodeNumber}
              className={`snap-start flex flex-col gap-2 shrink-0 ${
                isVertical
                  ? "w-[136px] sm:w-[154px] md:w-[174px]"
                  : "w-[220px] sm:w-[240px] md:w-[260px]"
              }`}
            >
              <button
                type="button"
                onClick={() => onClick(i)}
                aria-pressed={isActive}
                aria-label={`Play episode ${ep.episodeNumber}: ${ep.title}`}
                className="flex flex-col gap-2 text-left group cursor-pointer"
              >
                <div
                  className={`relative w-full overflow-hidden border-2 transition-all ${
                    isActive
                      ? "border-lime shadow-[0_0_0_3px_#C2FF3F33]"
                      : "border-transparent group-hover:border-current"
                  }`}
                  style={{ aspectRatio: String(aspect) }}
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
                      {isActive && playing ? (
                        <PauseBars />
                      ) : (
                        <PlayTriangle size={12} />
                      )}
                    </span>
                  </div>
                  <div className="absolute top-2 left-2 bg-black/85 text-cream text-[9px] font-extrabold tracking-[0.14em] uppercase px-2 py-1">
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
              <ShareActions
                compact
                url={getShareUrl(i)}
                title={shareTitle}
                text={`Watch ${shareTitle} on VNMSFX`}
              />
            </article>
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
