// components/TranslationControls.tsx
import { Settings, Download, Trash2, History } from 'lucide-react';

interface TranslationControlsProps {
  onClearHistory: () => void;
  onDownloadHistory: () => void;
  onOpenSettings: () => void;
  historyCount: number;
}

export function TranslationControls({
  onClearHistory,
  onDownloadHistory,
  onOpenSettings,
  historyCount
}: TranslationControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4 mt-6">
      <button
        onClick={onClearHistory}
        disabled={historyCount === 0}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Clear history"
      >
        <Trash2 className="w-4 h-4" />
        <span className="text-sm">Clear</span>
      </button>
      
      <button
        onClick={onDownloadHistory}
        disabled={historyCount === 0}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Download history"
      >
        <Download className="w-4 h-4" />
        <span className="text-sm">Export</span>
      </button>
      
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
        <History className="w-4 h-4" />
        <span className="text-sm">{historyCount} translations</span>
      </div>
      
      <button
        onClick={onOpenSettings}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Open settings"
      >
        <Settings className="w-4 h-4" />
        <span className="text-sm">Settings</span>
      </button>
    </div>
  );
}