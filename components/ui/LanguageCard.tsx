"use client";

import { ArrowLeftRight } from "lucide-react";

type Lang = "en" | "es";

const FLAG: Record<Lang, string> = {
  en: "🇺🇸",
  es: "🇪🇸",
};

const LABEL: Record<Lang, string> = {
  en: "English",
  es: "Spanish",
};

export function LanguageCard({
  source,
  target,
  onSourceChange,
  onTargetChange,
  onSwap,
}: {
  source: Lang;
  target: Lang;
  onSourceChange: (l: Lang) => void;
  onTargetChange: (l: Lang) => void;
  onSwap: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-3xl bg-[linear-gradient(180deg,rgba(255,255,255,0.8),rgba(255,255,255,0.6))] p-[2px] shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.06))]">
        <div className="rounded-[calc(1.5rem-2px)] border border-pink-300/60 bg-white/80 px-4 py-3 dark:border-pink-300/20 dark:bg-black/40">
          <div className="flex items-center gap-3">
            <LangSelect value={source} onChange={onSourceChange} labelPrefix="From" />
            <div className="mx-1 h-8 w-px bg-pink-200/70 dark:bg-white/10" />
            <LangSelect value={target} onChange={onTargetChange} labelPrefix="To" />
            <button
              type="button"
              onClick={onSwap}
              aria-label="Swap languages"
              className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-pink-300/60 bg-pink-200/30 text-pink-700 transition-colors hover:bg-pink-200/50 dark:border-white/10 dark:bg-white/10 dark:text-white"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LangSelect({ value, onChange, labelPrefix }: { value: Lang; onChange: (l: Lang) => void; labelPrefix: string }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-black/60 dark:text-white/60 w-10">{labelPrefix}</label>
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-2xl border border-black/5 bg-white/80 px-3 py-1.5 text-sm shadow-sm transition-colors hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-white"
        onClick={() => onChange(value === "en" ? "es" : "en")}
        aria-label={`${labelPrefix} language`}
      >
        <span className="text-lg">{FLAG[value]}</span>
        <span className="font-medium">{LABEL[value]}</span>
        <span className="ml-1 text-black/40 dark:text-white/40">▾</span>
      </button>
    </div>
  );
}


