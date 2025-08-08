"use client";

import { Camera, Image as ImageIcon, Mic, Send } from "lucide-react";

export function InputPill({
  value,
  onChange,
  onSubmit,
  onMic,
  onCamera,
  onGallery,
  loading,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onMic: () => void;
  onCamera: () => void;
  onGallery: () => void;
  loading?: boolean;
}) {
  return (
    <div className="mx-auto mt-4 max-w-2xl rounded-full border border-pink-300/60 bg-white/80 px-3 py-2 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-black/40">
      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onSubmit(); }}
          placeholder="Type to translate instead"
          className="flex-1 rounded-full bg-transparent px-3 py-1.5 text-sm text-black/80 outline-none placeholder:text-black/40 dark:text-white dark:placeholder:text-white/40"
        />
        <button className="icon-btn" aria-label="Mic" onClick={onMic}><Mic className="h-4 w-4" /></button>
        <button className="icon-btn" aria-label="Camera" onClick={onCamera}><Camera className="h-4 w-4" /></button>
        <button className="icon-btn" aria-label="Gallery" onClick={onGallery}><ImageIcon className="h-4 w-4" /></button>
        <button
          className="ml-1 inline-flex h-8 items-center justify-center rounded-full bg-brand-gradient px-3 text-xs font-medium text-white"
          onClick={onSubmit}
          disabled={loading}
        >
          <Send className="mr-1 h-3.5 w-3.5" /> Send
        </button>
      </div>
    </div>
  );
}


