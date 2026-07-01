import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

/* ────────────────────────────────────────────────────────────
   VNMSFX — /work  (buyer door)
   The conversion page for brands. Point all cold outreach here.

   TO SWAP IN LATER:
   • BOOKING_URL — set to your Cal.com/Calendly link, then the CTAs
     become real "book a call" buttons instead of email.
   • CONTACT_EMAIL — swap to hello@vnmsfx.com once that inbox is live.
   • PROOF_REEL — replace the 6 poster picks with your chosen best.
   • PRICE tiers — tune the video counts to your real capacity.
   ──────────────────────────────────────────────────────────── */

const LOGO_SRC = "/brand/vnmsfx-logo-black.png";
const LOGO_W = 2522;
const LOGO_H = 905;

const CONTACT_EMAIL = "brandon@pushto6.com";
const BOOKING_URL = ""; // e.g. "https://cal.com/vnmsfx/15min" — empty = fall back to email
const MAILTO_TEST = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
  "VNMSFX — free test piece for [brand]"
)}&body=${encodeURIComponent(
  "Hi Brandon — saw your work. We're [brand] and we'd love a free test piece. Here's who we are: "
)}`;
const MAILTO_CALL = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
  "VNMSFX — 15-min call"
)}`;
const CALL_HREF = BOOKING_URL || MAILTO_CALL;

