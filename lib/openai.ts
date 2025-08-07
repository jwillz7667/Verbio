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

export interface TranslationRequest {
  text: string;
  sourceLanguage: 'en' | 'es';
  targetLanguage: 'en' | 'es';
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
}

export interface TranslationResponse {
  translatedText: string;
  audioUrl?: string;
  confidence: number;
  detectedLanguage?: string;
}

export async function translateText({
  text,
  sourceLanguage,
  targetLanguage,
  voice = 'alloy'
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

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const translatedText = completion.choices[0]?.message?.content || '';

    const audioResponse = await openai.audio.speech.create({
      model: 'tts-1',
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
    const audioFile = new File([audioBuffer], 'audio.wav', { type: 'audio/wav' });
    
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
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
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  temperature?: number;
  maxTokens?: number;
  sourceLanguage: 'en' | 'es';
  targetLanguage: 'en' | 'es';
}

export function createRealtimeSessionConfig({
  model = 'gpt-4o-realtime-preview-2024-12-17',
  voice = 'alloy',
  temperature = 0.7,
  maxTokens = 4096,
  sourceLanguage,
  targetLanguage
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
        model: 'whisper-1'
      },
      turn_detection: {
        type: 'server_vad',
        threshold: 0.5,
        prefix_padding_ms: 300,
        silence_duration_ms: 500
      },
      temperature,
      max_response_output_tokens: maxTokens
    }
  };
}

export const OPENAI_REALTIME_URL = 'wss://api.openai.com/v1/realtime';
export const OPENAI_REALTIME_MODEL = 'gpt-4o-realtime-preview-2024-12-17';