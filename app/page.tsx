import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { NowPlayingBoard } from "./components/NowPlayingBoard";
import { SocialRow } from "./components/SocialRow";
import { TrackedLink } from "./components/TrackedLink";
import {
  HANK_BEANS_ROAR,
  CHECKPOINT_CHISME,
  SUBSCRIBE_MAILTO,
} from "./lib/shows";

const LOGO_SRC = "/brand/vnmsfx-logo-black.png";
const LOGO_W = 2522;
const LOGO_H = 905;

export const metadata: Metadata = {
  title: "VNMSFX — AI-Native Comedy Network",
  description:
    "VNMSFX is an AI-native comedy network from New York making short-form shows, character series, and internet-first video drops.",
  openGraph: {
    title: "VNMSFX — AI-Native Comedy Network",
    description:
      "VNMSFX is an AI-native comedy network from New York making short-form shows, character series, and internet-first video drops.",
    type: "website",
    url: "https://vnmsfx.com",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "VNMSFX — AI-Native Comedy Network",
    description:
      "Watch Hank, Beans & Roar and Checkpoint Chisme. New drops every Thursday.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "https://vnmsfx.com" },
};

const TICKER =
  "→ → → → → → → → →  One email per drop · No spam, no decks, no AI hype  → → → → → → → → → → → → → →";

export default function Page() {
  return (
    <main className="font-sans bg-lavender text-black overflow-x-hidden">
      <TopNav />
      <Hero />
      <SubscribeBar />
      <HankBeansRoarSection />
      <CheckpointChismeSection />
      <Footer />
    </main>
  );
}

function TopNav() {
  return (
    <nav className="w-full h-14 flex items-center justify-between px-5 md:px-14 border-b-[1.5px] border-black text-[10px] md:text-[11px] font-bold tracking-[0.08em] uppercase bg-lavender">
      <div className="flex items-center gap-2">
        <span className="block w-2.5 h-2.5 rounded-full bg-black shrink-0" />
        <Image
          src={LOGO_SRC}
          alt="VNMSFX"
          width={LOGO_W}
          height={LOGO_H}
          priority
          className="h-[16px] md:h-[18px] w-auto"
        />
        <span className="text-[8px] md:text-[9px] -translate-y-1.5">®</span>
        <span className="hidden sm:inline opacity-70">
          &nbsp;&nbsp;/&nbsp;&nbsp;NYC, EST 2024
        </span>
      </div>
      <div className="hidden md:flex items-center gap-5">
        <Link href="/hank-beans-roar" className="hover:underline">
          Hank, Beans & Roar
        </Link>
        <span className="opacity-30">·</span>
        <Link href="/checkpoint-chisme" className="hover:underline">
          Checkpoint Chisme
        </Link>
      </div>
      <a
        href="#hank-beans-roar"
        className="md:hidden font-extrabold tracking-[0.08em]"
      >
        WATCH ↓
      </a>
    </nav>
  );
}

function Hero() {
  return (
    <section className="px-5 md:px-14 pt-10 md:pt-24 pb-10 md:pb-14 flex flex-col gap-10 md:gap-16">
      <div className="flex flex-col md:flex-row items-start gap-5 md:gap-8">
        <aside className="w-full md:w-48 shrink-0 md:pt-6 flex md:block items-start gap-3 md:gap-0">
          <div className="text-[10px] font-extrabold tracking-[0.14em] uppercase leading-[1.4] shrink-0">
            AI-NATIVE
            <br />
            COMEDY NETWORK
          </div>
          <div className="hidden md:block w-8 h-[1.5px] mt-3.5 bg-black" />
          <p className="hidden md:block text-[11px] mt-3.5 leading-[1.45]">
            Short-form shows. Character series. New drops every Thursday.
          </p>
          <p className="md:hidden text-[11px] leading-[1.45] flex-1">
            Short-form shows. New drops every Thursday.
          </p>
        </aside>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-[clamp(40px,11vw,120px)] leading-[0.92] tracking-[-0.035em] uppercase">
            &ldquo;WE MAKE THE INTERNET FEEL LIKE THE INTERNET AGAIN.&rdquo;
          </h1>
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 md:gap-8">
        <a href="#hank-beans-roar" className="flex items-center gap-4 group shrink-0">
          <span className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-black flex items-center justify-center group-hover:bg-[#1a1a1a] transition-colors shrink-0">
            <span
              aria-hidden
              className="block w-0 h-0"
              style={{
                borderTop: "10px solid transparent",
                borderBottom: "10px solid transparent",
                borderLeft: "15px solid #C2FF3F",
                marginLeft: 4,
              }}
            />
          </span>
          <div className="max-w-[260px]">
            <div className="text-[11px] md:text-xs font-extrabold tracking-[0.08em] uppercase">
              Watch the latest drops
            </div>
            <div className="font-serif italic text-[12px] md:text-[13px] mt-1">
              Two shows, scrollable below
            </div>
          </div>
        </a>
        <div className="flex items-end gap-4 md:gap-6 self-stretch md:self-auto justify-between md:justify-end">
          <p className="font-serif italic text-[14px] md:text-[18px] leading-[1.4] text-left md:text-right max-w-[280px] md:max-w-[420px] pb-2 md:pb-3">
            VNMSFX is an AI-native comedy network making short-form shows,
            character series, and internet-first video drops.
          </p>
          <Image
            src={LOGO_SRC}
            alt="VNMSFX"
            width={LOGO_W}
            height={LOGO_H}
            className="h-[clamp(32px,7vw,52px)] w-auto shrink-0"
          />
        </div>
      </div>
    </section>
  );
}

function SubscribeBar() {
  return (
    <section className="w-full bg-lime border-y-2 border-black px-5 md:px-14 py-6 md:py-0 md:h-28 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-10">
      <div className="flex-1 font-display text-[clamp(20px,4.5vw,28px)] leading-[1.05] tracking-[-0.01em] uppercase">
        ↳ New drop every Thursday · One email when it hits
      </div>
      <TrackedLink
        href={SUBSCRIBE_MAILTO}
        event="subscribe_click"
        className="flex items-center gap-3.5 shrink-0 group self-stretch md:self-auto justify-between md:justify-end"
      >
        <span className="text-xs font-extrabold tracking-[0.08em] uppercase">
          Subscribe
        </span>
        <span className="w-12 h-12 md:w-14 md:h-14 bg-black flex items-center justify-center text-lime text-[20px] md:text-[22px] group-hover:bg-[#1a1a1a] transition-colors shrink-0">
          →
        </span>
      </TrackedLink>
    </section>
  );
}

function ShowSectionHeader({
  showHref,
  episodes,
  title,
  hookLine,
  bodyLine,
  variant,
}: {
  showHref: string;
  episodes: number;
  title: string;
  hookLine: string;
  bodyLine: string;
  variant: "dark" | "light";
}) {
  const isDark = variant === "dark";
  return (
    <header
      className={`flex flex-col gap-5 md:gap-6 border-b-2 pb-5 md:pb-6 ${
        isDark ? "border-cream/30" : "border-black"
      }`}
    >
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-2">
          <div
            className={`text-[10px] md:text-[11px] font-bold tracking-[0.14em] uppercase flex items-center gap-2 ${
              isDark ? "opacity-70" : "opacity-70"
            }`}
          >
            <span className="block w-2.5 h-2.5 rounded-full bg-lime" />
            <span>Now Playing · {episodes} episodes</span>
          </div>
          <h2 className="font-display text-[clamp(40px,9vw,120px)] leading-[0.86] tracking-[-0.04em] uppercase">
            {title}
          </h2>
        </div>
        <Link
          href={showHref}
          className="text-[12px] md:text-[13px] font-extrabold tracking-[0.08em] uppercase hover:underline shrink-0"
        >
          ↗ Show page
        </Link>
      </div>
      <div className="flex flex-col gap-2 max-w-[760px]">
        <p className="font-serif italic text-[18px] md:text-[22px] leading-[1.3]">
          {hookLine}
        </p>
        <p className="text-[14px] md:text-[15px] leading-[1.55] opacity-90">
          {bodyLine}
        </p>
      </div>
    </header>
  );
}

function HankBeansRoarSection() {
  return (
    <section
      id="hank-beans-roar"
      className="bg-black text-cream border-b-2 border-black px-5 md:px-14 pt-12 md:pt-20 pb-14 md:pb-24 flex flex-col gap-8 md:gap-10 scroll-mt-14"
    >
      <ShowSectionHeader
        showHref="/hank-beans-roar"
        episodes={HANK_BEANS_ROAR.episodes?.length ?? 0}
        title="Hank, Beans & Roar"
        hookLine="Hank thinks he's in charge. Beans knows something is wrong. Roar makes it worse."
        bodyLine="A short-form chaos series about a clueless human, a stressed-out dog, and a lion who turns every normal situation into a disaster."
        variant="dark"
      />
      <NowPlayingBoard work={HANK_BEANS_ROAR} />
      <div className="flex flex-col gap-4 md:gap-6">
        <ShowCtaRow
          primary={{
            href: "/hank-beans-roar",
            label: "Watch Hank, Beans & Roar",
            event: "watch_hank_beans_click",
          }}
          secondary={{
            href: "/hank-beans-roar#submit",
            label: "Submit the Next Disaster",
            event: "submit_disaster_click",
          }}
          variant="dark"
        />
        <SocialRow campaign="hank_beans_roar" variant="dark" />
      </div>
    </section>
  );
}

function CheckpointChismeSection() {
  return (
    <section
      id="checkpoint-chisme"
      className="bg-cream px-5 md:px-14 pt-12 md:pt-20 pb-16 md:pb-24 flex flex-col gap-8 md:gap-10 scroll-mt-14"
    >
      <ShowSectionHeader
        showHref="/checkpoint-chisme"
        episodes={CHECKPOINT_CHISME.episodes?.length ?? 0}
        title="Checkpoint Chisme"
        hookLine="Airport security meets neighborhood gossip."
        bodyLine="A felt puppet comedy series where every ID check, break room conversation, and suspicious suitcase turns into a full-blown chisme investigation."
        variant="light"
      />
      <NowPlayingBoard work={CHECKPOINT_CHISME} />
      <div className="flex flex-col gap-4 md:gap-6">
        <ShowCtaRow
          primary={{
            href: "/checkpoint-chisme",
            label: "Watch Checkpoint Chisme",
            event: "watch_checkpoint_chisme_click",
          }}
          secondary={{
            href: "/checkpoint-chisme#submit",
            label: "Report Some Chisme",
            event: "report_chisme_click",
          }}
          variant="light"
        />
        <SocialRow campaign="checkpoint_chisme" variant="light" />
      </div>
    </section>
  );
}

function ShowCtaRow({
  primary,
  secondary,
  variant,
}: {
  primary: {
    href: string;
    label: string;
    event: "watch_hank_beans_click" | "watch_checkpoint_chisme_click";
  };
  secondary: {
    href: string;
    label: string;
    event: "submit_disaster_click" | "report_chisme_click";
  };
  variant: "dark" | "light";
}) {
  const isDark = variant === "dark";
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
      <TrackedLink
        href={primary.href}
        event={primary.event}
        eventProps={{ source: "homepage" }}
        className="inline-flex items-center gap-3 bg-lime text-black px-4 py-3 group self-start"
      >
        <span className="text-[12px] md:text-[13px] font-extrabold tracking-[0.08em] uppercase">
          ▶ {primary.label}
        </span>
        <span className="text-[14px] group-hover:translate-x-1 transition-transform">
          →
        </span>
      </TrackedLink>
      <TrackedLink
        href={secondary.href}
        event={secondary.event}
        eventProps={{ source: "homepage" }}
        className={`inline-flex items-center gap-3 px-4 py-3 group self-start border ${
          isDark ? "border-cream/60" : "border-black/60"
        }`}
      >
        <span className="text-[12px] md:text-[13px] font-extrabold tracking-[0.08em] uppercase">
          {secondary.label}
        </span>
        <span className="text-[14px] group-hover:translate-x-1 transition-transform opacity-80">
          ↗
        </span>
      </TrackedLink>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-lavender border-t-2 border-black flex flex-col">
      <div className="w-full h-12 md:h-14 flex items-center px-5 md:px-14 border-b-[1.5px] border-black overflow-hidden">
        <div className="flex-1 text-[11px] md:text-[13px] font-bold tracking-[0.04em] whitespace-nowrap">
          {TICKER}
        </div>
      </div>
      <div className="pt-10 md:pt-14 pb-6 md:pb-8 px-5 md:px-14 flex justify-center">
        <Image
          src={LOGO_SRC}
          alt="VNMSFX"
          width={LOGO_W}
          height={LOGO_H}
          className="h-[clamp(64px,16vw,200px)] w-auto"
        />
      </div>
      <div className="px-5 md:px-14 pb-6 md:pb-8 flex flex-col items-center gap-3">
        <div className="font-serif italic text-center text-[14px] md:text-[16px] max-w-[480px] leading-[1.45]">
          &ldquo;The funniest network in New York right now.&rdquo;{" "}
          <span className="text-[12px] md:text-[13px]">— Highsnobiety</span>
        </div>
      </div>
      <div className="flex flex-col md:flex-row border-t-[1.5px] border-black">
        <TrackedLink
          href="https://x.com/vnmsfx?utm_source=vnmsfx&utm_medium=site&utm_campaign=homepage"
          event="social_x_click"
          eventProps={{ source: "footer" }}
          external
          className="flex-1 py-6 md:py-8 px-5 md:px-14 border-b-[1.5px] md:border-b-0 md:border-r-[1.5px] border-black text-center hover:bg-black hover:text-lime transition-colors group"
        >
          <div className="font-display text-[14px] md:text-base tracking-[0.04em] uppercase">
            X / Twitter
          </div>
          <div className="mt-2 text-[14px] md:text-base group-hover:underline">
            ↗ @vnmsfx
          </div>
        </TrackedLink>
        <TrackedLink
          href="https://www.youtube.com/@vnmsfx?utm_source=vnmsfx&utm_medium=site&utm_campaign=homepage"
          event="social_youtube_click"
          eventProps={{ source: "footer" }}
          external
          className="flex-1 py-6 md:py-8 px-5 md:px-14 border-b-[1.5px] md:border-b-0 md:border-r-[1.5px] border-black text-center hover:bg-black hover:text-lime transition-colors group"
        >
          <div className="font-display text-[14px] md:text-base tracking-[0.04em] uppercase">
            YouTube
          </div>
          <div className="mt-2 text-[14px] md:text-base group-hover:underline">
            ↗ @vnmsfx
          </div>
        </TrackedLink>
        <TrackedLink
          href="https://www.tiktok.com/@vnmsfxreels?utm_source=vnmsfx&utm_medium=site&utm_campaign=homepage"
          event="social_tiktok_click"
          eventProps={{ source: "footer" }}
          external
          className="flex-1 py-6 md:py-8 px-5 md:px-14 text-center hover:bg-black hover:text-lime transition-colors group"
        >
          <div className="font-display text-[14px] md:text-base tracking-[0.04em] uppercase">
            TikTok
          </div>
          <div className="mt-2 text-[14px] md:text-base group-hover:underline">
            ↗ @vnmsfxreels
          </div>
        </TrackedLink>
      </div>
      <div className="flex flex-col md:flex-row border-y-[1.5px] border-black">
        <div className="flex-1 py-6 md:py-8 px-5 md:px-14 border-b-[1.5px] md:border-b-0 md:border-r-[1.5px] border-black text-center">
          <div className="font-display text-[14px] md:text-base tracking-[0.04em] uppercase">
            Inbox
          </div>
          <a
            href="mailto:brandon@pushto6.com"
            className="block mt-2 text-[14px] md:text-base hover:underline break-all"
          >
            brandon@pushto6.com
          </a>
        </div>
        <div className="flex-1 py-6 md:py-8 px-5 md:px-14 text-center">
          <div className="font-display text-[14px] md:text-base tracking-[0.04em] uppercase">
            Press
          </div>
          <a
            href="mailto:brandon@pushto6.com?subject=Press%20inquiry"
            className="block mt-2 text-[14px] md:text-base hover:underline break-all"
          >
            brandon@pushto6.com
          </a>
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between py-5 md:py-6 px-5 md:px-14 text-[10px] md:text-[11px] font-bold tracking-[0.1em] uppercase gap-2">
        <div>© 2026 VNMSFX LLC · Made in New York · All rights reserved</div>
        <div>Site by VNMSFX®</div>
      </div>
    </footer>
  );
}
