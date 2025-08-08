"use client";

import { Mic, MicOff, Loader2 } from "lucide-react";

export function FloatingMic({
  recording,
  translating,
  onToggle,
}: {
  recording: boolean;
  translating: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      aria-label={recording ? "Stop recording" : "Start recording"}
      onClick={onToggle}
      disabled={translating}
      className={`fixed bottom-20 right-6 z-40 grid h-16 w-16 place-items-center rounded-full transition-all duration-300 ${
        recording
          ? "bg-gradient-to-br from-rose-500 to-rose-600 shadow-[0_0_0_8px_rgba(244,63,94,0.15)]"
          : "bg-gradient-to-br from-indigo-500 to-pink-500 shadow-[0_0_0_8px_rgba(99,102,241,0.15)]"
      } text-white focus:outline-none focus:ring-4 focus:ring-indigo-400/40 disabled:opacity-60`}
    >
      {translating ? (
        <Loader2 className="h-7 w-7 animate-spin" />
      ) : recording ? (
        <MicOff className="h-7 w-7" />
      ) : (
        <Mic className="h-7 w-7" />
      )}
      {recording && <span className="pulse-ring" />}
    </button>
  );
}


