import { toLangCode } from '@/lib/i18n/languages';

export interface TranslateTextParams {
  text: string;
  fromLanguage: string; // human name or code
  toLanguage: string;   // human name or code
}

export interface TranslateTextResponse {
  translatedText: string;
  confidence?: number;
  audioUrl?: string;
}

export async function translateTextClient({ text, fromLanguage, toLanguage }: TranslateTextParams): Promise<TranslateTextResponse> {
  const res = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      sourceLanguage: toLangCode(fromLanguage),
      targetLanguage: toLangCode(toLanguage),
    }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Translation failed');
  return { translatedText: json.data.text, confidence: json.data.confidence, audioUrl: json.data.audioUrl };
}


