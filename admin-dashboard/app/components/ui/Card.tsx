import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export default function Card({
  children,
  className = '',
  padding = 'md',
  hover = false,
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`
        bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/60
        ${paddingClasses[padding]}
        ${hover ? 'hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
