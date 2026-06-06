import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { NowPlayingBoard } from "../components/NowPlayingBoard";
import { PageViewTracker } from "../components/PageViewTracker";
import { SocialRow } from "../components/SocialRow";
import { SubmissionForm } from "../components/SubmissionForm";
import { TrackedLink } from "../components/TrackedLink";
import { REX_AND_CROW } from "../lib/shows";
import { buildShowSchema } from "../lib/schema";

export const metadata: Metadata = {
  title: "Rex & Crow — VNMSFX",
  description:
    "Meet Rex and Crow, a VNMSFX felt-puppet series about two roommates frozen since 1989 — a glam-rock optimist and a goth-rock cynic — getting punched in the face by the modern world.",
  alternates: { canonical: "https://vnmsfx.com/rex-and-crow" },
  openGraph: {
    title: "Rex & Crow — VNMSFX",
    description:
      "They never broke up. Reality kept happening. A VNMSFX felt-puppet two-hander about a glam-rock optimist and a goth-rock cynic stuck in the same NYC apartment since 1989.",
    type: "website",
    url: "https://vnmsfx.com/rex-and-crow",
    images: [
      {
        url: "/og-rex-and-crow.png",
        width: 1200,
        height: 630,
        alt: "Rex & Crow — They never broke up. Reality kept happening.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rex & Crow — VNMSFX",
    description:
      "They never broke up. Reality kept happening. A VNMSFX felt-puppet series.",
    images: ["/og-rex-and-crow.png"],
  },
};

export default function RexAndCrowPage() {
  const schema = buildShowSchema(REX_AND_CROW);
  return (
    <main className="font-sans bg-black text-cream overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <PageViewTracker show="rex_and_crow" />
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
          &nbsp;&nbsp;/&nbsp;&nbsp;Rex &amp; Crow
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
    <section className="min-h-[calc(100svh-56px)] border-b-[1.5px] border-cream/30 px-5 md:px-14 pt-12 md:pt-24 pb-10 md:pb-16 flex flex-col justify-between gap-8 md:gap-12">
      <div className="flex flex-col gap-3 md:gap-4">
        <div className="text-[10px] md:text-[11px] font-bold tracking-[0.14em] uppercase opacity-70 flex items-center gap-2">
          <span className="block w-2.5 h-2.5 rounded-full bg-lime" />
          <span>A VNMSFX Show · S1 · {REX_AND_CROW.episodes?.length} episodes</span>
        </div>
        <h1 className="font-display text-[clamp(54px,12vw,168px)] leading-[0.86] tracking-[-0.04em] uppercase">
          Rex &amp; Crow
        </h1>
        <p className="font-serif italic text-[20px] md:text-[28px] leading-[1.2] max-w-[820px]">
          They never broke up. Reality kept happening.
        </p>
      </div>
      <div className="flex flex-col md:flex-row gap-6 md:gap-12">
        <div className="flex-1 flex flex-col gap-2 text-[16px] md:text-[18px] leading-[1.5]">
          <p>Rex thinks they&rsquo;re still making it.</p>
          <p>Crow knew they didn&rsquo;t in 1992.</p>
          <p>The rent&rsquo;s due Friday.</p>
          <p className="mt-4 opacity-80 text-[14px] md:text-[15px]">
            A felt-puppet two-hander about a glam-rock optimist and a goth-rock
            cynic sharing the same NYC apartment since 1989. New episodes drop
            whenever the world shows up uninvited.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 self-start md:self-end">
          <TrackedLink
            href="#player"
            event="watch_rex_and_crow_click"
            eventProps={{ source: "rc_page_hero" }}
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
            event="submit_rex_and_crow_click"
            eventProps={{ source: "rc_page_hero" }}
            className="flex items-center gap-3 group border-2 border-cream/60 px-5 py-4"
          >
            <span className="font-display text-[14px] md:text-[15px] uppercase tracking-[-0.01em]">
              Send the Next Bullshit
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
      className="px-5 md:px-14 pt-10 md:pt-16 pb-12 md:pb-20 flex flex-col gap-6 md:gap-10 scroll-mt-14"
    >
      <NowPlayingBoard work={REX_AND_CROW} />
      <SocialRow campaign="rex_and_crow" variant="dark" />
    </section>
  );
}

function CharacterQA() {
  const qa = [
    {
      q: "Who is Rex?",
      a: "The white-haired glam frontman who still believes the band is going to make it. Confidently wrong about everything modern. Will panic. Will yell. Will sign up for the new AI assistant.",
    },
    {
      q: "Who is Crow?",
      a: "The black-haired goth bassist who accepted defeat in 1992. Calm in any disaster. 'The curb owns the vehicle.' Refuses to engage with whatever Rex just signed them up for.",
    },
    {
      q: "What's the world?",
      a: "A rent-stabilized one-bedroom in NYC. Hair-metal posters never came down. The lease is in someone's dead uncle's name. Modern bullshit (AI, Tinder, wellness, tow trucks, gentrification) keeps arriving at the door.",
    },
    {
      q: "Why is Crow finally winning in life?",
      a: "Because Crow has decided the absence of trying counts as winning. Rex disagrees and intends to hold an intervention. The intervention is also doomed.",
    },
    {
      q: "What kind of show is this?",
      a: "A two-puppet odd-couple comedy. Felt-puppet construction. NYC location. Each episode is one new 2026 problem hitting two characters who never left 1989. Format-as-joke: the band that never broke up keeps getting punched by the present.",
    },
  ];

  return (
    <section className="bg-cream text-black border-y-2 border-black px-5 md:px-14 py-12 md:py-20 flex flex-col gap-8 md:gap-10">
      <header className="flex items-end justify-between border-b-2 border-black pb-5 md:pb-6 gap-4 flex-wrap">
        <h2 className="font-display text-[clamp(36px,7vw,72px)] leading-[0.95] tracking-[-0.03em] uppercase">
          Meet the cast
        </h2>
        <div className="text-[10px] md:text-[11px] font-bold tracking-[0.1em] uppercase opacity-70">
          Two characters. One apartment. Zero plan.
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-[920px]">
        <CastCard
          src="/cast/rex.jpg"
          name="REX"
          tag="Still thinks they're making it."
          body="Glam-rock frontman. White-blonde hair, smudged kohl, sleeveless white satin vest. Believes hustle works. Engages with every new modern thing. Panics first, processes later."
        />
        <CastCard
          src="/cast/crow.jpg"
          name="CROW"
          tag="Knew they weren't, in 1992."
          body="Goth-rock bassist. Jet-black hair, runny eye makeup, leather jacket, wallet chain. Believes nothing. Stays calm in any disaster. 'The curb owns the vehicle.'"
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
          sizes="(max-width: 768px) 100vw, 50vw"
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
            Audience writers&rsquo; room
          </div>
          <h2 className="font-display text-[clamp(36px,7vw,72px)] leading-[0.95] tracking-[-0.03em] uppercase">
            Send the next bullshit
          </h2>
        </div>
        <div className="text-[12px] md:text-[13px] font-bold tracking-[0.08em] uppercase opacity-70 max-w-[300px] text-right">
          What modern thing should ruin their week next? You tell us.
        </div>
      </header>

      <SubmissionForm
        showSlug="rex_and_crow"
        showTitle="Rex & Crow"
        subjectPrefix="Bullshit"
        ideaLabel="What modern thing should hit Rex & Crow next?"
        ideaPlaceholder="A meditation retreat. A wedding registry. A Soho House dinner. Their landlord's new app."
        ctaLabel="Send it"
        trackEvent="submit_rex_and_crow_click"
        variant="dark"
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
          Three shows. One network.
        </h3>
        <p className="text-[14px] md:text-[15px] leading-[1.5] mt-3 max-w-[640px]">
          Rex &amp; Crow is one of three flagship VNMSFX shows. Also currently airing: <strong>Hank, Beans &amp; Roar</strong> (expedition-disaster character series) and <strong>Checkpoint Chisme</strong> (felt-puppet airport security comedy).
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <TrackedLink
          href="/hank-beans-roar"
          event="watch_hank_beans_click"
          eventProps={{ source: "rc_page_footer" }}
          className="flex items-center gap-3 group border-2 border-black px-5 py-4"
        >
          <span className="font-display text-[14px] md:text-[15px] uppercase tracking-[-0.01em]">
            ↗ Hank, Beans &amp; Roar
          </span>
        </TrackedLink>
        <TrackedLink
          href="/checkpoint-chisme"
          event="watch_checkpoint_chisme_click"
          eventProps={{ source: "rc_page_footer" }}
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
