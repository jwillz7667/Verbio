"use client";

import { cn } from "@/utils/cn";

export function LanguagePill({
  from,
  to,
  onSwap,
  floating = true,
  className,
}: {
  from: string;
  to: string;
  onSwap: () => void;
  floating?: boolean;
  className?: string;
}) {
  const base =
    "rounded-full border border-black/5 bg-white/70 px-3 py-1.5 text-sm shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-black/40";
  const position = floating
    ? "fixed left-1/2 top-24 -translate-x-1/2 z-30"
    : "relative z-10";

  return (
    <div className={cn(base, position, className)}>
      <span className="font-medium text-black/70 dark:text-white/80">{from}</span>
      <span className="mx-2 text-black/30 dark:text-white/30">→</span>
      <span className="font-medium text-black/70 dark:text-white/80">{to}</span>
      <button
        className="ml-3 rounded-full border border-black/10 bg-black/5 px-2 py-0.5 text-xs text-black/70 transition-colors hover:bg-black/10 dark:border-white/10 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/20"
        onClick={onSwap}
        aria-label="Swap languages"
      >
        Swap
      </button>
    </div>
  );
}


