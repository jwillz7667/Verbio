"use client";

import React, { useCallback, useRef, useState } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AudioControlsProps {
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
}

export function AudioControls({ isListening, setIsListening }: AudioControlsProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  
  const requestMicrophonePermission = useCallback(async () => {
    try {
      setPermissionError(null);
      
      // Request microphone permission explicitly
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      // Clean up the stream immediately after getting permission
      stream.getTracks().forEach(track => track.stop());
      
      setHasPermission(true);
      return true;
    } catch (error: any) {
      console.error('Microphone permission error:', error);
      
      if (error.name === 'NotAllowedError') {
        setPermissionError('Microphone access denied. Please enable it in your browser settings.');
      } else if (error.name === 'NotFoundError') {
        setPermissionError('No microphone found. Please connect a microphone.');
      } else {
        setPermissionError('Failed to access microphone. Please check your settings.');
      }
      
      setHasPermission(false);
      return false;
    }
  }, []);
  
  const handleMicClick = useCallback(async () => {
    // First check if we have permission
    if (hasPermission === null || hasPermission === false) {
      const granted = await requestMicrophonePermission();
      if (!granted) return;
    }
    
    // Toggle listening state
    setIsListening(!isListening);
    
    // Announce state change to screen readers
    const message = isListening ? 'Stopped listening' : 'Started listening';
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  }, [isListening, setIsListening, hasPermission, requestMicrophonePermission]);

  // Keyboard support
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleMicClick();
    }
  }, [handleMicClick]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Permission Error Display */}
      {permissionError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{permissionError}</span>
        </motion.div>
      )}
      
      {/* Main Mic Button with proper touch target size (min 44x44px) */}
      <motion.button
        ref={buttonRef}
        onClick={handleMicClick}
        onKeyDown={handleKeyDown}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          relative min-w-[88px] min-h-[88px] rounded-full border-2 
          transition-all duration-300 focus:outline-none focus:ring-4
          ${isListening 
            ? 'bg-red-500 hover:bg-red-600 border-red-300 focus:ring-red-300' 
            : 'bg-blue-500 hover:bg-blue-600 border-blue-300 focus:ring-blue-300'
          }
          text-white shadow-lg flex items-center justify-center
          ${hasPermission === false ? 'opacity-75' : ''}
        `}
        aria-label={isListening ? 'Stop recording' : 'Start recording'}
        aria-pressed={isListening}
        type="button"
      >
        <AnimatePresence mode="wait">
          {isListening ? (
            <motion.div
              key="listening"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MicOff className="h-10 w-10" aria-hidden="true" />
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Mic className="h-10 w-10" aria-hidden="true" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* CSS-only pulse effect for better performance */}
        {isListening && (
          <div className="absolute inset-0 rounded-full">
            <div className="absolute inset-0 rounded-full bg-red-400 animate-ping" />
            <div className="absolute inset-0 rounded-full bg-red-400 animate-ping animation-delay-200" />
          </div>
        )}
      </motion.button>

      {/* Status Text */}
      <p className="text-gray-700 dark:text-gray-300 font-medium text-base text-center">
        {isListening ? 'Listening... Tap to stop' : 
         hasPermission === false ? 'Grant microphone access to start' :
         'Tap to start speaking'}
      </p>

      {/* CSS-only audio visualization for better performance */}
      {isListening && (
        <div className="flex gap-1 h-12 items-end" aria-hidden="true">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 bg-gradient-to-t from-blue-500 to-blue-300 rounded-full"
              style={{
                animation: `audioBar ${0.6 + i * 0.1}s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`,
                height: '20px'
              }}
            />
          ))}
        </div>
      )}
      
      {/* Request Permission Button if needed */}
      {hasPermission === false && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={requestMicrophonePermission}
          className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Grant Microphone Access
        </motion.button>
      )}
    </div>
  );
}