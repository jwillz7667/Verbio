"use client";

import { useState, useEffect, useRef } from 'react';
import { useRealtimeTranslation } from '@/hooks/useRealtimeTranslation';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useRealtimeVoiceRealtime } from '@/hooks/useRealtimeVoiceRealtime';
import { ModernConversationDisplay } from '@/components/ModernConversationDisplay';
import { FloatingMic } from '@/components/ui/FloatingMic';
import { TipChips } from '@/components/ui/TipChips';
import { LanguageCard } from '@/components/ui/LanguageCard';
import { InputPill } from '@/components/ui/InputPill';
import { Header } from '@/components/Header';
import { Switch } from '@/components/ui/Switch';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { toast } from 'sonner';
import { Mic, MicOff, Loader2, Square, Play } from 'lucide-react';

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState<'en' | 'es'>('en');
  const [targetLanguage, setTargetLanguage] = useState<'en' | 'es'>('es');
  const [isTranslating, setIsTranslating] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number>(0);
  const [conversationMode, setConversationMode] = useState(true);
  const [autoRecord, setAutoRecord] = useState(false);
  const [conversationActive, setConversationActive] = useState(false);
  const autoRecordTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [voicePreference, setVoicePreference] = useState<'auto' | 'male' | 'female'>('auto');
  const [lowLatencyMode, setLowLatencyMode] = useState(false);
  const [lastVoiceUsed, setLastVoiceUsed] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Array<{
    id: string;
    type: 'user' | 'assistant';
    text: string;
    language: 'en' | 'es';
    timestamp: Date;
    audioUrl?: string;
    voice?: string;
  }]>([]);
  const [textInput, setTextInput] = useState<string>("");
  const [isTextTranslating, setIsTextTranslating] = useState<boolean>(false);

  const {
    disconnect,
    sendAudioData,
    isConnected,
    connectionStatus,
    currentTranscription,
    updateLanguages
  } = useRealtimeTranslation({
    onTranscriptionUpdate: (text) => {
      console.log('Transcription:', text);
    },
    onTranslationComplete: async (translation) => {
      if (translation.voiceUsed) setLastVoiceUsed(translation.voiceUsed);
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
      if (conversationMode && autoRecord && conversationActive) {
        if (autoRecordTimeoutRef.current) clearTimeout(autoRecordTimeoutRef.current);
        autoRecordTimeoutRef.current = setTimeout(async () => {
          if (conversationActive) {
            const success = await startRecording();
            if (success) {
              setIsRecording(true);
              setRecordingStartTime(Date.now());
              toast.info('Listening for response...');
            }
          }
        }, 1500);
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
    maxDurationMs: 60_000,
    onMaxDurationReached: () => {
      setIsRecording(false);
      toast.info('Recording stopped (60s time limit)');
    },
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

  // Low-latency realtime voice (WebRTC)
  const { connect: connectRealtime, disconnect: _disconnectRealtime, isConnected: isRealtimeConnected, isConnecting: isRealtimeConnecting } = useRealtimeVoiceRealtime({
    onError: (e) => toast.error(e.message),
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
      if (lowLatencyMode) {
        if (!isRealtimeConnected && !isRealtimeConnecting) {
          await connectRealtime();
        }
        // WebRTC path streams immediately; visualizer uses mic already
        setIsRecording(true);
        setRecordingStartTime(Date.now());
        toast.success('Realtime listening…');
      } else {
        const success = await startRecording();
        if (success) {
          setIsRecording(true);
          setRecordingStartTime(Date.now());
          toast.success(`Recording in ${sourceLanguage === 'en' ? 'English' : 'Spanish'}`);
        }
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

  const handleTextTranslate = async () => {
    const trimmed = textInput.trim();
    if (!trimmed) return;

    try {
      setIsTextTranslating(true);

      // Append user's typed message
      const userMsgId = crypto.randomUUID();
      setConversations((prev) => [
        ...prev,
        {
          id: userMsgId,
          type: 'user',
          text: trimmed,
          language: sourceLanguage,
          timestamp: new Date(),
        },
      ]);

      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: trimmed,
          sourceLanguage,
          targetLanguage,
        }),
      });

      if (!res.ok) {
        throw new Error(`Translate failed: ${res.statusText}`);
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(data?.error?.message || 'Translation failed');
      }

      const translated = data.data;
      setConversations((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: 'assistant',
          text: translated.text,
          language: translated.language,
          timestamp: new Date(),
          audioUrl: translated.audioUrl,
        },
      ]);

      setTextInput("");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Translation error');
    } finally {
      setIsTextTranslating(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="blob absolute -top-24 -left-24 w-[680px] h-[680px] opacity-20" />
        <div className="blob absolute -bottom-32 -right-32 w-[820px] h-[820px] opacity-15" style={{ animationDelay: '10s' }} />
        <div className="blob absolute top-1/2 left-1/2 w-[720px] h-[720px] opacity-10 -translate-x-1/2 -translate-y-1/2" style={{ animationDelay: '5s' }} />
      </div>

      <Header status={connectionStatus} />

      {/* Main Content */}
      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        {/* Title */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs text-black/60 dark:text-white/60">Say something. I’ll translate it instantly.</p>
        </div>

        {/* Toggles */}
        <div className="mb-6 flex w-full justify-center">
          <div className="glass-panel rounded-2xl p-3 flex w-full max-w-3xl flex-col gap-3">
            <div className="flex flex-wrap items-center justify-center gap-6">
              <Switch checked={conversationMode} onCheckedChange={setConversationMode} label="Conversation Mode (Auto-detect)" />
              {conversationMode && (
                <Switch checked={autoRecord} onCheckedChange={setAutoRecord} label="Auto-continue" />
              )}
              <Switch
                checked={lowLatencyMode}
                onCheckedChange={(v) => setLowLatencyMode(!!v)}
                label="Low-latency (Realtime)"
              />
            </div>

            <div className="flex items-center justify-center gap-2">
              <span className="text-sm font-medium text-black/70 dark:text-white/70">Voice Output:</span>
              <SegmentedControl
                value={voicePreference}
                onChange={(v) => setVoicePreference(v as any)}
                options={[
                  { value: 'auto', label: 'Auto' },
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Language card and text input */}
        <div className="mx-auto max-w-3xl space-y-4">
          <LanguageCard
            source={sourceLanguage}
            target={targetLanguage}
            onSourceChange={(l) => setSourceLanguage(l)}
            onTargetChange={(l) => setTargetLanguage(l)}
            onSwap={swapLanguages}
          />

          <InputPill
            value={textInput}
            onChange={(v) => setTextInput(v.slice(0, 1000))}
            onSubmit={handleTextTranslate}
            onMic={handleRecordingToggle}
            onCamera={() => toast.info('Camera coming soon')}
            onGallery={() => toast.info('Gallery coming soon')}
            loading={isTextTranslating}
          />
          <div className="flex justify-center">
            <TipChips />
          </div>
        </div>

        {/* Conversation Display */}
        <div className="mx-auto mb-6 max-w-3xl">
          <ModernConversationDisplay
            conversations={conversations}
            onPlayAudio={playAudioOutput}
            isTranslating={isTranslating || isTextTranslating}
            currentTranscription={currentTranscription}
            audioLevel={audioLevel}
            isRecording={isRecording}
          />
        </div>

        {/* Recording Controls */}
        <div className="flex flex-col items-center gap-4 pb-24">
          {conversationMode && autoRecord ? (
            // Conversation mode with start/stop buttons
            <div className="flex gap-3">
              {!conversationActive ? (
                <button
                  onClick={startConversation}
                  disabled={!isConnected}
                  className={`
                    relative group
                    w-20 h-20 rounded-full
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
                  <Play className="w-8 h-8 text-white ml-1" />
                  {isConnected && <span className="pulse-ring border-green-400" />}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleRecordingToggle}
                    disabled={!isConnected || isTranslating}
                    className={`
                      relative group
                      w-20 h-20 rounded-full
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
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    ) : isRecording ? (
                      <MicOff className="w-8 h-8 text-white" />
                    ) : (
                      <Mic className="w-8 h-8 text-white" />
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
                      w-20 h-20 rounded-full
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
                    <Square className="w-8 h-8 text-white" />
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
                w-20 h-20 rounded-full
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
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              ) : isRecording ? (
                <MicOff className="w-8 h-8 text-white" />
              ) : (
                <Mic className="w-8 h-8 text-white" />
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
      <FloatingMic recording={isRecording} translating={isTranslating || isTextTranslating} onToggle={handleRecordingToggle} />
    </main>
  );
}
