import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { NowPlayingBoard } from "../components/NowPlayingBoard";
import { PageViewTracker } from "../components/PageViewTracker";
import { SocialRow } from "../components/SocialRow";
import { SubmissionForm } from "../components/SubmissionForm";
import { TrackedLink } from "../components/TrackedLink";
import { CHECKPOINT_CHISME } from "../lib/shows";

const LOGO = "/brand/vnmsfx-logo-black.png";

export const metadata: Metadata = {
  title: "Checkpoint Chisme — VNMSFX",
  description:
    "Checkpoint Chisme is a VNMSFX felt puppet comedy series where airport security, gossip, IDs, passengers, and bureaucracy collide.",
  alternates: { canonical: "https://vnmsfx.com/checkpoint-chisme" },
  openGraph: {
    title: "Checkpoint Chisme — VNMSFX",
    description:
      "Checkpoint Chisme is a VNMSFX felt puppet comedy series where airport security, gossip, IDs, passengers, and bureaucracy collide.",
    type: "website",
    url: "https://vnmsfx.com/checkpoint-chisme",
    images: [
      {
        url: "/og-checkpoint-chisme.png",
        width: 1200,
        height: 630,
        alt: "Checkpoint Chisme — Airport security. Maximum gossip.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Checkpoint Chisme — VNMSFX",
    description:
      "Airport security. Maximum gossip. A VNMSFX felt puppet comedy series.",
    images: ["/og-checkpoint-chisme.png"],
  },
};

export default function CheckpointChismePage() {
  return (
    <main className="font-sans bg-cream text-black overflow-x-hidden">
      <PageViewTracker show="checkpoint_chisme" />
      <ShowNav />
      <Hero />
      <Player />
      <WorldQA />
      <Submission />
      <BackToNetwork />
    </main>
  );
}

function ShowNav() {
  return (
    <nav className="w-full h-14 flex items-center justify-between px-5 md:px-14 border-b-[1.5px] border-black text-[10px] md:text-[11px] font-bold tracking-[0.08em] uppercase bg-cream">
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
          &nbsp;&nbsp;/&nbsp;&nbsp;Checkpoint Chisme
        </span>
      </Link>
      <Link href="/hank-beans-roar" className="hover:underline">
        ↗ Hank, Beans &amp; Roar
      </Link>
    </nav>
  );
}

function Hero() {
  return (
    <section className="px-5 md:px-14 pt-12 md:pt-24 pb-10 md:pb-16 flex flex-col gap-8 md:gap-12">
      <div className="flex flex-col gap-3 md:gap-4">
        <div className="text-[10px] md:text-[11px] font-bold tracking-[0.14em] uppercase opacity-70 flex items-center gap-2">
          <span className="block w-2.5 h-2.5 rounded-full bg-lime border border-black" />
          <span>
            A VNMSFX Show · Felt Puppet · {CHECKPOINT_CHISME.episodes?.length} episodes
          </span>
        </div>
        <h1 className="font-display text-[clamp(50px,11vw,148px)] leading-[0.86] tracking-[-0.04em] uppercase">
          Checkpoint Chisme
        </h1>
        <p className="font-serif italic text-[20px] md:text-[28px] leading-[1.2] max-w-[820px]">
          Airport security. Maximum gossip.
        </p>
      </div>
      <div className="flex flex-col md:flex-row gap-6 md:gap-12">
        <p className="flex-1 text-[15px] md:text-[17px] leading-[1.55] max-w-[640px]">
          A felt puppet comedy series where every checkpoint becomes an
          investigation, every passenger has a story, and every break room
          has something to say.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 self-start md:self-end">
          <TrackedLink
            href="#player"
            event="watch_checkpoint_chisme_click"
            eventProps={{ source: "cc_page_hero" }}
            className="flex items-center gap-3 group bg-lime text-black px-5 py-4 border-2 border-black"
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
            event="report_chisme_click"
            eventProps={{ source: "cc_page_hero" }}
            className="flex items-center gap-3 group border-2 border-black px-5 py-4"
          >
            <span className="font-display text-[14px] md:text-[15px] uppercase tracking-[-0.01em]">
              Report Some Chisme
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
      <NowPlayingBoard work={CHECKPOINT_CHISME} />
      <SocialRow campaign="checkpoint_chisme" variant="light" />
    </section>
  );
}

function WorldQA() {
  const qa = [
    {
      q: "What is Checkpoint Chisme?",
      a: "A felt puppet comedy series set inside an airport security world where routine checks turn into gossip-fueled chaos.",
    },
    {
      q: "What kind of comedy is it?",
      a: "Authority comedy, workplace comedy, airport absurdity, and neighborhood chisme all smashed together.",
    },
    {
      q: "Who is it for?",
      a: "People who love puppet comedy, TSA/airport jokes, Latino humor, workplace drama, and characters who take tiny situations way too seriously.",
    },
    {
      q: "What is the world?",
      a: "A checkpoint universe where IDs talk back, passengers overshare, agents investigate everything, and no one leaves without becoming part of the story.",
    },
  ];

  return (
    <section className="bg-black text-cream border-y-2 border-black px-5 md:px-14 py-12 md:py-20 flex flex-col gap-8 md:gap-10">
      <header className="flex items-end justify-between border-b-2 border-cream/30 pb-5 md:pb-6 gap-4 flex-wrap">
        <h2 className="font-display text-[clamp(36px,7vw,72px)] leading-[0.95] tracking-[-0.03em] uppercase">
          The world
        </h2>
        <div className="text-[10px] md:text-[11px] font-bold tracking-[0.1em] uppercase opacity-70 max-w-[280px] text-right">
          Where airport security becomes community theater.
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
        {[
          ["The agents", "are dramatic."],
          ["The passengers", "are suspicious."],
          ["The IDs", "have stories."],
          ["The break room", "has opinions."],
        ].map(([title, body]) => (
          <div
            key={title}
            className="flex flex-col gap-2 border-2 border-cream/30 p-4"
          >
            <div className="font-display text-[15px] md:text-[18px] leading-[1.05] tracking-[-0.01em] uppercase">
              {title}
            </div>
            <div className="text-[13px] md:text-[14px] leading-[1.5] opacity-80">
              {body}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 md:gap-5">
        {qa.map((row) => (
          <div
            key={row.q}
            className="flex flex-col md:flex-row md:items-start gap-2 md:gap-8"
          >
            <div className="md:w-[320px] font-display text-[18px] md:text-[22px] leading-[1.1] tracking-[-0.01em] uppercase">
              {row.q}
            </div>
            <div className="flex-1 text-[15px] md:text-[16px] leading-[1.55] opacity-90">
              {row.a}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Submission() {
  return (
    <section
      id="submit"
      className="bg-cream text-black px-5 md:px-14 py-12 md:py-20 flex flex-col gap-8 md:gap-10 scroll-mt-14"
    >
      <header className="flex items-end justify-between border-b-2 border-black pb-5 md:pb-6 gap-4 flex-wrap">
        <div className="flex flex-col gap-2">
          <div className="text-[10px] md:text-[11px] font-bold tracking-[0.14em] uppercase opacity-70 flex items-center gap-2">
            <span className="block w-2.5 h-2.5 rounded-full bg-lime border border-black" />
            Audience writers' room
          </div>
          <h2 className="font-display text-[clamp(36px,7vw,72px)] leading-[0.95] tracking-[-0.03em] uppercase">
            Report some chisme
          </h2>
        </div>
        <div className="text-[12px] md:text-[13px] font-bold tracking-[0.08em] uppercase opacity-70 max-w-[280px] text-right">
          Heard something at Gate B? Tell us. The agents will investigate.
        </div>
      </header>

      <SubmissionForm
        showSlug="checkpoint_chisme"
        showTitle="Checkpoint Chisme"
        subjectPrefix="Chisme Report"
        ctaLabel="Send the chisme"
        trackEvent="report_chisme_click"
        variant="light"
        fields={[
          {
            key: "situation",
            label: "What checkpoint situation should become an episode?",
            required: true,
            placeholder: "The traveler with seventeen plantains in carry-on…",
          },
          {
            key: "who",
            label: "Who is causing the chisme?",
            placeholder: "A passenger / an agent / the supervisor…",
          },
          {
            key: "what",
            label:
              "What suspicious item, ID, or passenger detail starts the drama?",
            placeholder: "An expired ID with a different last name…",
          },
          {
            key: "overreact",
            label: "What should the agent completely overreact to?",
            placeholder: "A bag of expired Halloween candy…",
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
          Checkpoint Chisme is one of two flagship VNMSFX shows. Also currently airing: <strong>Hank, Beans &amp; Roar</strong> — a clueless human, a stressed dog, and a lion who ruins everything.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <TrackedLink
          href="/hank-beans-roar"
          event="watch_hank_beans_click"
          eventProps={{ source: "cc_page_footer" }}
          className="flex items-center gap-3 group border-2 border-black px-5 py-4"
        >
          <span className="font-display text-[14px] md:text-[15px] uppercase tracking-[-0.01em]">
            ↗ Hank, Beans &amp; Roar
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
