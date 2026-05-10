import { FeaturedShow } from "./components/FeaturedShow";
import { NowPlayingBoard, type Work } from "./components/NowPlayingBoard";

const CHECKPOINT_CHISME: Work = {
  slug: "checkpoint-chisme",
  category: "Felt Puppet Series · 15 sec each",
  meta: "NEW THIS WEEK",
  title: "Checkpoint Chisme",
  body: "Felt-puppet TSA agents. Suspicious groceries. Infinite chisme.",
  poster: "/work/checkpoint-chisme/ep01.jpg",
  video: "/videos/checkpoint-chisme/ep01.mp4",
  episodes: [
    {
      episodeNumber: 1,
      title: "The Grocery",
      body: "Three felt-puppet TSA agents. One suspicious grocery bag. Infinite chisme.",
      poster: "/work/checkpoint-chisme/ep01.jpg",
      video: "/videos/checkpoint-chisme/ep01.mp4",
    },
    {
      episodeNumber: 2,
      title: "The Interrogation",
      body: "The desk lamp's on. The Food 4 Less bag is on the table. Some chisme cannot be contained.",
      poster: "/work/checkpoint-chisme/ep02.jpg",
      video: "/videos/checkpoint-chisme/ep02.mp4",
    },
    {
      episodeNumber: 3,
      title: "Immigration",
      body: "The scanner. The printer. The face on the printout. Welcome to checkpoint chisme.",
      poster: "/work/checkpoint-chisme/ep03.jpg",
      video: "/videos/checkpoint-chisme/ep03.mp4",
    },
  ],
};

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
      <FeaturedShow
        show="Hank & Beans"
        episodeMeta="S1 · EP01 · 14 SEC"
        episodeTitle="The Cook-off"
        body="Two cooks. One kitchen. Zero ground rules. The pilot of Hank & Beans drops with a cook-off that should never have been allowed to happen."
        poster="/work/the-cook-off.jpg"
        video="/videos/the-cook-off.mp4"
        aspect={4 / 3}
      />
      <CheckpointChismeSection />
      <Footer />
    </main>
  );
}

function TopNav() {
  return (
    <nav className="w-full h-14 flex items-center justify-between px-5 md:px-14 border-b-[1.5px] border-black text-[10px] md:text-[11px] font-bold tracking-[0.08em] uppercase bg-lavender">
      <div className="flex items-center gap-2">
        <span className="block w-2.5 h-2.5 rounded-full bg-black shrink-0" />
        <span className="truncate">VNMSFX®&nbsp;&nbsp;/&nbsp;&nbsp;NYC, EST 2024</span>
      </div>
      <div className="hidden md:block">
        WATCH · SERIES · NEW · DISPATCH · CONTACT
      </div>
      <a
        href="#checkpoint-chisme"
        className="md:hidden font-extrabold tracking-[0.08em]"
      >
        WATCH ↓
      </a>
    </nav>
  );
}

