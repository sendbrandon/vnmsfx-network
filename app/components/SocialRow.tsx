"use client";

import { track } from "@vercel/analytics";

type Campaign = "hank_beans_roar" | "checkpoint_chisme" | "homepage";

function utm(href: string, campaign: Campaign) {
  const u = new URL(href);
  u.searchParams.set("utm_source", "vnmsfx");
  u.searchParams.set("utm_medium", "site");
  u.searchParams.set("utm_campaign", campaign);
  return u.toString();
}

export function SocialRow({
  campaign,
  variant = "light",
  label = "Follow the drops",
}: {
  campaign: Campaign;
  variant?: "light" | "dark";
  label?: string;
}) {
  const isDark = variant === "dark";
  const onClick = (network: "tiktok" | "x" | "youtube") =>
    track(`social_${network}_click`, { campaign });

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 py-4 ${
        isDark ? "text-cream" : "text-black"
      }`}
    >
      <span className="text-[10px] md:text-[11px] font-bold tracking-[0.14em] uppercase opacity-70 flex items-center gap-2 shrink-0">
        <span className="block w-2.5 h-2.5 rounded-full bg-lime" />
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] md:text-[13px] font-extrabold tracking-[0.08em] uppercase">
        <a
          href={utm("https://www.tiktok.com/@vnmsfxreels", campaign)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onClick("tiktok")}
          className="hover:underline"
        >
          ↗ TikTok
        </a>
        <span className="opacity-30">·</span>
        <a
          href={utm("https://x.com/vnmsfx", campaign)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onClick("x")}
          className="hover:underline"
        >
          ↗ X / Twitter
        </a>
        <span className="opacity-30">·</span>
        <a
          href={utm("https://www.youtube.com/@vnmsfx", campaign)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onClick("youtube")}
          className="hover:underline"
        >
          ↗ YouTube
        </a>
      </div>
    </div>
  );
}
