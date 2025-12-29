import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  gradient?: boolean;
}

export default function Card({ 
  children, 
  className = '', 
  hover = false,
  onClick,
  gradient = false 
}: CardProps) {
  const baseClasses = 'bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden';
  const hoverClasses = hover ? 'hover:shadow-xl hover:scale-[1.02] transition-all duration-300' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';
  const gradientClasses = gradient ? 'bg-gradient-to-br from-white to-gray-50' : '';

  return (
    <div 
      className={`${baseClasses} ${hoverClasses} ${clickableClasses} ${gradientClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ 
  children, 
  className = '' 
}: { children: ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ 
  children, 
  className = '' 
}: { children: ReactNode; className?: string }) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ 
  children, 
  className = '' 
}: { children: ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-4 border-t border-gray-200 bg-gray-50 ${className}`}>
      {children}
    </div>
  );
}

