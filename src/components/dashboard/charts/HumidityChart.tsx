import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { SensorLog } from "@/pages/Index";
import { computeSoilPercents } from "@/lib/utils";

interface HumidityChartProps {
  data: SensorLog[];
  timeRange: string;
}

const HumidityChart = ({ data, timeRange }: HumidityChartProps) => {
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
    humidity: (() => {
      const v1 = log.dht1?.humidity;
      const v2 = log.dht2?.humidity;
      // prefer primary sensor (dht1), fallback to dht2
      if (v1 !== undefined && v1 !== null && Number.isFinite(Number(v1))) return Number(v1);
      if (v2 !== undefined && v2 !== null && Number.isFinite(Number(v2))) return Number(v2);
      return null;
    })(),
    soilRes: (() => {
      const capRaw = log.soil?.capacitive_raw;
      const resRaw = log.soil?.resistive_raw;
      const { resistive_percent } = computeSoilPercents(capRaw, resRaw);
      if (resistive_percent === undefined || resistive_percent === null) return null;
      if (resistive_percent < 0 || resistive_percent > 100) return null;
      return resistive_percent;
    })(),
    soilCap: (() => {
      const capRaw = log.soil?.capacitive_raw;
      const resRaw = log.soil?.resistive_raw;
      const { capacitive_percent } = computeSoilPercents(capRaw, resRaw);
      if (capacitive_percent === undefined || capacitive_percent === null) return null;
      if (capacitive_percent < 0 || capacitive_percent > 100) return null;
      return capacitive_percent;
    })(),
  }));

  const currentHumidity = (() => {
    if (data.length === 0) return "--";
    const last = data[data.length - 1];
    const v1 = last.dht1?.humidity;
    const v2 = last.dht2?.humidity;
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
          <span className="text-sm text-muted-foreground">Humidity & Moisture</span>
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-5xl font-bold text-humidity">{currentHumidity}%</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={350}>
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
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12 }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickLine={false}
            domain={[0, 100]}
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
