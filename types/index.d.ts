export interface User {
  id: string;
  email?: string;
  name?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  type: 'user' | 'assistant';
  text: string;
  language: LanguageCode;
  timestamp: Date;
  audioUrl?: string;
  duration?: number;
  confidence?: number;
}

export interface TranslationSession {
  id: string;
  userId?: string;
  sourceLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  conversations: Conversation[];
  createdAt: Date;
  updatedAt: Date;
}

export type LanguageCode = 'en' | 'es';

export type VoiceId = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

export interface AudioChunk {
  data: ArrayBuffer;
  timestamp: number;
  duration: number;
}

export interface RealtimeMessage {
  type: string;
  [key: string]: any;
}

export interface SessionConfig {
  model: string;
  modalities: string[];
  instructions: string;
  voice: VoiceId;
  input_audio_format: string;
  output_audio_format: string;
  input_audio_transcription: {
    model: string;
  };
  turn_detection: {
    type: string;
    threshold: number;
    prefix_padding_ms: number;
    silence_duration_ms: number;
  };
  temperature: number;
  max_response_output_tokens: number;
}

export interface TranslationResult {
  text: string;
  language: LanguageCode;
  audioUrl?: string;
  confidence?: number;
  detectedLanguage?: LanguageCode;
}

export interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioLevel: number;
  error?: string;
}

export interface ConnectionState {
  status: 'disconnected' | 'connecting' | 'connected' | 'error' | 'reconnecting';
  error?: string;
  sessionId?: string;
  lastConnected?: Date;
}

export interface UserPreferences {
  defaultSourceLanguage: LanguageCode;
  defaultTargetLanguage: LanguageCode;
  preferredVoice: VoiceId;
  autoPlayTranslation: boolean;
  saveHistory: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  services: {
    openai: boolean;
    database?: boolean;
    redis?: boolean;
  };
}

export interface MetricsData {
  totalTranslations: number;
  averageResponseTime: number;
  activeUsers: number;
  errorRate: number;
  timestamp: Date;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
}

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}