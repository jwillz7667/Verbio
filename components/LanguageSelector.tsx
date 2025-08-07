// components/LanguageSelector.tsx
"use client";

import { ArrowLeftRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';

interface LanguageSelectorProps {
  sourceLanguage: 'en' | 'es';
  targetLanguage: 'en' | 'es';
  onSourceChange: (lang: 'en' | 'es') => void;
  onTargetChange: (lang: 'en' | 'es') => void;
  onSwap: () => void;
}

export function LanguageSelector({
  sourceLanguage,
  targetLanguage,
  onSourceChange,
  onTargetChange,
  onSwap
}: LanguageSelectorProps) {
  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="flex items-end justify-between gap-4">
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium text-white/70">From</label>
          <Select value={sourceLanguage} onValueChange={(v) => onSourceChange(v as 'en' | 'es')}>
            <SelectTrigger>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">🇬🇧 English</SelectItem>
              <SelectItem value="es">🇪🇸 Spanish</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <button
          onClick={onSwap}
          className="mb-1 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition-all hover:rotate-180 hover:bg-white/10"
          aria-label="Swap languages"
        >
          <ArrowLeftRight className="h-5 w-5" />
        </button>

        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium text-white/70">To</label>
          <Select value={targetLanguage} onValueChange={(v) => onTargetChange(v as 'en' | 'es')}>
            <SelectTrigger>
              <SelectValue placeholder="Select target" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="es">🇪🇸 Spanish</SelectItem>
              <SelectItem value="en">🇬🇧 English</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}