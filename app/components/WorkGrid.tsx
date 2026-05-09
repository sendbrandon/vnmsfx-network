"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export type Work = {
  slug: string;
  category: string;
  meta: string;
  title: string;
  body: string;
  cta: string;
  poster: string;
  video: string;
};

export function WorkGrid({
  featured,
  works,
}: {
  featured: Work;
  works: Work[];
}) {
  const [active, setActive] = useState<Work | null>(null);

  const open = useCallback((w: Work) => setActive(w), []);
  const close = useCallback(() => setActive(null), []);

  return (
    <>
      <div className="flex gap-5 md:gap-6 flex-col lg:flex-row">
        {/* Featured */}
        <article className="flex-[1.4] flex flex-col gap-4 md:gap-5">
          <button
            type="button"
            onClick={() => open(featured)}
            className="block relative w-full h-[260px] sm:h-[400px] lg:h-[560px] overflow-hidden group cursor-pointer text-left"
            aria-label={`Play ${featured.title}`}
          >
            <Image
              src={featured.poster}
              alt={featured.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover group-hover:scale-[1.015] transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/55 pointer-events-none" />
            <div className="absolute inset-0 p-5 md:p-7 flex flex-col justify-between text-cream">
              <div className="flex items-start justify-between gap-3">
                <div className="text-[10px] md:text-[11px] font-bold tracking-[0.1em] uppercase">
                  ● {featured.category}
                </div>
                <div className="text-[10px] md:text-[11px] font-bold tracking-[0.1em] uppercase text-right">
                  {featured.meta}
                </div>
              </div>
              <div>
                <h3 className="font-display text-[clamp(36px,9vw,88px)] leading-[0.86] tracking-[-0.04em] uppercase">
                  {featured.title}
                </h3>
                <div className="flex items-center mt-3 md:mt-4 gap-3">
                  <span className="w-10 h-10 md:w-12 md:h-12 bg-lime flex items-center justify-center text-black rounded-full">
                    <PlayIcon />
                  </span>
                  <span className="text-[12px] md:text-[13px] font-extrabold tracking-[0.06em] uppercase">
                    {featured.cta}
                  </span>
                </div>
              </div>
            </div>
          </button>
          <p className="text-[15px] md:text-base leading-[1.5] max-w-[520px]">
            {featured.body}
          </p>
        </article>

        {/* Stacked */}
        <div className="flex-1 flex flex-col gap-4">
          {works.map((w, i) => (
            <button
              type="button"
              key={w.slug}
              onClick={() => open(w)}
              className={`flex gap-3 md:gap-4 group items-center cursor-pointer text-left w-full ${
                i < works.length - 1
                  ? "pb-4 border-b-[1.5px] border-black"
                  : ""
              }`}
              aria-label={`Play ${w.title}`}
            >
              <div className="relative w-24 h-24 md:w-32 md:h-32 shrink-0 overflow-hidden">
                <Image
                  src={w.poster}
                  alt={w.title}
                  fill
                  sizes="(max-width: 768px) 96px, 128px"
                  className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                  <span className="w-8 h-8 md:w-9 md:h-9 bg-lime rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayIcon small />
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-1 md:gap-1.5">
                <div className="text-[9px] md:text-[10px] font-bold tracking-[0.1em] uppercase">
                  ● {w.category}
                </div>
                <div className="font-display text-[18px] md:text-[24px] leading-[0.95] tracking-[-0.02em] uppercase">
                  {w.title}
                </div>
                <p className="text-[12px] md:text-[13px] leading-[1.4] line-clamp-2">
                  {w.body}
                </p>
              </div>
              <span className="w-8 h-8 md:w-9 md:h-9 bg-lime flex items-center justify-center text-black shrink-0 group-hover:bg-[#a8e632] transition-colors rounded-full">
                <PlayIcon small />
              </span>
            </button>
          ))}
        </div>
      </div>

      {active && <VideoModal work={active} onClose={close} />}
    </>
  );
}

function PlayIcon({ small = false }: { small?: boolean }) {
  const size = small ? 11 : 15;
  return (
    <span
      aria-hidden
      className="block w-0 h-0"
      style={{
        borderTop: `${size * 0.55}px solid transparent`,
        borderBottom: `${size * 0.55}px solid transparent`,
        borderLeft: `${size}px solid currentColor`,
        marginLeft: small ? 2 : 3,
      }}
    />
  );
}

function VideoModal({ work, onClose }: { work: Work; onClose: () => void }) {
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
      aria-label={`Now playing: ${work.title}`}
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 sm:p-6 md:p-10"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3 md:mb-4 text-cream gap-3">
          <div className="flex flex-col min-w-0">
            <div className="text-[10px] font-bold tracking-[0.14em] uppercase opacity-70 truncate">
              ● {work.category}
            </div>
            <div className="font-display text-[22px] sm:text-[32px] md:text-[40px] leading-[0.95] tracking-[-0.02em] uppercase mt-1 truncate">
              {work.title}
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
        <div className="relative bg-black aspect-video w-full">
          <video
            ref={videoRef}
            src={work.video}
            poster={work.poster}
            controls
            autoPlay
            playsInline
            className="w-full h-full"
          >
            Your browser does not support HTML5 video.
            <a href={work.video}>Download {work.title} ({work.video})</a>.
          </video>
        </div>
        <p className="mt-3 md:mt-4 text-cream/85 text-[13px] md:text-base leading-[1.5] max-w-2xl">
          {work.body}
        </p>
      </div>
    </div>
  );
}
