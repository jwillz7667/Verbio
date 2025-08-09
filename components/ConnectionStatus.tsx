"use client";
// components/ConnectionStatus.tsx
import { Wifi, WifiOff, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConnectionStatusProps {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  errorMessage?: string;
  reconnectIn?: number; // seconds until reconnect
  onRetry?: () => void;
}

export function ConnectionStatus({ 
  status, 
  errorMessage, 
  reconnectIn,
  onRetry 
}: ConnectionStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: <Wifi className="w-4 h-4" aria-hidden="true" />,
          text: 'Connected',
          className: 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30 border-green-200 dark:border-green-800',
          ariaLabel: 'Connection status: Connected'
        };
      case 'connecting':
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />,
          text: reconnectIn ? `Reconnecting in ${reconnectIn}s...` : 'Connecting...',
          className: 'text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800',
          ariaLabel: 'Connection status: Connecting'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-4 h-4" aria-hidden="true" />,
          text: errorMessage || 'Connection Error',
          className: 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30 border-red-200 dark:border-red-800',
          ariaLabel: `Connection status: Error - ${errorMessage || 'Connection failed'}`
        };
      default:
        return {
          icon: <WifiOff className="w-4 h-4" aria-hidden="true" />,
          text: 'Disconnected',
          className: 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700',
          ariaLabel: 'Connection status: Disconnected'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${config.className}`}
        role="status"
        aria-live="polite"
        aria-label={config.ariaLabel}
      >
        {config.icon}
        <span className="min-w-0 flex-1">
          {config.text}
        </span>
        
        {/* Retry button for error state */}
        {status === 'error' && onRetry && (
          <button
            onClick={onRetry}
            className="ml-2 px-2 py-0.5 text-xs font-medium rounded bg-white/20 hover:bg-white/30 dark:bg-black/20 dark:hover:bg-black/30 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500"
            aria-label="Retry connection"
            type="button"
          >
            Retry
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}