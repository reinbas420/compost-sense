import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SensorLog } from "@/pages/Index";
import TemperatureChart from "./charts/TemperatureChart";
import HumidityChart from "./charts/HumidityChart";
import GasChart from "./charts/GasChart";
import CombinedChart from "./charts/CombinedChart";
import { BarChart3, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DataVisualizationProps {
  sensorLogs: SensorLog[];
}

type TimeRange = "hour" | "day" | "all" | "custom";

const DataVisualization = ({ sensorLogs }: DataVisualizationProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>("day");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const filterLogsByRange = (logs: SensorLog[], range: TimeRange) => {
    if (range === "all") return logs;

    if (range === "custom" && selectedDate) {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      const startTimestamp = startOfDay.getTime() / 1000;
      const endTimestamp = endOfDay.getTime() / 1000;
      
      return logs.filter((log) => log.unix_time >= startTimestamp && log.unix_time <= endTimestamp);
    }

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

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setTimeRange("custom");
    }
  };

  return (
    <Card className="p-6 border-2">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Data Visualization</h2>
        </div>
        <div className="flex gap-2 flex-wrap">
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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={timeRange === "custom" ? "default" : "outline"}
                size="sm"
                className={cn("gap-2", !selectedDate && "text-muted-foreground")}
              >
                <CalendarIcon className="h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : "Pick date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Tabs defaultValue="combined" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="combined">Combined</TabsTrigger>
          <TabsTrigger value="temperature">Temperature</TabsTrigger>
          <TabsTrigger value="humidity">Humidity</TabsTrigger>
          <TabsTrigger value="gas">Air Quality</TabsTrigger>
        </TabsList>
        
        <TabsContent value="combined" className="space-y-4">
          <CombinedChart data={filteredLogs} timeRange={timeRange} />
        </TabsContent>
        
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
