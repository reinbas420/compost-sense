import { Thermometer, Droplets, Sprout, Wind } from "lucide-react";
import { SensorData } from "@/pages/Index";
import MetricCard from "./MetricCard";

interface MetricsGridProps {
  sensorData: SensorData;
}

const MetricsGrid = ({ sensorData }: MetricsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <MetricCard
        icon={<Thermometer className="h-6 w-6" />}
        label="Temperature"
        value={sensorData.dht?.temperature?.toFixed(1) || "--"}
        unit="°C"
        variant="temp"
        subtitle="DHT22 Sensor"
      />

      <MetricCard
        icon={<Droplets className="h-6 w-6" />}
        label="Humidity"
        value={sensorData.dht?.humidity?.toFixed(1) || "--"}
        unit="%"
        variant="humidity"
        subtitle="DHT22 Sensor"
      />

      <MetricCard
        icon={<Thermometer className="h-6 w-6" />}
        label="Temperature"
        value={sensorData.ds18b20?.temperature_c?.toFixed(1) || "--"}
        unit="°C"
        variant="temp"
        subtitle="DS18B20 Sensor"
      />

      <MetricCard
        icon={<Sprout className="h-6 w-6" />}
        label="Moisture"
        value={sensorData.soil?.resistive_percent?.toFixed(1) || "--"}
        unit="%"
        variant="moisture"
        subtitle="Resistive Sensor"
      />

      <MetricCard
        icon={<Sprout className="h-6 w-6" />}
        label="Moisture"
        value={sensorData.soil?.capacitive_percent?.toFixed(1) || "--"}
        unit="%"
        variant="moisture"
        subtitle="Capacitive Sensor"
      />

      <MetricCard
        icon={<Wind className="h-6 w-6" />}
        label="Air Quality"
        value={sensorData.gas?.mq135_ppm?.toFixed(1) || "--"}
        unit="ppm"
        variant="gas"
        subtitle="MQ-135 Sensor"
      />
    </div>
  );
};

export default MetricsGrid;
