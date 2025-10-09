import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { SensorLog } from "@/pages/Index";

interface TemperatureChartProps {
  data: SensorLog[];
  timeRange: string;
}

const TemperatureChart = ({ data, timeRange }: TemperatureChartProps) => {
  const formatLabel = (timestamp: number) => {
    const istTimestamp = (timestamp + 19800) * 1000;
    const date = new Date(istTimestamp);

    if (timeRange === "hour") {
      return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
      });
    } else if (timeRange === "day") {
      return date.toLocaleString("en-IN", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        timeZone: "UTC",
      });
    } else {
      return date.toLocaleString("en-IN", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      });
    }
  };

  const chartData = data.map((log) => ({
    time: formatLabel(log.unix_time),
    dht: log.dht?.temperature || null,
    ds18b20: log.ds18b20?.temperature_c || null,
  }));

  // Find current temperature for display
  const currentTemp = data.length > 0 ? data[data.length - 1]?.dht?.temperature?.toFixed(1) : "--";

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Temperature</span>
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-5xl font-bold text-temp">{currentTemp}°C</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="dhtGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="dsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12 }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickLine={false}
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Area
            type="monotone"
            dataKey="dht"
            stroke="hsl(var(--chart-1))"
            fill="url(#dhtGradient)"
            strokeWidth={2}
            name="DHT22"
          />
          <Area
            type="monotone"
            dataKey="ds18b20"
            stroke="hsl(var(--chart-2))"
            fill="url(#dsGradient)"
            strokeWidth={2}
            name="DS18B20"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TemperatureChart;
