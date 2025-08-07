'use client';

import { useState, useEffect, useRef } from 'react';
import { useRealtimeTranslation } from '@/hooks/useRealtimeTranslation';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { ModernConversationDisplay } from '@/components/ModernConversationDisplay';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { VoiceVisualizer } from '@/components/VoiceVisualizer';
import { toast } from 'sonner';
import { Mic, MicOff, Volume2, Loader2, Square, Play } from 'lucide-react';

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState<'en' | 'es'>('en');
  const [targetLanguage, setTargetLanguage] = useState<'en' | 'es'>('es');
  const [isTranslating, setIsTranslating] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number>(0);
  const [conversationMode, setConversationMode] = useState(true); // Enable conversation mode by default
  const [autoRecord, setAutoRecord] = useState(false); // Auto-record after translation
  const [conversationActive, setConversationActive] = useState(false); // Track if conversation is active
  const autoRecordTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [voicePreference, setVoicePreference] = useState<'auto' | 'male' | 'female'>('auto');
  const [lastVoiceUsed, setLastVoiceUsed] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Array<{
    id: string;
    type: 'user' | 'assistant';
    text: string;
    language: 'en' | 'es';
    timestamp: Date;
    audioUrl?: string;
    voice?: string;
  }>>([]);

  const {
    disconnect,
    sendAudioData,
    isConnected,
    connectionStatus,
    currentTranscription,
    updateLanguages
  } = useRealtimeTranslation({
    onTranscriptionUpdate: (text) => {
      // Live transcription updates
      console.log('Transcription:', text);
    },
    onTranslationComplete: async (translation) => {
      // Update voice used
      if (translation.voiceUsed) {
        setLastVoiceUsed(translation.voiceUsed);
      }
      
      // Add translation to conversation with gender/voice info
      setConversations(prev => [...prev, {
        id: crypto.randomUUID(),
        type: 'assistant',
        text: translation.text,
        language: translation.language as 'en' | 'es',
        timestamp: new Date(),
        audioUrl: translation.audioUrl,
        voice: translation.voiceUsed
      }]);
      setIsTranslating(false);
      
      // In conversation mode, automatically start recording again after a short delay
      if (conversationMode && autoRecord && conversationActive) {
        // Clear any existing timeout
        if (autoRecordTimeoutRef.current) {
          clearTimeout(autoRecordTimeoutRef.current);
        }
        
        autoRecordTimeoutRef.current = setTimeout(async () => {
          if (conversationActive) { // Double-check still active
            console.log('Auto-starting next recording for conversation mode');
            const success = await startRecording();
            if (success) {
              setIsRecording(true);
              setRecordingStartTime(Date.now());
              toast.info('Listening for response...');
            }
          }
        }, 1500); // Wait 1.5 seconds after audio playback
      }
    },
    onError: (error) => {
      toast.error(error.message);
      setIsTranslating(false);
      setIsRecording(false);
    }
  });

  const {
    startRecording,
    stopRecording,
    audioLevel,
    isSupported
  } = useAudioRecorder({
    onAudioData: (audioData) => {
      // Don't send chunks during recording, wait for complete audio
      console.log('Receiving audio chunk, size:', audioData.length);
    },
    onRecordingComplete: async (audioBlob) => {
      console.log('Recording complete, blob size:', audioBlob.size);
      
      // Check minimum recording duration (0.5 seconds)
      const recordingDuration = (Date.now() - recordingStartTime) / 1000;
      console.log('Recording duration:', recordingDuration, 'seconds');
      
      if (recordingDuration < 0.5) {
        toast.error('Recording too short. Please speak for at least 0.5 seconds.');
        return;
      }
      
      setIsTranslating(true);
      
      // Convert blob to ArrayBuffer and send to API
      try {
        const arrayBuffer = await audioBlob.arrayBuffer();
        console.log('Sending audio to API, size:', arrayBuffer.byteLength);
        
        // Add user's speech to conversation first
        const conversationId = crypto.randomUUID();
        setConversations(prev => [...prev, {
          id: conversationId,
          type: 'user',
          text: 'Processing...',
          language: 'auto' as any, // Will be updated when detected
          timestamp: new Date(),
          audioUrl: URL.createObjectURL(audioBlob)
        }]);
        
        // Send audio for translation with voice preference
        if (isConnected) {
          await sendAudioData(arrayBuffer, voicePreference);
        }
      } catch (error) {
        console.error('Error processing audio:', error);
        setIsTranslating(false);
      }
    }
  });

  // Initialize connection on mount
  useEffect(() => {
    // Connection is handled automatically in the hook
    // Just update languages when they change
    updateLanguages(sourceLanguage, targetLanguage);
    
    return () => {
      // Cleanup on unmount
      if (autoRecordTimeoutRef.current) {
        clearTimeout(autoRecordTimeoutRef.current);
      }
      disconnect();
    };
  }, [disconnect, sourceLanguage, targetLanguage, updateLanguages]);

  // Update languages in realtime session
  useEffect(() => {
    if (isConnected) {
      // Update session configuration when languages change
      updateLanguages(sourceLanguage, targetLanguage);
    }
  }, [sourceLanguage, targetLanguage, isConnected, updateLanguages]);

  const handleRecordingToggle = async () => {
    if (!isSupported) {
      toast.error('Your browser does not support audio recording');
      return;
    }

    if (!isConnected) {
      toast.error('Connecting to translation service...');
      return;
    }

    if (isRecording) {
      await stopRecording();
      setIsRecording(false);
    } else {
      const success = await startRecording();
      if (success) {
        setIsRecording(true);
        setRecordingStartTime(Date.now());
        toast.success(`Recording in ${sourceLanguage === 'en' ? 'English' : 'Spanish'}`);
      }
    }
  };

  const swapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
  };

  const startConversation = async () => {
    setConversationActive(true);
    const success = await startRecording();
    if (success) {
      setIsRecording(true);
      setRecordingStartTime(Date.now());
      toast.success('Conversation started - speak in any language');
    }
  };

  const stopConversation = async () => {
    setConversationActive(false);
    
    // Clear any pending auto-record timeout
    if (autoRecordTimeoutRef.current) {
      clearTimeout(autoRecordTimeoutRef.current);
      autoRecordTimeoutRef.current = null;
    }
    
    // Stop recording if active
    if (isRecording) {
      await stopRecording();
      setIsRecording(false);
    }
    
    toast.info('Conversation stopped');
  };

  const playAudioOutput = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play().catch(error => {
      toast.error('Failed to play audio');
      console.error('Audio playback error:', error);
    });
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="blob absolute top-0 left-0 w-[600px] h-[600px] opacity-20" />
        <div className="blob absolute bottom-0 right-0 w-[800px] h-[800px] opacity-15" style={{ animationDelay: '10s' }} />
        <div className="blob absolute top-1/2 left-1/2 w-[700px] h-[700px] opacity-10" style={{ animationDelay: '5s' }} />
      </div>

      {/* Header */}
      <header className="glass-panel sticky top-0 z-50 border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-border-animated rounded-xl flex items-center justify-center floating">
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Volume2 className="w-6 h-6 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold glow-text">
                Verbio
              </h1>
            </div>
            <ConnectionStatus status={connectionStatus} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Conversation Mode Toggle */}
        <div className="mb-6 flex justify-center">
          <div className="glass-panel rounded-2xl p-4 flex flex-col gap-4">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={conversationMode}
                  onChange={(e) => setConversationMode(e.target.checked)}
                  className="w-5 h-5 text-purple-500 rounded-lg focus:ring-purple-400 focus:ring-2 bg-transparent border-white/30"
                />
                <span className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">
                  Conversation Mode (Auto-detect)
                </span>
              </label>
              {conversationMode && (
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={autoRecord}
                    onChange={(e) => setAutoRecord(e.target.checked)}
                    className="w-5 h-5 text-purple-500 rounded-lg focus:ring-purple-400 focus:ring-2 bg-transparent border-white/30"
                  />
                  <span className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">
                    Auto-continue
                  </span>
                </label>
              )}
            </div>
            
            {/* Voice Preference Selector */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-white/70">Voice Output:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setVoicePreference('auto')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    voicePreference === 'auto' 
                      ? 'bg-purple-500/30 text-purple-300 border border-purple-400/50' 
                      : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  Auto
                </button>
                <button
                  onClick={() => setVoicePreference('male')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    voicePreference === 'male' 
                      ? 'bg-blue-500/30 text-blue-300 border border-blue-400/50' 
                      : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  👨 Male
                </button>
                <button
                  onClick={() => setVoicePreference('female')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    voicePreference === 'female' 
                      ? 'bg-pink-500/30 text-pink-300 border border-pink-400/50' 
                      : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  👩 Female
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Language Selector - Hide in conversation mode */}
        {!conversationMode && (
          <div className="mb-8">
            <LanguageSelector
              sourceLanguage={sourceLanguage}
              targetLanguage={targetLanguage}
              onSourceChange={setSourceLanguage}
              onTargetChange={setTargetLanguage}
              onSwap={swapLanguages}
            />
          </div>
        )}

        {/* Conversation Display */}
        <div className="mb-8">
          <ModernConversationDisplay
            conversations={conversations}
            onPlayAudio={playAudioOutput}
            isTranslating={isTranslating}
            currentTranscription={currentTranscription}
          />
        </div>

        {/* Voice Visualizer */}
        {isRecording && (
          <div className="mb-8 glass-panel rounded-2xl p-4 hover-lift">
            <VoiceVisualizer 
              audioLevel={audioLevel}
              isActive={isRecording}
            />
          </div>
        )}

        {/* Recording Controls */}
        <div className="flex flex-col items-center gap-6">
          {conversationMode && autoRecord ? (
            // Conversation mode with start/stop buttons
            <div className="flex gap-4">
              {!conversationActive ? (
                <button
                  onClick={startConversation}
                  disabled={!isConnected}
                  className={`
                    relative group
                    w-24 h-24 rounded-full
                    flex items-center justify-center
                    transition-all duration-300 transform
                    btn-glow
                    ${!isConnected ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
                  `}
                  style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
                    boxShadow: '0 0 40px rgba(34, 197, 94, 0.4)'
                  }}
                >
                  <Play className="w-10 h-10 text-white ml-1" />
                  {isConnected && <span className="pulse-ring border-green-400" />}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleRecordingToggle}
                    disabled={!isConnected || isTranslating}
                    className={`
                      relative group
                      w-24 h-24 rounded-full
                      flex items-center justify-center
                      transition-all duration-300 transform
                      ${isRecording ? 'neu-pressed' : 'neu-flat'}
                      ${(!isConnected || isTranslating) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
                    `}
                    style={{
                      background: isRecording 
                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                        : 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                      boxShadow: isRecording
                        ? '0 0 60px rgba(239, 68, 68, 0.6), inset 0 0 20px rgba(0,0,0,0.2)'
                        : '0 0 40px rgba(139, 92, 246, 0.4)'
                    }}
                  >
                    {isTranslating ? (
                      <Loader2 className="w-10 h-10 text-white animate-spin" />
                    ) : isRecording ? (
                      <MicOff className="w-10 h-10 text-white" />
                    ) : (
                      <Mic className="w-10 h-10 text-white" />
                    )}
                    
                    {/* Ripple effect when recording */}
                    {isRecording && (
                      <>
                        <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
                        <span className="absolute inset-0 rounded-full bg-red-500 animate-ping animation-delay-200 opacity-50" />
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={stopConversation}
                    className="
                      relative group
                      w-24 h-24 rounded-full
                      flex items-center justify-center
                      transition-all duration-300 transform
                      neu-flat
                      hover:scale-105 active:scale-95
                    "
                    style={{
                      background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                      boxShadow: '0 0 40px rgba(107, 114, 128, 0.4)'
                    }}
                  >
                    <Square className="w-10 h-10 text-white" />
                    <span className="pulse-ring border-gray-400" />
                  </button>
                </>
              )}
            </div>
          ) : (
            // Regular recording button
            <button
              onClick={handleRecordingToggle}
              disabled={!isConnected || isTranslating}
              className={`
                relative group
                w-24 h-24 rounded-full
                flex items-center justify-center
                transition-all duration-300 transform
                ${isRecording ? 'neu-pressed' : 'neu-flat'}
                ${(!isConnected || isTranslating) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
              `}
              style={{
                background: isRecording 
                  ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                  : 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                boxShadow: isRecording
                  ? '0 0 60px rgba(239, 68, 68, 0.6), inset 0 0 20px rgba(0,0,0,0.2)'
                  : '0 0 40px rgba(139, 92, 246, 0.4)'
              }}
            >
              {isTranslating ? (
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              ) : isRecording ? (
                <MicOff className="w-10 h-10 text-white" />
              ) : (
                <Mic className="w-10 h-10 text-white" />
              )}
              
              {/* Ripple effect when recording */}
              {isRecording && (
                <>
                  <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
                  <span className="absolute inset-0 rounded-full bg-red-500 animate-ping animation-delay-200 opacity-50" />
                </>
              )}
            </button>
          )}

          <div className="text-center">
            <p className="text-lg font-medium glow-text">
              {conversationActive ? (
                isRecording 
                  ? 'Listening... (Speak in any language)'
                  : isTranslating
                  ? 'Translating...'
                  : 'Tap mic to speak or stop to end'
              ) : (
                isRecording 
                  ? conversationMode 
                    ? 'Listening... (Speak in any language)'
                    : `Recording in ${sourceLanguage === 'en' ? 'English' : 'Spanish'}...`
                  : isTranslating
                  ? 'Translating...'
                  : conversationMode && autoRecord
                  ? 'Tap play to start conversation'
                  : conversationMode
                  ? 'Tap to start conversation'
                  : 'Tap to start recording'
              )}
            </p>
            {!isConnected && (
              <p className="text-sm text-amber-400 mt-2 animate-pulse">
                Connecting to translation service...
              </p>
            )}
            {conversationMode && (
              <>
                <p className="text-xs text-white/50 mt-2">
                  Automatic language detection enabled • Translates everything
                </p>
                {lastVoiceUsed && (
                  <p className="text-xs text-white/40 mt-1">
                    Using {lastVoiceUsed} voice
                  </p>
                )}
              </>
            )}
          </div>

          {/* Quick Tips */}
          <div className="text-center text-sm text-white/40 glass-panel rounded-xl p-3 mt-4">
            <p>Speak clearly and naturally for best results</p>
            <p className="mt-1">Press <kbd className="px-2 py-1 bg-white/10 rounded border border-white/20">Space</kbd> to toggle recording</p>
          </div>
        </div>
      </div>
    </main>
  );
}