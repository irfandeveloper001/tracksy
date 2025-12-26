interface MiniChartProps {
  data: number[];
  color?: string;
  height?: number;
}

export default function MiniChart({ data, color = 'blue', height = 40 }: MiniChartProps) {
  const maxValue = Math.max(...data, 1);
  const minValue = Math.min(...data, 0);
  const range = maxValue - minValue || 1;

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600',
  };

  const gradient = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <div className="relative w-full" style={{ height: `${height}px` }}>
      <svg className="w-full h-full" viewBox={`0 0 ${data.length * 10} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={`var(--color-${color}-500)`} stopOpacity="0.8" />
            <stop offset="100%" stopColor={`var(--color-${color}-600)`} stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <path
          d={`M 0 ${height} ${data.map((value, index) => {
            const x = index * 10;
            const y = height - ((value - minValue) / range) * height;
            return `L ${x} ${y}`;
          }).join(' ')} L ${(data.length - 1) * 10} ${height} Z`}
          fill={`url(#gradient-${color})`}
          className={`fill-${color}-500/20`}
        />
        <path
          d={`M 0 ${height} ${data.map((value, index) => {
            const x = index * 10;
            const y = height - ((value - minValue) / range) * height;
            return `L ${x} ${y}`;
          }).join(' ')}`}
          fill="none"
          stroke={`currentColor`}
          strokeWidth="2"
          className={`text-${color}-500`}
        />
      </svg>
    </div>
  );
}














