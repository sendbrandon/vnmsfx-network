import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CommunityModule } from "../components/CommunityModule";
import { NowPlayingBoard } from "../components/NowPlayingBoard";
import { PageViewTracker } from "../components/PageViewTracker";
import { ShowSubscribeBlock } from "../components/ShowSubscribeBlock";
import { SocialRow } from "../components/SocialRow";
import { TrackedLink } from "../components/TrackedLink";
import { GPTEA } from "../lib/shows";
import { buildShowSchema } from "../lib/schema";

const LOGO = "/brand/vnmsfx-logo-black.png";
const HERO_POSTER = "/work/gptea/ep-12-poster.jpg";

export const metadata: Metadata = {
  title: "GPTea — VNMSFX",
  description:
    "GPTea is a VNMSFX vertical workplace cartoon about Doug, the hoodie guy, and Marv, the other guy stuck processing AI dread in the office.",
  alternates: { canonical: "https://vnmsfx.com/gptea" },
  openGraph: {
    title: "GPTea — VNMSFX",
    description:
      "Office coffee, AI dread, and the hoodie guy who saw it coming. A VNMSFX vertical workplace cartoon.",
    type: "website",
    url: "https://vnmsfx.com/gptea",
    images: [
      {
        url: HERO_POSTER,
        width: 720,
        height: 1280,
        alt: "GPTea — a vertical workplace episode poster.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GPTea — VNMSFX",
    description:
      "Office coffee, AI dread, and the hoodie guy who saw it coming.",
    images: [HERO_POSTER],
  },
};

export default function GPTeaPage() {
  const schema = buildShowSchema(GPTEA);

  return (
    <main className="font-sans bg-lavender text-black overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <PageViewTracker show="gptea" />
      <ShowNav />
      <Hero />
      <Player />
      <MeetTheCast />
      <BackToNetwork />
    </main>
  );
}

function ShowNav() {
  return (
    <nav className="w-full h-14 flex items-center justify-between px-5 md:px-14 border-b-[1.5px] border-black text-[10px] md:text-[11px] font-bold tracking-[0.08em] uppercase bg-lavender">
      <Link href="/" className="flex items-center gap-2 hover:opacity-80">
        <span className="block w-2.5 h-2.5 rounded-full bg-lime shrink-0 border border-black" />
        <Image
          src={LOGO}
          alt="VNMSFX"
          width={2522}
          height={905}
          priority
          className="h-[16px] md:h-[18px] w-auto"
        />
        <span className="hidden sm:inline opacity-70">
          &nbsp;&nbsp;/&nbsp;&nbsp;GPTea
        </span>
      </Link>
      <div className="flex items-center gap-4 md:gap-5">
        <Link href="/signal" className="hover:underline">
          Signal
        </Link>
        <span className="opacity-30">·</span>
        <Link href="/clips" className="hover:underline">
          Clip
        </Link>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="grid border-b-2 border-black bg-lavender lg:min-h-[calc(100svh-56px)] lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.82fr)]">
      <div className="flex min-h-[calc(100dvh-56px)] flex-col justify-between gap-8 px-5 py-8 md:px-14 md:py-14 lg:min-h-[calc(100svh-56px)]">
        <div className="flex flex-col gap-3 md:gap-4">
          <div className="text-[10px] md:text-[11px] font-bold tracking-[0.14em] uppercase opacity-70 flex items-center gap-2">
            <span className="block w-2.5 h-2.5 rounded-full bg-lime border border-black" />
            <span>A VNMSFX Show · Vertical · {GPTEA.episodes?.length} episodes</span>
          </div>
          <h1 className="font-display text-[clamp(58px,13vw,150px)] leading-[0.86] tracking-normal uppercase">
            GPTea
          </h1>
          <p className="max-w-[660px] text-[17px] leading-[1.35] md:text-[22px]">
            Office coffee. AI dread.
          </p>
        </div>
        <div className="flex flex-col gap-5">
          <p className="max-w-[520px] text-[12px] font-extrabold uppercase leading-[1.45] tracking-[0.1em] opacity-75">
            {GPTEA.episodes?.length ?? 12} vertical episodes live.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 self-start">
            <TrackedLink
              href="#player"
              event="watch_gptea_click"
              eventProps={{ source: "gptea_page_hero" }}
              className="flex items-center gap-3 group bg-black text-lime px-5 py-4"
            >
              <span className="font-display text-[15px] md:text-[16px] uppercase tracking-normal">
                ▶ Watch GPTea
              </span>
              <span className="text-[18px] group-hover:translate-x-1 transition-transform">
                →
              </span>
            </TrackedLink>
            <TrackedLink
              href="/signal"
              event="join_signal_click"
              eventProps={{ source: "gptea_page_hero" }}
              className="flex items-center gap-3 group border-2 border-black px-5 py-4"
            >
              <span className="font-display text-[14px] md:text-[15px] uppercase tracking-normal">
                Join Signal
              </span>
              <span className="text-[16px] group-hover:translate-x-1 transition-transform opacity-80">
                ↗
              </span>
            </TrackedLink>
          </div>
        </div>
      </div>
      <div className="flex min-h-[540px] items-center justify-center p-5 sm:p-8 lg:min-h-[calc(100svh-56px)]">
        <div className="relative aspect-[9/16] w-full max-w-[300px] overflow-hidden shadow-[0_18px_50px_rgba(0,0,0,0.16)] sm:max-w-[360px] md:max-w-[420px]">
          <Image
            src={HERO_POSTER}
            alt="Doug from GPTea holding office coffee."
            fill
            priority
            sizes="(max-width: 1024px) 80vw, 420px"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}

function Player() {
  return (
    <section
      id="player"
      className="px-5 md:px-14 pt-10 md:pt-16 pb-12 md:pb-20 flex flex-col gap-6 md:gap-10 scroll-mt-14"
    >
      <NowPlayingBoard work={GPTEA} />
      <SocialRow campaign="gptea" variant="light" />
      <div
        id="subscribe"
        className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)] gap-6 md:gap-8 items-start scroll-mt-14"
      >
        <ShowSubscribeBlock
          interest="gptea"
          variant="light"
          source="gptea_player"
        />
        <CommunityModule
          scope="workplace"
          variant="light"
          source="gptea_player"
        />
      </div>
    </section>
  );
}

function MeetTheCast() {
  const cast = [
    {
      name: "DOUG",
      tag: "The hoodie guy.",
      body: "Already emotionally offsite. Holds coffee like a warning flare. Saw the AI memo and decided the correct response was stillness.",
      src: "/work/gptea/ep-05-poster.jpg",
    },
    {
      name: "MARV",
      tag: "The other guy.",
      body: "Still asking follow-up questions after the room has clearly lost the plot. Wants a normal workday. Keeps receiving prophecy instead.",
      src: "/work/gptea/ep-01-poster.jpg",
    },
  ];

  return (
    <section className="bg-black text-cream border-y-2 border-black px-5 md:px-14 py-12 md:py-20 flex flex-col gap-8 md:gap-10">
      <header className="flex items-end justify-between border-b-2 border-cream/30 pb-5 md:pb-6 gap-4 flex-wrap">
        <h2 className="font-display text-[clamp(36px,7vw,72px)] leading-[0.95] tracking-normal uppercase">
          Meet the cast
        </h2>
        <div className="text-[10px] md:text-[11px] font-bold tracking-[0.1em] uppercase opacity-70">
          Two coworkers. One breakroom. Zero comfort.
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-[980px]">
        {cast.map((member) => (
          <article key={member.name} className="flex flex-col gap-3">
            <div className="relative w-full max-w-[360px] aspect-[9/16] overflow-hidden border-2 border-cream/30 bg-black">
              <Image
                src={member.src}
                alt={member.name}
                fill
                sizes="(max-width: 768px) 100vw, 360px"
                className="object-cover"
              />
            </div>
            <h3 className="font-display text-[24px] md:text-[32px] leading-[0.95] tracking-normal uppercase">
              {member.name}
            </h3>
            <div className="text-[11px] md:text-[12px] font-bold tracking-[0.08em] uppercase opacity-90">
              {member.tag}
            </div>
            <p className="text-[13px] md:text-[14px] leading-[1.5] opacity-80 max-w-[460px]">
              {member.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function BackToNetwork() {
  return (
    <section className="px-5 md:px-14 py-10 md:py-14">
      <Link
        href="/"
        className="inline-flex items-center gap-3 bg-black text-lime px-5 py-4 font-display text-[14px] md:text-[16px] uppercase tracking-normal"
      >
        ← Back to VNMSFX
      </Link>
    </section>
  );
}
