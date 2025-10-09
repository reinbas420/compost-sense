import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { SensorLog } from "@/pages/Index";

interface HumidityChartProps {
  data: SensorLog[];
  timeRange: string;
}

const HumidityChart = ({ data, timeRange }: HumidityChartProps) => {
  const formatLabel = (timestamp: number) => {
    const istTimestamp = (timestamp + 19800) * 1000;
    const date = new Date(istTimestamp);

    if (timeRange === "hour" || timeRange === "custom") {
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

  const formatTooltipTime = (timestamp: number) => {
    const istTimestamp = (timestamp + 19800) * 1000;
    const date = new Date(istTimestamp);
    return date.toLocaleString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "UTC",
    });
  };

  const chartData = data.map((log) => ({
    time: formatLabel(log.unix_time),
    fullTime: formatTooltipTime(log.unix_time),
    humidity: log.dht?.humidity || null,
    soilRes: log.soil?.resistive_percent || null,
    soilCap: log.soil?.capacitive_percent || null,
  }));

  const currentHumidity = data.length > 0 ? data[data.length - 1]?.dht?.humidity?.toFixed(1) : "--";

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Humidity & Moisture</span>
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-5xl font-bold text-humidity">{currentHumidity}%</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="soilResGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="soilCapGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            interval="preserveStartEnd"
            minTickGap={50}
          />
          <YAxis 
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            domain={[0, 100]}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--card-foreground))',
            }}
            labelFormatter={(label, payload) => {
              if (payload && payload[0]) {
                return payload[0].payload.fullTime;
              }
              return label;
            }}
            formatter={(value: any) => [`${value?.toFixed(1)}%`]}
          />
          <Area
            type="monotone"
            dataKey="humidity"
            stroke="hsl(var(--chart-2))"
            fill="url(#humidityGradient)"
            strokeWidth={2}
            name="DHT Humidity"
          />
          <Area
            type="monotone"
            dataKey="soilRes"
            stroke="hsl(var(--chart-3))"
            fill="url(#soilResGradient)"
            strokeWidth={2}
            name="Soil Resistive"
          />
          <Area
            type="monotone"
            dataKey="soilCap"
            stroke="hsl(var(--chart-4))"
            fill="url(#soilCapGradient)"
            strokeWidth={2}
            name="Soil Capacitive"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HumidityChart;
