// components/LanguageSelector.tsx
import { ArrowLeftRight } from 'lucide-react';

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
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            From
          </label>
          <select
            value={sourceLanguage}
            onChange={(e) => onSourceChange(e.target.value as 'en' | 'es')}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          >
            <option value="en">🇬🇧 English</option>
            <option value="es">🇪🇸 Spanish</option>
          </select>
        </div>
        
        <button
          onClick={onSwap}
          className="mt-6 p-3 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-all hover:rotate-180 duration-300"
          aria-label="Swap languages"
        >
          <ArrowLeftRight className="w-5 h-5" />
        </button>
        
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            To
          </label>
          <select
            value={targetLanguage}
            onChange={(e) => onTargetChange(e.target.value as 'en' | 'es')}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          >
            <option value="es">🇪🇸 Spanish</option>
            <option value="en">🇬🇧 English</option>
          </select>
        </div>
      </div>
    </div>
  );
}