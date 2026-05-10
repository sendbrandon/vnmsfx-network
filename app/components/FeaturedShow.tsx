"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export type FeaturedShowProps = {
  show: string;
  episodeMeta: string;
  episodeTitle: string;
  body: string;
  poster: string;
  video: string;
  // aspect: width/height ratio for the player. Default 16/9.
  aspect?: number;
};

export function FeaturedShow(props: FeaturedShowProps) {
  const [open, setOpen] = useState(false);

  return (
    <section
      id="hank-and-beans"
      className="bg-black text-cream border-y-2 border-black px-5 md:px-14 pt-12 md:pt-20 pb-14 md:pb-24 flex flex-col gap-8 md:gap-12 scroll-mt-14"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[10px] md:text-[11px] font-bold tracking-[0.14em] uppercase">
          <span className="block w-2.5 h-2.5 rounded-full bg-lime" />
          <span>NEW SHOW · PREMIERE</span>
        </div>
        <div className="text-[10px] md:text-[11px] font-bold tracking-[0.1em] uppercase opacity-70">
          {props.episodeMeta}
        </div>
      </div>

      <header className="flex flex-col gap-3 md:gap-4">
        <h2 className="font-display text-[clamp(54px,12vw,168px)] leading-[0.86] tracking-[-0.04em] uppercase">
          {props.show}
        </h2>
        <div className="font-serif italic text-[20px] md:text-[28px] leading-[1.2]">
          Episode 01 — &ldquo;{props.episodeTitle}&rdquo;
        </div>
      </header>

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Play ${props.show} — ${props.episodeTitle}`}
        className="block relative w-full overflow-hidden group cursor-pointer text-left"
        style={{ aspectRatio: String(props.aspect ?? 16 / 9) }}
      >
        <Image
          src={props.poster}
          alt={`${props.show} — ${props.episodeTitle}`}
          fill
          sizes="(max-width: 1024px) 100vw, 1100px"
          className="object-cover group-hover:scale-[1.01] transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/0 pointer-events-none" />
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
        <div className="absolute left-5 right-5 bottom-5 md:left-8 md:right-8 md:bottom-8 flex items-end justify-between gap-4">
          <div className="text-[11px] md:text-[13px] font-extrabold tracking-[0.08em] uppercase">
            ▶ Watch the pilot
          </div>
          <div className="text-[10px] md:text-[12px] font-bold tracking-[0.1em] uppercase opacity-80">
            14 sec · 4:3
          </div>
        </div>
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-12">
        <p className="font-serif italic text-[18px] md:text-[24px] leading-[1.4] max-w-[640px]">
          {props.body}
        </p>
        <a
          href="mailto:brandon@pushto6.com?subject=Subscribe%20me%20to%20Hank%20%26%20Beans&body=Notify%20me%20when%20Episode%2002%20drops."
          className="flex items-center gap-3.5 shrink-0 group self-stretch md:self-end justify-between md:justify-end border-t border-cream/30 md:border-t-0 pt-4 md:pt-0"
        >
          <span className="text-[11px] md:text-xs font-extrabold tracking-[0.08em] uppercase">
            Get notified for Ep. 02
          </span>
          <span className="w-12 h-12 md:w-14 md:h-14 bg-lime flex items-center justify-center text-black text-[20px] md:text-[22px] group-hover:bg-[#a8e632] transition-colors">
            →
          </span>
        </a>
      </div>

      {open && <VideoModal {...props} onClose={() => setOpen(false)} />}
    </section>
  );
}

function VideoModal({
  show,
  episodeTitle,
  episodeMeta,
  body,
  poster,
  video,
  onClose,
}: FeaturedShowProps & { onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Now playing: ${show} — ${episodeTitle}`}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-3 sm:p-6 md:p-10"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3 md:mb-4 text-cream gap-3">
          <div className="flex flex-col min-w-0">
            <div className="text-[10px] font-bold tracking-[0.14em] uppercase opacity-70 truncate">
              ● {show} · {episodeMeta}
            </div>
            <div className="font-display text-[22px] sm:text-[32px] md:text-[40px] leading-[0.95] tracking-[-0.02em] uppercase mt-1 truncate">
              {episodeTitle}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close video"
            className="w-10 h-10 md:w-12 md:h-12 bg-lime text-black flex items-center justify-center text-xl md:text-2xl font-bold rounded-full hover:bg-[#a8e632] transition-colors shrink-0"
          >
            ✕
          </button>
        </div>
        <div className="relative bg-black w-full flex items-center justify-center" style={{ aspectRatio: "16 / 9" }}>
          <video
            ref={videoRef}
            src={video}
            poster={poster}
            controls
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          >
            Your browser does not support HTML5 video.
            <a href={video}>Download {episodeTitle}</a>.
          </video>
        </div>
        <p className="mt-3 md:mt-4 text-cream/85 text-[13px] md:text-base leading-[1.5] max-w-2xl">
          {body}
        </p>
      </div>
    </div>
  );
}
