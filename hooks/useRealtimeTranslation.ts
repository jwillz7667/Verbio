import { useState, useEffect, useRef, useCallback } from 'react';

interface TranslationResult {
  text: string;
  language: string;
  audioUrl?: string;
  audioBase64?: string;
  confidence?: number;
  voiceGender?: 'male' | 'female' | 'neutral';
  voiceUsed?: string;
}

interface UseRealtimeTranslationProps {
  onTranscriptionUpdate?: (text: string) => void;
  onTranslationComplete?: (translation: TranslationResult) => void;
  onError?: (error: Error) => void;
}

export function useRealtimeTranslation({
  onTranscriptionUpdate,
  onTranslationComplete,
  onError
}: UseRealtimeTranslationProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [currentTranscription, setCurrentTranscription] = useState('');
  const [finalTranslation, setFinalTranslation] = useState<TranslationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionConfigRef = useRef({
    sourceLanguage: 'en',
    targetLanguage: 'es'
  });

  // Initialize AudioContext
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 24000 // OpenAI expects 24kHz
    });
    
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  const checkConnection = useCallback(async () => {
    try {
      console.log('Checking connection...');
      const response = await fetch('/api/realtime');
      const data = await response.json();
      console.log('Connection check response:', data);
      
      if (data.hasApiKey) {
        setIsConnected(true);
        setConnectionStatus('connected');
        console.log('Connected successfully');
      } else {
        setConnectionStatus('error');
        onError?.(new Error('API key not configured'));
      }
    } catch (error) {
      console.error('Connection check failed:', error);
      setConnectionStatus('error');
      onError?.(error as Error);
    }
  }, [onError]);

  // Check API connection on mount
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const connect = useCallback(async (_apiKey: string, sourceLanguage: 'en' | 'es', targetLanguage: 'en' | 'es') => {
    sessionConfigRef.current = { sourceLanguage, targetLanguage };
    setConnectionStatus('connecting');
    
    // Check connection status
    await checkConnection();
  }, [checkConnection]);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  const sendAudioData = useCallback(async (audioData: ArrayBuffer, voicePreference: 'auto' | 'male' | 'female' = 'auto') => {
    if (!isConnected || isProcessing) {
      console.log('Not connected or already processing');
      return;
    }

    setIsProcessing(true);
    console.log('Processing audio data, size:', audioData.byteLength);
    
    try {
      // Convert ArrayBuffer to base64
      const uint8Array = new Uint8Array(audioData);
      let binary = '';
      const chunkSize = 8192; // Process in chunks to avoid stack overflow
      
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, Math.min(i + chunkSize, uint8Array.length));
        binary += String.fromCharCode.apply(null, Array.from(chunk));
      }
      
      const base64Audio = btoa(binary);
      console.log('Base64 audio length:', base64Audio.length);
      
      const response = await fetch('/api/realtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio: base64Audio,
          autoDetectLanguage: true, // Enable automatic language detection
          preferredVoiceGender: voicePreference,
        }),
      });

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log(`Detected: ${data.detectedLanguage}, Voice: ${data.voiceUsed} (${data.voiceGender}), Translated to: ${data.targetLanguage}`);
        
        // Update transcription
        setCurrentTranscription(data.transcription);
        onTranscriptionUpdate?.(data.transcription);
        
        // Update translation with voice info
        const result: TranslationResult = {
          text: data.translation,
          language: data.targetLanguage,
          audioBase64: data.audio,
          voiceGender: data.voiceGender,
          voiceUsed: data.voiceUsed,
        };
        
        setFinalTranslation(result);
        onTranslationComplete?.(result);
        
        // Play audio if available - with higher volume for clarity
        if (data.audio) {
          await playAudioFromBase64(data.audio);
        }
      } else {
        throw new Error(data.error || 'Translation failed');
      }
    } catch (error) {
      console.error('Error sending audio:', error);
      onError?.(error as Error);
      setConnectionStatus('error');
    } finally {
      setIsProcessing(false);
    }
  }, [isConnected, isProcessing, onTranscriptionUpdate, onTranslationComplete, onError]);

  const playAudioFromBase64 = useCallback(async (base64Audio: string) => {
    if (!audioContextRef.current) return;
    
    try {
      // Resume audio context if suspended (for autoplay policies)
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      // Convert base64 to ArrayBuffer
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Decode audio data
      const audioBuffer = await audioContextRef.current.decodeAudioData(bytes.buffer);
      
      // Create gain node for volume control
      const gainNode = audioContextRef.current.createGain();
      gainNode.gain.value = 1.2; // Increase volume by 20% for clarity (reduced from 50% for more natural sound)
      
      // Create compressor for more natural dynamics
      const compressor = audioContextRef.current.createDynamicsCompressor();
      compressor.threshold.value = -24;
      compressor.knee.value = 30;
      compressor.ratio.value = 12;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;
      
      // Create and play audio source with audio processing chain
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(gainNode);
      gainNode.connect(compressor);
      compressor.connect(audioContextRef.current.destination);
      
      // Add completion callback for continuous mode
      source.onended = () => {
        console.log('Audio playback completed');
        // Could trigger next recording here for continuous mode
      };
      
      source.start();
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }, []);

  const updateLanguages = useCallback((sourceLanguage: 'en' | 'es', targetLanguage: 'en' | 'es') => {
    sessionConfigRef.current = { sourceLanguage, targetLanguage };
  }, []);

  const playAudioDelta = useCallback(async (_audioDelta: string) => {
    // This function is kept for compatibility but won't be used with the standard API
    console.log('Audio delta playback not supported in standard API mode');
  }, []);

  const processQueuedAudio = useCallback(async () => {
    // This function is kept for compatibility but won't be used with the standard API
    console.log('Audio queue processing not supported in standard API mode');
  }, []);

  const clearTranscription = useCallback(() => {
    setCurrentTranscription('');
    setFinalTranslation(null);
  }, []);

  return {
    isConnected,
    connectionStatus,
    currentTranscription,
    finalTranslation,
    isProcessing,
    connect,
    disconnect,
    sendAudioData,
    updateLanguages,
    playAudioDelta,
    processQueuedAudio,
    clearTranscription,
  };
}