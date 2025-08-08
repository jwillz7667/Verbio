"use client";

import dynamic from "next/dynamic";
import type { ListeningOrbInner as InnerType } from "./ListeningOrbInner";

export function ListeningOrb(props: { level: number; state: "idle" | "listening" | "translating" }) {
  // Client-only import of the framer-motion dependent inner component
  const Client = dynamic(async () => (await import("./ListeningOrbInner")).ListeningOrbInner as unknown as Promise<typeof InnerType>, { ssr: false }) as any;
  return <Client {...props} />;
}


