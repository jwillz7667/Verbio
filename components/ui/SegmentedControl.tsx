"use client";

import * as React from "react";
import { cn } from "@/utils/cn";

interface SegmentedControlOption<T extends string> {
  value: T;
  label: string | React.ReactNode;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedControlOption<T>[];
  className?: string;
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur",
        className
      )}
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={cn(
              "min-w-[80px] rounded-full px-3 py-1.5 text-sm transition-all",
              selected
                ? "bg-gradient-to-r from-indigo-500 to-pink-500 text-white shadow"
                : "text-white/70 hover:bg-white/10"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}


