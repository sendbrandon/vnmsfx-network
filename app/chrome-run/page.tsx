import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageViewTracker } from "../components/PageViewTracker";
import { SocialRow } from "../components/SocialRow";
import { TrackedLink } from "../components/TrackedLink";

const LOGO = "/brand/vnmsfx-logo-white.png";
const HERO_VIDEO = "/videos/chrome-run/widescreen.mp4";
const HERO_POSTER = "/work/chrome-run/widescreen.jpg";

const FILMS = [
  {
    title: "Tunnel Chase",
    label: "Film 01",
    src: "/videos/chrome-run/vertical-chase.mp4",
    poster: "/work/chrome-run/vertical-chase.jpg",
    body:
      "Chrome bikes, a silver tunnel, and one chase that refuses to explain why it is happening.",
  },
  {
    title: "Shark Deck",
    label: "Film 02",
    src: "/videos/chrome-run/vertical-shark.mp4",
    poster: "/work/chrome-run/vertical-shark.jpg",
    body:
      "A command deck, a shark, a flag, and the quiet confidence of a plan that should not exist.",
  },
  {
    title: "Red Alert",
    label: "Film 03",
    src: "/videos/chrome-run/vertical-alarm.mp4",
    poster: "/work/chrome-run/vertical-alarm.jpg",
    body:
      "Control-room panic, a red button, and the kind of workplace emergency HR cannot process.",
  },
  {
    title: "Control Room",
    label: "Film 04",
    src: "/videos/chrome-run/vertical-control-room.mp4",
    poster: "/work/chrome-run/vertical-control-room.jpg",
    body:
      "The operation escalates from sci-fi procedure to full meltdown without losing eye contact.",
  },
];

export const metadata: Metadata = {
  title: { absolute: "The Chrome Run — VNMSFX" },
  description:
    "The Chrome Run is a VNMSFX retro-future chase comedy built from a widescreen trailer and four vertical social films.",
  alternates: { canonical: "https://vnmsfx.com/chrome-run" },
  openGraph: {
    title: "The Chrome Run — VNMSFX",
    description:
      "A retro-future chase comedy where chrome motorcycles, control-room panic, shark-deck ceremony, and one chicken become brand-ready character IP.",
    type: "website",
    url: "https://vnmsfx.com/chrome-run",
    images: [
      {
        url: HERO_POSTER,
        width: 1918,
        height: 822,
        alt: "The Chrome Run — chrome motorcycles racing through a silver tunnel.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Chrome Run — VNMSFX",
    description:
      "Chrome motorcycles, control-room panic, shark-deck ceremony, and one chicken who refuses to break character.",
    images: [HERO_POSTER],
  },
};

export default function ChromeRunPage() {
  return (
    <main className="font-sans bg-black text-cream overflow-x-hidden">
      <PageViewTracker show="chrome_run" />
      <ShowNav />
      <Hero />
      <FilmGrid />
      <B2BUse />
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
          src={LOGO}
          alt="VNMSFX"
          width={2522}
          height={905}
          priority
          className="h-[16px] md:h-[18px] w-auto"
        />
        <span className="hidden sm:inline opacity-70">
          &nbsp;&nbsp;/&nbsp;&nbsp;The Chrome Run
        </span>
      </Link>
      <Link href="/gptea" className="hover:underline">
        Next show
      </Link>
    </nav>
  );
}

function Hero() {
  return (
    <section className="border-b-2 border-lime">
      <video
        src={HERO_VIDEO}
        poster={HERO_POSTER}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-label="The Chrome Run widescreen trailer."
        className="block w-full aspect-[1918/822] max-h-[calc(100svh-56px)] object-cover"
      />
      <div className="px-5 md:px-14 py-7 md:py-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.75fr)] lg:items-end border-t border-cream/20">
        <div>
          <p className="text-[10px] md:text-[11px] font-extrabold tracking-[0.14em] uppercase text-lime">
            VNMSFX Show · 5 Films · Retro-future chase comedy
          </p>
          <h1 className="mt-3 font-display text-[48px] leading-[0.86] uppercase sm:text-[76px] lg:text-[132px]">
            The Chrome Run
          </h1>
        </div>
        <div className="flex flex-col gap-5">
          <p className="text-[15px] md:text-[18px] leading-[1.45] text-cream/90">
            A chrome motorcycle duel keeps escalating into workplace sci-fi,
            control-room panic, shark-deck ceremony, and one chicken who
            refuses to break character.
          </p>
          <TrackedLink
            href="#films"
            event="watch_chrome_run_click"
            eventProps={{ source: "chrome_run_page_hero" }}
            className="inline-flex items-center gap-3 bg-lime text-black px-5 py-4 self-start font-display text-[15px] uppercase"
          >
            Watch the Films →
          </TrackedLink>
        </div>
      </div>
    </section>
  );
}

function FilmGrid() {
  return (
    <section
      id="films"
      className="px-5 md:px-14 py-10 md:py-16 flex flex-col gap-7 md:gap-10 scroll-mt-14"
    >
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-cream/25 pb-5">
        <h2 className="font-display text-[38px] leading-[0.9] uppercase sm:text-[56px]">
          Vertical Cuts
        </h2>
        <p className="max-w-[520px] text-[14px] md:text-[16px] leading-[1.45] text-cream/75 md:text-right">
          Four 15-second social films built as individual scroll-stoppers from
          the same strange world.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-px bg-cream/25 border border-cream/25">
        {FILMS.map((film) => (
          <article key={film.src} className="bg-black">
            <div className="relative aspect-[9/16] overflow-hidden bg-black">
              <video
                src={film.src}
                poster={film.poster}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label={`${film.title} from The Chrome Run.`}
                className="h-full w-full object-cover"
              />
              <div className="absolute left-3 top-3 bg-lime px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-black">
                {film.label}
              </div>
            </div>
            <div className="p-5 md:p-6">
              <h3 className="font-display text-[28px] leading-[0.95] uppercase">
                {film.title}
              </h3>
              <p className="mt-4 text-[14px] leading-[1.45] text-cream/78">
                {film.body}
              </p>
            </div>
          </article>
        ))}
      </div>
      <SocialRow campaign="chrome_run" variant="dark" />
    </section>
  );
}

function B2BUse() {
  return (
    <section className="bg-cream text-black border-y-2 border-black px-5 md:px-14 py-10 md:py-16">
      <div className="grid gap-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.75fr)] lg:items-end">
        <div>
          <p className="text-[10px] md:text-[11px] font-extrabold tracking-[0.14em] uppercase">
            B2B use
          </p>
          <h2 className="mt-3 font-display text-[40px] leading-[0.9] uppercase sm:text-[64px] lg:text-[92px]">
            Launches, speed reels, surreal product drops.
          </h2>
        </div>
        <p className="text-[15px] md:text-[17px] leading-[1.5]">
          Chrome Run is the VNMSFX slot for products that need velocity,
          spectacle, and a little corporate sci-fi panic. Your brand can enter
          the chase as the object, sponsor, mission, device, warning, or thing
          everyone should have read first.
        </p>
      </div>
    </section>
  );
}

function BackToNetwork() {
  return (
    <section className="px-5 md:px-14 py-10 md:py-14">
      <Link
        href="/"
        className="inline-flex items-center gap-3 bg-lime text-black px-5 py-4 font-display text-[14px] md:text-[16px] uppercase"
      >
        ← Back to VNMSFX
      </Link>
    </section>
  );
}
