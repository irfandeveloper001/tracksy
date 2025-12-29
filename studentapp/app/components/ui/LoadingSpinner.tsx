interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'indigo' | 'blue' | 'green' | 'purple';
  text?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'indigo',
  text,
  fullScreen = false 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 border-2',
    md: 'h-12 w-12 border-2',
    lg: 'h-16 w-16 border-4',
  };

  const colorClasses = {
    indigo: 'border-indigo-600',
    blue: 'border-blue-600',
    green: 'border-green-600',
    purple: 'border-purple-600',
  };

  const spinner = (
    <div className="text-center">
      <div className={`inline-block animate-spin rounded-full border-b-transparent ${sizeClasses[size]} ${colorClasses[color]}`}></div>
      {text && <p className="mt-4 text-gray-600 font-medium">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {spinner}
    </div>
  );
}

