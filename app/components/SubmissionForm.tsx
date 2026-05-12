"use client";

import { track } from "@vercel/analytics";
import { useState } from "react";

export function SubmissionForm({
  showSlug,
  showTitle,
  subjectPrefix,
  ideaLabel,
  ideaPlaceholder,
  ctaLabel,
  trackEvent,
  variant = "light",
}: {
  showSlug: "hank_beans_roar" | "checkpoint_chisme";
  showTitle: string;
  subjectPrefix: string;
  ideaLabel: string;
  ideaPlaceholder: string;
  ctaLabel: string;
  trackEvent: "submit_disaster_click" | "report_chisme_click";
  variant?: "light" | "dark";
}) {
  const [idea, setIdea] = useState("");
  const [handle, setHandle] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const isDark = variant === "dark";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    track(trackEvent, { show: showSlug });

    const body =
      `${ideaLabel}\n${idea || "—"}\n\n` +
      `Sent by\n${handle || "anonymous"}`;

    const mailto = `mailto:brandon@pushto6.com?subject=${encodeURIComponent(
      subjectPrefix + " — " + showTitle
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
    setSubmitted(true);
  };

  const inputClass = isDark
    ? "w-full bg-transparent border-b-2 border-cream/30 focus:border-lime outline-none py-2 text-[15px] md:text-[16px] text-cream placeholder:text-cream/40"
    : "w-full bg-transparent border-b-2 border-black/30 focus:border-black outline-none py-2 text-[15px] md:text-[16px] text-black placeholder:text-black/40";

  const textareaClass = isDark
    ? "w-full bg-transparent border-2 border-cream/30 focus:border-lime outline-none p-3 text-[15px] md:text-[16px] text-cream placeholder:text-cream/40 resize-y min-h-[100px]"
    : "w-full bg-transparent border-2 border-black/30 focus:border-black outline-none p-3 text-[15px] md:text-[16px] text-black placeholder:text-black/40 resize-y min-h-[100px]";

  if (submitted) {
    return (
      <div
        className={`flex flex-col gap-3 p-5 border-2 max-w-[560px] ${
          isDark
            ? "border-lime bg-black text-cream"
            : "border-lime bg-lime/10 text-black"
        }`}
      >
        <div className="text-[10px] md:text-[11px] font-bold tracking-[0.14em] uppercase">
          ● Opened in your mail app
        </div>
        <p className="text-[14px] md:text-[15px] leading-[1.5]">
          Hit send when you&rsquo;re ready. We read everything. The good ones
          get made.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setIdea("");
            setHandle("");
          }}
          className="text-[12px] font-extrabold tracking-[0.08em] uppercase underline self-start"
        >
          ↺ Send another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 md:gap-6 max-w-[640px]"
    >
      <div className="flex flex-col gap-2">
        <label
          htmlFor="idea"
          className={`text-[11px] md:text-[12px] font-bold tracking-[0.1em] uppercase ${
            isDark ? "text-cream/80" : "text-black/80"
          }`}
        >
          {ideaLabel}
          <span className="text-lime"> *</span>
        </label>
        <textarea
          id="idea"
          name="idea"
          required
          placeholder={ideaPlaceholder}
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          className={textareaClass}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="handle"
          className={`text-[11px] md:text-[12px] font-bold tracking-[0.1em] uppercase ${
            isDark ? "text-cream/80" : "text-black/80"
          }`}
        >
          Your handle or email (optional)
        </label>
        <input
          id="handle"
          name="handle"
          type="text"
          placeholder="@yourhandle"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        className="inline-flex items-center gap-3 self-start group mt-1"
      >
        <span className="w-12 h-12 md:w-14 md:h-14 bg-lime flex items-center justify-center text-black text-[20px] md:text-[22px] group-hover:bg-[#a8e632] transition-colors">
          →
        </span>
        <span
          className={`text-[12px] md:text-xs font-extrabold tracking-[0.08em] uppercase ${
            isDark ? "text-cream" : "text-black"
          }`}
        >
          {ctaLabel}
        </span>
      </button>
      <p
        className={`text-[11px] leading-[1.4] ${
          isDark ? "text-cream/50" : "text-black/50"
        }`}
      >
        Opens your email pre-filled. We read every one. No promises we make
        every one.
      </p>
    </form>
  );
}
