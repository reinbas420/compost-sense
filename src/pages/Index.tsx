import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import MetricsGrid from "@/components/dashboard/MetricsGrid";
import DataVisualization from "@/components/dashboard/DataVisualization";
import ConnectionStatus from "@/components/dashboard/ConnectionStatus";
import { ThemeToggle } from "@/components/ThemeToggle";

const firebaseConfig = {
  apiKey: "AIzaSyBUhwjURUmcdMm3Dzzre7w_4xhITNVloHc",
  databaseURL: "https://compost-bin-monitoring-default-rtdb.firebaseio.com/",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export interface SensorData {
  dht: { temperature: number; humidity: number } | null;
  ds18b20: { temperature_c: number } | null;
  soil: { resistive_percent: number; capacitive_percent: number } | null;
  gas: { mq135_ppm: number } | null;
  system: { last_update: string; total_logs: number } | null;
}

export interface SensorLog {
  unix_time: number;
  dht?: { temperature: number; humidity: number };
  ds18b20?: { temperature_c: number };
  soil?: { resistive_percent: number; capacitive_percent: number };
  gas?: { mq135_ppm: number };
}

const Index = () => {
  const [sensorData, setSensorData] = useState<SensorData>({
    dht: null,
    ds18b20: null,
    soil: null,
    gas: null,
    system: null,
  });
  const [sensorLogs, setSensorLogs] = useState<SensorLog[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Listen to real-time data
    const dhtRef = ref(database, "/dht");
    const ds18b20Ref = ref(database, "/ds18b20");
    const soilRef = ref(database, "/soil");
    const gasRef = ref(database, "/gas");
    const systemRef = ref(database, "/system");

    onValue(dhtRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSensorData((prev) => ({ ...prev, dht: data }));
        setIsConnected(true);
      }
    });

    onValue(ds18b20Ref, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSensorData((prev) => ({ ...prev, ds18b20: data }));
      }
    });

    onValue(soilRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSensorData((prev) => ({ ...prev, soil: data }));
      }
    });

    onValue(gasRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSensorData((prev) => ({ ...prev, gas: data }));
      }
    });

    onValue(systemRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSensorData((prev) => ({ ...prev, system: data }));
      }
    });

    // Listen to sensor logs
    const logsRef = ref(database, "/sensor_logs");
    onValue(logsRef, (snapshot) => {
      const logs: SensorLog[] = [];
      snapshot.forEach((child) => {
        const logData = child.val();
        if (logData && !logData.unix_time) {
          logData.unix_time = parseInt(child.key);
        }
        if (logData) {
          logs.push(logData);
        }
      });
      logs.sort((a, b) => (a.unix_time || 0) - (b.unix_time || 0));
      setSensorLogs(logs);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-primary" strokeWidth={2.5} />
              <div>
                <h1 className="text-2xl font-bold text-foreground">IoT Dashboard</h1>
                <p className="text-sm text-muted-foreground">Real-time sensor monitoring</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ConnectionStatus 
                isConnected={isConnected}
                lastUpdate={sensorData.system?.last_update}
              />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Metrics Grid */}
          <MetricsGrid sensorData={sensorData} />

          {/* Data Visualization */}
          <DataVisualization sensorLogs={sensorLogs} />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Last updated: {sensorData.system?.last_update || "..."}</p>
          <p className="mt-1">Ready for Firebase integration • Total logs: {sensorData.system?.total_logs || 0}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
