export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'ja' | 'ko' | 'zh';

export interface LanguageDef {
  code: LanguageCode;
  name: string;
  flag: string;
}

export const LANGUAGES: LanguageDef[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
];

export function findLanguageByName(name: string): LanguageDef | undefined {
  return LANGUAGES.find((l) => l.name.toLowerCase() === name.toLowerCase());
}

export function toLangCode(nameOrCode: string): 'en' | 'es' {
  // Our realtime/text APIs currently support en/es robustly
  const lower = nameOrCode.toLowerCase();
  if (lower.startsWith('es') || lower === 'spanish') return 'es';
  return 'en';
}

export function getFlagByName(name: string): string | undefined {
  return findLanguageByName(name)?.flag;
}


