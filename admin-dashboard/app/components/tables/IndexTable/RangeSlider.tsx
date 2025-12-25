// RangeSlider Component
// Dual-handle range slider for numeric filters

import { useState, useEffect, useRef } from 'react';
import type { RangeSliderProps } from './types';

export default function RangeSlider({
  label,
  labelHidden = false,
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix = '',
  suffix = '',
  output = false,
  disabled = false,
}: RangeSliderProps) {
  const [localValue, setLocalValue] = useState(value);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleMinChange = (newMin: number) => {
    const clampedMin = Math.min(newMin, localValue[1]);
    const newValue: [number, number] = [clampedMin, localValue[1]];
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleMaxChange = (newMax: number) => {
    const clampedMax = Math.max(newMax, localValue[0]);
    const newValue: [number, number] = [localValue[0], clampedMax];
    setLocalValue(newValue);
    onChange(newValue);
  };

  const minPercent = ((localValue[0] - min) / (max - min)) * 100;
  const maxPercent = ((localValue[1] - min) / (max - min)) * 100;

  return (
    <div className="space-y-3">
      {label && !labelHidden && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}
      
      <div className="px-2">
        {/* Dual Range Slider */}
        <div ref={sliderRef} className="relative h-2">
          {/* Background track */}
          <div className="absolute w-full h-2 bg-gray-200 rounded-full" />
          
          {/* Active range track */}
          <div
            className="absolute h-2 bg-blue-600 rounded-full"
            style={{
              left: `${minPercent}%`,
              width: `${maxPercent - minPercent}%`,
            }}
          />
          
          {/* Min handle */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={localValue[0]}
            onChange={(e) => handleMinChange(Number(e.target.value))}
            disabled={disabled}
            className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none
              [&::-webkit-slider-thumb]:pointer-events-auto
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-5
              [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:border-2
              [&::-webkit-slider-thumb]:border-blue-600
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:shadow-md
              [&::-webkit-slider-thumb]:hover:shadow-lg
              [&::-webkit-slider-thumb]:transition-shadow
              [&::-moz-range-thumb]:pointer-events-auto
              [&::-moz-range-thumb]:appearance-none
              [&::-moz-range-thumb]:w-5
              [&::-moz-range-thumb]:h-5
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-white
              [&::-moz-range-thumb]:border-2
              [&::-moz-range-thumb]:border-blue-600
              [&::-moz-range-thumb]:cursor-pointer
              [&::-moz-range-thumb]:shadow-md
              [&::-moz-range-thumb]:hover:shadow-lg
              [&::-moz-range-thumb]:transition-shadow"
            style={{ zIndex: localValue[0] > max - (max - min) / 4 ? 5 : 3 }}
          />
          
          {/* Max handle */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={localValue[1]}
            onChange={(e) => handleMaxChange(Number(e.target.value))}
            disabled={disabled}
            className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none
              [&::-webkit-slider-thumb]:pointer-events-auto
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-5
              [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:border-2
              [&::-webkit-slider-thumb]:border-blue-600
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:shadow-md
              [&::-webkit-slider-thumb]:hover:shadow-lg
              [&::-webkit-slider-thumb]:transition-shadow
              [&::-moz-range-thumb]:pointer-events-auto
              [&::-moz-range-thumb]:appearance-none
              [&::-moz-range-thumb]:w-5
              [&::-moz-range-thumb]:h-5
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-white
              [&::-moz-range-thumb]:border-2
              [&::-moz-range-thumb]:border-blue-600
              [&::-moz-range-thumb]:cursor-pointer
              [&::-moz-range-thumb]:shadow-md
              [&::-moz-range-thumb]:hover:shadow-lg
              [&::-moz-range-thumb]:transition-shadow"
            style={{ zIndex: 4 }}
          />
        </div>
        
        {/* Output values */}
        {output && (
          <div className="flex items-center justify-between mt-3 text-sm text-gray-700">
            <span className="font-medium">
              {prefix}
              {localValue[0].toLocaleString()}
              {suffix}
            </span>
            <span className="text-gray-400">-</span>
            <span className="font-medium">
              {prefix}
              {localValue[1].toLocaleString()}
              {suffix}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

