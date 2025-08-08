"use client";

import { useState } from "react";

type Tip = { id: string; label: string; description: string };

const DEFAULT_TIPS: Tip[] = [
  { id: "speak", label: "Speak clearly", description: "Keep the mic 10–15cm away and speak at a steady pace." },
  { id: "noise", label: "Avoid background noise", description: "Find a quiet space or move closer to the mic." },
  { id: "choose", label: "Choose the right voice", description: "Switch between natural or clear pronunciation in settings." },
];

export function TipChips({ tips = DEFAULT_TIPS }: { tips?: Tip[] }) {
  const [openTip, setOpenTip] = useState<string | null>(null);

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {tips.map((t) => (
        <div key={t.id} className="relative">
          <button
            onClick={() => setOpenTip((prev) => (prev === t.id ? null : t.id))}
            className="rounded-full border border-black/5 bg-white/70 px-3 py-1.5 text-sm text-black/70 transition-colors hover:bg-white/90 dark:border-white/10 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/20"
          >
            {t.label}
          </button>
          {openTip === t.id && (
            <div className="absolute left-0 top-10 z-10 w-64 rounded-xl border border-black/5 bg-white/90 p-3 text-xs text-black/70 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-black/70 dark:text-white/80">
              {t.description}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}


