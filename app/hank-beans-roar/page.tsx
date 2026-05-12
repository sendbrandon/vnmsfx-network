import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { NowPlayingBoard } from "../components/NowPlayingBoard";
import { PageViewTracker } from "../components/PageViewTracker";
import { SocialRow } from "../components/SocialRow";
import { SubmissionForm } from "../components/SubmissionForm";
import { TrackedLink } from "../components/TrackedLink";
import { HANK_BEANS_ROAR } from "../lib/shows";

const LOGO = "/brand/vnmsfx-logo-black.png";

export const metadata: Metadata = {
  title: "Hank, Beans & Roar — VNMSFX",
  description:
    "Meet Hank, Beans, and Roar, a VNMSFX short-form character series about a clueless human, a stressed-out dog, and a lion who ruins everything.",
  alternates: { canonical: "https://vnmsfx.com/hank-beans-roar" },
  openGraph: {
    title: "Hank, Beans & Roar — VNMSFX",
    description:
      "Meet Hank, Beans, and Roar, a VNMSFX short-form character series about a clueless human, a stressed-out dog, and a lion who ruins everything.",
    type: "website",
    url: "https://vnmsfx.com/hank-beans-roar",
    images: [
      {
        url: "/og-hank-beans-roar.png",
        width: 1200,
        height: 630,
        alt: "Hank, Beans & Roar — One expedition. Zero survival instincts.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hank, Beans & Roar — VNMSFX",
    description:
      "One expedition. Zero survival instincts. A VNMSFX short-form character series.",
    images: ["/og-hank-beans-roar.png"],
  },
};

export default function HankBeansRoarPage() {
  return (
    <main className="font-sans bg-black text-cream overflow-x-hidden">
      <PageViewTracker show="hank_beans_roar" />
      <ShowNav />
      <Hero />
      <Player />
      <CharacterQA />
      <Submission />
      <BackToNetwork />
    </main>
  );
}

function ShowNav() {
  return (
    <nav className="w-full h-14 flex items-center justify-between px-5 md:px-14 border-b-[1.5px] border-cream/30 text-[10px] md:text-[11px] font-bold tracking-[0.08em] uppercase">
      <Link href="/" className="flex items-center gap-2 hover:opacity-80">
        <span className="block w-2.5 h-2.5 rounded-full bg-lime shrink-0" />
        <Image
          src="/brand/vnmsfx-logo-white.png"
          alt="VNMSFX"
          width={2522}
          height={905}
          priority
          className="h-[16px] md:h-[18px] w-auto"
        />
        <span className="hidden sm:inline opacity-70">
          &nbsp;&nbsp;/&nbsp;&nbsp;Hank, Beans &amp; Roar
        </span>
      </Link>
      <Link href="/checkpoint-chisme" className="hover:underline">
        ↗ Checkpoint Chisme
      </Link>
    </nav>
  );
}

function Hero() {
  return (
    <section className="px-5 md:px-14 pt-12 md:pt-24 pb-10 md:pb-16 flex flex-col gap-8 md:gap-12">
      <div className="flex flex-col gap-3 md:gap-4">
        <div className="text-[10px] md:text-[11px] font-bold tracking-[0.14em] uppercase opacity-70 flex items-center gap-2">
          <span className="block w-2.5 h-2.5 rounded-full bg-lime" />
          <span>A VNMSFX Show · S1 · {HANK_BEANS_ROAR.episodes?.length} episodes</span>
        </div>
        <h1 className="font-display text-[clamp(54px,12vw,168px)] leading-[0.86] tracking-[-0.04em] uppercase">
          Hank, Beans &amp; Roar
        </h1>
        <p className="font-serif italic text-[20px] md:text-[28px] leading-[1.2] max-w-[820px]">
          One expedition. Zero survival instincts.
        </p>
      </div>
      <div className="flex flex-col md:flex-row gap-6 md:gap-12">
        <div className="flex-1 flex flex-col gap-2 text-[16px] md:text-[18px] leading-[1.5]">
          <p>Hank thinks he&rsquo;s leading.</p>
          <p>Beans knows they&rsquo;re doomed.</p>
          <p>Roar is why.</p>
          <p className="mt-4 opacity-80 text-[14px] md:text-[15px]">
            Watch the latest drops, meet the characters, and submit where they
            should go next.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 self-start md:self-end">
          <TrackedLink
            href="#player"
            event="watch_hank_beans_click"
            eventProps={{ source: "hbr_page_hero" }}
            className="flex items-center gap-3 group bg-lime text-black px-5 py-4"
          >
            <span className="font-display text-[15px] md:text-[16px] uppercase tracking-[-0.01em]">
              ▶ Watch the show
            </span>
            <span className="text-[18px] group-hover:translate-x-1 transition-transform">
              →
            </span>
          </TrackedLink>
          <TrackedLink
            href="#submit"
            event="submit_disaster_click"
            eventProps={{ source: "hbr_page_hero" }}
            className="flex items-center gap-3 group border-2 border-cream/60 px-5 py-4"
          >
            <span className="font-display text-[14px] md:text-[15px] uppercase tracking-[-0.01em]">
              Submit the Next Disaster
            </span>
            <span className="text-[16px] group-hover:translate-x-1 transition-transform opacity-80">
              ↗
            </span>
          </TrackedLink>
        </div>
      </div>
    </section>
  );
}

function Player() {
  return (
    <section
      id="player"
      className="px-5 md:px-14 pb-12 md:pb-20 flex flex-col gap-6 md:gap-10 scroll-mt-14"
    >
      <NowPlayingBoard work={HANK_BEANS_ROAR} />
      <SocialRow campaign="hank_beans_roar" variant="dark" />
    </section>
  );
}

function CharacterQA() {
  const qa = [
    {
      q: "Who is Hank?",
      a: "The confidently wrong human who thinks he's leading the expedition.",
    },
    {
      q: "Why is Beans always stressed?",
      a: "Because Beans notices the danger before everyone else.",
    },
    {
      q: "Why does Roar ruin everything?",
      a: "Because Roar believes every problem needs maximum force.",
    },
    {
      q: "What kind of world is this?",
      a: "A meme-logic expedition world full of cursed locations, suspicious signs, bad shortcuts, and preventable disasters.",
    },
  ];

  return (
    <section className="bg-cream text-black border-y-2 border-black px-5 md:px-14 py-12 md:py-20 flex flex-col gap-8 md:gap-10">
      <header className="flex items-end justify-between border-b-2 border-black pb-5 md:pb-6 gap-4 flex-wrap">
        <h2 className="font-display text-[clamp(36px,7vw,72px)] leading-[0.95] tracking-[-0.03em] uppercase">
          Meet the cast
        </h2>
        <div className="text-[10px] md:text-[11px] font-bold tracking-[0.1em] uppercase opacity-70">
          Three characters. Zero plan.
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <CastCard
          src="/cast/hank.jpg"
          name="HANK"
          tag="Confidently wrong. Somehow still alive."
          body="The human who treats every warning sign like a suggestion."
        />
        <CastCard
          src="/cast/beans.jpg"
          name="BEANS"
          tag="The only one paying attention."
          body="A stressed-out dog with better survival instincts than the entire team."
        />
        <CastCard
          src="/cast/roar.jpg"
          name="ROAR"
          tag="The problem with a mane."
          body="A lion who believes every situation can be solved by escalating it."
        />
      </div>

      <div className="flex flex-col gap-4 md:gap-5 pt-6 md:pt-8 border-t-2 border-black">
        {qa.map((row) => (
          <div
            key={row.q}
            className="flex flex-col md:flex-row md:items-start gap-2 md:gap-8"
          >
            <div className="md:w-[320px] font-display text-[18px] md:text-[22px] leading-[1.1] tracking-[-0.01em] uppercase">
              {row.q}
            </div>
            <div className="flex-1 text-[15px] md:text-[16px] leading-[1.55]">
              {row.a}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CastCard({
  src,
  name,
  tag,
  body,
}: {
  src: string;
  name: string;
  tag: string;
  body: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full aspect-[4/5] overflow-hidden border-2 border-black">
        <Image
          src={src}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="font-display text-[28px] md:text-[36px] leading-[0.95] tracking-[-0.02em] uppercase">
        {name}
      </div>
      <div className="text-[11px] md:text-[12px] font-bold tracking-[0.08em] uppercase">
        {tag}
      </div>
      <p className="text-[13px] md:text-[14px] leading-[1.5]">{body}</p>
    </div>
  );
}

function Submission() {
  return (
    <section
      id="submit"
      className="bg-black text-cream px-5 md:px-14 py-12 md:py-20 flex flex-col gap-8 md:gap-10 scroll-mt-14"
    >
      <header className="flex items-end justify-between border-b-2 border-cream/30 pb-5 md:pb-6 gap-4 flex-wrap">
        <div className="flex flex-col gap-2">
          <div className="text-[10px] md:text-[11px] font-bold tracking-[0.14em] uppercase opacity-70 flex items-center gap-2">
            <span className="block w-2.5 h-2.5 rounded-full bg-lime" />
            Audience writers' room
          </div>
          <h2 className="font-display text-[clamp(36px,7vw,72px)] leading-[0.95] tracking-[-0.03em] uppercase">
            Submit the next disaster
          </h2>
        </div>
        <div className="text-[12px] md:text-[13px] font-bold tracking-[0.08em] uppercase opacity-70 max-w-[280px] text-right">
          Where should they go next? What should Roar ruin? You tell us.
        </div>
      </header>

      <SubmissionForm
        showSlug="hank_beans_roar"
        showTitle="Hank, Beans & Roar"
        subjectPrefix="Next Disaster"
        ctaLabel="Send the disaster"
        trackEvent="submit_disaster_click"
        variant="dark"
        fields={[
          {
            key: "where",
            label: "Where should Hank, Beans & Roar go next?",
            required: true,
            placeholder: "A waterpark / A jury duty / Costco at 11pm…",
          },
          {
            key: "beans",
            label: "What should Beans notice first?",
            placeholder: "The sign that says do not enter…",
          },
          {
            key: "roar",
            label: "What should Roar ruin?",
            placeholder: "The complimentary breakfast…",
          },
          {
            key: "hank",
            label: "What should Hank misunderstand?",
            placeholder: "Hank thinks the wifi is a snack…",
          },
          {
            key: "name",
            label: "Your name or handle",
            placeholder: "@yourhandle",
          },
          {
            key: "email",
            label: "Email (optional)",
            type: "email",
            placeholder: "we won't spam you",
          },
        ]}
      />
    </section>
  );
}

function BackToNetwork() {
  return (
    <section className="bg-lavender text-black px-5 md:px-14 py-10 md:py-14 flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-t-2 border-black">
      <div className="flex-1">
        <div className="text-[10px] md:text-[11px] font-bold tracking-[0.14em] uppercase opacity-70">
          ● The Network
        </div>
        <h3 className="font-display text-[clamp(28px,5vw,44px)] leading-[1.05] tracking-[-0.02em] uppercase mt-2">
          Two shows. One network.
        </h3>
        <p className="text-[14px] md:text-[15px] leading-[1.5] mt-3 max-w-[640px]">
          Hank, Beans &amp; Roar is one of two flagship VNMSFX shows. Also currently airing: <strong>Checkpoint Chisme</strong> — felt puppet airport security comedy.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <TrackedLink
          href="/checkpoint-chisme"
          event="watch_checkpoint_chisme_click"
          eventProps={{ source: "hbr_page_footer" }}
          className="flex items-center gap-3 group border-2 border-black px-5 py-4"
        >
          <span className="font-display text-[14px] md:text-[15px] uppercase tracking-[-0.01em]">
            ↗ Checkpoint Chisme
          </span>
        </TrackedLink>
        <Link
          href="/"
          className="flex items-center gap-3 group bg-black text-lime px-5 py-4"
        >
          <span className="font-display text-[14px] md:text-[15px] uppercase tracking-[-0.01em]">
            ← Back to VNMSFX
          </span>
        </Link>
      </div>
    </section>
  );
}
