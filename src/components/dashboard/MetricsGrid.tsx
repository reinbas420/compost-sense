import { Thermometer, Droplets, Sprout, Wind } from "lucide-react";
import { SensorData } from "@/pages/Index";
import MetricCard from "./MetricCard";
import { computeSoilPercents } from "@/lib/utils";

interface MetricsGridProps {
  sensorData: SensorData;
}

const MetricsGrid = ({ sensorData }: MetricsGridProps) => {
  // Helper: coerce value to finite number or null
  const asNumber = (v: number | undefined | null) => {
    if (v == null) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  // Choose best reading between dht1 and dht2 for a given field
  const bestDHT = (field: 'temperature' | 'humidity') => {
    const a = sensorData.dht1 ? asNumber((sensorData.dht1 as any)[field]) : null;
    const b = sensorData.dht2 ? asNumber((sensorData.dht2 as any)[field]) : null;

    const isValidTemp = (v: number | null) => v !== null && v > -40 && v < 80;
    const isValidHum = (v: number | null) => v !== null && Number.isFinite(v) && v >= 0 && v <= 100 && v !== 100;

    if (field === 'temperature') {
      const va = isValidTemp(a) ? a : null;
      const vb = isValidTemp(b) ? b : null;
      if (va === null && vb === null) return { value: null, source: 'none' };
      if (va !== null && vb === null) return { value: va, source: 'dht1' };
      if (va === null && vb !== null) return { value: vb, source: 'dht2' };
      // both valid -> average for stability
      return { value: (va! + vb!) / 2, source: 'avg(dht1,dht2)' };
    }

    // humidity
    const ha = isValidHum(a) ? a : null;
    const hb = isValidHum(b) ? b : null;
    if (ha === null && hb === null) return { value: null, source: 'none' };
    if (ha !== null && hb === null) return { value: ha, source: 'dht1' };
    if (ha === null && hb !== null) return { value: hb, source: 'dht2' };
    // both valid -> average
    return { value: (ha! + hb!) / 2, source: 'avg(dht1,dht2)' };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <MetricCard
        icon={<Thermometer className="h-6 w-6" />}
        label="Temperature"
        value={
          (() => {
            const best = bestDHT('temperature');
            const t = best.value;
            return t == null ? "--" : t.toFixed(1);
          })()
        }
        unit="°C"
        variant="temp"
        subtitle={(() => {
          const best = bestDHT('temperature');
          if (best.source === 'dht1') return 'DHT22 (dht1)';
          if (best.source === 'dht2') return 'DHT22 (dht2)';
          if (best.source === 'avg(dht1,dht2)') return 'DHT22 (avg)';
          return 'DHT22 Sensor';
        })()}
      />

      <MetricCard
        icon={<Droplets className="h-6 w-6" />}
        label="Humidity"
        value={
          (() => {
            const best = bestDHT('humidity');
            const h = best.value;
            return h == null ? "--" : h.toFixed(1);
          })()
        }
        unit="%"
        variant="humidity"
        subtitle={(() => {
          const best = bestDHT('humidity');
          if (best.source === 'dht1') return 'DHT22 (dht1)';
          if (best.source === 'dht2') return 'DHT22 (dht2)';
          if (best.source === 'avg(dht1,dht2)') return 'DHT22 (avg)';
          return 'DHT22 Sensor';
        })()}
      />

      <MetricCard
        icon={<Thermometer className="h-6 w-6" />}
        label="Temperature"
            value={
              (() => {
                const t = asNumber(sensorData.ds18b20_1?.temperature);
                // DS18B20 valid range roughly -40 to 125°C
                if (t === undefined || t === null) return "--";
                if (t < -40 || t > 125) return "--";
                return t.toFixed(1);
              })()
            }
        unit="°C"
        variant="temp"
            subtitle={
              (() => {
                const t = asNumber(sensorData.ds18b20_1?.temperature);
                if (t === undefined || t === null) return "DS18B20 Sensor";
                if (t < -40 || t > 125) return "DS18B20 Sensor (invalid reading)";
                return "DS18B20 Sensor";
              })()
            }
      />

      <MetricCard
        icon={<Sprout className="h-6 w-6" />}
        label="Moisture"
        value={(() => {
          const percents = sensorData.soil ? computeSoilPercents(sensorData.soil.capacitive_raw, sensorData.soil.resistive_raw) : { capacitive_percent: null, resistive_percent: null };
          return percents.resistive_percent != null && Number.isFinite(percents.resistive_percent) ? percents.resistive_percent.toFixed(1) : "--";
        })()}
        unit="%"
        variant="moisture"
        subtitle="Resistive Sensor"
      />

      <MetricCard
        icon={<Sprout className="h-6 w-6" />}
        label="Moisture"
        value={
          (() => {
            const percents = sensorData.soil ? computeSoilPercents(sensorData.soil.capacitive_raw, sensorData.soil.resistive_raw) : { capacitive_percent: null, resistive_percent: null };
            const cap = percents.capacitive_percent;
            const res = percents.resistive_percent;
            if (cap === undefined || cap === null || !Number.isFinite(cap)) return "--";
            if (cap === 100) return "--";
            return cap.toFixed(1);
          })()
        }
        unit="%"
        variant="moisture"
        subtitle={
          (() => {
            const percents = sensorData.soil ? computeSoilPercents(sensorData.soil.capacitive_raw, sensorData.soil.resistive_raw) : { capacitive_percent: null, resistive_percent: null };
            const cap = percents.capacitive_percent;
            const res = percents.resistive_percent;
            if (cap === undefined || cap === null || !Number.isFinite(cap)) return "Capacitive Sensor";
            if (cap === 100) return `Capacitive unreliable — resistive: ${res && Number.isFinite(res) ? res.toFixed(1) : "--"}%`;
            return "Capacitive Sensor";
          })()
        }
      />

      <MetricCard
        icon={<Wind className="h-6 w-6" />}
        label="Air Quality"
        value={
          Number.isFinite(sensorData.gas?.mq135_ppm as number)
            ? (sensorData.gas!.mq135_ppm as number).toFixed(1)
            : "--"
        }
        unit="ppm"
        variant="gas"
        subtitle="MQ-135 Sensor"
      />
    </div>
  );
};

export default MetricsGrid;
