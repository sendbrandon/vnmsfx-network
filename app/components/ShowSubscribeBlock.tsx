import { SubscribeForm } from "./SubscribeForm";
import type { ShowInterestId } from "../lib/audience";

const COPY: Record<
  Exclude<ShowInterestId, "everything">,
  { headline: string; body: string; buttonLabel: string }
> = {
  hank_beans_roar: {
    headline: "Get Disaster Reports in your inbox.",
    body: "Subscribe to Hank, Beans & Roar drops only.",
    buttonLabel: "Sign me up →",
  },
  checkpoint_chisme: {
    headline: "Get Chisme Reports in your inbox.",
    body: "Subscribe to Checkpoint Chisme drops only.",
    buttonLabel: "Sign me up →",
  },
  rex_and_crow: {
    headline: "Get Bullshit Reports in your inbox.",
    body: "Subscribe to Rex & Crow drops only.",
    buttonLabel: "Sign me up →",
  },
  gptea: {
    headline: "Get GPTea in your inbox.",
    body: "Subscribe to GPTea drops only.",
    buttonLabel: "Sign me up →",
  },
};

export function ShowSubscribeBlock({
  interest,
  variant = "light",
  source,
}: {
  interest: Exclude<ShowInterestId, "everything">;
  variant?: "light" | "dark" | "lime";
  source: string;
}) {
  const copy = COPY[interest];

  return (
    <div className="max-w-[760px]">
      <SubscribeForm
        source={source}
        variant={variant}
        includeInterests={false}
        defaultInterests={[interest]}
        headline={copy.headline}
        body={copy.body}
        buttonLabel={copy.buttonLabel}
      />
    </div>
  );
}
