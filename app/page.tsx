import { WorkGrid, type Work } from "./components/WorkGrid";

const FEATURED: Work = {
  slug: "prairie-pussy",
  category: "Film · 41 sec · 2026",
  meta: "NEW THIS WEEK",
  title: "Prairie Pussy 1847",
  body: "Prestige period drama played absolutely straight against an OnlyFans confession. She just wanted to be seen.",
  cta: "Press play",
  poster: "/work/prairie-pussy.jpg",
  video: "/videos/prairie-pussy.mp4",
};

const WORKS: Work[] = [
  {
    slug: "twelve-dollar-sandwich",
    category: "Felt Puppet · 20 sec",
    meta: "DROP #022",
    title: "Twelve Dollar Sandwich",
    body: "A puppet has a documentary-real diner panic about inflation, a kidney, and needing a Hyundai by Friday.",
    cta: "Watch",
    poster: "/work/twelve-dollar-sandwich.jpg",
    video: "/videos/twelve-dollar-sandwich.mp4",
  },
  {
    slug: "barbarian-mental-health",
    category: "Series · Arc 04",
    meta: "RECURRING",
    title: "Barbarian Mental Health",
    body: "He survived the Ice Age. He cannot survive boundaries.",
    cta: "Open case file",
    poster: "/work/barbarian-mental-health.jpg",
    video: "/videos/barbarian-mental-health.mp4",
  },
  {
    slug: "room-47",
    category: "Series · Pilot",
    meta: "NEW",
    title: "Room 47",
    body: "Today's number is 47. Also the number of people Dad's department lost. A children's counting show.",
    cta: "Watch",
    poster: "/work/room-47.jpg",
    video: "/videos/room-47.mp4",
  },
];

const TICKER =
  "→ → → → → → → → →  One email per drop · No spam, no decks, no AI hype  → → → → → → → → → → → → → →";

const SUBSCRIBE_MAILTO =
  "mailto:brandon@pushto6.com?subject=Subscribe%20me%20to%20VNMSFX&body=Add%20me%20to%20the%20list%20for%20new%20drops.";

export default function Page() {
  return (
    <main className="font-sans bg-lavender text-black overflow-x-hidden">
      <TopNav />
      <Hero />
      <SubscribeBar />
      <NowPlayingSection />
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
        WATCH · SERIES · NEW · DISPATCH · CONTACT
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
            NOW PLAYING
            <br />
            VOL. 26—27
          </div>
          <div className="w-8 h-[1.5px] mt-3.5 bg-black" />
          <p className="text-[11px] mt-3.5 leading-[1.45]">
            Four new drops from the network. Press play. Subscribe so you don&rsquo;t miss the next one.
          </p>
        </aside>
        <div className="flex-1">
          <h1 className="font-display text-[120px] leading-[0.92] tracking-[-0.035em] uppercase">
            &ldquo;WE MAKE THE INTERNET FEEL LIKE THE INTERNET AGAIN.&rdquo;
          </h1>
        </div>
      </div>
      <div className="flex items-end justify-between gap-8 flex-wrap">
        <a href="#now-playing" className="flex items-center gap-4 group">
          <span className="w-16 h-16 rounded-full bg-black flex items-center justify-center group-hover:bg-[#1a1a1a] transition-colors">
            <span
              aria-hidden
              className="block w-0 h-0"
              style={{
                borderTop: "11px solid transparent",
                borderBottom: "11px solid transparent",
                borderLeft: "17px solid #C2FF3F",
                marginLeft: 5,
              }}
            />
          </span>
          <div className="w-60">
            <div className="text-xs font-extrabold tracking-[0.08em] uppercase">
              Watch the latest drops
            </div>
            <div className="font-serif italic text-[13px] mt-1">
              4 new this week — scroll to play
            </div>
          </div>
        </a>
        <div className="flex items-end gap-6">
          <p className="font-serif italic text-[18px] leading-[1.4] text-right max-w-[300px] pb-3">
            Dangerously good AI videos. Made in New York. New drops every Thursday.
          </p>
          <div className="font-display text-[56px] leading-[0.9] tracking-[-0.03em]">
            VNMSFX
          </div>
        </div>
      </div>
    </section>
  );
}

function SubscribeBar() {
  return (
    <section className="w-full h-28 bg-lime border-y-2 border-black px-14 flex items-center gap-10">
      <div className="flex-1 font-display text-[28px] leading-[1] tracking-[-0.01em] uppercase">
        ↳ New drop every Thursday · One email when it hits
      </div>
      <a
        href={SUBSCRIBE_MAILTO}
        className="flex items-center gap-3.5 shrink-0 group"
      >
        <span className="text-xs font-extrabold tracking-[0.08em] uppercase">
          Subscribe
        </span>
        <span className="w-14 h-14 bg-black flex items-center justify-center text-lime text-[22px] group-hover:bg-[#1a1a1a] transition-colors">
          →
        </span>
      </a>
    </section>
  );
}

function NowPlayingSection() {
  return (
    <section id="now-playing" className="bg-cream px-14 pt-20 pb-24 flex flex-col gap-10 scroll-mt-14">
      <header className="flex items-end justify-between border-b-2 border-black pb-6 gap-6 flex-wrap">
        <h2 className="font-display text-[88px] leading-[0.92] tracking-[-0.03em] uppercase">
          Now Playing
        </h2>
        <div className="flex items-center gap-6">
          <div className="text-[11px] font-bold tracking-[0.1em] uppercase">
            Film · Series · Drops · Recurring
          </div>
          <a
            href={SUBSCRIBE_MAILTO}
            className="text-[13px] font-extrabold tracking-[0.04em] uppercase hover:underline"
          >
            ↗ Full feed
          </a>
        </div>
      </header>

      <WorkGrid featured={FEATURED} works={WORKS} />
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
            Inbox
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
            Press
          </div>
          <a
            href="mailto:brandon@pushto6.com?subject=Press%20inquiry"
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
