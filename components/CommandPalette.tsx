"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Command = {
  id: string;
  title: string;
  shortcut?: string;
  run: () => void;
};

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = useMemo(
    () => [
      { id: "home", title: "Go to Home", shortcut: "G H", run: () => router.push("/") },
      { id: "profile", title: "Open Profile", shortcut: "G P", run: () => router.push("/profile") },
      { id: "terms", title: "View Terms", run: () => router.push("/terms") },
      { id: "privacy", title: "View Privacy", run: () => router.push("/privacy") },
    ],
    [router]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => c.title.toLowerCase().includes(q));
  }, [commands, query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isK = e.key.toLowerCase() === "k";
      if ((e.metaKey || e.ctrlKey) && isK) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setQuery("");
      setActiveIndex(0);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      className="fixed inset-0 z-[100] flex items-start justify-center p-4"
      onClick={() => setOpen(false)}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-white/80 p-3 shadow-2xl backdrop-blur-xl dark:bg-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/70 px-3 py-2 dark:bg-white/5">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-sm text-black/80 outline-none placeholder:text-black/40 dark:text-white dark:placeholder:text-white/40"
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIndex((i) => Math.max(i - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                filtered[activeIndex]?.run();
                setOpen(false);
              } else if (e.key === "Escape") {
                setOpen(false);
              }
            }}
          />
          <kbd className="hidden sm:block rounded border border-white/20 bg-white/30 px-2 py-1 text-[10px] text-black/60 dark:text-white/70">Esc</kbd>
        </div>
        <div className="mt-3 max-h-80 overflow-y-auto rounded-xl border border-white/10 bg-white/70 p-1 dark:bg-white/5">
          {filtered.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-black/50 dark:text-white/60">
              No results
            </div>
          ) : (
            <ul>
              {filtered.map((cmd, idx) => (
                <li key={cmd.id}>
                  <button
                    onClick={() => {
                      cmd.run();
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      idx === activeIndex
                        ? "bg-indigo-600/90 text-white"
                        : "hover:bg-black/5 dark:hover:bg-white/10"
                    }`}
                    onMouseEnter={() => setActiveIndex(idx)}
                  >
                    <span>{cmd.title}</span>
                    {cmd.shortcut && (
                      <span className="text-[10px] text-black/50 dark:text-white/60">
                        {cmd.shortcut}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between px-1">
          <p className="text-xs text-black/50 dark:text-white/60">Press ⌘K / Ctrl K to toggle</p>
          <p className="text-xs text-black/50 dark:text-white/60">Enter to run • Esc to close</p>
        </div>
      </div>
    </div>
  );
}


