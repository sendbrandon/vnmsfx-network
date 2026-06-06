import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { NowPlayingBoard } from "../components/NowPlayingBoard";
import { PageViewTracker } from "../components/PageViewTracker";
import { SocialRow } from "../components/SocialRow";
import { SubmissionForm } from "../components/SubmissionForm";
import { TrackedLink } from "../components/TrackedLink";
import { CHECKPOINT_CHISME } from "../lib/shows";
import { buildShowSchema } from "../lib/schema";

const LOGO = "/brand/vnmsfx-logo-black.png";

export const metadata: Metadata = {
  title: "Checkpoint Chisme — VNMSFX",
  description:
    "Checkpoint Chisme is a VNMSFX two-character felt-puppet comedy. An insecure US officer treats a working-class Mexican dad like a federal case — in the wrong place, every time, and loses every time.",
  alternates: { canonical: "https://vnmsfx.com/checkpoint-chisme" },
  openGraph: {
    title: "Checkpoint Chisme — VNMSFX",
    description:
      "A two-character felt-puppet comedy. Officer Pike runs every encounter like a federal case. Don Rafa was just trying to get tacos.",
    type: "website",
    url: "https://vnmsfx.com/checkpoint-chisme",
    images: [
      {
        url: "/og-checkpoint-chisme.png",
        width: 1200,
        height: 630,
        alt: "Checkpoint Chisme — Tactical force. Tuesday energy.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Checkpoint Chisme — VNMSFX",
    description:
      "Tactical force. Tuesday energy. A VNMSFX two-character felt-puppet comedy.",
    images: ["/og-checkpoint-chisme.png"],
  },
};

export default function CheckpointChismePage() {
  const schema = buildShowSchema(CHECKPOINT_CHISME);
  return (
    <main className="font-sans bg-cream text-black overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <PageViewTracker show="checkpoint_chisme" />
      <ShowNav />
      <Hero />
      <Player />
      <MeetTheCast />
      <TheWorld />
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
    <section className="min-h-[calc(100svh-56px)] border-b-2 border-black px-5 md:px-14 pt-12 md:pt-24 pb-10 md:pb-16 flex flex-col justify-between gap-8 md:gap-12">
      <div className="flex flex-col gap-3 md:gap-4">
        <div className="text-[10px] md:text-[11px] font-bold tracking-[0.14em] uppercase opacity-70 flex items-center gap-2">
          <span className="block w-2.5 h-2.5 rounded-full bg-lime border border-black" />
          <span>
            A VNMSFX Show · Felt Puppet · {CHECKPOINT_CHISME.episodes?.length}{" "}
            episodes
          </span>
        </div>
        <h1 className="font-display text-[clamp(50px,11vw,148px)] leading-[0.86] tracking-[-0.04em] uppercase">
          Checkpoint Chisme
        </h1>
        <p className="font-serif italic text-[20px] md:text-[28px] leading-[1.2] max-w-[820px]">
          Tactical force. Tuesday energy.
        </p>
      </div>
      <div className="flex flex-col md:flex-row gap-6 md:gap-12">
        <p className="flex-1 text-[15px] md:text-[17px] leading-[1.55] max-w-[640px]">
          A two-character felt-puppet comedy. An insecure US officer treats a
          working-class Mexican dad like a federal case &mdash; in the wrong
          place, every time. The chisme is always in the details.
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
      className="px-5 md:px-14 pt-10 md:pt-16 pb-12 md:pb-20 flex flex-col gap-6 md:gap-10 scroll-mt-14"
    >
      <NowPlayingBoard work={CHECKPOINT_CHISME} />
      <SocialRow campaign="checkpoint_chisme" variant="light" />
    </section>
  );
}

function MeetTheCast() {
  const cast: { name: string; tag: string; line: string; src: string }[] = [
    {
      name: "OFFICER PIKE",
      tag: "Federal force. Wrong sneakers.",
      line: "Insecure US officer. Olive shirt, tactical vest, gold badge, AR-15. Bright red Air Jordans on duty. Treats every encounter like a federal case. Loses every time.",
      src: "/cast/cc-agente.jpg",
    },
    {
      name: "DON RAFA",
      tag: "Tool belt. One-word denial.",
      line: "Working-class Mexican dad. Blue work shirt, black leather apron, tool belt, city-employee lanyard Pike never reads. Owns the taco truck Pike raids. Fixes the printer Pike just broke. Wins by doing nothing.",
      src: "/cast/cc-inspector.jpg",
    },
  ];
  return (
    <section className="bg-black text-cream border-y-2 border-black px-5 md:px-14 py-12 md:py-20 flex flex-col gap-8 md:gap-10">
      <header className="flex items-end justify-between border-b-2 border-cream/30 pb-5 md:pb-6 gap-4 flex-wrap">
        <h2 className="font-display text-[clamp(36px,7vw,72px)] leading-[0.95] tracking-[-0.03em] uppercase">
          Meet the cast
        </h2>
        <div className="text-[10px] md:text-[11px] font-bold tracking-[0.1em] uppercase opacity-70">
          Two puppets. One never wins.
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-[1100px]">
        {cast.map((c) => (
          <div key={c.name} className="flex flex-col gap-3">
            <div className="relative w-full aspect-[4/5] overflow-hidden border-2 border-cream/30">
              <Image
                src={c.src}
                alt={c.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="font-display text-[24px] md:text-[32px] leading-[0.95] tracking-[-0.02em] uppercase">
              {c.name}
            </div>
            <div className="text-[11px] md:text-[12px] font-bold tracking-[0.08em] uppercase opacity-90">
              {c.tag}
            </div>
            <p className="text-[13px] md:text-[14px] leading-[1.5] opacity-80">
              {c.line}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function TheWorld() {
  return (
    <section className="bg-cream text-black px-5 md:px-14 py-12 md:py-20 flex flex-col gap-8 md:gap-10">
      <header className="flex items-end justify-between border-b-2 border-black pb-5 md:pb-6 gap-4 flex-wrap">
        <h2 className="font-display text-[clamp(36px,7vw,72px)] leading-[0.95] tracking-[-0.03em] uppercase">
          The world
        </h2>
        <div className="text-[10px] md:text-[11px] font-bold tracking-[0.1em] uppercase opacity-70">
          What you&rsquo;re watching
        </div>
      </header>

      <div className="flex flex-col gap-2 max-w-[760px]">
        <p className="font-serif italic text-[20px] md:text-[26px] leading-[1.25]">
          Felt-puppet enforcement. Real-world stakes.
        </p>
        <p className="text-[15px] md:text-[16px] leading-[1.55]">
          Suburban California, late afternoon. Pike has followed Rafa into
          every corner of his life &mdash; the parking lot, the taco truck, the
          drive-thru, the immigration counter at 4pm. Every encounter is a
          traffic stop. Every traffic stop ends the same way. The badge cracks
          before Rafa does.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 max-w-[820px]">
        <WorldCard
          kicker="Where"
          line="Suburban California, dusk. Parking lots, taco trucks, drive-thrus, the immigration counter, the government hallway with the red Jordans."
        />
        <WorldCard
          kicker="What happens"
          line="Pike escalates. Rafa deadpans. Pike escalates harder. A small detail flips the power. Rafa walks away."
        />
        <WorldCard
          kicker="Who&rsquo;s there"
          line="Two leads. Real-human bystanders. One printer that keeps malfunctioning. Pike&rsquo;s sneakers."
        />
        <WorldCard
          kicker="Vibe"
          line="Awkward Puppets meets a traffic stop you can&rsquo;t believe is happening. Authority comedy with the volume turned down on the right side."
        />
      </div>
    </section>
  );
}

function WorldCard({ kicker, line }: { kicker: string; line: string }) {
  return (
    <div className="flex flex-col gap-2 border-2 border-black p-4 md:p-5">
      <div
        className="text-[10px] md:text-[11px] font-bold tracking-[0.14em] uppercase opacity-70"
        dangerouslySetInnerHTML={{ __html: kicker }}
      />
      <div className="text-[14px] md:text-[15px] leading-[1.5]">{line}</div>
    </div>
  );
}

function Submission() {
  return (
    <section
      id="submit"
      className="bg-black text-cream px-5 md:px-14 py-12 md:py-20 flex flex-col gap-8 md:gap-10 scroll-mt-14 border-t-2 border-black"
    >
      <header className="flex items-end justify-between border-b-2 border-cream/30 pb-5 md:pb-6 gap-4 flex-wrap">
        <div className="flex flex-col gap-2">
          <div className="text-[10px] md:text-[11px] font-bold tracking-[0.14em] uppercase opacity-70 flex items-center gap-2">
            <span className="block w-2.5 h-2.5 rounded-full bg-lime" />
            Audience writers&rsquo; room
          </div>
          <h2 className="font-display text-[clamp(36px,7vw,72px)] leading-[0.95] tracking-[-0.03em] uppercase">
            Report some chisme
          </h2>
        </div>
        <div className="text-[12px] md:text-[13px] font-bold tracking-[0.08em] uppercase opacity-70 max-w-[280px] text-right">
          Heard something in the parking lot? Drop it.
        </div>
      </header>

      <SubmissionForm
        showSlug="checkpoint_chisme"
        showTitle="Checkpoint Chisme"
        subjectPrefix="Chisme Report"
        ideaLabel="Where should Pike walk in on Rafa next?"
        ideaPlaceholder="A traffic stop at the car wash. A pat-down at the laundromat. A federal investigation of an enchilada."
        ctaLabel="Send the chisme"
        trackEvent="report_chisme_click"
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
          Also on VNMSFX
        </h3>
        <p className="text-[14px] md:text-[15px] leading-[1.5] mt-3 max-w-[640px]">
          <strong>Hank, Beans &amp; Roar</strong> — a clueless human, a
          stressed dog, and a lion who ruins everything.
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
            ← VNMSFX
          </span>
        </Link>
      </div>
    </section>
  );
}
