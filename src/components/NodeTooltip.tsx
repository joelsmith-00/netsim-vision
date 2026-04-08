import { motion } from 'framer-motion';

interface NodeTooltipProps {
  nodeId: string;
  status: string;
  congestionLevel: number;
  position: { x: number; y: number };
  packetsSent: number;
  packetsReceived: number;
  packetsDropped: number;
}

export default function NodeTooltip({ nodeId, status, congestionLevel, position, packetsSent, packetsReceived, packetsDropped }: NodeTooltipProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute z-30 pointer-events-none"
      style={{ left: position.x + 30, top: position.y - 10 }}
    >
      <div className="glass-card rounded-lg p-2.5 border border-border/50 shadow-xl min-w-[140px]">
        <div className="flex items-center gap-2 mb-1.5">
          <div className={`w-2 h-2 rounded-full ${
            status === 'failed' ? 'bg-destructive' :
            status === 'source' ? 'bg-primary' :
            status === 'dest' ? 'bg-accent' :
            'bg-success'
          }`} />
          <span className="font-display text-xs font-bold text-foreground">Node {nodeId}</span>
        </div>
        <div className="space-y-0.5 font-mono text-[9px]">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status:</span>
            <span className={`font-semibold ${
              status === 'failed' ? 'text-destructive' : 'text-success'
            }`}>{status.toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Congestion:</span>
            <span className="text-warning">{Math.round(congestionLevel * 100)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sent:</span>
            <span className="text-accent">{packetsSent}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Received:</span>
            <span className="text-success">{packetsReceived}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Dropped:</span>
            <span className="text-destructive">{packetsDropped}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
