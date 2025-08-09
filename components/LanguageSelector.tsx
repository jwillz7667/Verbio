// components/LanguageSelector.tsx
"use client";

import { useId, useMemo, useCallback } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface LanguageSelectorProps {
  sourceLanguage: 'en' | 'es';
  targetLanguage: 'en' | 'es';
  onSourceChange: (lang: 'en' | 'es') => void;
  onTargetChange: (lang: 'en' | 'es') => void;
  onSwap: () => void;
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
] as const;

export function LanguageSelector({
  sourceLanguage,
  targetLanguage,
  onSourceChange,
  onTargetChange,
  onSwap
}: LanguageSelectorProps) {
  const sourceSelectId = useId();
  const targetSelectId = useId();
  
  // Memoize language lookups for performance
  const sourceLang = useMemo(
    () => LANGUAGES.find(lang => lang.code === sourceLanguage),
    [sourceLanguage]
  );
  const targetLang = useMemo(
    () => LANGUAGES.find(lang => lang.code === targetLanguage),
    [targetLanguage]
  );
  
  // Keyboard support for swap button
  const handleSwapKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSwap();
    }
  }, [onSwap]);

  return (
    <div 
      className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-xl"
      role="group"
      aria-label="Language selection"
    >
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        {/* Source Language */}
        <div className="flex-1 min-w-0">
          <label 
            htmlFor={sourceSelectId}
            className="block text-gray-700 dark:text-gray-300 text-sm mb-2 font-medium"
          >
            Translate from
          </label>
          <select
            id={sourceSelectId}
            value={sourceLanguage}
            onChange={(e) => onSourceChange(e.target.value as 'en' | 'es')}
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer hover:border-gray-400 dark:hover:border-gray-500"
            aria-label="Source language"
          >
            {LANGUAGES.map((language) => (
              <option key={language.code} value={language.code}>
                {language.flag} {language.name}
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button with proper touch target (44x44px min) */}
        <div className="flex items-center justify-center sm:self-end sm:mb-1">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSwap}
            onKeyDown={handleSwapKeyDown}
            className="min-w-[44px] min-h-[44px] p-2.5 rounded-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors shadow-lg"
            aria-label={`Swap languages: ${sourceLang?.name} to ${targetLang?.name}`}
            type="button"
          >
            <ArrowLeftRight className="h-5 w-5" aria-hidden="true" />
          </motion.button>
        </div>

        {/* Target Language */}
        <div className="flex-1 min-w-0">
          <label 
            htmlFor={targetSelectId}
            className="block text-gray-700 dark:text-gray-300 text-sm mb-2 font-medium"
          >
            Translate to
          </label>
          <select
            id={targetSelectId}
            value={targetLanguage}
            onChange={(e) => onTargetChange(e.target.value as 'en' | 'es')}
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer hover:border-gray-400 dark:hover:border-gray-500"
            aria-label="Target language"
          >
            {LANGUAGES.map((language) => (
              <option key={language.code} value={language.code}>
                {language.flag} {language.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Screen reader announcement for language changes */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Translating from {sourceLang?.name} to {targetLang?.name}
      </div>
    </div>
  );
}