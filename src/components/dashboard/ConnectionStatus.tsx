import { Badge } from "@/components/ui/badge";
import { Circle } from "lucide-react";

interface ConnectionStatusProps {
  isConnected: boolean;
  lastUpdate?: string;
}

const ConnectionStatus = ({ isConnected, lastUpdate }: ConnectionStatusProps) => {
  return (
    <div className="flex items-center gap-4">
      <Badge 
        variant={isConnected ? "default" : "secondary"} 
        className="px-3 py-1.5 gap-2"
      >
        <Circle 
          className={`h-2 w-2 fill-current ${isConnected ? "animate-pulse" : ""}`} 
        />
        {isConnected ? "Connected" : "Connecting..."}
      </Badge>
    </div>
  );
};

export default ConnectionStatus;
