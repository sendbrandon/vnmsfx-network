import Image from "next/image";

type Work = {
  slug: string;
  category: string;
  meta: string;
  title: string;
  body: string;
  cta: string;
  poster: string;
};

const FEATURED: Work = {
  slug: "prairie-pussy",
  category: "Film · 41 sec · 2026",
  meta: "MAY 09, 2026",
  title: "Prairie Pussy 1847",
  body: "Prestige period drama played absolutely straight against an OnlyFans confession. She just wanted to be seen.",
  cta: "Watch the cut",
  poster: "/work/prairie-pussy.jpg",
};

const WORKS: Work[] = [
  {
    slug: "twelve-dollar-sandwich",
    category: "Felt Puppet · Drop #022",
    meta: "MAY 09, 2026",
    title: "Twelve Dollar Sandwich",
    body: "A puppet has a documentary-real diner panic about inflation, a kidney, and needing a Hyundai by Friday.",
    cta: "Watch",
    poster: "/work/twelve-dollar-sandwich.jpg",
  },
  {
    slug: "barbarian-mental-health",
    category: "Series · Arc 04 · Recurring",
    meta: "MAY 06, 2026",
    title: "Barbarian Mental Health",
    body: "A Pleistocene barbarian processes therapy-speak, boundaries, and case-file logic through a brutal ancient worldview.",
    cta: "Open case file",
    poster: "/work/barbarian-mental-health.jpg",
  },
  {
    slug: "room-47",
    category: "Children's Format · New York",
    meta: "MAY 06, 2026",
    title: "Room 47",
    body: "Today's number is 47. Also the number of people Dad's department lost. A children's counting show.",
    cta: "Watch",
    poster: "/work/room-47.jpg",
  },
];

const TICKER =
  "→ → → → → → → → →  Get the Friday dispatch · No spam, no decks, no AI hype  → → → → → → → → → → → → → →";

export default function Page() {
  return (
    <main className="font-sans bg-lavender text-black overflow-x-hidden">
      <TopNav />
      <Hero />
      <BookingBar />
      <WorkSection featured={FEATURED} works={WORKS} />
      <PressSection />
      <Footer />
    </main>
  );
}

function TopNav() {
  return (
    <nav className="w-full h-14 flex items-center justify-between px-14 border-b-[1.5px] border-black text-[11px] font-bold tracking-[0.08em] uppercase bg-lavender">
      <div className="flex items-center gap-2">
        <span className="block w-2.5 h-2.5 rounded-full bg-black" />
        <span>VNMSFX®&nbsp;&nbsp;/&nbsp;&nbsp;NYC, EST 2024</span>
      </div>
      <div className="hidden md:block">
        STUDIO · NETWORK · ARTIFACTS · DISPATCH · CONTACT
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="px-14 pt-24 pb-14 flex flex-col gap-20">
      <div className="flex items-start gap-8">
        <aside className="w-48 shrink-0 pt-6">
          <div className="text-[10px] font-extrabold tracking-[0.14em] uppercase leading-[1.4]">
            MANIFESTO
            <br />
            SLATE 26—27
          </div>
          <div className="w-8 h-[1.5px] mt-3.5 bg-black" />
          <p className="text-[11px] mt-3.5 leading-[1.45]">
            A nine-point note from the studio on what we make and who it's for.
          </p>
        </aside>
        <div className="flex-1">
          <h1 className="font-display text-[120px] leading-[0.92] tracking-[-0.035em] uppercase">
            &ldquo;WE MAKE THE INTERNET FEEL LIKE THE INTERNET AGAIN.&rdquo;
          </h1>
        </div>
      </div>
      <div className="flex items-end justify-between gap-8 flex-wrap">
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Read the full manifesto"
            className="w-16 h-16 rounded-full bg-black flex items-center justify-center"
          >
            <span
              aria-hidden
              className="block w-0 h-0"
              style={{
                borderTop: "11px solid transparent",
                borderBottom: "11px solid transparent",
                borderLeft: "17px solid #ffffff",
                marginLeft: 5,
              }}
            />
          </button>
          <div className="w-60">
            <div className="text-xs font-extrabold tracking-[0.08em] uppercase">
              READ THE FULL NOTE
            </div>
            <div className="font-serif italic text-[13px] mt-1">
              — Brandon Adams, Founder
            </div>
          </div>
        </div>
        <div className="flex items-end gap-6">
          <p className="font-serif italic text-[18px] leading-[1.4] text-right max-w-[260px] pb-3">
            A New York network for AI work that doesn&rsquo;t look like AI work.
          </p>
          <div className="font-display text-[56px] leading-[0.9] tracking-[-0.03em]">
            VNMSFX
          </div>
        </div>
      </div>
    </section>
  );
}

function BookingBar() {
  return (
    <section className="w-full h-28 bg-lime border-y-2 border-black px-14 flex items-center gap-10">
      <div className="flex-1 font-display text-[28px] leading-[1] tracking-[-0.01em] uppercase">
        ↳ Now booking slate 26—27 · Films, artifacts, retainers
      </div>
      <a
        href="mailto:brandon@pushto6.com?subject=VNMSFX%20Network%20Inquiry"
        className="flex items-center gap-3.5 shrink-0 group"
      >
        <span className="text-xs font-extrabold tracking-[0.08em] uppercase">
          Start a project
        </span>
        <span className="w-14 h-14 bg-black flex items-center justify-center text-lime text-[22px] group-hover:bg-[#1a1a1a] transition-colors">
          →
        </span>
      </a>
    </section>
  );
}

