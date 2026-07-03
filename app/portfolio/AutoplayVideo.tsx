"use client";

import { useEffect, useRef } from "react";

type AutoplayVideoProps = {
  src: string;
  poster: string;
  label: string;
};

export function AutoplayVideo({ src, poster, label }: AutoplayVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.muted = true;
    video.defaultMuted = true;

    const play = () => {
      video.play().catch(() => {});
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          play();
        } else {
          video.pause();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(video);
    play();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        play();
      } else {
        video.pause();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={label}
      className="h-full w-full object-cover"
    />
  );
}
