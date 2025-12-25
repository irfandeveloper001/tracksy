// Badge Component
// Displays status and progress indicators with beautiful styling

import type { BadgeProps } from './types';

export default function Badge({ progress, status, children }: BadgeProps) {
  // Progress-based styling (like payment/fulfillment status)
  const progressStyles = {
    complete: 'bg-green-100 text-green-800 border-green-200',
    partiallyComplete: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    incomplete: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  // Status-based styling (alternative approach)
  const statusStyles = {
    success: 'bg-green-100 text-green-800 border-green-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    critical: 'bg-red-100 text-red-800 border-red-200',
    attention: 'bg-orange-100 text-orange-800 border-orange-200',
    default: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const styleClass = progress
    ? progressStyles[progress]
    : status
    ? statusStyles[status]
    : statusStyles.default;

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
        ${styleClass}
      `}
    >
      {children}
    </span>
  );
}

