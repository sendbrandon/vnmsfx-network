"use client";

import { track } from "@vercel/analytics";
import { useState } from "react";
import {
  ALL_INTEREST_IDS,
  SHOW_INTERESTS,
  type ShowInterestId,
} from "../lib/audience";

type SubscribeFormVariant = "light" | "dark" | "lime";

export function SubscribeForm({
  source,
  variant = "light",
  includeInterests = true,
  defaultInterests = ALL_INTEREST_IDS,
  headline = "Become a VNMSFX Correspondent.",
  body = "One email per drop. No spam, no decks, no AI hype.",
  buttonLabel = "Sign up →",
}: {
  source: string;
  variant?: SubscribeFormVariant;
  includeInterests?: boolean;
  defaultInterests?: ShowInterestId[];
  headline?: string;
  body?: string;
  buttonLabel?: string;
}) {
  const [email, setEmail] = useState("");
  const [selectedInterests, setSelectedInterests] =
    useState<ShowInterestId[]>(defaultInterests);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  const isDark = variant === "dark";
  const isLime = variant === "lime";
  const textClass = isDark ? "text-cream" : "text-black";
  const mutedClass = isDark ? "text-cream/70" : "text-black/70";
  const borderClass = isDark ? "border-cream/35" : "border-black";
  const inputClass = isDark
    ? "min-h-12 flex-1 bg-transparent border-2 border-cream/35 px-3 py-3 text-[15px] text-cream placeholder:text-cream/45 outline-none focus:border-lime"
    : "min-h-12 flex-1 bg-transparent border-2 border-black px-3 py-3 text-[15px] text-black placeholder:text-black/45 outline-none focus:border-black";
  const buttonClass = isDark
    ? "min-h-12 bg-lime text-black px-4 py-3 text-[12px] font-extrabold tracking-[0.08em] uppercase hover:bg-[#a8e632] transition-colors disabled:opacity-60"
    : "min-h-12 bg-black text-lime px-4 py-3 text-[12px] font-extrabold tracking-[0.08em] uppercase hover:bg-[#1a1a1a] transition-colors disabled:opacity-60";

  const toggleInterest = (id: ShowInterestId) => {
    setSelectedInterests((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }
      return [...current, id];
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const interests = includeInterests ? selectedInterests : defaultInterests;

    if (!interests.length) {
      setStatus("error");
      setMessage("Pick at least one drop before signing up.");
      return;
    }

    setStatus("loading");
    setMessage("");
    track("subscribe_click", { source, interests: interests.join(",") });

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, interests, source }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(payload?.error ?? "Could not finish signup.");
      }

      setStatus("success");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not finish signup. Try again in a minute.",
      );
    }
  };

  if (status === "success") {
    return (
      <div
        className={`flex flex-col gap-2 border-2 ${borderClass} ${
          isDark ? "bg-black" : isLime ? "bg-lime" : "bg-lavender"
        } ${textClass} p-4 md:p-5 max-w-[680px]`}
      >
        <h3 className="font-display text-[24px] md:text-[30px] leading-[1] uppercase">
          You're in.
        </h3>
        <p className="text-[14px] md:text-[15px] leading-[1.45]">
          Welcome to the network, Correspondent.
        </p>
        <p className="text-[14px] md:text-[15px] leading-[1.45]">
          The next matching drop will hit your inbox.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col gap-4 md:gap-5 ${textClass} max-w-[760px]`}
    >
      <div className="flex flex-col gap-1.5">
        <h3 className="font-display text-[22px] md:text-[30px] leading-[1] uppercase">
          {headline}
        </h3>
        <p className={`text-[14px] md:text-[15px] leading-[1.45] ${mutedClass}`}>
          {body}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <label htmlFor={`${source}-email`} className="sr-only">
          Email address
        </label>
        <input
          id={`${source}-email`}
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="email@domain.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={inputClass}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className={buttonClass}
        >
          {status === "loading" ? "Signing up..." : buttonLabel}
        </button>
      </div>

      {includeInterests && (
        <fieldset
          className={`border-t-2 ${isDark ? "border-cream/25" : "border-black/25"} pt-4`}
        >
          <legend className="text-[11px] md:text-[12px] font-extrabold tracking-[0.1em] uppercase mb-3">
            Choose your shows
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 md:gap-3">
            {SHOW_INTERESTS.map((interest) => (
              <label
                key={interest.id}
                className={`flex items-start gap-3 border ${borderClass} p-3 cursor-pointer ${
                  selectedInterests.includes(interest.id)
                    ? isDark
                      ? "bg-cream/10"
                      : "bg-black/5"
                    : "opacity-70"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedInterests.includes(interest.id)}
                  onChange={() => toggleInterest(interest.id)}
                  className="mt-1 h-4 w-4 accent-black"
                />
                <span className="flex flex-col gap-0.5">
                  <span className="text-[12px] md:text-[13px] font-extrabold tracking-[0.08em] uppercase">
                    {interest.label}
                  </span>
                  <span className={`text-[12px] leading-[1.35] ${mutedClass}`}>
                    {interest.reportLabel}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {status === "error" && (
        <p className="text-[12px] md:text-[13px] leading-[1.4] font-bold text-red-700">
          {message}
        </p>
      )}
    </form>
  );
}
