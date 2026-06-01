"use client";

import { track } from "@vercel/analytics";
import { useEffect } from "react";

export function PageViewTracker({
  show,
}: {
  show: "hank_beans_roar" | "checkpoint_chisme" | "rex_and_crow" | "gptea";
}) {
  useEffect(() => {
    track("show_page_view", { show });
  }, [show]);
  return null;
}
