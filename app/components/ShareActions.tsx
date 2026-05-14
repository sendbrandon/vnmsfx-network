"use client";

import { useMemo, useState } from "react";

const TIKTOK_URL = "https://www.tiktok.com/@vnmsfxreels";

type ShareActionsProps = {
  url: string;
  title: string;
  text?: string;
  compact?: boolean;
};

export function ShareActions({
  url,
  title,
  text,
  compact = false,
}: ShareActionsProps) {
  const [copied, setCopied] = useState(false);
  const shareText = text ?? `${title} on VNMSFX`;

  const links = useMemo(() => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedShareText = encodeURIComponent(shareText);

    return {
      x: `https://twitter.com/intent/tweet?text=${encodedShareText}&url=${encodedUrl}`,
      reddit: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      tiktok: TIKTOK_URL,
    };
  }, [shareText, title, url]);

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      window.prompt("Copy this link", url);
    }
  }

  const buttonClass = compact
    ? "border border-current px-1.5 py-1 text-[8px] sm:text-[9px] font-extrabold uppercase tracking-[0.1em] hover:bg-lime hover:text-black transition-colors"
    : "border-2 border-current px-3 py-2 text-[10px] md:text-[11px] font-extrabold uppercase tracking-[0.12em] hover:bg-lime hover:text-black transition-colors";

  return (
    <div
      className={`flex flex-wrap items-center ${compact ? "gap-1" : "gap-2"}`}
      aria-label={`Share ${title}`}
    >
      <button
        type="button"
        onClick={handleShare}
        className={`${buttonClass} bg-lime text-black border-black`}
      >
        {copied ? "Copied" : "Share"}
      </button>
      <a
        href={links.x}
        target="_blank"
        rel="noreferrer"
        className={buttonClass}
        aria-label={`Share ${title} on X`}
      >
        X
      </a>
      <a
        href={links.reddit}
        target="_blank"
        rel="noreferrer"
        className={buttonClass}
        aria-label={`Share ${title} on Reddit`}
      >
        Reddit
      </a>
      <a
        href={links.tiktok}
        target="_blank"
        rel="noreferrer"
        className={buttonClass}
        aria-label="Open VNMSFX on TikTok"
      >
        TikTok
      </a>
    </div>
  );
}