function Hero() {
  return (
    <section className="px-5 md:px-14 pt-10 md:pt-24 pb-10 md:pb-14 flex flex-col gap-10 md:gap-20">
      <div className="flex flex-col md:flex-row items-start gap-5 md:gap-8">
        <aside className="w-full md:w-48 shrink-0 md:pt-6 flex md:block items-start gap-3 md:gap-0">
          <div className="text-[10px] font-extrabold tracking-[0.14em] uppercase leading-[1.4] shrink-0">
            NOW PLAYING
            <br />
            VOL. 26—27
          </div>
          <div className="hidden md:block w-8 h-[1.5px] mt-3.5 bg-black" />
          <p className="hidden md:block text-[11px] mt-3.5 leading-[1.45]">
            New shows from the network. Press play. Subscribe so you don&rsquo;t miss the next one.
          </p>
          <p className="md:hidden text-[11px] leading-[1.45] flex-1">
            New shows from the network. Press play. Subscribe so you don&rsquo;t miss the next one.
          </p>
        </aside>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-[clamp(40px,11vw,120px)] leading-[0.92] tracking-[-0.035em] uppercase">
            &ldquo;WE MAKE THE INTERNET FEEL LIKE THE INTERNET AGAIN.&rdquo;
          </h1>
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 md:gap-8">
        <a href="#hank-and-beans" className="flex items-center gap-4 group shrink-0">
          <span className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-black flex items-center justify-center group-hover:bg-[#1a1a1a] transition-colors shrink-0">
            <span
              aria-hidden
              className="block w-0 h-0"
              style={{
                borderTop: "10px solid transparent",
                borderBottom: "10px solid transparent",
                borderLeft: "15px solid #C2FF3F",
                marginLeft: 4,
              }}
            />
          </span>
          <div className="max-w-[240px]">
            <div className="text-[11px] md:text-xs font-extrabold tracking-[0.08em] uppercase">
              Watch the latest drops
            </div>
            <div className="font-serif italic text-[12px] md:text-[13px] mt-1">
              Scroll to play
            </div>
          </div>
        </a>
        <div className="flex items-end gap-4 md:gap-6 self-stretch md:self-auto justify-between md:justify-end">
          <p className="font-serif italic text-[14px] md:text-[18px] leading-[1.4] text-left md:text-right max-w-[200px] md:max-w-[300px] pb-2 md:pb-3">
            Dangerously good AI videos. Made in New York. New drops every Thursday.
          </p>
          <div className="font-display text-[clamp(36px,8vw,56px)] leading-[0.9] tracking-[-0.03em] shrink-0">
            VNMSFX
          </div>
        </div>
      </div>
    </section>
  );
}

function SubscribeBar() {
  return (
    <section className="w-full bg-lime border-y-2 border-black px-5 md:px-14 py-6 md:py-0 md:h-28 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-10">
      <div className="flex-1 font-display text-[clamp(20px,4.5vw,28px)] leading-[1.05] tracking-[-0.01em] uppercase">
        ↳ New drop every Thursday · One email when it hits
      </div>
      <a
        href={SUBSCRIBE_MAILTO}
        className="flex items-center gap-3.5 shrink-0 group self-stretch md:self-auto justify-between md:justify-end"
      >
        <span className="text-xs font-extrabold tracking-[0.08em] uppercase">
          Subscribe
        </span>
        <span className="w-12 h-12 md:w-14 md:h-14 bg-black flex items-center justify-center text-lime text-[20px] md:text-[22px] group-hover:bg-[#1a1a1a] transition-colors shrink-0">
          →
        </span>
      </a>
    </section>
  );
}

function CheckpointChismeSection() {
  return (
    <section
      id="checkpoint-chisme"
      className="bg-cream px-5 md:px-14 pt-12 md:pt-20 pb-16 md:pb-24 flex flex-col gap-8 md:gap-10 scroll-mt-14"
    >
      <header className="flex items-end justify-between border-b-2 border-black pb-5 md:pb-6 gap-4 md:gap-6">
        <div className="flex flex-col gap-2">
          <div className="text-[10px] md:text-[11px] font-bold tracking-[0.14em] uppercase opacity-70">
            ● Now Playing · 3 episodes
          </div>
          <h2 className="font-display text-[clamp(42px,9vw,88px)] leading-[0.92] tracking-[-0.03em] uppercase">
            Checkpoint Chisme
          </h2>
        </div>
      </header>

      <NowPlayingBoard work={CHECKPOINT_CHISME} />
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-lavender border-t-2 border-black flex flex-col">
      <div className="w-full h-12 md:h-14 flex items-center px-5 md:px-14 border-b-[1.5px] border-black overflow-hidden">
        <div className="flex-1 text-[11px] md:text-[13px] font-bold tracking-[0.04em] whitespace-nowrap">
          {TICKER}
        </div>
      </div>
      <div className="pt-10 md:pt-14 pb-6 md:pb-8 px-5 md:px-14">
        <div className="font-display text-[clamp(72px,18vw,248px)] leading-[0.85] tracking-[-0.05em] text-center">
          VNMSFX
        </div>
      </div>
      <div className="px-5 md:px-14 pb-6 md:pb-8 flex flex-col items-center gap-3">
        <div className="font-serif italic text-center text-[14px] md:text-[16px] max-w-[480px] leading-[1.45]">
          &ldquo;The funniest network in New York right now.&rdquo;{" "}
          <span className="text-[12px] md:text-[13px]">— Highsnobiety</span>
        </div>
      </div>
      <div className="flex flex-col md:flex-row border-y-[1.5px] border-black">
        <div className="flex-1 py-6 md:py-8 px-5 md:px-14 border-b-[1.5px] md:border-b-0 md:border-r-[1.5px] border-black text-center">
          <div className="font-display text-[14px] md:text-base tracking-[0.04em] uppercase">
            Inbox
          </div>
          <a
            href="mailto:brandon@pushto6.com"
            className="block mt-2 text-[14px] md:text-base hover:underline break-all"
          >
            brandon@pushto6.com
          </a>
        </div>
        <div className="flex-1 py-6 md:py-8 px-5 md:px-14 text-center">
          <div className="font-display text-[14px] md:text-base tracking-[0.04em] uppercase">
            Press
          </div>
          <a
            href="mailto:brandon@pushto6.com?subject=Press%20inquiry"
            className="block mt-2 text-[14px] md:text-base hover:underline break-all"
          >
            brandon@pushto6.com
          </a>
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between py-5 md:py-6 px-5 md:px-14 text-[10px] md:text-[11px] font-bold tracking-[0.1em] uppercase gap-2">
        <div>© 2026 VNMSFX LLC · Made in New York · All rights reserved</div>
        <div>Site by VNMSFX®</div>
      </div>
    </footer>
  );
}
