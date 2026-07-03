import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AutoScrollRail } from "./AutoScrollRail";
import { AutoplayVideo } from "./AutoplayVideo";

const LOGO = "/brand/vnmsfx-logo-black.png";
const HERO = "/work/too-much/hero.jpg";

type Film = {
  number: string;
  title: string;
  line: string;
  video: string;
  poster: string;
};

const TOO_MUCH_FILMS: Film[] = [
  {
    number: "01",
    title: "Superspeed",
    line: "The room stays normal. The product does not.",
    video: "/videos/too-much/too-much-superspeed.mp4",
    poster: "/work/too-much/too-much-superspeed.jpg",
  },
  {
    number: "02",
    title: "Blue Ultimatum",
    line: "A luxury drink with no chill and excellent posture.",
    video: "/videos/too-much/too-much-blue-ultimatum.mp4",
    poster: "/work/too-much/too-much-blue-ultimatum.jpg",
  },
  {
    number: "03",
    title: "Peacock Energy",
    line: "Confidence becomes visible, then becomes everyone else's problem.",
    video: "/videos/too-much/too-much-peacock.mp4",
    poster: "/work/too-much/too-much-peacock.jpg",
  },
  {
    number: "04",
    title: "Inflation",
    line: "One can. One office. Several new versions of the same bad idea.",
    video: "/videos/too-much/too-much-inflation.mp4",
    poster: "/work/too-much/too-much-inflation.jpg",
  },
  {
    number: "05",
    title: "Replaced",
    line: "Your job is safe. Your personality is not.",
    video: "/videos/too-much/too-much-replaced.mp4",
    poster: "/work/too-much/too-much-replaced.jpg",
  },
];

const SYSTEM_NOTES = [
  {
    label: "Product",
    title: "Clinically excessive energy",
    body: "TOO MUCH is built as a fake beverage with a real brand voice: premium, reckless, deadpan, and just responsible enough to sell the joke.",
  },
  {
    label: "Campaign",
    title: "Five vertical spec spots",
    body: "Each film keeps the same world and product logic while changing the physical consequence: velocity, confidence, expansion, duplication, replacement.",
  },
  {
    label: "Use",
    title: "Portfolio system",
    body: "This page is structured for future spec ads, so every new product can drop in as a campaign with its own hero, films, and brand logic.",
  },
];

