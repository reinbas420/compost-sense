import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SensorLog } from "@/pages/Index";
import TemperatureChart from "./charts/TemperatureChart";
import HumidityChart from "./charts/HumidityChart";
import GasChart from "./charts/GasChart";
import { BarChart3 } from "lucide-react";

interface DataVisualizationProps {
  sensorLogs: SensorLog[];
}

type TimeRange = "hour" | "day" | "all";

const DataVisualization = ({ sensorLogs }: DataVisualizationProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>("day");

  const filterLogsByRange = (logs: SensorLog[], range: TimeRange) => {
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
