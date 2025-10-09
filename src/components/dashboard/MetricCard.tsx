import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface MetricCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  unit: string;
  variant: "temp" | "humidity" | "moisture" | "gas";
  subtitle?: string;
}

const MetricCard = ({ icon, label, value, unit, variant, subtitle }: MetricCardProps) => {
  const variantClasses = {
    temp: "metric-card-temp text-temp",
    humidity: "metric-card-humidity text-humidity",
    moisture: "metric-card-moisture text-moisture",
    gas: "metric-card-gas text-gas",
  };

  return (
    <Card
      className={cn(
        "p-6 border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        "animate-fade-in",
        variantClasses[variant]
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-muted-foreground mb-1">{label}</span>
          {subtitle && <span className="text-xs text-muted-foreground/70">{subtitle}</span>}
        </div>
        <div className={cn("p-2 rounded-lg", variantClasses[variant].split(" ")[0])}>
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className={cn("text-4xl font-bold", variantClasses[variant].split(" ")[1])}>
          {value}
        </span>
        <span className="text-xl text-muted-foreground font-medium">{unit}</span>
      </div>
    </Card>
  );
};

export default MetricCard;
