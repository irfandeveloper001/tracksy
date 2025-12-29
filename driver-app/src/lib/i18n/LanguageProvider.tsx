import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  applyDocumentLanguage,
  DEFAULT_LANGUAGE_CODE,
  getStoredLanguage,
  persistLanguage,
  resolveLanguage,
} from './languages';
import type { LanguageEntry } from './languages';
import { translations, type TranslationKey } from './translations';

interface LanguageContextValue {
  language: LanguageEntry;
  setLanguage: (code: string) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageEntry>(() => {
    const stored = getStoredLanguage();
    return resolveLanguage(stored || DEFAULT_LANGUAGE_CODE);
  });

  useEffect(() => {
    applyDocumentLanguage(language);
  }, [language]);

  const setLanguage = useCallback((code: string) => {
    const resolved = resolveLanguage(code);
    setLanguageState(resolved);
    persistLanguage(resolved.code);
    applyDocumentLanguage(resolved);
  }, []);

  const t = useCallback(
    (key: TranslationKey) => {
      const locale = translations[language.code] || translations.en;
      return locale[key] || translations.en[key] || key;
    },
    [language.code]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, setLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context) {
    return context;
  }

  const fallbackLanguage = resolveLanguage(
    getStoredLanguage() || DEFAULT_LANGUAGE_CODE
  );
  const fallbackTranslations = translations[fallbackLanguage.code] || translations.en;

  return {
    language: fallbackLanguage,
    setLanguage: () => {},
    t: (key: TranslationKey) =>
      fallbackTranslations[key] || translations.en[key] || key,
  };
};
