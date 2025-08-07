export const APP_CONFIG = {
  name: 'Verbio',
  description: 'Real-time voice translation platform',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://verbio.app',
  version: '1.0.0',
} as const;

export const LANGUAGES = {
  en: { code: 'en', name: 'English', flag: '🇬🇧', nativeName: 'English' },
  es: { code: 'es', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
} as const;

export type LanguageCode = keyof typeof LANGUAGES;

export const VOICES = {
  alloy: { id: 'alloy', name: 'Alloy', gender: 'neutral' },
  echo: { id: 'echo', name: 'Echo', gender: 'male' },
  fable: { id: 'fable', name: 'Fable', gender: 'neutral' },
  onyx: { id: 'onyx', name: 'Onyx', gender: 'male' },
  nova: { id: 'nova', name: 'Nova', gender: 'female' },
  shimmer: { id: 'shimmer', name: 'Shimmer', gender: 'female' },
} as const;

export type VoiceId = keyof typeof VOICES;

export const AUDIO_CONFIG = {
  sampleRate: 24000,
  channels: 1,
  format: 'pcm16',
  bufferSize: 4096,
  chunkSize: 1024,
} as const;

export const REALTIME_CONFIG = {
  model: 'gpt-4o-realtime-preview-2024-12-17',
  temperature: 0.7,
  maxTokens: 4096,
  vadThreshold: 0.5,
  vadPrefixPaddingMs: 300,
  vadSilenceDurationMs: 500,
} as const;

export const RATE_LIMIT = {
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
} as const;

export const CONNECTION_STATUS = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error',
  RECONNECTING: 'reconnecting',
} as const;

export type ConnectionStatus = typeof CONNECTION_STATUS[keyof typeof CONNECTION_STATUS];

export const ERROR_MESSAGES = {
  MICROPHONE_PERMISSION: 'Please grant microphone permission to use voice translation',
  MICROPHONE_NOT_FOUND: 'No microphone found. Please connect a microphone and try again',
  BROWSER_NOT_SUPPORTED: 'Your browser does not support audio recording',
  CONNECTION_FAILED: 'Failed to connect to translation service',
  TRANSLATION_FAILED: 'Translation failed. Please try again',
  API_KEY_MISSING: 'OpenAI API key not configured',
  NETWORK_ERROR: 'Network error. Please check your connection',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait a moment',
  SESSION_EXPIRED: 'Session expired. Please refresh the page',
} as const;

export const KEYBOARD_SHORTCUTS = {
  TOGGLE_RECORDING: ' ',
  SWAP_LANGUAGES: 's',
  CLEAR_CONVERSATION: 'c',
  CANCEL_RECORDING: 'Escape',
} as const;

export const ANALYTICS_EVENTS = {
  RECORDING_STARTED: 'recording_started',
  RECORDING_STOPPED: 'recording_stopped',
  TRANSLATION_COMPLETED: 'translation_completed',
  TRANSLATION_FAILED: 'translation_failed',
  LANGUAGE_CHANGED: 'language_changed',
  VOICE_CHANGED: 'voice_changed',
  AUDIO_PLAYED: 'audio_played',
  CONNECTION_ESTABLISHED: 'connection_established',
  CONNECTION_LOST: 'connection_lost',
} as const;

export const STORAGE_KEYS = {
  SOURCE_LANGUAGE: 'verbio_source_language',
  TARGET_LANGUAGE: 'verbio_target_language',
  SELECTED_VOICE: 'verbio_selected_voice',
  CONVERSATION_HISTORY: 'verbio_conversation_history',
  USER_PREFERENCES: 'verbio_user_preferences',
} as const;

export const API_ROUTES = {
  REALTIME: '/api/realtime',
  TRANSLATE: '/api/translate',
  HEALTH: '/api/health',
  METRICS: '/api/metrics',
} as const;

export const WEBSOCKET_EVENTS = {
  SESSION_UPDATE: 'session.update',
  SESSION_CREATED: 'session.created',
  SESSION_UPDATED: 'session.updated',
  INPUT_AUDIO_BUFFER_APPEND: 'input_audio_buffer.append',
  INPUT_AUDIO_BUFFER_COMMIT: 'input_audio_buffer.commit',
  INPUT_AUDIO_BUFFER_CLEAR: 'input_audio_buffer.clear',
  INPUT_AUDIO_BUFFER_SPEECH_STARTED: 'input_audio_buffer.speech_started',
  INPUT_AUDIO_BUFFER_SPEECH_STOPPED: 'input_audio_buffer.speech_stopped',
  CONVERSATION_ITEM_CREATED: 'conversation.item.created',
  RESPONSE_CREATE: 'response.create',
  RESPONSE_DONE: 'response.done',
  RESPONSE_AUDIO_DELTA: 'response.audio.delta',
  RESPONSE_AUDIO_DONE: 'response.audio.done',
  RESPONSE_TEXT_DELTA: 'response.text.delta',
  RESPONSE_TEXT_DONE: 'response.text.done',
  ERROR: 'error',
} as const;

export const MAX_RECORDING_DURATION = 300000;
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const RECONNECT_DELAY = 3000;
export const HEARTBEAT_INTERVAL = 30000;