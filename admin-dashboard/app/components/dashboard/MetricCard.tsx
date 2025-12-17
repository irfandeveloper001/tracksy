interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

export default function MetricCard({
  title,
  value,
  icon,
  change,
  color = 'blue',
}: MetricCardProps) {
  const colorConfig = {
    blue: {
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200',
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      shadow: 'shadow-blue-500/20',
    },
    green: {
      gradient: 'from-green-500 to-green-600',
      bg: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-200',
      iconBg: 'bg-gradient-to-br from-green-500 to-green-600',
      shadow: 'shadow-green-500/20',
    },
    yellow: {
      gradient: 'from-yellow-500 to-yellow-600',
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      border: 'border-yellow-200',
      iconBg: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
      shadow: 'shadow-yellow-500/20',
    },
    red: {
      gradient: 'from-red-500 to-red-600',
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-200',
      iconBg: 'bg-gradient-to-br from-red-500 to-red-600',
      shadow: 'shadow-red-500/20',
    },
    purple: {
      gradient: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-200',
      iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
      shadow: 'shadow-purple-500/20',
    },
  };

  const config = colorConfig[color];

  return (
    <div className="group relative bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
      {/* Gradient background effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      
      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">{title}</p>
          <p className="text-4xl font-bold text-gray-900 mb-1 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change && (
            <div className="mt-3 flex items-center">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                  change.isPositive 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {change.isPositive ? '↑' : '↓'} {Math.abs(change.value)}%
              </span>
              <span className="text-xs text-gray-500 ml-2">vs last month</span>
            </div>
          )}
        </div>
        <div className={`${config.iconBg} p-4 rounded-xl text-white shadow-lg ${config.shadow} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
          <div className="h-8 w-8">
            {icon}
          </div>
        </div>
      </div>
      
      {/* Decorative corner element */}
      <div className={`absolute top-0 right-0 w-20 h-20 ${config.bg} rounded-bl-full opacity-10`} />
    </div>
  );
}


