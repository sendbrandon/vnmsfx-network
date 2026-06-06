import { NowPlayingBoard } from "./NowPlayingBoard";
import { GPTEA } from "../lib/shows";

export function OpenPlanFeature() {
  return (
    <section
      id="gptea"
      aria-labelledby="gptea-title"
      className="bg-lavender text-black border-b-2 border-black px-5 md:px-14 pt-10 md:pt-16 pb-12 md:pb-20"
    >
      <header className="mb-8 md:mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 text-[10px] md:text-[11px] font-extrabold uppercase tracking-[0.16em]">
            <span className="block h-2.5 w-2.5 bg-lime border border-black" />
            <span>
              New Show · {GPTEA.episodes?.length ?? 12} episodes live
            </span>
          </div>
          <h2
            id="gptea-title"
            className="font-display text-[clamp(42px,9vw,110px)] leading-[0.86] uppercase tracking-[-0.02em]"
          >
            GPTea.
          </h2>
          <p className="font-serif italic text-[18px] md:text-[24px] leading-[1.25] max-w-[620px]">
            Office coffee, AI dread, and the hoodie guy who saw it coming.
          </p>
        </div>
        <p className="text-[14px] md:text-[15px] leading-[1.55] max-w-[420px] md:text-right">
          A vertical workplace cartoon about <strong>Doug</strong>, the guy in the hoodie, and <strong>Marv</strong>, the other guy stuck translating the end of the world into office small talk.
        </p>
      </header>

      <NowPlayingBoard work={GPTEA} />
    </section>
  );
}
