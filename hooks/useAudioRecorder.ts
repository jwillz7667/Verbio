import { useState, useRef, useCallback, useEffect } from 'react';

interface UseAudioRecorderProps {
  onAudioData?: (audioData: Uint8Array) => void;
  onRecordingComplete?: (audioBlob: Blob) => void;
  sampleRate?: number;
  chunkSize?: number;
}

export function useAudioRecorder({
  onAudioData,
  onRecordingComplete,
  sampleRate = 24000, // OpenAI Realtime API expects 24kHz
  chunkSize = 4096
}: UseAudioRecorderProps = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSupported, setIsSupported] = useState(true);
  
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioChunksRef = useRef<Uint8Array[]>([]);
  const animationFrameRef = useRef<number>();
  const isRecordingRef = useRef(false);

  // Check browser support
  useEffect(() => {
    const supported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    setIsSupported(supported);
    
    if (!supported) {
      console.error('getUserMedia is not supported in this browser');
    }
  }, []);

  // Initialize audio context
  const initializeAudio = useCallback(async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: sampleRate,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      mediaStreamRef.current = stream;
      
      // Create audio context with specific sample rate
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: sampleRate
      });
      
      // Create audio nodes
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      processorRef.current = audioContextRef.current.createScriptProcessor(chunkSize, 1, 1);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      // Connect nodes
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);
      
      // Process audio data
      let processCount = 0;
      processorRef.current.onaudioprocess = (event) => {
        // Check the recording ref to avoid stale closure
        if (!isRecordingRef.current) {
          return;
        }
        
        const inputData = event.inputBuffer.getChannelData(0);
        const pcm16Data = float32ToPcm16(inputData);
        
        // Log first few chunks for debugging
        if (processCount < 3) {
          console.log(`Audio chunk ${processCount}: size=${pcm16Data.length}, recording=${isRecordingRef.current}`);
          processCount++;
        }
        
        // Store chunk for final blob
        audioChunksRef.current.push(pcm16Data);
        
        // Send chunk for real-time processing
        onAudioData?.(pcm16Data);
      };
      
      return true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      if ((error as any).name === 'NotAllowedError') {
        throw new Error('Microphone access denied. Please allow microphone access and try again.');
      } else if ((error as any).name === 'NotFoundError') {
        throw new Error('No microphone found. Please connect a microphone and try again.');
      }
      throw error;
    }
  }, [sampleRate, chunkSize, onAudioData]);

  // Convert Float32 audio to PCM16 (required by OpenAI)
  const float32ToPcm16 = useCallback((float32Array: Float32Array): Uint8Array => {
    const pcm16 = new Int16Array(float32Array.length);
    
    for (let i = 0; i < float32Array.length; i++) {
      // Clamp values to -1 to 1 range
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      // Convert to 16-bit PCM
      pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    
    // Convert to Uint8Array
    return new Uint8Array(pcm16.buffer);
  }, []);

  // Monitor audio levels for visualization
  const monitorAudioLevel = useCallback(() => {
    if (!analyserRef.current || !isRecording) {
      setAudioLevel(0);
      return;
    }
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Calculate average volume
    const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
    setAudioLevel(average / 255); // Normalize to 0-1
    
    animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);
  }, [isRecording]);

  // Start recording
  const startRecording = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      throw new Error('Audio recording is not supported');
    }
    
    try {
      // Initialize audio if not already done
      if (!audioContextRef.current) {
        await initializeAudio();
      }
      
      // Resume audio context if suspended
      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      // Clear previous chunks
      audioChunksRef.current = [];
      
      // Start recording
      setIsRecording(true);
      isRecordingRef.current = true;
      
      // Start monitoring audio levels
      monitorAudioLevel();
      
      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsRecording(false);
      throw error;
    }
  }, [isSupported, initializeAudio, monitorAudioLevel]);

  // Stop recording
  const stopRecording = useCallback(async (): Promise<Blob> => {
    setIsRecording(false);
    isRecordingRef.current = false;
    
    // Stop monitoring audio levels
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setAudioLevel(0);
    
    // Log audio chunks info
    console.log('Audio chunks collected:', audioChunksRef.current.length);
    console.log('Chunk sizes:', audioChunksRef.current.map(c => c.length));
    
    // Combine all audio chunks
    const totalLength = audioChunksRef.current.reduce((acc, chunk) => acc + chunk.length, 0);
    console.log('Total audio data length:', totalLength);
    const combinedAudio = new Uint8Array(totalLength);
    let offset = 0;
    
    for (const chunk of audioChunksRef.current) {
      combinedAudio.set(chunk, offset);
      offset += chunk.length;
    }
    
    // Create WAV blob
    const wavBlob = createWavBlob(combinedAudio, sampleRate);
    
    // Notify completion
    onRecordingComplete?.(wavBlob);
    
    return wavBlob;
  }, [sampleRate, onRecordingComplete]);

  // Create WAV file from PCM data
  const createWavBlob = useCallback((pcmData: Uint8Array, sampleRate: number): Blob => {
    const length = pcmData.length;
    const arrayBuffer = new ArrayBuffer(44 + length);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); // Byte rate
    view.setUint16(32, 2, true); // Block align
    view.setUint16(34, 16, true); // Bits per sample
    writeString(36, 'data');
    view.setUint32(40, length, true);
    
    // Copy PCM data
    const uint8View = new Uint8Array(arrayBuffer, 44);
    uint8View.set(pcmData);
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (processorRef.current) {
        processorRef.current.disconnect();
      }
      
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    isRecording,
    startRecording,
    stopRecording,
    audioLevel,
    isSupported
  };
}