"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

type AutoScrollRailProps = {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
};

const MOBILE_CAROUSEL_SPEED = 24;
const USER_PAUSE_MS = 3200;
const EDGE_PAUSE_MS = 700;

export function AutoScrollRail({
  children,
  className,
  ariaLabel,
}: AutoScrollRailProps) {
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    const mobileQuery = window.matchMedia("(max-width: 1023px)");
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    let frameId = 0;
    let lastFrame = performance.now();
    let direction = 1;
    let isVisible = false;
    let pauseUntil = lastFrame + 900;

    const pauseForUser = () => {
      pauseUntil = performance.now() + USER_PAUSE_MS;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = Boolean(entry?.isIntersecting);
        pauseUntil = performance.now() + 400;
      },
      { threshold: 0.28 },
    );

    const resetClock = () => {
      lastFrame = performance.now();
    };

    const animate = (now: number) => {
      const maxScroll = rail.scrollWidth - rail.clientWidth;
      const shouldMove =
        isVisible &&
        mobileQuery.matches &&
        !reducedMotionQuery.matches &&
        document.visibilityState === "visible" &&
        maxScroll > 8 &&
        now >= pauseUntil;

      if (shouldMove) {
        const delta =
          ((now - lastFrame) / 1000) * MOBILE_CAROUSEL_SPEED * direction;
        const nextScroll = rail.scrollLeft + delta;

        if (nextScroll >= maxScroll) {
          rail.scrollLeft = maxScroll;
          direction = -1;
          pauseUntil = now + EDGE_PAUSE_MS;
        } else if (nextScroll <= 0) {
          rail.scrollLeft = 0;
          direction = 1;
          pauseUntil = now + EDGE_PAUSE_MS;
        } else {
          rail.scrollLeft = nextScroll;
        }
      }

      lastFrame = now;
      frameId = window.requestAnimationFrame(animate);
    };

    observer.observe(rail);
    rail.addEventListener("pointerdown", pauseForUser);
    rail.addEventListener("touchstart", pauseForUser, { passive: true });
    rail.addEventListener("wheel", pauseForUser, { passive: true });
    rail.addEventListener("focusin", pauseForUser);
    document.addEventListener("visibilitychange", resetClock);

    frameId = window.requestAnimationFrame(animate);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frameId);
      rail.removeEventListener("pointerdown", pauseForUser);
      rail.removeEventListener("touchstart", pauseForUser);
      rail.removeEventListener("wheel", pauseForUser);
      rail.removeEventListener("focusin", pauseForUser);
      document.removeEventListener("visibilitychange", resetClock);
    };
  }, []);

  return (
    <div ref={railRef} className={className} aria-label={ariaLabel}>
      {children}
    </div>
  );
}