export const metadata: Metadata = {
  title: { absolute: "Portfolio — VNMSFX" },
  description:
    "VNMSFX portfolio of spec ads, product worlds, and scroll-native campaigns. First up: TOO MUCH, the world's first clinically excessive energy drink.",
  alternates: { canonical: "https://vnmsfx.com/portfolio" },
  openGraph: {
    title: "Portfolio — VNMSFX",
    description:
      "Spec ads, product worlds, and scroll-native campaigns from VNMSFX.",
    type: "website",
    url: "https://vnmsfx.com/portfolio",
    images: [
      {
        url: HERO,
        width: 2200,
        height: 1244,
        alt: "TOO MUCH energy drink spec campaign by VNMSFX.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio — VNMSFX",
    description:
      "Spec ads, product worlds, and scroll-native campaigns from VNMSFX.",
    images: [HERO],
  },
};

export default function PortfolioPage() {
  return (
    <main className="font-sans bg-lavender text-black overflow-x-hidden">
      <PortfolioNav />
      <Hero />
      <CampaignIntro />
      <FilmGrid />
      <SystemNotes />
      <PortfolioFooter />
    </main>
  );
}

function PortfolioNav() {
  return (
    <nav className="w-full h-14 flex items-center justify-between px-5 md:px-14 border-b-[1.5px] border-cream/25 text-[10px] md:text-[11px] font-bold uppercase bg-black text-cream">
      <Link href="/" className="flex items-center gap-2 hover:opacity-85">
        <span className="block w-2.5 h-2.5 rounded-full bg-lime shrink-0" />
        <span className="flex h-[22px] items-center bg-cream px-2">
          <Image
            src={LOGO}
            alt="VNMSFX"
            width={2522}
            height={905}
            priority
            className="h-[14px] w-auto"
          />
        </span>
        <span className="hidden sm:inline opacity-70">
          &nbsp;&nbsp;/&nbsp;&nbsp;PORTFOLIO
        </span>
      </Link>
      <div className="flex items-center gap-3 md:gap-5">
        <Link href="/" className="hover:underline">
          Shows
        </Link>
        <span className="opacity-30">/</span>
        <Link href="/work" className="hover:underline">
          Work
        </Link>
        <span className="opacity-30">/</span>
        <Link href="/signal" className="text-lime hover:underline">
          Signal
        </Link>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative h-[calc(100svh-56px)] min-h-[560px] overflow-hidden bg-black text-cream md:min-h-[620px]">
      <Image
        src={HERO}
        alt="TOO MUCH energy drink campaign hero."
        fill
        priority
        sizes="100vw"
        className="portfolio-hero-pan object-cover opacity-80 md:object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/20" />
      <div className="relative z-10 flex h-full flex-col justify-between px-5 py-7 md:px-14 md:py-12">
        <div className="hidden flex-wrap items-center gap-3 text-[11px] font-bold uppercase opacity-90 md:flex">
          <span className="block h-2.5 w-2.5 rounded-full bg-lime" />
          <span>Spec ads</span>
          <span className="opacity-45">/</span>
          <span>Product worlds</span>
          <span className="opacity-45">/</span>
          <span>Scroll-native campaigns</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase opacity-90 md:hidden">
          <span className="block h-2.5 w-2.5 rounded-full bg-lime" />
          <span>Spec ads / Campaign 001</span>
        </div>

        <div className="flex flex-col gap-4 md:gap-7">
          <div className="max-w-[920px]">
            <h1 className="font-display text-[52px] leading-[0.9] uppercase sm:text-7xl lg:text-9xl">
              Portfolio
            </h1>
            <p className="mt-3 max-w-[620px] text-[16px] leading-[1.3] md:mt-4 md:text-[22px]">
              <span className="md:hidden">
                Spec ads built like entertainment.
              </span>
              <span className="hidden md:inline">
                Spec ads built like entertainment. The first campaign is TOO
                MUCH&trade;, the world&rsquo;s first clinically excessive energy
                drink.
              </span>
            </p>
          </div>

          <div className="hidden max-w-[900px] grid-cols-2 border border-cream/35 bg-black/55 text-cream backdrop-blur-sm md:grid md:grid-cols-4">
            {[
              ["001", "Campaign"],
              ["5", "Films"],
              ["15s", "Each"],
              ["9:16", "Vertical"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="border-b border-r border-cream/25 p-3 last:border-r-0 md:border-b-0 md:p-4"
              >
                <div className="font-display text-2xl uppercase leading-none md:text-4xl">
                  {value}
                </div>
                <div className="mt-1 text-[10px] font-bold uppercase opacity-70 md:text-[11px]">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CampaignIntro() {
  return (
    <section
      id="too-much"
      className="bg-lime border-b-2 border-black px-5 py-10 md:px-14 md:py-14"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.72fr)] lg:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2 text-[10px] md:text-[11px] font-bold uppercase opacity-75">
            <span className="block h-2.5 w-2.5 rounded-full bg-black" />
            <span>Campaign 001 / Energy drink / Spec</span>
          </div>
          <h2 className="font-display text-5xl leading-[0.9] uppercase sm:text-7xl lg:text-8xl">
            TOO MUCH&trade;
          </h2>
        </div>
        <div className="flex flex-col gap-4">
          <p className="font-serif text-[22px] italic leading-[1.2] md:text-[30px]">
            The world&rsquo;s first clinically excessive energy drink.
            Unfortunately, it works.
          </p>
          <p className="max-w-[620px] text-[15px] leading-[1.55] md:text-[17px]">
            Most energy drinks give you a boost. TOO MUCH gives you a
            personality event: office chaos, cold blue luxury, and the kind of
            confidence that should probably come with a waiver.
          </p>
        </div>
      </div>
    </section>
  );
}

function FilmGrid() {
  return (
    <section className="bg-black text-cream border-b-2 border-black px-5 py-10 md:px-14 md:py-16">
      <header className="mb-7 flex flex-col gap-4 border-b border-cream/30 pb-6 md:mb-9 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[10px] md:text-[11px] font-bold uppercase opacity-70">
            <span className="block h-2.5 w-2.5 rounded-full bg-lime" />
            <span>Autoplay film set</span>
          </div>
          <h2 className="font-display text-4xl leading-[0.95] uppercase md:text-6xl">
            Five ways to overdo it.
          </h2>
        </div>
        <p className="max-w-[420px] text-[13px] font-bold uppercase leading-[1.45] opacity-75 md:text-right">
          Muted autoplay loops, compressed for mobile, cut for fast scanning.
        </p>
      </header>

      <AutoScrollRail
        ariaLabel="TOO MUCH autoplay film carousel"
        className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] md:-mx-14 md:px-14 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
      >
        {TOO_MUCH_FILMS.map((film, index) => (
          <article
            key={film.title}
            className={`w-[62vw] min-w-[220px] max-w-[260px] shrink-0 border border-cream/35 bg-black sm:w-[34vw] sm:max-w-[300px] lg:w-auto lg:min-w-0 lg:max-w-none lg:shrink ${
              index === TOO_MUCH_FILMS.length - 1
                ? "sm:col-span-2 lg:col-span-1"
                : ""
            }`}
          >
            <div className="aspect-[9/16] w-full overflow-hidden bg-black">
              <AutoplayVideo
                src={film.video}
                poster={film.poster}
                label={`TOO MUCH ${film.title} spec ad`}
              />
            </div>
            <div className="border-t border-cream/35 p-3 md:p-4">
              <div className="mb-2 flex items-center justify-between gap-3 text-[10px] font-bold uppercase opacity-65">
                <span>{film.number}</span>
                <span>TOO MUCH</span>
              </div>
              <h3 className="font-display text-[17px] leading-[1.02] uppercase md:text-[22px]">
                {film.title}
              </h3>
              <p className="mt-2 min-h-[38px] text-[12px] leading-[1.35] opacity-80 md:min-h-[42px] md:text-[13px]">
                {film.line}
              </p>
            </div>
          </article>
        ))}
      </AutoScrollRail>
    </section>
  );
}

function SystemNotes() {
  return (
    <section className="bg-cream border-b-2 border-black px-5 py-10 md:px-14 md:py-16">
      <header className="mb-7 max-w-[760px] md:mb-9">
        <div className="mb-2 flex items-center gap-2 text-[10px] md:text-[11px] font-bold uppercase opacity-70">
          <span className="block h-2.5 w-2.5 rounded-full bg-lime border border-black" />
          <span>Brand logic</span>
        </div>
        <h2 className="font-display text-4xl leading-[0.95] uppercase md:text-6xl">
          The ad is the product world.
        </h2>
      </header>

      <div className="grid grid-cols-1 gap-px border-2 border-black bg-black md:grid-cols-3">
        {SYSTEM_NOTES.map((note) => (
          <article key={note.label} className="bg-cream p-5 md:p-7">
            <div className="mb-5 text-[10px] md:text-[11px] font-bold uppercase opacity-65">
              {note.label}
            </div>
            <h3 className="font-display text-[22px] leading-[1.02] uppercase md:text-[26px]">
              {note.title}
            </h3>
            <p className="mt-4 text-[15px] leading-[1.5] md:text-[16px]">
              {note.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function PortfolioFooter() {
  return (
    <footer className="bg-lavender px-5 py-9 md:px-14 md:py-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <Image
          src={LOGO}
          alt="VNMSFX"
          width={2522}
          height={905}
          className="h-[54px] w-auto md:h-[86px]"
        />
        <div className="flex flex-wrap items-center gap-4 text-[11px] md:text-[12px] font-bold uppercase">
          <Link href="/" className="hover:underline">
            Shows
          </Link>
          <Link href="/work" className="hover:underline">
            Work with VNMSFX
          </Link>
          <Link href="/signal" className="hover:underline">
            Signal
          </Link>
        </div>
      </div>
    </footer>
  );
}
