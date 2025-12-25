import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon,
  disabled = false,
  className = '',
  type = 'button',
}: ButtonProps) {
  const baseClasses = 'group relative overflow-hidden font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white',
    secondary: 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white',
    success: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white',
    ghost: 'bg-white border-2 border-indigo-600 hover:bg-indigo-50 text-indigo-600',
  };

  const sizeClasses = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-6 text-base',
    lg: 'py-4 px-8 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      <span className="relative z-10 flex items-center justify-center">
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </span>
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
    </button>
  );
}

