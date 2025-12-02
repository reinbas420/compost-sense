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
    dht:
      (() => {
        const v1 = log.dht1?.temperature;
        const v2 = log.dht2?.temperature;
        // prefer primary sensor (dht1), fallback to dht2
        if (v1 !== undefined && v1 !== null && Number.isFinite(Number(v1))) return Number(v1);
        if (v2 !== undefined && v2 !== null && Number.isFinite(Number(v2))) return Number(v2);
        return null;
      })(),
    ds18b20:
      (() => {
        const v1 = log.ds18b20_1?.temperature_c;
        const v2 = log.ds18b20_2?.temperature_c;
        // prefer primary sensor (ds18b20_1), fallback to ds18b20_2
        if (v1 !== undefined && v1 !== null && Number.isFinite(Number(v1))) {
          const nv = Number(v1);
          if (nv < -40 || nv > 125) return null;
          return nv;
        }
        if (v2 !== undefined && v2 !== null && Number.isFinite(Number(v2))) {
          const nv = Number(v2);
          if (nv < -40 || nv > 125) return null;
          return nv;
        }
        return null;
      })(),
  }));

  // Find current temperature for display
  const currentTemp = (() => {
    if (data.length === 0) return "--";
    const last = data[data.length - 1];
    const v1 = last.dht1?.temperature;
    const v2 = last.dht2?.temperature;
    const primary = v1 !== undefined && v1 !== null && Number.isFinite(Number(v1)) ? Number(v1) : null;
    const secondary = v2 !== undefined && v2 !== null && Number.isFinite(Number(v2)) ? Number(v2) : null;
    const value = primary != null ? primary : secondary;
    if (value == null) return "--";
    return value.toFixed(1);
  })();

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
