// components/ConversationDisplay.tsx
import { Volume2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface Conversation {
  id: string;
  type: 'user' | 'assistant';
  text: string;
  language: 'en' | 'es';
  timestamp: Date;
  audioUrl?: string;
}

interface ConversationDisplayProps {
  conversations: Conversation[];
  onPlayAudio: (audioUrl: string) => void;
  isTranslating: boolean;
  currentTranscription?: string;
}

export function ConversationDisplay({
  conversations,
  onPlayAudio,
  isTranslating,
  currentTranscription
}: ConversationDisplayProps) {
  if (conversations.length === 0 && !isTranslating) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
        <div className="text-6xl mb-4">🎙️</div>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Ready to Translate
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Click the microphone button and start speaking
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 max-h-[500px] overflow-y-auto">
      <div className="space-y-4">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={`flex ${conv.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl p-4 ${
                conv.type === 'user'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="text-xs opacity-75 mb-1">
                    {conv.language === 'en' ? '🇬🇧 English' : '🇪🇸 Spanish'}
                  </div>
                  <p className="text-sm leading-relaxed">{conv.text}</p>
                  <div className="text-xs opacity-60 mt-2">
                    {format(conv.timestamp, 'HH:mm:ss')}
                  </div>
                </div>
                {conv.audioUrl && (
                  <button
                    onClick={() => onPlayAudio(conv.audioUrl!)}
                    className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                    aria-label="Play audio"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {(isTranslating || currentTranscription) && (
          <div className="flex justify-end">
            <div className="max-w-[70%] rounded-2xl p-4 bg-indigo-500/20 border-2 border-indigo-500/40">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <p className="text-sm text-indigo-600">
                  {currentTranscription || 'Processing...'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}