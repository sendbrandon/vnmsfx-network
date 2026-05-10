"use client";

import { useEffect, useRef, useState } from "react";

type Track = {
  slug: string;
  title: string;
  src: string;
};

const TRACKS: Track[] = [
  {
    slug: "forty-seven",
    title: "Forty-Seven",
    src: "/audio/forty-seven.mp3",
  },
  {
    slug: "felt-puppet-at-the-barbecue",
    title: "Felt Puppet at the Barbecue",
    src: "/audio/felt-puppet-at-the-barbecue.mp3",
  },
  {
    slug: "fourteen-dollars",
    title: "Fourteen Dollars",
    src: "/audio/fourteen-dollars.mp3",
  },
];

function fmtTime(s: number) {
  if (!isFinite(s) || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function AudioPlayer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const wantPlayRef = useRef(false); // tracks intent across track changes

  const current = TRACKS[currentIndex];

  // Auto-pause our audio when ANY video on the page starts playing
  useEffect(() => {
    const onAnyPlay = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.tagName === "VIDEO" && audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        wantPlayRef.current = false;
      }
    };
    document.addEventListener("play", onAnyPlay, true); // capture phase
    return () => document.removeEventListener("play", onAnyPlay, true);
  }, []);

  // Sync audio play state with React intent
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      // Pause every video before we start
      document.querySelectorAll("video").forEach((v) => {
        if (!v.paused) v.pause();
      });
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // When the track changes, autoplay if user had been playing
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.load();
    if (wantPlayRef.current) {
      audio.play().catch(() => setIsPlaying(false));
    }
  }, [currentIndex]);

  const togglePlay = () => {
    wantPlayRef.current = !isPlaying;
    setIsPlaying((p) => !p);
  };

  const next = () => {
    setCurrentIndex((i) => (i + 1) % TRACKS.length);
  };

  const prev = () => {
    // If we're more than 3s in, restart the current track. Otherwise go back.
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    setCurrentIndex((i) => (i - 1 + TRACKS.length) % TRACKS.length);
  };

  const handleEnded = () => {
    if (currentIndex < TRACKS.length - 1) {
      setCurrentIndex((i) => i + 1);
      // wantPlayRef stays true → next track autoplays
    } else {
      // End of playlist — stop, reset to first
      wantPlayRef.current = false;
      setIsPlaying(false);
      setCurrentIndex(0);
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * duration;
    setProgress(audio.currentTime);
  };

  if (dismissed) return null;

  const progressPct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <>
      <audio
        ref={audioRef}
        src={current.src}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={handleEnded}
        preload="metadata"
      />

      {/* MOBILE PLAYER — slim bottom bar, respects safe-area */}
      <div
        className="md:hidden fixed left-2 right-2 bottom-2 z-40 bg-black text-cream border-2 border-lime flex items-center gap-2 px-2 py-2"
        style={{ paddingBottom: `calc(0.5rem + env(safe-area-inset-bottom))` }}
        aria-label="VNMSFX Mix player"
      >
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="w-9 h-9 bg-lime text-black flex items-center justify-center shrink-0 rounded-full"
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon size={12} />}
        </button>
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="text-[9px] font-bold tracking-[0.14em] uppercase opacity-70 leading-tight">
            VNMSFX MIX · {currentIndex + 1}/{TRACKS.length}
          </div>
          <div className="font-display text-[14px] leading-tight uppercase tracking-[-0.01em] truncate">
            {current.title}
          </div>
        </div>
        <button
          type="button"
          onClick={next}
          aria-label="Next track"
          className="w-9 h-9 bg-transparent border border-cream/40 text-cream flex items-center justify-center shrink-0"
        >
          <NextIcon />
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Hide player"
          className="w-7 h-9 text-cream/70 flex items-center justify-center shrink-0 text-base"
        >
          ×
        </button>
      </div>

      {/* DESKTOP PLAYER — corner pill */}
      <div
        className="hidden md:flex fixed bottom-6 right-6 z-40 w-[360px] flex-col bg-black text-cream border-2 border-lime"
        aria-label="VNMSFX Mix player"
      >
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.14em] uppercase">
            <span className="block w-2 h-2 rounded-full bg-lime" />
            <span>VNMSFX MIX · {currentIndex + 1} OF {TRACKS.length}</span>
          </div>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Hide player"
            className="text-cream/60 hover:text-cream text-base leading-none -mt-1"
          >
            ×
          </button>
        </div>
        <div className="px-4 pb-2">
          <div className="font-display text-[18px] leading-tight tracking-[-0.01em] uppercase truncate">
            {current.title}
          </div>
        </div>
        <div className="px-4 pb-3 flex items-center gap-3">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous track"
            className="w-8 h-8 bg-transparent border border-cream/40 text-cream flex items-center justify-center hover:border-cream"
          >
            <PrevIcon />
          </button>
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="w-10 h-10 bg-lime text-black flex items-center justify-center hover:bg-[#a8e632] rounded-full"
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon size={13} />}
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next track"
            className="w-8 h-8 bg-transparent border border-cream/40 text-cream flex items-center justify-center hover:border-cream"
          >
            <NextIcon />
          </button>
          <div className="flex-1 flex flex-col gap-1 min-w-0">
            <div
              role="slider"
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={duration || 0}
              aria-valuenow={progress}
              tabIndex={0}
              onClick={seek}
              className="relative w-full h-[3px] bg-cream/20 cursor-pointer"
            >
              <div
                className="absolute inset-y-0 left-0 bg-lime"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="text-[10px] font-mono tracking-wide opacity-60 tabular-nums">
              {fmtTime(progress)} / {fmtTime(duration)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function PlayIcon({ size = 14 }: { size?: number }) {
  return (
    <span
      aria-hidden
      className="block w-0 h-0"
      style={{
        borderTop: `${size * 0.6}px solid transparent`,
        borderBottom: `${size * 0.6}px solid transparent`,
        borderLeft: `${size}px solid currentColor`,
        marginLeft: 2,
      }}
    />
  );
}

function PauseIcon() {
  return (
    <span aria-hidden className="flex gap-1">
      <span className="block w-1 h-3 bg-current" />
      <span className="block w-1 h-3 bg-current" />
    </span>
  );
}

function NextIcon() {
  return (
    <span aria-hidden className="flex items-center">
      <span
        className="block w-0 h-0"
        style={{
          borderTop: "5px solid transparent",
          borderBottom: "5px solid transparent",
          borderLeft: "7px solid currentColor",
        }}
      />
      <span className="block w-[2px] h-[10px] bg-current ml-[1px]" />
    </span>
  );
}

function PrevIcon() {
  return (
    <span aria-hidden className="flex items-center">
      <span className="block w-[2px] h-[10px] bg-current mr-[1px]" />
      <span
        className="block w-0 h-0"
        style={{
          borderTop: "5px solid transparent",
          borderBottom: "5px solid transparent",
          borderRight: "7px solid currentColor",
        }}
      />
    </span>
  );
}
