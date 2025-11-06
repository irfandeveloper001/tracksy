import { ClockIcon } from '@heroicons/react/24/outline';

interface PerformanceMetricsProps {
  onTimePercentage: number;
  averageWaitTime: Array<{ date: string; minutes: number }>;
}

export default function PerformanceMetrics({
  onTimePercentage,
  averageWaitTime,
}: PerformanceMetricsProps) {
  const avgWaitTime =
    averageWaitTime.length > 0
      ? averageWaitTime.reduce((sum, item) => sum + item.minutes, 0) / averageWaitTime.length
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">On-Time Performance</h3>
        <div className="relative">
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke={onTimePercentage >= 80 ? '#10b981' : onTimePercentage >= 60 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(onTimePercentage / 100) * 351.86} 351.86`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{onTimePercentage}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Average Wait Time</h3>
        <div className="flex items-center space-x-2">
          <ClockIcon className="h-6 w-6 text-blue-600" />
          <div>
            <p className="text-3xl font-bold text-gray-900">{avgWaitTime.toFixed(1)}</p>
            <p className="text-sm text-gray-500">minutes</p>
          </div>
        </div>
      </div>
    </div>
  );
}

