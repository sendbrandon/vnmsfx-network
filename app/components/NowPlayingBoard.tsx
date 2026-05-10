"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type Work = {
  slug: string;
  category: string;
  meta: string;
  title: string;
  body: string;
  poster: string;
  video: string;
};

export function NowPlayingBoard({ works }: { works: Work[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  const active = works[activeIndex];

  // When the active video changes while we're in playing mode, the new
  // <video> element mounts fresh — autoPlay handles starting it.
  useEffect(() => {
    if (playing && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [activeIndex, playing]);

  const handleCardClick = (idx: number) => {
    setActiveIndex(idx);
    setPlaying(true);
    // Smooth-scroll the player into view on small screens so the user
    // sees the swap, not just a card highlight change off-screen.
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      requestAnimationFrame(() => {
        playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 md:gap-10">
      {/* Player slot */}
      <div ref={playerRef} className="flex flex-col gap-4 md:gap-6 scroll-mt-14">
        <div className="relative w-full bg-black overflow-hidden" style={{ aspectRatio: "16 / 9" }}>
          {playing ? (
            <video
              key={active.slug}
              ref={videoRef}
              src={active.video}
              poster={active.poster}
              controls
              autoPlay
              playsInline
              onEnded={() => setPlaying(false)}
              className="w-full h-full object-contain bg-black"
            >
              Your browser does not support HTML5 video.{" "}
              <a href={active.video}>Download {active.title}</a>.
            </video>
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label={`Play ${active.title}`}
              className="block absolute inset-0 group cursor-pointer"
            >
              <Image
                src={active.poster}
                alt={active.title}
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

        {/* Active video info */}
        <div className="flex flex-col gap-3 md:gap-4">
          <div className="flex items-center gap-3 text-[10px] md:text-[11px] font-bold tracking-[0.14em] uppercase">
            <span className="block w-2.5 h-2.5 rounded-full bg-lime" />
            <span>{playing ? "Now Playing" : "Up next"}</span>
            <span className="opacity-60">·</span>
            <span className="opacity-80">{active.category}</span>
            <span className="opacity-60 hidden sm:inline">·</span>
            <span className="opacity-60 hidden sm:inline">{active.meta}</span>
          </div>
          <h3 className="font-display text-[clamp(32px,6vw,56px)] leading-[0.95] tracking-[-0.02em] uppercase">
            {active.title}
          </h3>
          <p className="text-[15px] md:text-base leading-[1.5] max-w-[640px]">
            {active.body}
          </p>
        </div>
      </div>

      {/* Queue: all 4 videos as equal cards */}
      <div className="border-t-[1.5px] border-black pt-6 md:pt-8">
        <div className="flex items-center justify-between mb-4 md:mb-5">
          <div className="text-[10px] md:text-[11px] font-bold tracking-[0.14em] uppercase">
            ↓ The Queue
          </div>
          <div className="text-[10px] md:text-[11px] font-bold tracking-[0.1em] uppercase opacity-60">
            {works.length} drops
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {works.map((w, i) => {
            const isActive = i === activeIndex;
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
                      {isActive && playing ? (
                        <PauseBars />
                      ) : (
                        <PlayTriangle size={14} />
                      )}
                    </span>
                  </div>
                  {isActive && (
                    <div className="absolute top-2 left-2 bg-lime text-black text-[9px] font-extrabold tracking-[0.12em] uppercase px-2 py-1">
                      ● {playing ? "Playing" : "Selected"}
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
