import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SensorLog } from "@/pages/Index";
import TemperatureChart from "./charts/TemperatureChart";
import HumidityChart from "./charts/HumidityChart";
import GasChart from "./charts/GasChart";
import { BarChart3 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

interface DataVisualizationProps {
  sensorLogs: SensorLog[];
}

type TimeRange = "hour" | "day" | "all";

const DataVisualization = ({ sensorLogs }: DataVisualizationProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>("day");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const filterLogsByRange = (logs: SensorLog[], range: TimeRange) => {
    // If a calendar date is selected, filter strictly to that day
    if (selectedDate) {
      const start = new Date(selectedDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      const startUnix = Math.floor(start.getTime() / 1000);
      const endUnix = Math.floor(end.getTime() / 1000);
      return logs.filter((log) => (log.unix_time || 0) >= startUnix && (log.unix_time || 0) < endUnix);
    }
    if (range === "all") return logs;

    const now = Date.now() / 1000;
    let timeThreshold: number;

    if (range === "hour") {
      timeThreshold = now - 60 * 60;
    } else {
      timeThreshold = now - 24 * 60 * 60;
    }

    return logs.filter((log) => log.unix_time >= timeThreshold);
  };

  const filteredLogs = filterLogsByRange(sensorLogs, timeRange);

  // Compute the set of days that have data (for calendar highlighting)
  const daysWithData = useMemo(() => {
    const set = new Map<string, Date>();
    for (const log of sensorLogs) {
      if (!log?.unix_time) continue;
      const d = new Date((log.unix_time || 0) * 1000);
      const key = format(d, "yyyy-MM-dd");
      if (!set.has(key)) {
        const midday = new Date(d);
        midday.setHours(12, 0, 0, 0);
        set.set(key, midday);
      }
    }
    return Array.from(set.values());
  }, [sensorLogs]);

  return (
    <Card className="p-6 border-2">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Data Visualization</h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant={timeRange === "hour" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("hour")}
          >
            1h
          </Button>
          <Button
            variant={timeRange === "day" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("day")}
          >
            24h
          </Button>
          <Button
            variant={timeRange === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("all")}
          >
            7d
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedDate(null)}>
            Clear date
          </Button>
        </div>
      </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Calendar</h3>
                <p className="text-xs text-muted-foreground">Days with data are highlighted</p>
              </div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onDayClick={(day) => setSelectedDate(day ?? null)}
                // pass modifiers so the calendar shows which days have data
                modifiers={{ hasData: daysWithData }}
                // style modifier for days that have data (use modifiersClassNames for typed support)
                modifiersClassNames={{ hasData: "bg-accent/40 text-accent-foreground rounded-md" }}
                classNames={{ day_selected: "bg-primary text-primary-foreground" }}
              />
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Selected</h3>
                <p className="text-xs text-muted-foreground">{selectedDate ? format(selectedDate, "PPP") : "All data"}</p>
              </div>
              {/* Charts will be shown below */}
            </Card>
          </div>
        </div>

      <Tabs defaultValue="temperature" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="temperature">Temperature</TabsTrigger>
          <TabsTrigger value="humidity">Humidity</TabsTrigger>
          <TabsTrigger value="gas">Air Quality</TabsTrigger>
        </TabsList>
        
        <TabsContent value="temperature" className="space-y-4">
          <TemperatureChart data={filteredLogs} timeRange={timeRange} />
        </TabsContent>
        
        <TabsContent value="humidity" className="space-y-4">
          <HumidityChart data={filteredLogs} timeRange={timeRange} />
        </TabsContent>
        
        <TabsContent value="gas" className="space-y-4">
          <GasChart data={filteredLogs} timeRange={timeRange} />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default DataVisualization;
