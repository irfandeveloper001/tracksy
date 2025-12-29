import languagesData from '../../data/languages.json';

export type LanguageDirection = 'ltr' | 'rtl';

export interface LanguageEntry {
  code: string;
  name: string;
  nativeName: string;
  direction: LanguageDirection;
}

// Offline language mode ensures no external API calls are needed.
export const OFFLINE_LANGUAGE_MODE = true;
export const LANGUAGE_STORAGE_KEY = 'tracksy_language';
export const DEFAULT_LANGUAGE_CODE = 'en';
export const SUPPORTED_LANGUAGE_CODES = ['en', 'ur', 'hi', 'fr', 'de', 'ar'] as const;
export type SupportedLanguageCode = (typeof SUPPORTED_LANGUAGE_CODES)[number];
const SUPPORTED_LANGUAGE_SET = new Set<SupportedLanguageCode>(SUPPORTED_LANGUAGE_CODES);

export const LANGUAGES: LanguageEntry[] = languagesData as LanguageEntry[];

export const LANGUAGE_LOOKUP = LANGUAGES.reduce<Record<string, LanguageEntry>>(
  (acc, language) => {
    acc[language.code] = language;
    return acc;
  },
  {}
);

export const getStoredLanguage = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
};

export const persistLanguage = (code: string) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
};

export const resolveLanguage = (code?: string): LanguageEntry => {
  if (code && LANGUAGE_LOOKUP[code] && SUPPORTED_LANGUAGE_SET.has(code as SupportedLanguageCode)) {
    return LANGUAGE_LOOKUP[code];
  }
  return LANGUAGE_LOOKUP[DEFAULT_LANGUAGE_CODE];
};

export const applyDocumentLanguage = (language: LanguageEntry) => {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = language.code;
  document.documentElement.dir = language.direction;
};
