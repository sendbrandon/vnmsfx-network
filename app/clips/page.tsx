import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { SubscribeForm } from "../components/SubscribeForm";

const SITE_URL = "https://vnmsfx.com";
const LOGO_SRC = "/brand/vnmsfx-logo-black.png";
const LOGO_W = 2522;
const LOGO_H = 905;
const HERO_IMAGE = "/work/gptea/ep-02-poster.jpg";

export const metadata: Metadata = {
  title: "Clip GPTea - VNMSFX",
  description:
    "Public VNMSFX clipper rules for reposting GPTea clips, linking back, and earning Correspondent credit.",
  alternates: { canonical: `${SITE_URL}/clips` },
  openGraph: {
    title: "Clip GPTea - VNMSFX",
    description:
      "Yes, you can clip and repost GPTea if you follow the VNMSFX clipper rules and point people back to the Signal.",
    type: "website",
    url: `${SITE_URL}/clips`,
    images: [
      {
        url: HERO_IMAGE,
        width: 720,
        height: 1280,
        alt: "GPTea character Doug holding coffee in the office.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Clip GPTea - VNMSFX",
    description:
      "Repost GPTea clips, keep the VNMSFX signal intact, and point people back to vnmsfx.com/signal.",
    images: [HERO_IMAGE],
  },
};

const CLIPPER_RULES = [
  {
    label: "Keep The Mark Visible",
    body: "Do not crop out, blur, remove, or cover the VNMSFX/GPTea logo or watermark when it appears in the clip.",
  },
  {
    label: "Point Back To The Signal",
    body: "In the caption, pinned comment, profile link, or description, send people to vnmsfx.com/signal.",
  },
  {
    label: "Credit The Source",
    body: "Use clear credit like GPTea by @vnmsfx or VNMSFX. Make it obvious this is our show and your repost/edit.",
  },
  {
    label: "Do Not Fake Context",
    body: "Do not edit dialogue, order, subtitles, or framing to make the show say something it did not say.",
  },
  {
    label: "Do Not Sell The Clip",
    body: "Do not put VNMSFX clips behind a paywall, sell full episodes, mint them, or imply you own the characters.",
  },
  {
    label: "Keep It Out Of Gross Places",
    body: "No hate content, porn, scams, fake endorsements, political ads, or spam farms using VNMSFX clips.",
  },
];

const CTA_LINES = [
  "We're making one subscriber comment into an episode. Join the Signal.",
  "Correspondents get the next drop first. Link in bio.",
  "Vote on what ruins the office next.",
  "Send us the most cursed AI/workplace thing you've seen. If we use it, we'll credit you.",
  "This network gets weirder if you participate.",
  "Want to vote on what gets made next? Join the VNMSFX Signal: vnmsfx.com",
];

const REWARD_PATH = [
  {
    label: "Public credit",
    body: "Clip, submit, or refer something that becomes useful and we can credit you publicly as a Correspondent.",
  },
  {
    label: "Priority ideas",
    body: "Clippers who send real viewers and good weirdness get moved toward the front of the premise pile.",
  },
  {
    label: "Affiliate layer",
    body: "When paid memberships go live, trackable links can turn into commission. The public trail starts now.",
  },
];

export default function ClipsPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-cream text-black">
      <ClipNav />
      <Hero />
      <Permission />
      <Rules />
      <Rewards />
      <CopyLines />
      <FinalSignup />
    </main>
  );
}

function ClipNav() {
  return (
    <nav className="flex h-14 w-full items-center justify-between border-b-2 border-black bg-lavender px-5 text-[10px] font-bold uppercase tracking-[0.08em] md:px-14 md:text-[11px]">
      <Link href="/" className="flex items-center gap-2 hover:opacity-80">
        <span className="block h-2.5 w-2.5 shrink-0 rounded-full border border-black bg-lime" />
        <Image
          src={LOGO_SRC}
          alt="VNMSFX"
          width={LOGO_W}
          height={LOGO_H}
          priority
          className="h-[16px] w-auto md:h-[18px]"
        />
      </Link>
      <div className="flex items-center gap-4 md:gap-6">
        <Link href="/gptea" className="hover:underline">
          GPTea
        </Link>
        <Link href="/signal" className="hover:underline">
          Signal
        </Link>
        <Link href="/clips" className="text-black underline decoration-lime decoration-2 underline-offset-4">
          Clip
        </Link>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="grid min-h-[calc(100svh-56px)] border-b-2 border-black bg-lavender lg:grid-cols-[1.1fr_0.9fr]">
      <div className="flex flex-col justify-between gap-10 px-5 py-10 md:px-14 md:py-16">
        <div>
          <p className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.16em]">
            Public clipper rules
          </p>
          <h1 className="font-display text-[clamp(58px,13vw,150px)] uppercase leading-[0.84] tracking-[-0.04em]">
            Clip GPTea.
          </h1>
        </div>
        <div className="max-w-[760px]">
          <p className="font-serif text-[22px] italic leading-[1.25] md:text-[30px]">
            Yes, you can repost GPTea and VNMSFX clips if you keep the signal
            intact, credit the source, and send people back to the Signal.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signal"
              className="bg-black px-5 py-4 text-[12px] font-extrabold uppercase tracking-[0.1em] text-lime hover:bg-[#1a1a1a]"
            >
              Join the Signal
            </Link>
            <a
              href="https://www.youtube.com/@vnmsfx"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-black px-5 py-4 text-[12px] font-extrabold uppercase tracking-[0.1em] hover:bg-black hover:text-lime"
            >
              Watch on YouTube
            </a>
          </div>
        </div>
      </div>
      <div className="relative min-h-[520px] border-t-2 border-black bg-black lg:border-l-2 lg:border-t-0">
        <Image
          src={HERO_IMAGE}
          alt="Doug from GPTea holding a coffee mug."
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 46vw"
          className="object-cover opacity-90"
        />
      </div>
    </section>
  );
}

