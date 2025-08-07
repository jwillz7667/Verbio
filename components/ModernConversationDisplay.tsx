'use client';

import { useEffect, useRef } from 'react';
import { Volume2, Mic, Globe } from 'lucide-react';

interface Conversation {
  id: string;
  type: 'user' | 'assistant';
  text: string;
  language: 'en' | 'es' | 'auto';
  timestamp: Date;
  audioUrl?: string;
  voice?: string;
}

interface ModernConversationDisplayProps {
  conversations: Conversation[];
  onPlayAudio?: (audioUrl: string) => void;
  isTranslating?: boolean;
  currentTranscription?: string;
  audioLevel?: number;
  isRecording?: boolean;
}

export function ModernConversationDisplay({
  conversations,
  onPlayAudio,
  isTranslating,
  currentTranscription,
  audioLevel = 0,
  isRecording = false,
}: ModernConversationDisplayProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversations, currentTranscription]);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
  };

  const getLanguageIcon = (language: string) => {
    if (language === 'en') return '🇬🇧';
    if (language === 'es') return '🇪🇸';
    return <Globe className="w-4 h-4" />;
  };

  return (
    <div className="relative h-[500px] glass-panel rounded-3xl p-6 overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="blob absolute -top-20 -left-20 w-80 h-80 opacity-20" />
        <div className="blob absolute -bottom-20 -right-20 w-96 h-96 opacity-15" style={{ animationDelay: '5s' }} />
      </div>

      {/* Messages container */}
      <div
        ref={scrollRef}
        className="relative h-full overflow-y-auto smooth-scroll pr-2 space-y-4"
      >
        {conversations.length === 0 && !currentTranscription && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              {/* Responsive mini visualizer based on live audioLevel */}
              <div className="flex h-10 items-end justify-center gap-1.5">
                {Array.from({ length: 24 }).map((_, idx) => {
                  const multipliers = [
                    0.2, 0.35, 0.5, 0.65, 0.8, 1,
                    0.85, 0.7, 0.55, 0.4, 0.3, 0.25,
                    0.25, 0.3, 0.4, 0.55, 0.7, 0.85,
                    1, 0.8, 0.65, 0.5, 0.35, 0.2,
                  ];
                  const m = multipliers[idx] ?? 0.5;
                  const level = Math.min(1, Math.max(0, audioLevel));
                  const height = 6 + Math.round(level * 32 * m);
                  return (
                    <span
                      key={idx}
                      aria-hidden
                      className="w-1.5 rounded-sm"
                      style={{
                        height: `${height}px`,
                        background:
                          'linear-gradient(180deg, hsl(var(--primary)), hsl(var(--accent)))',
                        opacity: isRecording ? 1 : 0.5,
                        transition: 'height 120ms ease, opacity 200ms ease',
                        boxShadow: isRecording
                          ? '0 0 12px hsla(var(--primary),0.35)'
                          : 'none',
                      }}
                    />
                  );
                })}
              </div>
              <p className="text-gray-400 text-sm">
                Start speaking to begin translation
              </p>
            </div>
          </div>
        )}

        {conversations.map((conv, index) => (
          <div
            key={conv.id}
            className={`flex ${conv.type === 'user' ? 'justify-end' : 'justify-start'}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div
              className={`
                chat-bubble max-w-[80%] group
                ${conv.type === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}
                hover-lift
              `}
            >
              {/* Language and gender indicator */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs opacity-70">
                  {getLanguageIcon(conv.language)}
                </span>
                {conv.voice && (
                  <span className="text-xs opacity-60" title={`Voice: ${conv.voice}`}>
                    🔊
                  </span>
                )}
                <span className="text-xs opacity-50">
                  {formatTime(conv.timestamp)}
                </span>
                {conv.type === 'user' ? (
                  <Mic className="w-3 h-3 opacity-50" />
                ) : (
                  <Globe className="w-3 h-3 opacity-50" />
                )}
              </div>

              {/* Message text */}
              <p className="text-sm leading-relaxed">
                {conv.text}
              </p>

              {/* Audio playback button */}
              {conv.audioUrl && onPlayAudio && (
                <button
                  onClick={() => onPlayAudio(conv.audioUrl!)}
                  className="
                    mt-3 flex items-center gap-2 
                    text-xs opacity-60 hover:opacity-100 
                    transition-opacity duration-200
                    group-hover:scale-105 transform
                  "
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Play audio</span>
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Current transcription */}
        {currentTranscription && (
          <div className="flex justify-end">
            <div className="chat-bubble chat-bubble-user max-w-[80%] opacity-70">
              <div className="flex items-center gap-2 mb-2">
                <Mic className="w-3 h-3 animate-pulse" />
                <span className="text-xs opacity-50">Listening...</span>
              </div>
              <p className="text-sm leading-relaxed">
                {currentTranscription}
              </p>
            </div>
          </div>
        )}

        {/* Translation indicator */}
        {isTranslating && (
          <div className="flex justify-start">
            <div className="chat-bubble chat-bubble-assistant">
              <div className="flex space-x-1">
                <div className="loading-dot" />
                <div className="loading-dot" />
                <div className="loading-dot" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}