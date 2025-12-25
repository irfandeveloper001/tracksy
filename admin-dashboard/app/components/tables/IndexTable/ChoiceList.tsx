// ChoiceList Component
// Multi-select or single-select choice list for filters

import type { ChoiceListProps } from './types';

export default function ChoiceList({
  title,
  titleHidden = false,
  choices,
  selected,
  onChange,
  allowMultiple = false,
  disabled = false,
}: ChoiceListProps) {
  const handleChange = (value: string) => {
    if (allowMultiple) {
      const newSelected = selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value];
      onChange(newSelected);
    } else {
      onChange([value]);
    }
  };

  return (
    <div className="space-y-2">
      {title && !titleHidden && (
        <label className="block text-sm font-medium text-gray-700">{title}</label>
      )}
      <div className="space-y-2">
        {choices.map((choice) => (
          <label
            key={choice.value}
            className={`
              flex items-start cursor-pointer group
              ${disabled || choice.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input
              type={allowMultiple ? 'checkbox' : 'radio'}
              checked={selected.includes(choice.value)}
              onChange={() => handleChange(choice.value)}
              disabled={disabled || choice.disabled}
              className={`
                mt-0.5 h-4 w-4 rounded border-gray-300
                text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${disabled || choice.disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
            />
            <div className="ml-3">
              <span className="text-sm text-gray-900 group-hover:text-gray-700">
                {choice.label}
              </span>
              {choice.helpText && (
                <p className="text-xs text-gray-500 mt-0.5">{choice.helpText}</p>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

