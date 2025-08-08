let OpenAI: any;
try {
  OpenAI = require('openai').OpenAI;
} catch (error) {
  console.error('OpenAI module not loaded:', error);
}

const apiKey = process.env.OPENAI_API_KEY;

export const openai = apiKey && OpenAI ? new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: false,
}) : null;

export type VoiceId =
  | 'alloy'
  | 'echo'
  | 'fable'
  | 'onyx'
  | 'nova'
  | 'shimmer'
  | 'verse';

export interface TranslationRequest {
  text: string;
  sourceLanguage: 'en' | 'es';
  targetLanguage: 'en' | 'es';
  voice?: VoiceId;
}

export interface TranslationResponse {
  translatedText: string;
  audioUrl?: string;
  confidence: number;
  detectedLanguage?: string;
}

// Preferred models (as of latest OpenAI guidance)
const MODEL_TEXT_PRIMARY = 'gpt-4o-mini'; // fast, low-latency, high quality
const MODEL_TTS_PRIMARY = 'gpt-4o-mini-tts';
const MODEL_TRANSCRIBE_PRIMARY = 'gpt-4o-mini-transcribe';

export async function translateText({
  text,
  sourceLanguage,
  targetLanguage,
  voice = 'verse',
}: TranslationRequest): Promise<TranslationResponse> {
  if (!openai) {
    throw new Error('OpenAI client not initialized');
  }

  try {
    const systemPrompt = `You are a professional translator. Translate from ${
      sourceLanguage === 'en' ? 'English' : 'Spanish'
    } to ${
      targetLanguage === 'en' ? 'English' : 'Spanish'
    }. Maintain the tone, emotion, and context of the original text. Provide only the translation without any additional commentary.`;

    // Prefer Responses API if available
    let translatedText = '';
    if (openai.responses?.create) {
      const resp = await openai.responses.create({
        model: MODEL_TEXT_PRIMARY,
        input: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
        max_output_tokens: 1000,
      });
      // Responses API returns output in a unified format
      translatedText = resp.output_text || resp?.output?.[0]?.content?.[0]?.text?.value || '';
    } else {
      // Fallback to Chat Completions if Responses API not present
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });
      translatedText = completion.choices[0]?.message?.content || '';
    }

    // Text-to-Speech via the latest TTS model
    const audioResponse = await openai.audio.speech.create({
      model: MODEL_TTS_PRIMARY,
      voice,
      input: translatedText,
      response_format: 'mp3',
    });

    const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
    const audioBase64 = audioBuffer.toString('base64');
    const audioUrl = `data:audio/mp3;base64,${audioBase64}`;

    return {
      translatedText,
      audioUrl,
      confidence: 0.95,
      detectedLanguage: sourceLanguage,
    };
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error('Failed to translate text');
  }
}

export async function transcribeAudio(audioBuffer: Buffer, language?: string): Promise<string> {
  if (!openai) {
    throw new Error('OpenAI client not initialized');
  }

  try {
    // Convert Buffer to Uint8Array for proper Blob creation
    const uint8Array = new Uint8Array(
      (audioBuffer.buffer as ArrayBuffer),
      audioBuffer.byteOffset,
      audioBuffer.byteLength
    );
    const audioFile = new File([uint8Array], 'audio.wav', { type: 'audio/wav' });

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: MODEL_TRANSCRIBE_PRIMARY,
      language: language || 'en',
      response_format: 'text',
    });

    return transcription;
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Failed to transcribe audio');
  }
}

export interface RealtimeSessionConfig {
  model?: string;
  voice?: VoiceId;
  temperature?: number;
  maxTokens?: number;
  sourceLanguage: 'en' | 'es';
  targetLanguage: 'en' | 'es';
}

export function createRealtimeSessionConfig({
  model = 'gpt-4o-realtime-preview-2024-12-17',
  voice = 'verse',
  temperature = 0.7,
  maxTokens = 4096,
  sourceLanguage,
  targetLanguage,
}: RealtimeSessionConfig) {
  return {
    type: 'session.update',
    session: {
      model,
      modalities: ['text', 'audio'],
      instructions: `You are a professional translator between ${
        sourceLanguage === 'en' ? 'English' : 'Spanish'
      } and ${
        targetLanguage === 'en' ? 'English' : 'Spanish'
      }. Translate spoken audio maintaining the tone and emotion of the original speech. Provide natural, fluent translations.`,
      voice,
      input_audio_format: 'pcm16',
      output_audio_format: 'pcm16',
      input_audio_transcription: {
        model: MODEL_TRANSCRIBE_PRIMARY,
      },
      turn_detection: {
        type: 'server_vad',
        threshold: 0.5,
        prefix_padding_ms: 300,
        silence_duration_ms: 500,
      },
      temperature,
      max_response_output_tokens: maxTokens,
    },
  };
}

export const OPENAI_REALTIME_URL = 'wss://api.openai.com/v1/realtime';
export const OPENAI_REALTIME_MODEL = 'gpt-4o-realtime-preview-2024-12-17';