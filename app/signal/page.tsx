import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { SubscribeForm } from "../components/SubscribeForm";

const SITE_URL = "https://vnmsfx.com";
const LOGO_SRC = "/brand/vnmsfx-logo-black.png";
const LOGO_W = 2522;
const LOGO_H = 905;
const HERO_IMAGE = "/work/gptea/welcome-email-screengrab.jpg";

export const metadata: Metadata = {
  title: "Join the VNMSFX Signal",
  description:
    "Join the VNMSFX Signal for new drops, viewer votes, strange transmissions, and chances to feed the network.",
  alternates: { canonical: `${SITE_URL}/signal` },
  openGraph: {
    title: "Join the VNMSFX Signal",
    description:
      "New drops, viewer votes, strange transmissions, and chances to feed the network.",
    type: "website",
    url: `${SITE_URL}/signal`,
    images: [
      {
        url: HERO_IMAGE,
        width: 1200,
        height: 720,
        alt: "A GPTea character calmly drinking coffee during a strange workday.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Join the VNMSFX Signal",
    description:
      "New drops, viewer votes, strange transmissions, and chances to feed the network.",
    images: [HERO_IMAGE],
  },
};

const SIGNAL_POINTS = [
  {
    label: "Drops First",
    body: "New episodes and network updates before they get buried in the scroll.",
  },
  {
    label: "Vote The Premise",
    body: "Help decide which cursed idea gets fed to the machine next.",
  },
  {
    label: "Send The Weird Thing",
    body: "Submit the AI, workplace, city, or internet nonsense that should become a bit.",
  },
  {
    label: "Get Credited",
    body: "If your comment turns into an episode, we can credit the Correspondent who sent it in.",
  },
];

export default function SignalPage() {
  return (
    <main className="min-h-screen bg-black text-cream font-sans overflow-x-hidden">
      <SignalNav />
      <Hero />
      <SignalLoop />
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
        <Link href="/signal" className="text-lime">
          Signal
        </Link>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative min-h-[calc(100svh-56px)] border-b-2 border-lime">
      <Image
        src={HERO_IMAGE}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-55"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.72)_46%,rgba(207,168,250,0.12)_100%)]" />
      <div className="relative z-10 flex min-h-[calc(100svh-56px)] flex-col justify-between px-5 py-8 md:px-14 md:py-12">
        <div className="max-w-[980px]">
          <p className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.18em] text-lime md:text-[12px]">
            VNMSFX Correspondent Access
          </p>
          <h1 className="font-display text-[clamp(54px,12vw,150px)] uppercase leading-[0.86] tracking-[-0.04em]">
            Join the VNMSFX Signal.
          </h1>
        </div>

        <div className="grid gap-8 pt-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.72fr)] lg:items-end">
          <p className="max-w-[740px] font-serif text-[22px] italic leading-[1.25] text-cream md:text-[30px]">
            New drops, viewer votes, strange transmissions, and the chance to
            feed the network something it should not know.
          </p>
          <div className="w-full border-t-2 border-lime pt-5">
            <SubscribeForm
              source="signal_hero"
              variant="dark"
              includeInterests={false}
              defaultInterests={["everything"]}
              headline="Become a Correspondent."
              body="One email per drop. No spam, no decks, no AI hype."
              buttonLabel="Join the Signal"
            />
          </div>
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
          Watch. Vote. Send the weird thing.
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

function TransmissionQueue() {
  return (
    <section className="border-b-2 border-lime bg-lavender px-5 py-10 text-black md:px-14 md:py-16">
      <div className="grid gap-8 lg:grid-cols-[0.72fr_1fr] lg:items-start">
        <div>
          <p className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.16em]">
            Correspondent queue
          </p>
          <h2 className="font-display text-[clamp(34px,6vw,78px)] uppercase leading-[0.9] tracking-[-0.03em]">
            Feed us the thing that should become a bit.
          </h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {["Cursed AI behavior", "Workplace nonsense", "Internet symptoms"].map(
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
          Correspondents get the drop first, then help decide what the network
          becomes next.
        </p>
      </div>
      <div className="px-5 py-10 md:px-14 md:py-16">
        <SubscribeForm
          source="signal_bottom"
          variant="lime"
          includeInterests={false}
          defaultInterests={["everything"]}
          headline="Join the Signal."
          body="New drops, votes, submissions, and occasional evidence that the network is alive."
          buttonLabel="Become a Correspondent"
        />
      </div>
    </section>
  );
}
