"use client";

export function LanguagePill({
  from,
  to,
  onSwap,
}: {
  from: string;
  to: string;
  onSwap: () => void;
}) {
  return (
    <div className="fixed left-1/2 top-20 z-30 -translate-x-1/2 rounded-full border border-black/5 bg-white/70 px-3 py-1.5 text-sm shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-black/40">
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


