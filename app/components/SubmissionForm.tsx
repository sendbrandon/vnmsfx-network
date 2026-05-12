"use client";

import { track } from "@vercel/analytics";
import { useState } from "react";

export type SubmissionField = {
  key: string;
  label: string;
  required?: boolean;
  type?: "text" | "email";
  placeholder?: string;
};

export function SubmissionForm({
  showSlug,
  showTitle,
  subjectPrefix,
  fields,
  ctaLabel,
  trackEvent,
  variant = "light",
}: {
  showSlug: "hank_beans_roar" | "checkpoint_chisme";
  showTitle: string;
  subjectPrefix: string;
  fields: SubmissionField[];
  ctaLabel: string;
  trackEvent: "submit_disaster_click" | "report_chisme_click";
  variant?: "light" | "dark";
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const isDark = variant === "dark";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    track(trackEvent, { show: showSlug });

    const body = fields
      .map((f) => `${f.label}\n${values[f.key] || "—"}`)
      .join("\n\n");

    const mailto = `mailto:brandon@pushto6.com?subject=${encodeURIComponent(
      subjectPrefix + " — " + showTitle
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
    setSubmitted(true);
  };

  const inputClass = isDark
    ? "w-full bg-transparent border-b-2 border-cream/30 focus:border-lime outline-none py-2 text-[14px] md:text-[15px] text-cream placeholder:text-cream/40"
    : "w-full bg-transparent border-b-2 border-black/30 focus:border-black outline-none py-2 text-[14px] md:text-[15px] text-black placeholder:text-black/40";

  if (submitted) {
    return (
      <div
        className={`flex flex-col gap-3 p-6 border-2 ${
          isDark ? "border-lime bg-black text-cream" : "border-lime bg-lime/10 text-black"
        }`}
      >
        <div className="text-[10px] md:text-[11px] font-bold tracking-[0.14em] uppercase">
          ● Submission opened in your mail app
        </div>
        <p className="text-[14px] md:text-[15px] leading-[1.5]">
          Hit send when you&rsquo;re ready. We read everything that comes in. No promise we&rsquo;ll make it, but the good ones get made.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="text-[12px] font-extrabold tracking-[0.08em] uppercase underline self-start"
        >
          ↺ Submit another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 md:gap-6">
      {fields.map((f) => (
        <div key={f.key} className="flex flex-col gap-2">
          <label
            htmlFor={f.key}
            className={`text-[10px] md:text-[11px] font-bold tracking-[0.14em] uppercase ${
              isDark ? "text-cream/80" : "text-black/80"
            }`}
          >
            {f.label} {f.required ? <span className="text-lime">*</span> : null}
          </label>
          <input
            id={f.key}
            name={f.key}
            type={f.type ?? "text"}
            required={f.required}
            placeholder={f.placeholder}
            value={values[f.key] ?? ""}
            onChange={(e) =>
              setValues((v) => ({ ...v, [f.key]: e.target.value }))
            }
            className={inputClass}
          />
        </div>
      ))}
      <button
        type="submit"
        className={`inline-flex items-center gap-3 self-start group mt-2`}
      >
        <span
          className={`w-12 h-12 md:w-14 md:h-14 bg-lime flex items-center justify-center text-black text-[20px] md:text-[22px] group-hover:bg-[#a8e632] transition-colors`}
        >
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
        Submitting opens your email client with everything pre-filled. We can&rsquo;t
        promise we&rsquo;ll make every one but we read every one.
      </p>
    </form>
  );
}