function WorkSection({
  featured,
  works,
}: {
  featured: Work;
  works: Work[];
}) {
  return (
    <section className="bg-cream px-14 pt-20 pb-24 flex flex-col gap-10">
      <header className="flex items-end justify-between border-b-2 border-black pb-6 gap-6 flex-wrap">
        <h2 className="font-display text-[88px] leading-[0.92] tracking-[-0.03em] uppercase">
          The Work
        </h2>
        <div className="flex items-center gap-6">
          <div className="text-[11px] font-bold tracking-[0.1em] uppercase">
            Film · Series · Artifacts · Network
          </div>
          <a
            href="#all"
            className="text-[13px] font-extrabold tracking-[0.04em] uppercase hover:underline"
          >
            ↗ All projects
          </a>
        </div>
      </header>

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Featured card */}
        <article className="flex-[1.4] flex flex-col gap-5">
          <a
            href={`#${featured.slug}`}
            className="block relative w-full h-[560px] overflow-hidden group"
          >
            <Image
              src={featured.poster}
              alt={featured.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover group-hover:scale-[1.015] transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/55 pointer-events-none" />
            <div className="absolute inset-0 p-7 flex flex-col justify-between text-cream">
              <div className="flex items-start justify-between">
                <div className="text-[11px] font-bold tracking-[0.1em] uppercase">
                  ● {featured.category}
                </div>
                <div className="text-[11px] font-bold tracking-[0.1em] uppercase">
                  {featured.meta}
                </div>
              </div>
              <div>
                <h3 className="font-display text-[88px] leading-[0.86] tracking-[-0.04em] uppercase">
                  {featured.title}
                </h3>
                <div className="flex items-center mt-4 gap-3">
                  <span className="w-10 h-10 bg-lime flex items-center justify-center text-black text-lg">
                    →
                  </span>
                  <span className="text-[13px] font-extrabold tracking-[0.06em] uppercase">
                    {featured.cta}
                  </span>
                </div>
              </div>
            </div>
          </a>
          <p className="text-base leading-[1.5] max-w-[520px]">
            {featured.body}
          </p>
        </article>

        {/* Stacked cards */}
        <div className="flex-1 flex flex-col gap-4">
          {works.map((w, i) => (
            <a
              key={w.slug}
              href={`#${w.slug}`}
              className={`flex gap-4 group items-center ${
                i < works.length - 1
                  ? "pb-4 border-b-[1.5px] border-black"
                  : ""
              }`}
            >
              <div className="relative w-32 h-32 shrink-0 overflow-hidden">
                <Image
                  src={w.poster}
                  alt={w.title}
                  fill
                  sizes="128px"
                  className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                />
              </div>
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="text-[10px] font-bold tracking-[0.1em] uppercase">
                  ● {w.category}
                </div>
                <div className="font-display text-[24px] leading-[0.95] tracking-[-0.02em] uppercase">
                  {w.title}
                </div>
                <p className="text-[13px] leading-[1.4] line-clamp-2">
                  {w.body}
                </p>
              </div>
              <span className="w-9 h-9 bg-lime flex items-center justify-center text-black text-base shrink-0 group-hover:bg-[#a8e632] transition-colors">
                →
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function PressSection() {
  return (
    <section className="bg-lavender border-t-2 border-black px-14 pt-20 pb-14 flex flex-col gap-14">
      <div className="flex items-center justify-between">
        <div className="font-display text-[32px] leading-[1] tracking-[-0.01em] uppercase">
          ● Press
        </div>
        <div className="flex gap-3.5">
          <span className="block w-3 h-3 rounded-full bg-black" />
          <span className="block w-3 h-3 rounded-full bg-black opacity-25" />
          <span className="block w-3 h-3 rounded-full bg-black opacity-25" />
          <span className="block w-3 h-3 rounded-full bg-black opacity-25" />
        </div>
      </div>
      <div className="flex items-end gap-16 flex-wrap">
        <blockquote className="flex-1 font-display text-[88px] leading-[0.95] tracking-[-0.025em] uppercase">
          &ldquo;The funniest network in New York right now.&rdquo;
        </blockquote>
        <div className="w-72 shrink-0 pb-3">
          <div className="font-serif italic text-[22px]">— Highsnobiety</div>
          <div className="text-[11px] font-bold tracking-[0.1em] uppercase mt-2">
            FEB 14, 2026 · ISSUE 47
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-lavender border-t-2 border-black flex flex-col">
      <div className="w-full h-14 flex items-center px-14 border-b-[1.5px] border-black overflow-hidden">
        <div className="flex-1 text-[13px] font-bold tracking-[0.04em] whitespace-nowrap">
          {TICKER}
        </div>
      </div>
      <div className="pt-14 pb-8 px-14">
        <div className="font-display text-[clamp(120px,18vw,248px)] leading-[0.85] tracking-[-0.05em] text-center">
          VNMSFX
        </div>
      </div>
      <div className="flex border-y-[1.5px] border-black">
        <div className="flex-1 py-8 px-14 border-r-[1.5px] border-black text-center">
          <div className="font-display text-base tracking-[0.04em] uppercase">
            Booking
          </div>
          <a
            href="mailto:brandon@pushto6.com"
            className="block mt-2 text-base hover:underline"
          >
            brandon@pushto6.com
          </a>
        </div>
        <div className="flex-1 py-8 px-14 text-center">
          <div className="font-display text-base tracking-[0.04em] uppercase">
            Studio
          </div>
          <a
            href="mailto:brandon@pushto6.com"
            className="block mt-2 text-base hover:underline"
          >
            brandon@pushto6.com
          </a>
        </div>
      </div>
      <div className="flex items-center justify-between py-6 px-14 text-[11px] font-bold tracking-[0.1em] uppercase flex-wrap gap-2">
        <div>© 2026 VNMSFX LLC · Made in New York · All rights reserved</div>
        <div>Site by VNMSFX®</div>
      </div>
    </footer>
  );
}
