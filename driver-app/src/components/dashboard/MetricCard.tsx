interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo' | 'gray';
}

export default function MetricCard({
  title,
  value,
  icon,
  change,
  color = 'indigo',
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
    indigo: {
      gradient: 'from-indigo-500 to-indigo-600',
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      border: 'border-indigo-200',
      iconBg: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      shadow: 'shadow-indigo-500/20',
    },
    gray: {
      gradient: 'from-gray-500 to-gray-600',
      bg: 'bg-gray-50',
      text: 'text-gray-600',
      border: 'border-gray-200',
      iconBg: 'bg-gradient-to-br from-gray-500 to-gray-600',
      shadow: 'shadow-gray-500/20',
    },
  };

  const config = colorConfig[color];

  return (
    <div className="group relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-2xl hover:shadow-gray-300/50 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
      {/* Animated gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
      
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      
      <div className="relative flex items-center justify-between z-10">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
            {change && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                  change.isPositive 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-red-100 text-red-700 border border-red-200'
                }`}
              >
                {change.isPositive ? '↑' : '↓'} {Math.abs(change.value)}%
              </span>
            )}
          </div>
          <p className="text-3xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2 transition-all duration-500 group-hover:scale-105">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        <div className={`${config.iconBg} p-4 rounded-2xl text-white shadow-xl ${config.shadow} group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 relative overflow-hidden`}>
          {/* Icon glow effect */}
          <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-500`}></div>
          <div className="relative h-6 w-6 z-10">
            {icon}
          </div>
        </div>
      </div>
      
      {/* Enhanced decorative elements */}
      <div className={`absolute top-0 right-0 w-32 h-32 ${config.bg} rounded-bl-[3rem] opacity-5 group-hover:opacity-20 transition-opacity duration-500`} />
      <div className={`absolute bottom-0 left-0 w-24 h-24 ${config.bg} rounded-tr-[3rem] opacity-5 group-hover:opacity-15 transition-opacity duration-500`} />
      
      {/* Bottom border accent */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
    </div>
  );
}


