import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { SensorLog } from "@/pages/Index";

interface CombinedChartProps {
  data: SensorLog[];
  timeRange: string;
}

const CombinedChart = ({ data, timeRange }: CombinedChartProps) => {
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
    temperature: log.dht?.temperature || null,
    humidity: log.dht?.humidity || null,
    gas: log.gas?.mq135_ppm || null,
  }));

  return (
    <div>
      <div className="mb-4">
        <span className="text-sm text-muted-foreground">All Sensor Data Combined</span>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="tempGradientCombined" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="humidityGradientCombined" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gasGradientCombined" x1="0" y1="0" x2="0" y2="1">
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
            yAxisId="left"
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            label={{ value: 'Temp (°C) / Humidity (%)', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: 'hsl(var(--muted-foreground))' } }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            label={{ value: 'Gas (ppm)', angle: 90, position: 'insideRight', style: { fontSize: 11, fill: 'hsl(var(--muted-foreground))' } }}
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
            formatter={(value: any, name: string) => {
              if (name === "Temperature") return [`${value?.toFixed(1)}°C`, name];
              if (name === "Humidity") return [`${value?.toFixed(1)}%`, name];
              if (name === "Air Quality") return [`${value?.toFixed(1)} ppm`, name];
              return [value, name];
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: 12 }}
            iconType="line"
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="temperature"
            stroke="hsl(var(--chart-1))"
            fill="url(#tempGradientCombined)"
            strokeWidth={2}
            name="Temperature"
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="humidity"
            stroke="hsl(var(--chart-2))"
            fill="url(#humidityGradientCombined)"
            strokeWidth={2}
            name="Humidity"
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="gas"
            stroke="hsl(var(--chart-4))"
            fill="url(#gasGradientCombined)"
            strokeWidth={2}
            name="Air Quality"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CombinedChart;
