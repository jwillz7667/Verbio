"use client";
// components/ConnectionStatus.tsx
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

interface ConnectionStatusProps {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
}

export function ConnectionStatus({ status }: ConnectionStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: <Wifi className="w-4 h-4" />,
          text: 'Connected',
          className: 'text-green-600 bg-green-50 dark:bg-green-900/20'
        };
      case 'connecting':
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          text: 'Connecting...',
          className: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20'
        };
      case 'error':
        return {
          icon: <WifiOff className="w-4 h-4" />,
          text: 'Connection Error',
          className: 'text-red-600 bg-red-50 dark:bg-red-900/20'
        };
      default:
        return {
          icon: <WifiOff className="w-4 h-4" />,
          text: 'Disconnected',
          className: 'text-gray-600 bg-gray-50 dark:bg-gray-900/20'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${config.className}`}>
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
}
