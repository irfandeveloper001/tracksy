import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BusUtilizationChartProps {
  data: Array<{ bus_number: string; utilization: number }>;
}

export default function BusUtilizationChart({ data }: BusUtilizationChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No data available
      </div>
    );
  }

  const chartData = data.map((item) => ({
    bus: item.bus_number,
    utilization: item.utilization,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="bus" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Legend />
        <Bar dataKey="utilization" fill="#8b5cf6" name="Utilization %" />
      </BarChart>
    </ResponsiveContainer>
  );
}

