"use client";

import { createContext, useContext } from "react";
import type { BriefingStudioTransfer } from "@/lib/briefing-studio-transfer";

const BriefingStudioContext = createContext<BriefingStudioTransfer | null>(null);

/** Server data crosses the RSC boundary through a client provider, not PageProps. */
export function BriefingStudioHandoffProvider({
  transfer,
  children,
}: {
  transfer: BriefingStudioTransfer;
  children: React.ReactNode;
}) {
  return <BriefingStudioContext.Provider value={transfer}>{children}</BriefingStudioContext.Provider>;
}

export function useBriefingStudioHandoff() {
  return useContext(BriefingStudioContext);
}
