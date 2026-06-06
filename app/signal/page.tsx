import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { SubscribeForm } from "../components/SubscribeForm";

const SITE_URL = "https://vnmsfx.com";
const LOGO_SRC = "/brand/vnmsfx-logo-black.png";
const LOGO_W = 2522;
const LOGO_H = 905;
const HERO_IMAGE = "/work/gptea/ep-05-poster.jpg";

export const metadata: Metadata = {
  title: "Join the GPTea Signal",
  description:
    "Join the GPTea Signal for drops first, viewer votes, and credited weirdness.",
  alternates: { canonical: `${SITE_URL}/signal` },
  openGraph: {
    title: "Join the GPTea Signal",
    description:
      "Drops first. Viewer votes. Credited weirdness.",
    type: "website",
    url: `${SITE_URL}/signal`,
    images: [
      {
        url: HERO_IMAGE,
        width: 720,
        height: 1280,
        alt: "Doug from GPTea drinking office coffee.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Join the GPTea Signal",
    description:
      "Drops first. Viewer votes. Credited weirdness.",
    images: [HERO_IMAGE],
  },
};

const SIGNAL_POINTS = [
  {
    label: "Get The Drop First",
    body: "New GPTea drops before the feed gets them.",
  },
  {
    label: "Vote What Ruins The Office",
    body: "Pick the premise, prop, or office problem.",
  },
  {
    label: "Send The Cursed Thing",
    body: "Send AI, workplace, tech, or finance weirdness.",
  },
  {
    label: "Get Public Credit",
    body: "If it becomes a bit, we can credit you.",
  },
];

const REWARD_TIERS = [
  {
    count: "3",
    label: "Signal Roll",
    body: "Get listed when the public Correspondent roll opens.",
  },
  {
    count: "10",
    label: "Early Room Access",
    body: "See rough cuts and premise polls early.",
  },
  {
    count: "25",
    label: "Priority Premise",
    body: "Your submitted weirdness moves up the idea pile.",
  },
  {
    count: "50",
    label: "Episode Credit",
    body: "If your idea becomes an episode, you can get credited.",
  },
  {
    count: "100",
    label: "Canon Consideration",
    body: "Name, cameo, or office artifact consideration.",
  },
];

export default function SignalPage() {
  return (
    <main className="min-h-screen bg-black text-cream font-sans overflow-x-hidden">
      <SignalNav />
      <Hero />
      <SignalLoop />
      <ReferralRewards />
      <TransmissionQueue />
      <FinalSignup />
    </main>
  );
}

function SignalNav() {
  return (
    <nav className="relative z-20 flex h-14 w-full items-center justify-between border-b-2 border-cream/20 bg-black/85 px-5 text-[10px] font-bold uppercase tracking-[0.08em] md:px-14 md:text-[11px]">
      <Link href="/" className="flex items-center gap-2">
        <span className="block h-2.5 w-2.5 shrink-0 rounded-full bg-lime" />
        <span className="flex h-[22px] items-center bg-cream px-2">
          <Image
            src={LOGO_SRC}
            alt="VNMSFX"
            width={LOGO_W}
            height={LOGO_H}
            priority
            className="h-[14px] w-auto"
          />
        </span>
      </Link>
      <div className="flex items-center gap-4 md:gap-6">
        <Link href="/#gptea" className="hover:text-lime">
          Watch
        </Link>
        <Link href="/clips" className="hover:text-lime">
          Clip
        </Link>
        <Link href="/signal" className="text-lime">
          Signal
        </Link>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="grid border-b-2 border-lime bg-black text-cream lg:min-h-[calc(100svh-56px)] lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.82fr)]">
      <div className="flex min-h-[calc(100dvh-56px)] flex-col justify-between gap-8 px-5 py-8 md:px-14 md:py-14 lg:min-h-[calc(100svh-56px)]">
        <div className="max-w-[900px]">
          <p className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.18em] text-lime md:text-[12px]">
            GPTea Correspondent Access
          </p>
          <h1 className="font-display text-[clamp(48px,11vw,132px)] uppercase leading-[0.86] tracking-[-0.04em]">
            Join the GPTea Signal.
          </h1>
          <p className="mt-5 max-w-[620px] text-[17px] leading-[1.35] text-cream/85 md:text-[22px]">
            Drops first. Viewer votes. Credited weirdness.
          </p>
        </div>

        <div className="w-full max-w-[640px] border-t-2 border-lime pt-5">
          <SubscribeForm
            source="signal_hero"
            variant="dark"
            includeInterests={false}
            defaultInterests={["gptea"]}
            headline="Get the next GPTea drop."
            body="One email when something is worth sending."
            buttonLabel="Join Signal"
          />
          <div className="mt-4 flex flex-wrap gap-3 text-[11px] font-extrabold uppercase tracking-[0.08em] text-cream/75">
            <Link href="/clips" className="hover:text-lime">
              Clipper rules
            </Link>
            <span className="text-cream/35">/</span>
            <Link href="/gptea" className="hover:text-lime">
              Watch GPTea
            </Link>
          </div>
        </div>
      </div>
      <div className="flex min-h-[540px] items-center justify-center border-t-2 border-lime bg-[#080808] p-5 sm:p-8 lg:min-h-[calc(100svh-56px)] lg:border-l-2 lg:border-t-0">
        <div className="relative aspect-[9/16] w-full max-w-[300px] sm:max-w-[360px] md:max-w-[420px]">
          <Image
            src={HERO_IMAGE}
            alt="Doug from GPTea drinking office coffee."
            fill
            priority
            sizes="(max-width: 1024px) 80vw, 420px"
            className="object-contain"
          />
        </div>
      </div>
    </section>
  );
}

function SignalLoop() {
  return (
    <section className="grid border-b-2 border-black bg-cream text-black lg:grid-cols-[0.86fr_1.14fr]">
      <div className="border-b-2 border-black px-5 py-10 md:px-14 md:py-16 lg:border-b-0 lg:border-r-2">
        <p className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.16em]">
          How the signal works
        </p>
        <h2 className="font-display text-[clamp(38px,7vw,92px)] uppercase leading-[0.9] tracking-[-0.035em]">
          Watch. Vote. Feed the breakroom.
        </h2>
      </div>
      <div className="grid md:grid-cols-2">
        {SIGNAL_POINTS.map((point) => (
          <article
            key={point.label}
            className="min-h-[190px] border-b-2 border-black px-5 py-7 last:border-b-0 md:border-r-2 md:px-8 md:py-9 md:even:border-r-0 md:[&:nth-last-child(-n+2)]:border-b-0"
          >
            <div className="mb-5 h-3 w-3 rounded-full bg-lime ring-2 ring-black" />
            <h3 className="mb-3 text-[14px] font-extrabold uppercase tracking-[0.12em]">
              {point.label}
            </h3>
            <p className="text-[16px] leading-[1.45] md:text-[18px]">
              {point.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ReferralRewards() {
  return (
    <section className="border-b-2 border-black bg-black px-5 py-10 text-cream md:px-14 md:py-16">
      <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
        <div className="max-w-[640px]">
          <p className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.16em] text-lime">
            Public rewards first
          </p>
          <h2 className="font-display text-[clamp(38px,7vw,96px)] uppercase leading-[0.88] tracking-[-0.035em]">
            Refer people. Get seen by the network.
          </h2>
          <p className="mt-5 text-[15px] leading-[1.55] text-cream/75 md:text-[17px]">
            Public credit first. Early access and premise power next. Cash
            affiliate payouts come later with paid memberships.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {REWARD_TIERS.map((tier) => (
            <article
              key={tier.label}
              className="min-h-[180px] border-2 border-cream/35 bg-cream p-5 text-black"
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <span className="font-display text-[42px] uppercase leading-none">
                  {tier.count}
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-[0.12em]">
                  referrals
                </span>
              </div>
              <h3 className="mb-3 text-[14px] font-extrabold uppercase tracking-[0.12em]">
                {tier.label}
              </h3>
              <p className="text-[14px] leading-[1.45]">{tier.body}</p>
            </article>
          ))}
          <article className="min-h-[180px] border-2 border-lime bg-lime p-5 text-black">
            <div className="mb-6 h-3 w-3 rounded-full bg-black" />
            <h3 className="mb-3 text-[14px] font-extrabold uppercase tracking-[0.12em]">
              Clipper Path
            </h3>
            <p className="mb-5 text-[14px] leading-[1.45]">
              Repost cleanly, point people to the Signal, build the trail.
            </p>
            <Link
              href="/clips"
              className="text-[12px] font-extrabold uppercase tracking-[0.1em] underline"
            >
              Read clipper rules
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}

function TransmissionQueue() {
  return (
    <section className="border-b-2 border-lime bg-lavender px-5 py-10 text-black md:px-14 md:py-16">
      <div className="grid gap-8 lg:grid-cols-[0.72fr_1fr] lg:items-start">
        <div>
          <p className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.16em]">
            Correspondent queue
          </p>
          <h2 className="font-display text-[clamp(34px,6vw,78px)] uppercase leading-[0.9] tracking-[-0.03em]">
            Send the thing they should not be trusted with.
          </h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {["Cursed AI behavior", "Workplace nonsense", "Tech and finance symptoms"].map(
            (item) => (
              <article
                key={item}
                className="min-h-[170px] border-2 border-black bg-cream p-4"
              >
                <div className="mb-8 h-3 w-3 rounded-full bg-black" />
                <h3 className="text-[14px] font-extrabold uppercase tracking-[0.12em]">
                  {item}
                </h3>
              </article>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

function FinalSignup() {
  return (
    <section className="grid border-b-2 border-black bg-lime text-black lg:grid-cols-[0.82fr_1.18fr]">
      <div className="flex flex-col justify-between gap-10 border-b-2 border-black px-5 py-10 md:px-14 md:py-16 lg:border-b-0 lg:border-r-2">
        <h2 className="font-display text-[clamp(38px,7vw,96px)] uppercase leading-[0.88] tracking-[-0.035em]">
          This network gets weirder if you participate.
        </h2>
        <p className="max-w-[520px] text-[15px] font-bold uppercase leading-[1.45] tracking-[0.08em]">
          Correspondents get the drop first and help steer the next one.
        </p>
      </div>
      <div className="px-5 py-10 md:px-14 md:py-16">
        <SubscribeForm
          source="signal_bottom"
          variant="lime"
          includeInterests={false}
          defaultInterests={["gptea"]}
          headline="Join the GPTea Signal."
          body="Drops, votes, submissions, and office evidence."
          buttonLabel="Become a GPTea Correspondent"
        />
      </div>
    </section>
  );
}
