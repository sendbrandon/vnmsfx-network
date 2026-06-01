import { TrackedLink } from "./TrackedLink";

type CommunityScope = "network" | "disaster" | "chisme" | "bullshit" | "workplace";

const COPY: Record<CommunityScope, { headline: string; body: string }> = {
  network: {
    headline: "Join the Correspondents.",
    body: "Where the network goes off-record.",
  },
  disaster: {
    headline: "Disaster Correspondents talk over here.",
    body: "The expedition gets worse in public.",
  },
  chisme: {
    headline: "Chisme Correspondents talk over here.",
    body: "The details keep traveling after the episode ends.",
  },
  bullshit: {
    headline: "Bullshit Correspondents talk over here.",
    body: "Modern life keeps knocking. Rex keeps answering.",
  },
  workplace: {
    headline: "Workplace Correspondents talk over here.",
    body: "The office is open. HR is not prepared.",
  },
};

export function CommunityModule({
  scope = "network",
  variant = "light",
  source,
}: {
  scope?: CommunityScope;
  variant?: "light" | "dark" | "lime";
  source: string;
}) {
  const inviteUrl = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL;
  const copy = COPY[scope];
  const isDark = variant === "dark";
  const isLime = variant === "lime";
  const shellClass = isDark
    ? "border-cream/35 text-cream"
    : "border-black text-black";
  const buttonClass = isDark
    ? "bg-lime text-black hover:bg-[#a8e632]"
    : "bg-black text-lime hover:bg-[#1a1a1a]";

  return (
    <div
      className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-2 ${shellClass} ${
        isLime ? "bg-lime" : "bg-transparent"
      } p-4 md:p-5`}
    >
      <div className="flex flex-col gap-1.5">
        <h3 className="font-display text-[20px] md:text-[28px] leading-[1] uppercase">
          {copy.headline}
        </h3>
        <p
          className={`text-[14px] md:text-[15px] leading-[1.45] ${
            isDark ? "text-cream/70" : "text-black/70"
          }`}
        >
          {copy.body}
        </p>
      </div>

      {inviteUrl ? (
        <TrackedLink
          href={inviteUrl}
          event="community_discord_click"
          eventProps={{ source, scope }}
          external
          className={`inline-flex items-center justify-center min-h-12 px-4 py-3 text-[12px] font-extrabold tracking-[0.08em] uppercase transition-colors ${buttonClass}`}
        >
          Join the VNMSFX Discord →
        </TrackedLink>
      ) : (
        <div
          aria-disabled="true"
          className={`inline-flex items-center justify-center min-h-12 px-4 py-3 text-[12px] font-extrabold tracking-[0.08em] uppercase border ${
            isDark ? "border-cream/35 text-cream/60" : "border-black/40 text-black/60"
          }`}
        >
          Discord invite needed
        </div>
      )}
    </div>
  );
}
