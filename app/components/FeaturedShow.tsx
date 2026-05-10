"use client";

import Image from "next/image";
import { useRef, useState } from "react";

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
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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

      <div
        className="relative w-full overflow-hidden bg-black"
        style={{ aspectRatio: String(props.aspect ?? 16 / 9) }}
      >
        {playing ? (
          <video
            ref={videoRef}
            src={props.video}
            poster={props.poster}
            controls
            autoPlay
            playsInline
            onEnded={() => setPlaying(false)}
            className="w-full h-full object-contain bg-black"
          >
            Your browser does not support HTML5 video.{" "}
            <a href={props.video}>Download {props.episodeTitle}</a>.
          </video>
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play ${props.show} — ${props.episodeTitle}`}
            className="block absolute inset-0 group cursor-pointer text-left"
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
        )}
      </div>

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
    </section>
  );
}