export const metadata: Metadata = {
  title: { absolute: "Work With VNMSFX — AI Video Studio for Brands" },
  description:
    "VNMSFX is an AI-native content studio in NYC. Creative partner to CapCut, Kling AI, Pixverse, Dreamina, and Flora AI. Branded short-form people actually watch — a week of content in a day.",
  alternates: { canonical: "https://vnmsfx.com/work" },
  openGraph: {
    title: "Work With VNMSFX — AI Video Studio for Brands",
    description:
      "Branded short-form people actually watch — because it's funny, not because it's an ad. A week of content in a day.",
    type: "website",
    url: "https://vnmsfx.com/work",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

const CREATIVE_PARTNERS = [
  "CapCut",
  "Kling AI",
  "Pixverse",
  "Dreamina",
  "Flora AI",
];

const PROOF_REEL: { src: string; show: string; href: string }[] = [
  { src: "/work/gptea/ep-12-poster.jpg", show: "GPTea", href: "/gptea" },
  { src: "/work/gptea/ep-05-poster.jpg", show: "GPTea", href: "/gptea" },
  {
    src: "/work/hank-and-beans/ep01.jpg",
    show: "Hank, Beans & Roar",
    href: "/hank-beans-roar",
  },
  {
    src: "/work/checkpoint-chisme/ep01.jpg",
    show: "Checkpoint Chisme",
    href: "/checkpoint-chisme",
  },
  {
    src: "/work/rex-and-crow/ep01.jpg",
    show: "Rex & Crow",
    href: "/rex-and-crow",
  },
  { src: "/work/gptea/ep-01-poster.jpg", show: "GPTea", href: "/gptea" },
];

const CAPABILITIES = [
  {
    n: "01",
    title: "Frontier access, first",
    body: "As a creative partner to the platforms building AI video, we work with these models before the features go public. Your content does things other studios can't do yet — ahead of the trend, not chasing it.",
  },
  {
    n: "02",
    title: "Vetted taste, not a gamble",
    body: "Five AI platforms partner with us, and we partner with Anthropic. You're not rolling the dice on a random freelancer with a subscription — the toolmakers already did the vetting.",
  },
  {
    n: "03",
    title: "One studio, every engine",
    body: "We're not locked to one tool. CapCut, Kling, Pixverse, Dreamina, Flora — we pick the best model for each shot. A one-tool freelancer can't say that.",
  },
];

const WHAT_YOU_GET = [
  "Short-form that survives the scroll — built to be finished and shared, not skipped.",
  "Volume without a crew — a week of content in a day.",
  "A voice, not a template — your brand, made strange on purpose.",
  "Made with the same engine behind our own shows — 200+ episodes and counting.",
];

const STEPS = [
  {
    n: "1",
    title: "One free test piece",
    body: "Tell us the brand. We make one short in your voice — free — so you see it before you commit to anything.",
  },
  {
    n: "2",
    title: "You approve the direction",
    body: "Love it, we keep going. Want it weirder, tighter, safer — we dial it in. No decks, no six-week timelines.",
  },
  {
    n: "3",
    title: "Retainer — the steady drip",
    body: "A monthly flow of content that doesn't look like an ad. Cancel anytime. Your own in-house comedy studio, for less than one agency video.",
  },
];

const TIERS = [
  {
    name: "Starter",
    price: "$1,500",
    unit: "/mo",
    line: "~8 shorts a month",
    body: "Prove the engine. Land the feed.",
    features: ["~8 short-form videos / mo", "Your brand voice, locked", "Posting-ready exports"],
    featured: false,
  },
  {
    name: "Growth",
    price: "$3,000",
    unit: "/mo",
    line: "~16 shorts a month + strategy",
    body: "A week of content in a day. The one most brands pick.",
    features: [
      "~16 short-form videos / mo",
      "Monthly content strategy",
      "Priority turnaround",
      "Trend-response drops",
    ],
    featured: true,
  },
  {
    name: "Studio",
    price: "$5,000",
    unit: "/mo",
    line: "~30 shorts a month, multi-format",
    body: "Fully outsource your short-form engine.",
    features: [
      "~30 short-form videos / mo",
      "Multiple formats + series",
      "First priority in the queue",
      "Direct line, same-week ideas",
    ],
    featured: false,
  },
];

export default function WorkPage() {
  return (
    <main className="font-sans bg-lavender text-black overflow-x-hidden">
      <TopNav />
      <Hero />
      <PartnerBar />
      <Capabilities />
      <ProofReel />
      <ResultBand />
      <WhatYouGet />
      <HowItWorks />
      <Pricing />
      <FitBlock />
      <FinalCTA />
      <WorkFooter />
    </main>
  );
}

function TopNav() {
  return (
    <nav className="w-full h-14 flex items-center justify-between px-5 md:px-14 border-b-[1.5px] border-cream/25 text-[10px] md:text-[11px] font-bold tracking-[0.08em] uppercase bg-black text-cream">
      <div className="flex items-center gap-2">
        <span className="block w-2.5 h-2.5 rounded-full bg-lime shrink-0" />
        <Link href="/" className="flex h-[22px] items-center bg-cream px-2">
          <Image
            src={LOGO_SRC}
            alt="VNMSFX"
            width={LOGO_W}
            height={LOGO_H}
            priority
            className="h-[14px] w-auto"
          />
        </Link>
        <span className="text-[8px] md:text-[9px] -translate-y-1.5">®</span>
        <span className="hidden sm:inline opacity-70">
          &nbsp;&nbsp;/&nbsp;&nbsp;FOR BRANDS
        </span>
      </div>
      <div className="hidden md:flex items-center gap-5">
        <Link href="/" className="hover:underline">
          Shows
        </Link>
        <span className="opacity-30">·</span>
        <Link href="/clips" className="hover:underline">
          Clips
        </Link>
        <span className="opacity-30">·</span>
        <a href={CALL_HREF} className="text-lime hover:underline">
          Work with us
        </a>
      </div>
      <a href={CALL_HREF} className="md:hidden font-extrabold tracking-[0.08em] text-lime">
        BOOK A CALL
      </a>
    </nav>
  );
}

function Hero() {
  return (
    <section className="border-b-2 border-lime bg-black px-5 md:px-14 pt-12 md:pt-24 pb-14 md:pb-20 flex flex-col gap-10 md:gap-16 text-cream">
      <div className="flex flex-col md:flex-row items-start gap-5 md:gap-8">
        <aside className="w-full md:w-48 shrink-0 md:pt-6">
          <div className="text-[10px] font-extrabold tracking-[0.14em] uppercase leading-[1.4]">
            VNMSFX FOR BRANDS
          </div>
          <div className="hidden md:block w-8 h-[1.5px] mt-3.5 bg-lime" />
          <p className="text-[11px] mt-3.5 leading-[1.45] opacity-90">
            AI-native content studio. NYC.
          </p>
        </aside>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-[clamp(38px,9vw,104px)] leading-[0.9] tracking-[-0.035em] uppercase">
            The AI studio the AI companies partner with.
          </h1>
          <p className="font-serif italic text-[18px] md:text-[24px] leading-[1.35] mt-6 md:mt-8 max-w-[680px]">
            We make branded short-form people actually watch — because it&rsquo;s
            funny, not because it&rsquo;s an ad. And we can make a week of it in a
            day.
          </p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        <a
          href={MAILTO_TEST}
          className="inline-flex items-center gap-3 bg-lime text-black px-6 py-4 group self-start"
        >
          <span className="text-[13px] md:text-[15px] font-extrabold tracking-[0.06em] uppercase">
            Get a free test piece
          </span>
          <span className="text-[16px] group-hover:translate-x-1 transition-transform">
            →
          </span>
        </a>
        <a
          href={CALL_HREF}
          className="text-[13px] md:text-[14px] font-bold tracking-[0.04em] uppercase underline underline-offset-4 opacity-90 hover:opacity-100"
        >
          or book a 15-min call
        </a>
      </div>
    </section>
  );
}

function PartnerBar() {
  return (
    <section className="w-full bg-lime border-b-2 border-black px-5 md:px-14 py-9 md:py-12">
      <div className="text-[10px] md:text-[11px] font-bold tracking-[0.14em] uppercase flex items-center gap-2 mb-6 md:mb-8">
        <span className="block w-2.5 h-2.5 rounded-full bg-black" />
        <span>Trusted to build with the frontier</span>
      </div>

      <div className="flex flex-col gap-7 md:gap-8">
        <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-6">
          <span className="text-[11px] font-extrabold tracking-[0.14em] uppercase shrink-0 md:w-40 opacity-70">
            Creative Partner
          </span>
          <div className="font-display text-[clamp(22px,4.4vw,44px)] leading-[1.05] tracking-[-0.02em] uppercase flex flex-wrap items-baseline gap-x-3 gap-y-1">
            {CREATIVE_PARTNERS.map((name, i) => (
              <span key={name} className="inline-flex items-baseline">
                {name}
                {i < CREATIVE_PARTNERS.length - 1 && (
                  <span className="mx-2 md:mx-3 opacity-30">·</span>
                )}
              </span>
            ))}
          </div>
        </div>

        <div className="w-full h-[1.5px] bg-black/20" />

        <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-6">
          <span className="text-[11px] font-extrabold tracking-[0.14em] uppercase shrink-0 md:w-40 opacity-70">
            Partner
          </span>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
            <span className="font-display text-[clamp(22px,4.4vw,44px)] leading-[1.05] tracking-[-0.02em] uppercase">
              Anthropic (Claude)
            </span>
            <span className="font-serif italic text-[14px] md:text-[16px] opacity-80">
              Claude Certified Architect — in progress
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Capabilities() {
  return (
    <section className="bg-black text-cream border-b-2 border-black px-5 md:px-14 pt-12 md:pt-20 pb-14 md:pb-20 flex flex-col gap-8 md:gap-12">
      <header className="max-w-[820px]">
        <div className="text-[10px] md:text-[11px] font-bold tracking-[0.14em] uppercase flex items-center gap-2 mb-4 opacity-70">
          <span className="block w-2.5 h-2.5 rounded-full bg-lime" />
          <span>Why this isn&rsquo;t the AI slop you&rsquo;ve seen</span>
        </div>
        <h2 className="font-display text-[clamp(30px,6vw,68px)] leading-[0.9] tracking-[-0.03em] uppercase">
          Everyone has the tools. We have the partnerships.
        </h2>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-cream/20 border border-cream/20">
        {CAPABILITIES.map((c) => (
          <div key={c.n} className="bg-black p-6 md:p-8 flex flex-col gap-4">
            <span className="font-display text-[13px] tracking-[0.1em] text-lime">
              {c.n}
            </span>
            <h3 className="font-display text-[20px] md:text-[24px] leading-[1.05] tracking-[-0.01em] uppercase">
              {c.title}
            </h3>
            <p className="text-[16px] md:text-[17px] leading-[1.55] opacity-90">
              {c.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProofReel() {
  return (
    <section className="bg-cream border-b-2 border-black px-5 md:px-14 pt-12 md:pt-20 pb-14 md:pb-20 flex flex-col gap-8 md:gap-10">
      <header className="flex items-end justify-between gap-4 flex-wrap border-b-2 border-black pb-5 md:pb-6">
        <div>
          <div className="text-[10px] md:text-[11px] font-bold tracking-[0.14em] uppercase flex items-center gap-2 mb-2 opacity-70">
            <span className="block w-2.5 h-2.5 rounded-full bg-lime" />
            <span>Selected work · the pitch is the work</span>
          </div>
          <h2 className="font-display text-[clamp(30px,6vw,68px)] leading-[0.9] tracking-[-0.03em] uppercase">
            See it, don&rsquo;t take our word.
          </h2>
        </div>
        <Link
          href="/"
          className="text-[12px] md:text-[13px] font-extrabold tracking-[0.08em] uppercase hover:underline shrink-0"
        >
          ↗ All shows
        </Link>
      </header>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
        {PROOF_REEL.map((v, i) => (
          <Link
            key={i}
            href={v.href}
            className="group relative block aspect-[9/16] overflow-hidden border-2 border-black bg-black"
          >
            <Image
              src={v.src}
              alt={v.show}
              width={720}
              height={1280}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            />
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
              <span className="text-[11px] md:text-[12px] font-extrabold tracking-[0.06em] uppercase text-cream">
                {v.show}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ResultBand() {
  return (
    <section className="bg-lavender border-b-2 border-black px-5 md:px-14 pt-12 md:pt-16 pb-12 md:pb-16">
      <div className="text-[10px] md:text-[11px] font-bold tracking-[0.14em] uppercase flex items-center gap-2 mb-6 md:mb-8">
        <span className="block w-2.5 h-2.5 rounded-full bg-black" />
        <span>Proof it moves product</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 md:gap-14 items-center">
        <div className="flex gap-8 md:gap-12">
          <div>
            <div className="font-display text-[clamp(44px,9vw,88px)] leading-[0.85] tracking-[-0.03em]">
              $20K+
            </div>
            <div className="text-[11px] md:text-[12px] font-bold tracking-[0.1em] uppercase mt-2 opacity-70">
              one campaign
            </div>
          </div>
          <div>
            <div className="font-display text-[clamp(44px,9vw,88px)] leading-[0.85] tracking-[-0.03em]">
              1M+
            </div>
            <div className="text-[11px] md:text-[12px] font-bold tracking-[0.1em] uppercase mt-2 opacity-70">
              views
            </div>
          </div>
        </div>
        <p className="font-serif italic text-[20px] md:text-[28px] leading-[1.3] max-w-[620px]">
          We took Sweet Vegan Chocolate from nothing to the #1 vegan chocolate in
          NYC — on one campaign. That&rsquo;s the engine. Now point it at your
          brand.
        </p>
      </div>
    </section>
  );
}

function WhatYouGet() {
  return (
    <section className="bg-black text-cream border-b-2 border-black px-5 md:px-14 pt-12 md:pt-20 pb-14 md:pb-20 flex flex-col gap-8 md:gap-10">
      <h2 className="font-display text-[clamp(30px,6vw,68px)] leading-[0.9] tracking-[-0.03em] uppercase max-w-[900px]">
        What you actually get.
      </h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 md:gap-y-8 max-w-[1000px]">
        {WHAT_YOU_GET.map((item, i) => (
          <li key={i} className="flex gap-4 items-start">
            <span className="font-display text-lime text-[14px] mt-1 shrink-0">
              →
            </span>
            <span className="text-[17px] md:text-[19px] leading-[1.45]">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="bg-cream border-b-2 border-black px-5 md:px-14 pt-12 md:pt-20 pb-14 md:pb-20 flex flex-col gap-8 md:gap-12">
      <header className="max-w-[820px]">
        <div className="text-[10px] md:text-[11px] font-bold tracking-[0.14em] uppercase flex items-center gap-2 mb-4 opacity-70">
          <span className="block w-2.5 h-2.5 rounded-full bg-lime" />
          <span>How it works</span>
        </div>
        <h2 className="font-display text-[clamp(30px,6vw,68px)] leading-[0.9] tracking-[-0.03em] uppercase">
          No decks. No six-week timelines.
        </h2>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
        {STEPS.map((s) => (
          <div
            key={s.n}
            className="border-2 border-black p-6 md:p-8 flex flex-col gap-4 bg-cream"
          >
            <span className="font-display text-[clamp(40px,7vw,64px)] leading-none tracking-[-0.03em]">
              {s.n}
            </span>
            <h3 className="font-display text-[19px] md:text-[22px] leading-[1.05] tracking-[-0.01em] uppercase">
              {s.title}
            </h3>
            <p className="text-[16px] md:text-[17px] leading-[1.5] opacity-90">
              {s.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section className="bg-lavender border-b-2 border-black px-5 md:px-14 pt-12 md:pt-20 pb-14 md:pb-20 flex flex-col gap-8 md:gap-12">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="max-w-[720px]">
          <div className="text-[10px] md:text-[11px] font-bold tracking-[0.14em] uppercase flex items-center gap-2 mb-4 opacity-70">
            <span className="block w-2.5 h-2.5 rounded-full bg-black" />
            <span>Pricing</span>
          </div>
          <h2 className="font-display text-[clamp(30px,6vw,68px)] leading-[0.9] tracking-[-0.03em] uppercase">
            Agency quality. A fraction of the price.
          </h2>
        </div>
        <p className="font-serif italic text-[16px] md:text-[18px] leading-[1.4] max-w-[320px] md:text-right">
          Plans from <span className="not-italic font-display">$1,500/mo</span>.
          Every plan starts with one free test piece.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
        {TIERS.map((t) => (
          <div
            key={t.name}
            className={`relative border-2 border-black p-6 md:p-8 flex flex-col gap-5 ${
              t.featured ? "bg-lime" : "bg-cream"
            }`}
          >
            {t.featured && (
              <span className="absolute -top-3 left-6 bg-black text-lime text-[10px] font-extrabold tracking-[0.12em] uppercase px-3 py-1">
                ★ Most picked
              </span>
            )}
            <div>
              <h3 className="font-display text-[22px] md:text-[26px] uppercase tracking-[-0.01em]">
                {t.name}
              </h3>
              <p className="text-[13px] md:text-[14px] font-bold uppercase tracking-[0.06em] opacity-70 mt-1">
                {t.line}
              </p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-[clamp(40px,7vw,60px)] leading-none tracking-[-0.03em]">
                {t.price}
              </span>
              <span className="text-[15px] font-bold opacity-70">{t.unit}</span>
            </div>
            <p className="font-serif italic text-[15px] md:text-[16px] leading-[1.4]">
              {t.body}
            </p>
            <ul className="flex flex-col gap-2.5 mt-1">
              {t.features.map((f, i) => (
                <li key={i} className="flex gap-2.5 items-start">
                  <span className="text-[13px] mt-[3px] shrink-0">▪</span>
                  <span className="text-[15px] md:text-[16px] leading-[1.4]">
                    {f}
                  </span>
                </li>
              ))}
            </ul>
            <a
              href={MAILTO_TEST}
              className={`mt-auto inline-flex items-center justify-center gap-2 px-4 py-3 group border-2 border-black ${
                t.featured
                  ? "bg-black text-lime"
                  : "bg-lime text-black"
              }`}
            >
              <span className="text-[12px] md:text-[13px] font-extrabold tracking-[0.06em] uppercase">
                Start with a free piece
              </span>
              <span className="text-[14px] group-hover:translate-x-1 transition-transform">
                →
              </span>
            </a>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 border-t-2 border-black pt-6 md:pt-8">
        <p className="text-[15px] md:text-[16px] leading-[1.5] flex-1">
          <span className="font-display uppercase text-[14px] tracking-[0.04em]">
            Not ready for monthly?
          </span>{" "}
          One-off campaigns from <strong>$500/video</strong> or a{" "}
          <strong>$2,000 campaign pack</strong>. Want your content to run as paid
          ads? Add usage rights and we&rsquo;ll talk.
        </p>
        <p className="text-[15px] md:text-[16px] leading-[1.5] flex-1">
          <span className="font-display uppercase text-[14px] tracking-[0.04em]">
            Want to own the machine?
          </span>{" "}
          We&rsquo;ll build your team the in-house AI content system so you can
          produce this yourselves. Custom builds — let&rsquo;s scope it.
        </p>
      </div>
    </section>
  );
}

function FitBlock() {
  return (
    <section className="bg-black text-cream border-b-2 border-black px-5 md:px-14 pt-12 md:pt-16 pb-12 md:pb-16 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14">
      <div className="flex flex-col gap-4">
        <h3 className="font-display text-[20px] md:text-[24px] uppercase tracking-[-0.01em] text-lime">
          Good fit
        </h3>
        <p className="text-[17px] md:text-[19px] leading-[1.5]">
          DTC and CPG brands, restaurants, founders with a personality — anyone
          who&rsquo;d rather be talked about than ignored.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <h3 className="font-display text-[20px] md:text-[24px] uppercase tracking-[-0.01em] opacity-60">
          Not a fit
        </h3>
        <p className="text-[17px] md:text-[19px] leading-[1.5] opacity-80">
          If you want a safe corporate explainer that looks like everyone
          else&rsquo;s, we&rsquo;re the wrong studio. No hard feelings.
        </p>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="bg-lime border-b-2 border-black px-5 md:px-14 pt-14 md:pt-24 pb-14 md:pb-24 flex flex-col items-start gap-8">
      <h2 className="font-display text-[clamp(36px,8vw,96px)] leading-[0.88] tracking-[-0.035em] uppercase max-w-[1000px]">
        Your competitor&rsquo;s ad could be this good.
      </h2>
      <p className="font-serif italic text-[18px] md:text-[24px] leading-[1.35] max-w-[620px]">
        One free test piece. No deck, no pitch, no risk. If it&rsquo;s not the
        best thing on your feed, you&rsquo;ve lost nothing.
      </p>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        <a
          href={MAILTO_TEST}
          className="inline-flex items-center gap-3 bg-black text-lime px-6 py-4 group self-start"
        >
          <span className="text-[13px] md:text-[15px] font-extrabold tracking-[0.06em] uppercase">
            Get a free test piece
          </span>
          <span className="text-[16px] group-hover:translate-x-1 transition-transform">
            →
          </span>
        </a>
        <a
          href={CALL_HREF}
          className="text-[13px] md:text-[14px] font-bold tracking-[0.04em] uppercase underline underline-offset-4"
        >
          or book a 15-min call
        </a>
      </div>
    </section>
  );
}

function WorkFooter() {
  return (
    <footer className="bg-lavender flex flex-col">
      <div className="pt-10 md:pt-14 pb-6 md:pb-8 px-5 md:px-14 flex justify-center">
        <Link href="/">
          <Image
            src={LOGO_SRC}
            alt="VNMSFX"
            width={LOGO_W}
            height={LOGO_H}
            className="h-[clamp(48px,12vw,140px)] w-auto"
          />
        </Link>
      </div>
      <div className="flex flex-col md:flex-row border-t-[1.5px] border-black">
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="flex-1 py-6 md:py-8 px-5 md:px-14 border-b-[1.5px] md:border-b-0 md:border-r-[1.5px] border-black text-center hover:bg-black hover:text-lime transition-colors group"
        >
          <div className="font-display text-[14px] md:text-base tracking-[0.04em] uppercase">
            Work with us
          </div>
          <div className="mt-2 text-[14px] md:text-base group-hover:underline break-all">
            {CONTACT_EMAIL}
          </div>
        </a>
        <a
          href="https://www.youtube.com/@vnmsfx"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-6 md:py-8 px-5 md:px-14 border-b-[1.5px] md:border-b-0 md:border-r-[1.5px] border-black text-center hover:bg-black hover:text-lime transition-colors group"
        >
          <div className="font-display text-[14px] md:text-base tracking-[0.04em] uppercase">
            YouTube
          </div>
          <div className="mt-2 text-[14px] md:text-base group-hover:underline">
            ↗ @vnmsfx
          </div>
        </a>
        <a
          href="https://www.tiktok.com/@vnmsfxreels"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-6 md:py-8 px-5 md:px-14 text-center hover:bg-black hover:text-lime transition-colors group"
        >
          <div className="font-display text-[14px] md:text-base tracking-[0.04em] uppercase">
            TikTok
          </div>
          <div className="mt-2 text-[14px] md:text-base group-hover:underline">
            ↗ @vnmsfxreels
          </div>
        </a>
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between py-5 md:py-6 px-5 md:px-14 text-[10px] md:text-[11px] font-bold tracking-[0.1em] uppercase gap-2 border-t-[1.5px] border-black">
        <div>© 2026 VNMSFX LLC · Made in New York · All rights reserved</div>
        <Link href="/" className="hover:underline">
          ← Back to the shows
        </Link>
      </div>
    </footer>
  );
}