function Permission() {
  return (
    <section className="grid border-b-2 border-black bg-lime lg:grid-cols-[0.72fr_1.28fr]">
      <div className="border-b-2 border-black px-5 py-9 md:px-14 md:py-12 lg:border-b-0 lg:border-r-2">
        <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.16em]">
          The simple version
        </p>
        <h2 className="font-display text-[clamp(36px,7vw,88px)] uppercase leading-[0.88] tracking-[-0.035em]">
          Clip it. Credit it. Link it.
        </h2>
      </div>
      <div className="px-5 py-9 text-[17px] leading-[1.55] md:px-14 md:py-12 md:text-[22px]">
        <p>
          VNMSFX gives public permission to repost short clips, reactions,
          compilations, caption edits, and commentary edits from GPTea and the
          network as long as the rules below are followed.
        </p>
      </div>
    </section>
  );
}

function Rules() {
  return (
    <section className="border-b-2 border-black bg-cream px-5 py-10 md:px-14 md:py-16">
      <div className="mb-8 flex flex-col gap-3 border-b-2 border-black pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.16em]">
            Rules
          </p>
          <h2 className="font-display text-[clamp(38px,7vw,90px)] uppercase leading-[0.9] tracking-[-0.035em]">
            Keep it ours.
          </h2>
        </div>
        <p className="max-w-[440px] text-[13px] font-bold uppercase leading-[1.45] tracking-[0.08em]">
          We can ask for takedowns if a repost breaks these rules. Clean rules
          make the whole thing easier to share.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {CLIPPER_RULES.map((rule) => (
          <article
            key={rule.label}
            className="min-h-[210px] border-2 border-black bg-white p-5"
          >
            <div className="mb-7 h-3 w-3 rounded-full bg-lime ring-2 ring-black" />
            <h3 className="mb-3 text-[14px] font-extrabold uppercase tracking-[0.12em]">
              {rule.label}
            </h3>
            <p className="text-[14px] leading-[1.5] md:text-[15px]">
              {rule.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Rewards() {
  return (
    <section className="grid border-b-2 border-lime bg-black text-cream lg:grid-cols-[0.78fr_1.22fr]">
      <div className="border-b-2 border-cream/25 px-5 py-10 md:px-14 md:py-16 lg:border-b-0 lg:border-r-2">
        <p className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.16em] text-lime">
          Why clip it
        </p>
        <h2 className="font-display text-[clamp(38px,7vw,92px)] uppercase leading-[0.88] tracking-[-0.035em]">
          Build your public trail before commissions.
        </h2>
      </div>
      <div className="grid md:grid-cols-3">
        {REWARD_PATH.map((reward) => (
          <article
            key={reward.label}
            className="min-h-[230px] border-b-2 border-cream/25 px-5 py-8 md:border-b-0 md:border-r-2 md:border-cream/25 md:px-7 md:last:border-r-0"
          >
            <div className="mb-7 h-3 w-3 rounded-full bg-lime" />
            <h3 className="mb-3 text-[14px] font-extrabold uppercase tracking-[0.12em]">
              {reward.label}
            </h3>
            <p className="text-[14px] leading-[1.5] text-cream/75 md:text-[15px]">
              {reward.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function CopyLines() {
  return (
    <section className="border-b-2 border-black bg-lavender px-5 py-10 md:px-14 md:py-16">
      <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
        <div>
          <p className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.16em]">
            Caption fuel
          </p>
          <h2 className="font-display text-[clamp(34px,6vw,76px)] uppercase leading-[0.9] tracking-[-0.03em]">
            Use one of these.
          </h2>
        </div>
        <div className="grid gap-3">
          {CTA_LINES.map((line) => (
            <article key={line} className="border-2 border-black bg-cream p-4">
              <p className="font-serif text-[18px] italic leading-[1.35]">
                "{line}"
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalSignup() {
  return (
    <section className="grid bg-lime text-black lg:grid-cols-[0.8fr_1.2fr]">
      <div className="border-b-2 border-black px-5 py-10 md:px-14 md:py-16 lg:border-b-0 lg:border-r-2">
        <h2 className="font-display text-[clamp(38px,7vw,96px)] uppercase leading-[0.88] tracking-[-0.035em]">
          Clip the show. Join the Signal.
        </h2>
      </div>
      <div className="px-5 py-10 md:px-14 md:py-16">
        <SubscribeForm
          source="clips_page"
          variant="lime"
          includeInterests={false}
          defaultInterests={["gptea"]}
          headline="Become a GPTea Correspondent."
          body="Get drops, votes, and the public reward path as the clipper system grows."
          buttonLabel="Join the Signal"
        />
      </div>
    </section>
  );
}
