import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PeakHoursChartProps {
  data: Array<{ hour: number; count: number }>;
}

export default function PeakHoursChart({ data }: PeakHoursChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No data available
      </div>
    );
  }

  const chartData = data.map((item) => ({
    hour: `${item.hour}:00`,
    count: item.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="hour" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" fill="#10b981" name="Trip Count" />
      </BarChart>
    </ResponsiveContainer>
  );
}

