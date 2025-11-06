import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TripCountsChartProps {
  data: Array<{ date?: string; week?: string; month?: string; count: number }>;
  period: 'daily' | 'weekly' | 'monthly';
}

export default function TripCountsChart({ data, period }: TripCountsChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No data available
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.date || item.week || item.month || 'N/A',
    trips: item.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="trips"
          stroke="#3b82f6"
          strokeWidth={2}
          name="Trip Count"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

