"use client";

import Link from "next/link";
import { track } from "@vercel/analytics";

type EventName =
  | "watch_hank_beans_click"
  | "watch_checkpoint_chisme_click"
  | "subscribe_click"
  | "submit_disaster_click"
  | "report_chisme_click"
  | "social_tiktok_click"
  | "social_x_click"
  | "social_youtube_click"
  | "episode_play_click"
  | "show_page_view";

export function TrackedLink({
  href,
  event,
  eventProps,
  external = false,
  className,
  children,
  ariaLabel,
}: {
  href: string;
  event: EventName;
  eventProps?: Record<string, string>;
  external?: boolean;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
}) {
  const onClick = () => {
    track(event, eventProps);
  };

  if (external || href.startsWith("http") || href.startsWith("mailto:")) {
    return (
      <a
        href={href}
        target={href.startsWith("mailto:") ? undefined : "_blank"}
        rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
        onClick={onClick}
        className={className}
        aria-label={ariaLabel}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} onClick={onClick} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}
