export const AUDIENCE_IDENTITY = "VNMSFX Correspondent";

export type ShowInterestId =
  | "hank_beans_roar"
  | "checkpoint_chisme"
  | "rex_and_crow"
  | "gptea"
  | "everything";

export type ReportType =
  | "disaster"
  | "chisme"
  | "bullshit"
  | "workplace"
  | "leak";

export type InspiredBy = {
  handle: string;
  url?: string;
  reportType: ReportType;
};

export const SHOW_INTERESTS: {
  id: ShowInterestId;
  show: string;
  label: string;
  reportLabel: string;
  correspondent: string;
}[] = [
  {
    id: "hank_beans_roar",
    show: "Hank, Beans & Roar",
    label: "Hank, Beans & Roar",
    reportLabel: "Disaster reports",
    correspondent: "Disaster Correspondent",
  },
  {
    id: "checkpoint_chisme",
    show: "Checkpoint Chisme",
    label: "Checkpoint Chisme",
    reportLabel: "Chisme reports",
    correspondent: "Chisme Correspondent",
  },
  {
    id: "rex_and_crow",
    show: "Rex & Crow",
    label: "Rex & Crow",
    reportLabel: "Bullshit reports",
    correspondent: "Bullshit Correspondent",
  },
  {
    id: "gptea",
    show: "GPTea",
    label: "GPTea",
    reportLabel: "Office AI reports",
    correspondent: "GPTea Correspondent",
  },
  {
    id: "everything",
    show: "VNMSFX",
    label: "Everything from VNMSFX",
    reportLabel: "Network-wide drops, new show launches, etc.",
    correspondent: "VNMSFX Correspondent",
  },
];

export const ALL_INTEREST_IDS = SHOW_INTERESTS.map((interest) => interest.id);

export function normalizeInterestIds(values: unknown): ShowInterestId[] {
  if (!Array.isArray(values)) {
    return [];
  }

  const valid = new Set(ALL_INTEREST_IDS);
  return Array.from(
    new Set(
      values.filter((value): value is ShowInterestId => {
        return typeof value === "string" && valid.has(value as ShowInterestId);
      }),
    ),
  );
}

export function getInterestLabel(id: ShowInterestId) {
  return SHOW_INTERESTS.find((interest) => interest.id === id)?.label ?? id;
}

export function getDefaultHandleUrl(handle: string) {
  const cleanHandle = handle.replace(/^@/, "");
  return `https://x.com/${encodeURIComponent(cleanHandle)}`;
}
