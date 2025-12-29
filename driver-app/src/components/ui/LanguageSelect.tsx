import {
  DEFAULT_LANGUAGE_CODE,
  LANGUAGES,
  SUPPORTED_LANGUAGE_CODES,
  type LanguageEntry,
} from '../../lib/i18n/languages';

interface LanguageSelectProps {
  value: string;
  onChange: (code: string) => void;
  className?: string;
  allowedCodes?: string[];
}

const formatLabel = (language: LanguageEntry) =>
  `${language.nativeName} — ${language.name}`;

export default function LanguageSelect({
  value,
  onChange,
  className,
  allowedCodes,
}: LanguageSelectProps) {
  const activeCodes =
    allowedCodes && allowedCodes.length > 0
      ? allowedCodes
      : [...SUPPORTED_LANGUAGE_CODES];
  const options = LANGUAGES.filter((language) =>
    activeCodes.includes(language.code)
  );
  const fallbackCode = options[0]?.code || DEFAULT_LANGUAGE_CODE;
  const selectedValue = options.some((language) => language.code === value)
    ? value
    : fallbackCode;

  return (
    <select
      value={selectedValue}
      onChange={(event) => onChange(event.target.value)}
      className={
        className ||
        'w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500'
      }
    >
      {options.map((language) => (
        <option key={language.code} value={language.code}>
          {formatLabel(language)}
        </option>
      ))}
    </select>
  );
}
