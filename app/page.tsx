import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

const LOGO_SRC = "/brand/vnmsfx-logo-black.png";
const LOGO_W = 2522;
const LOGO_H = 905;

export const metadata: Metadata = {
  title: "VNMSFX — AI-Native Comedy Network",
  description:
    "VNMSFX is an AI-native comedy network and character IP studio making brand-ready shows, promos, and social films.",
  openGraph: {
    title: "VNMSFX — AI-Native Comedy Network",
    description:
      "VNMSFX is an AI-native comedy network and character IP studio making brand-ready shows, promos, and social films.",
    type: "website",
    url: "https://vnmsfx.com",
    images: [{ url: "/work/chrome-run/widescreen.jpg", width: 1918, height: 822 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "VNMSFX — AI-Native Comedy Network",
    description:
      "Character IP, social films, and AI-native promos for brands that need attention.",
    images: ["/work/chrome-run/widescreen.jpg"],
  },
  alternates: { canonical: "https://vnmsfx.com" },
};

const STUDIO_METRICS = [
  ["1,000,000+", "views across social"],
  ["5", "active IP worlds"],
  ["15s-60s", "brand-ready films"],
  ["NYC", "AI-native studio"],
];

const AI_STACK = ["Claude", "ByteDance", "CapCut", "Kling AI", "FLORA AI"];

const CHROME_RUN_VERTICALS = [
  {
    src: "/videos/chrome-run/vertical-chase.mp4",
    poster: "/work/chrome-run/vertical-chase.jpg",
    label: "The Chrome Run vertical chase cut.",
  },
  {
    src: "/videos/chrome-run/vertical-shark.mp4",
    poster: "/work/chrome-run/vertical-shark.jpg",
    label: "The Chrome Run shark deck cut.",
  },
  {
    src: "/videos/chrome-run/vertical-alarm.mp4",
    poster: "/work/chrome-run/vertical-alarm.jpg",
    label: "The Chrome Run red alert cut.",
  },
  {
    src: "/videos/chrome-run/vertical-control-room.mp4",
    poster: "/work/chrome-run/vertical-control-room.jpg",
    label: "The Chrome Run control room cut.",
  },
];

const IP_CATALOG = [
  {
    title: "The Chrome Run",
    label: "Retro-future chase comedy",
    thumbnail: "/work/chrome-run/vertical-chase.jpg",
    thumbnailAlt: "Chrome motorcycles racing through a silver tunnel.",
    body:
      "Chrome bikes, control-room panic, shark-deck ceremony, and a chicken with franchise energy.",
    href: "/chrome-run",
    use: "Launch films, speed reels, surreal product drops",
  },
  {
    title: "GPTea",
    label: "AI workplace satire",
    thumbnail: "/work/gptea/ep-01-poster.jpg",
    thumbnailAlt: "A tired cartoon office worker with coffee and a beard.",
    body:
      "The internet's least reliable advice machine, built for tech, tools, and explainers with teeth.",
    href: "/gptea",
    use: "B2B explainers, SaaS promos, creator-led education",
  },
  {
    title: "Hank, Beans & Roar",
    label: "Character chaos series",
    thumbnail: "/work/hank-and-beans/ep14.jpg",
    thumbnailAlt: "Beans sits in an ice bath wearing a cowboy hat.",
    body:
      "A clueless human, a stressed-out dog, and a lion who turns normal life into a liability event.",
    href: "/hank-beans-roar",
    use: "Mascot work, product mishaps, episodic campaigns",
  },
  {
    title: "Checkpoint Chisme",
    label: "Felt-puppet bureaucracy",
    thumbnail: "/work/checkpoint-chisme/ep09.jpg",
    thumbnailAlt: "A felt puppet security agent wearing aviator sunglasses.",
    body:
      "Airport security meets neighborhood gossip. Every small question becomes an investigation.",
    href: "/checkpoint-chisme",
    use: "Service brands, travel, retail, compliance comedy",
  },
  {
    title: "Rex & Crow",
    label: "Roommate culture war",
    thumbnail: "/work/rex-and-crow/ep02.jpg",
    thumbnailAlt: "Rex and Crow sit together in their apartment.",
    body:
      "A glam-rock optimist and a goth-rock cynic processing modern life from the same apartment.",
    href: "/rex-and-crow",
    use: "Lifestyle promos, culture commentary, social recurring bits",
  },
];

export default function Page() {
  return (
    <main className="font-sans bg-lavender text-black overflow-x-hidden">
      <TopNav />
      <ChromeRunFeature />
      <IpStudioSection />
      <StudioProofBand />
      <Hero />
    </main>
  );
}

function ChromeRunFeature() {
  return (
    <section
      id="chrome-run"
      aria-labelledby="chrome-run-title"
      className="flex min-h-[calc(100svh-56px)] flex-col bg-black text-cream border-b-2 border-lime"
    >
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(340px,0.7fr)_minmax(0,1.3fr)]">
        <div className="order-2 flex flex-col justify-between gap-5 border-t border-cream/25 px-5 py-6 md:px-14 md:py-8 lg:order-1 lg:border-r lg:border-t-0 lg:pr-10">
          <div>
            <div className="inline-flex items-center gap-2 border border-cream/35 px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-lime">
              <span className="h-2 w-2 bg-lime" />
              Now Playing
            </div>
            <p className="mt-4 text-[10px] md:text-[11px] font-extrabold tracking-[0.14em] uppercase text-cream/65">
              VNMSFX Original · 5 Films · 15 Seconds Each
            </p>
            <h2
              id="chrome-run-title"
              className="mt-3 font-display text-[54px] leading-[0.82] uppercase sm:text-[76px] lg:text-[86px] xl:text-[96px]"
            >
              <Link href="/chrome-run" className="transition-colors hover:text-lime">
                The Chrome Run
              </Link>
            </h2>
            <p className="mt-4 max-w-[560px] text-[14px] leading-[1.42] text-cream/85 md:text-[16px]">
              A chrome motorcycle duel keeps mutating into control-room panic,
              shark-deck ceremony, and one chicken with illegal franchise
              confidence.
            </p>
          </div>

          <div className="grid grid-cols-2 border border-cream/25 text-[9px] font-extrabold uppercase tracking-[0.12em] md:grid-cols-4">
            <div className="border-b border-r border-cream/25 p-3 md:border-b-0">
              <span className="block font-display text-[24px] leading-none text-lime">
                001
              </span>
              Series Launch
            </div>
            <div className="border-b border-cream/25 p-3 md:border-b-0 md:border-r">
              <span className="block font-display text-[24px] leading-none text-lime">
                5X
              </span>
              Social Cuts
            </div>
            <Link
              href="/chrome-run"
              className="border-r border-cream/25 bg-lime p-3 text-black hover:bg-cream"
            >
              <span className="block font-display text-[24px] leading-none">
                Play
              </span>
              Watch Show
            </Link>
            <a
              href="mailto:brandon@pushto6.com?subject=VNMSFX%20Chrome%20Run%20campaign"
              className="p-3 hover:bg-cream hover:text-black"
            >
              <span className="block font-display text-[24px] leading-none text-lime">
                B2B
              </span>
              Brand Slot
            </a>
          </div>
        </div>

        <div className="relative order-1 min-h-[360px] overflow-hidden bg-black md:min-h-[420px] lg:order-2 lg:min-h-0">
          <video
            src="/videos/chrome-run/widescreen.mp4"
            poster="/work/chrome-run/widescreen.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="The Chrome Run widescreen trailer."
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b border-cream/30 bg-black/80 px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em] md:px-6">
            <span>VNMSFX Signal 001</span>
            <span className="text-lime">Live Feed</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 grid grid-cols-[1fr_auto] border-t border-cream/30 bg-black/80 text-[10px] font-extrabold uppercase tracking-[0.12em]">
            <div className="px-4 py-3 md:px-6">
              Retro-future chase comedy for the scroll era
            </div>
            <Link
              href="/chrome-run"
              className="border-l border-cream/30 px-4 py-3 text-lime hover:bg-lime hover:text-black md:px-6"
            >
              Play
            </Link>
          </div>
        </div>
      </div>

      <div className="grid h-32 shrink-0 grid-cols-4 gap-px border-t border-cream/25 bg-cream/25 sm:h-36 md:h-44 lg:h-40 xl:h-44">
        {CHROME_RUN_VERTICALS.map((video, index) => (
          <Link
            href="/chrome-run#films"
            key={video.src}
            className="group relative overflow-hidden bg-black"
            aria-label={`Open ${video.label}`}
          >
            <video
              src={video.src}
              poster={video.poster}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label={video.label}
              className="h-full w-full object-cover object-[center_28%] opacity-90 transition-transform duration-500 group-hover:scale-[1.04]"
            />
            <span className="absolute left-2 top-2 bg-black px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-lime">
              Cut 0{index + 1}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function TopNav() {
  return (
    <nav className="sticky top-0 z-30 grid h-14 w-full grid-cols-[auto_1fr_auto] border-b-[1.5px] border-cream/25 bg-black text-[10px] font-extrabold uppercase tracking-[0.1em] text-cream">
      <Link href="/" className="flex items-center border-r border-cream/25 px-4 hover:bg-cream hover:text-black md:px-5">
        <span className="flex h-[24px] items-center bg-cream px-2">
          <Image
            src={LOGO_SRC}
            alt="VNMSFX"
            width={LOGO_W}
            height={LOGO_H}
            priority
            className="h-[15px] w-auto"
          />
        </span>
        <span className="ml-1 text-[8px] -translate-y-2">®</span>
      </Link>
      <div className="hidden min-w-0 items-center overflow-hidden lg:flex">
        {[
          ["Chrome Run", "/chrome-run"],
          ["GPTea", "/gptea"],
          ["Hank, Beans & Roar", "/hank-beans-roar"],
          ["Checkpoint Chisme", "/checkpoint-chisme"],
          ["Rex & Crow", "/rex-and-crow"],
        ].map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="flex h-full items-center border-r border-cream/20 px-4 hover:bg-cream hover:text-black"
          >
            {label}
          </Link>
        ))}
      </div>
      <div className="flex min-w-0 items-center justify-end">
        <a
          href="#ip-studio"
          className="hidden h-full items-center border-l border-cream/20 px-4 text-lime hover:bg-lime hover:text-black md:flex"
        >
          All IP
        </a>
        <Link
          href="/portfolio"
          className="hidden h-full items-center border-l border-cream/20 px-4 hover:bg-cream hover:text-black sm:flex"
        >
          Work
        </Link>
        <a
          href="mailto:brandon@pushto6.com?subject=VNMSFX%20B2B%20IP%20campaign"
          className="flex h-full items-center border-l border-cream/20 bg-lime px-4 text-black hover:bg-cream md:px-5"
        >
          Brand Campaign
        </a>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="border-b-2 border-lime bg-black px-5 md:px-14 py-14 md:py-20 flex flex-col gap-10 md:gap-14 text-cream">
      <div className="flex flex-col md:flex-row items-start gap-5 md:gap-8">
        <aside className="w-full md:w-56 shrink-0 md:pt-3 flex md:block items-start gap-3 md:gap-0">
          <div className="text-[10px] font-extrabold tracking-[0.14em] uppercase leading-[1.4] shrink-0">
            AI-NATIVE IP
            <br />
            FOR BUSINESS
          </div>
          <div className="hidden md:block w-8 h-[1.5px] mt-3.5 bg-lime" />
          <p className="hidden md:block text-[11px] mt-3.5 leading-[1.45]">
            Characters, shows, and social films that can carry a brand without
            sounding like an ad.
          </p>
          <p className="md:hidden text-[11px] leading-[1.45] flex-1">
            Characters and social films that can carry a brand without sounding
            like an ad.
          </p>
        </aside>
        <div className="flex-1 min-w-0 max-w-[940px]">
          <h1 className="max-w-[820px] font-display text-[38px] leading-[0.92] uppercase sm:text-[56px] md:text-[78px] lg:text-[96px]">
            WE MAKE THE INTERNET FEEL LIKE THE INTERNET AGAIN.
          </h1>
          <p className="mt-5 max-w-[660px] text-[15px] md:text-[18px] leading-[1.45] text-cream/85">
            Then we help brands borrow that feeling: recurring characters,
            product-world comedy, launch films, and social cutdowns built for
            the feed.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 md:gap-8 border-t border-cream/25 pt-6 md:pt-8">
        <a href="#ip-studio" className="flex items-center gap-4 group shrink-0">
          <span className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-lime flex items-center justify-center group-hover:bg-[#a8e632] transition-colors shrink-0">
            <span
              aria-hidden
              className="block w-0 h-0"
              style={{
                borderTop: "10px solid transparent",
                borderBottom: "10px solid transparent",
                borderLeft: "15px solid #000",
                marginLeft: 4,
              }}
            />
          </span>
          <div className="max-w-[260px]">
            <div className="text-[11px] md:text-xs font-extrabold tracking-[0.08em] uppercase">
              Build with VNMSFX IP
            </div>
            <div className="font-serif italic text-[12px] md:text-[13px] mt-1">
              Promos that act like entertainment
            </div>
          </div>
        </a>
        <div className="flex items-end gap-4 md:gap-6 self-stretch md:self-auto justify-between md:justify-end">
          <p className="font-serif italic text-[14px] md:text-[18px] leading-[1.4] text-left md:text-right max-w-[280px] md:max-w-[420px] pb-2 md:pb-3">
            The AI company behind your favorite AI company.
          </p>
          <Image
            src={LOGO_SRC}
            alt="VNMSFX"
            width={LOGO_W}
            height={LOGO_H}
            className="h-[clamp(32px,7vw,52px)] w-auto shrink-0 invert"
          />
        </div>
      </div>
    </section>
  );
}

function StudioProofBand() {
  return (
    <section className="bg-cream text-black border-b-2 border-black">
      <div className="grid grid-cols-2 md:grid-cols-4 border-b-2 border-black">
        {STUDIO_METRICS.map(([value, label]) => (
          <div
            key={label}
            className="min-h-[108px] border-r-2 border-b-2 border-black px-5 py-5 last:border-r-0 md:border-b-0 md:px-8 md:py-6"
          >
            <div className="font-display text-[30px] leading-none uppercase sm:text-[42px] lg:text-[58px]">
              {value}
            </div>
            <div className="mt-2 text-[10px] md:text-[11px] font-extrabold tracking-[0.13em] uppercase">
              {label}
            </div>
          </div>
        ))}
      </div>
      <div className="px-5 md:px-14 py-5 md:py-6 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <p className="max-w-[720px] text-[15px] md:text-[18px] leading-[1.4] font-semibold">
          VNMSFX turns character IP into social attention for companies that
          need more than a polished explainer.
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-2 text-[10px] md:text-[11px] font-extrabold tracking-[0.12em] uppercase">
          <span className="text-black/55">AI production stack:</span>
          {AI_STACK.map((name) => (
            <span key={name}>{name}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function IpStudioSection() {
  return (
    <section
      id="ip-studio"
      className="bg-black text-cream border-b-2 border-lime scroll-mt-14"
    >
      <div className="px-5 md:px-14 pt-12 md:pt-20 pb-7 md:pb-9 border-b border-cream/25">
        <div className="flex flex-col lg:flex-row lg:items-end gap-5 lg:gap-10">
          <div className="flex-1">
            <p className="text-[10px] md:text-[11px] font-extrabold tracking-[0.14em] uppercase text-lime">
              All Shows · Brand-Ready Character IP
            </p>
            <h2 className="mt-3 max-w-[980px] font-display text-[42px] leading-[0.88] uppercase sm:text-[64px] lg:text-[108px]">
              Pick a world. Put your brand inside it.
            </h2>
          </div>
          <p className="max-w-[560px] text-[14px] md:text-[17px] leading-[1.5] text-cream/85">
            A show grid should feel like a wall of strange doors. Ours are IP
            doors for brands: product drops, founder moments, event promos, and
            recurring social formats.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        {IP_CATALOG.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="min-h-[520px] border-b border-cream/25 transition-colors hover:bg-cream hover:text-black sm:border-r lg:border-b-0 lg:px-0 last:border-r-0 group"
          >
            <div className="flex h-full flex-col justify-between gap-8">
              <div className="flex flex-col">
                <div className="relative aspect-[4/5] overflow-hidden border-b border-cream/25 bg-black">
                  <Image
                    src={item.thumbnail}
                    alt={item.thumbnailAlt}
                    fill
                    sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3 text-[10px] font-extrabold uppercase tracking-[0.14em] text-cream">
                    <span>{item.label}</span>
                    <span className="text-lime">↗</span>
                  </div>
                </div>
                <div className="px-5 py-5 lg:px-6">
                  <h3 className="font-display text-[30px] leading-[0.95] uppercase">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-[14px] leading-[1.45] text-cream/80 group-hover:text-black/80">
                    {item.body}
                  </p>
                </div>
              </div>
              <div className="px-5 pb-6 lg:px-6">
                <p className="text-[10px] font-extrabold tracking-[0.12em] uppercase opacity-65">
                  B2B use
                </p>
                <p className="mt-2 text-[13px] leading-[1.4]">{item.use}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="px-5 md:px-14 py-7 md:py-9 border-t border-cream/25 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <p className="max-w-[680px] font-serif italic text-[18px] md:text-[24px] leading-[1.25]">
          Your product does not need to interrupt the show. It can become the
          reason the show exists.
        </p>
        <a
          href="mailto:brandon@pushto6.com?subject=VNMSFX%20B2B%20IP%20campaign"
          className="inline-flex items-center justify-center bg-lime text-black px-5 py-4 text-[12px] md:text-[13px] font-extrabold tracking-[0.1em] uppercase self-start md:self-auto hover:bg-cream transition-colors"
        >
          Start a B2B Campaign →
        </a>
      </div>
    </section>
  );
}
