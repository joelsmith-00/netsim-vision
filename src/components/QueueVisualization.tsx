import { useSim } from '@/context/SimContext';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface QueuePacket {
  id: number;
  from: string;
  to: string;
  size: number;
  status: 'queued' | 'sending' | 'delivered' | 'dropped';
  delay: number;
}

export default function QueueVisualization() {
  const { state } = useSim();
  const [packets, setPackets] = useState<QueuePacket[]>([]);
  const [bufferUsage, setBufferUsage] = useState(0);
  const counterRef = useRef(0);
  const BUFFER_MAX = 8;

  const addMultiPackets = () => {
    const count = 3 + Math.floor(Math.random() * 4);
    const newPackets: QueuePacket[] = [];
    for (let i = 0; i < count; i++) {
      counterRef.current++;
      newPackets.push({
        id: counterRef.current,
        from: state.source,
        to: state.destination === '__ALL__' ? String.fromCharCode(65 + Math.floor(Math.random() * state.nodeCount)) : state.destination,
        size: 64 + Math.floor(Math.random() * 512),
        status: 'queued',
        delay: Math.floor(Math.random() * 50) + 5,
      });
    }
    setPackets(prev => {
      const combined = [...prev.filter(p => p.status !== 'delivered' && p.status !== 'dropped'), ...newPackets];
      const overflow = combined.length - BUFFER_MAX;
      if (overflow > 0) {
        for (let i = 0; i < overflow; i++) {
          const idx = combined.findIndex(p => p.status === 'queued');
          if (idx >= 0) combined[idx].status = 'dropped';
        }
      }
      return combined;
    });
  };

  // Process queue
  useEffect(() => {
    const interval = setInterval(() => {
      setPackets(prev => {
        const next = [...prev];
        const sending = next.find(p => p.status === 'sending');
        if (!sending) {
          const queued = next.find(p => p.status === 'queued');
          if (queued) queued.status = 'sending';
        } else {
          sending.delay -= 10;
          if (sending.delay <= 0) {
            sending.status = state.congestion && Math.random() < 0.2 ? 'dropped' : 'delivered';
          }
        }
        return next.filter(p => {
          if (p.status === 'delivered' || p.status === 'dropped') {
            setTimeout(() => setPackets(pp => pp.filter(x => x.id !== p.id)), 1500);
          }
          return true;
        });
      });
    }, 300);
    return () => clearInterval(interval);
  }, [state.congestion]);

  useEffect(() => {
    const active = packets.filter(p => p.status === 'queued' || p.status === 'sending').length;
    setBufferUsage(Math.min(active / BUFFER_MAX * 100, 100));
  }, [packets]);

  const statusColors: Record<string, string> = {
    queued: 'bg-muted border-border',
    sending: 'bg-primary/20 border-primary animate-pulse',
    delivered: 'bg-success/20 border-success',
    dropped: 'bg-destructive/20 border-destructive',
  };

  const statusIcons: Record<string, string> = {
    queued: '⏳',
    sending: '📡',
    delivered: '✅',
    dropped: '❌',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card gradient-border rounded-xl p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Packet Queue
        </h3>
        <button
          onClick={addMultiPackets}
          className="px-3 py-1 rounded-md text-[10px] font-display font-semibold bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30 transition-colors"
        >
          📦 Flood Queue
        </button>
      </div>

      {/* Buffer bar */}
      <div className="mb-3">
        <div className="flex justify-between text-[9px] font-mono text-muted-foreground mb-1">
          <span>Buffer Usage</span>
          <span>{Math.round(bufferUsage)}% ({packets.filter(p => p.status === 'queued' || p.status === 'sending').length}/{BUFFER_MAX})</span>
        </div>
        <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
          <motion.div
            className={`h-full rounded-full transition-colors ${
              bufferUsage > 80 ? 'bg-destructive' : bufferUsage > 50 ? 'bg-warning' : 'bg-success'
            }`}
            animate={{ width: `${bufferUsage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Packet list */}
      <div className="space-y-1 max-h-32 overflow-y-auto">
        <AnimatePresence>
          {packets.length === 0 && (
            <p className="text-[10px] text-muted-foreground/50 italic text-center py-3">
              Click "Flood Queue" to simulate multi-packet congestion
            </p>
          )}
          {packets.map(p => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className={`flex items-center gap-2 px-2 py-1 rounded-md border text-[10px] font-mono ${statusColors[p.status]}`}
            >
              <span>{statusIcons[p.status]}</span>
              <span className="text-foreground">#{p.id}</span>
              <span className="text-muted-foreground">{p.from}→{p.to}</span>
              <span className="text-muted-foreground/60">{p.size}B</span>
              <span className="ml-auto text-muted-foreground">{p.delay > 0 ? `${p.delay}ms` : p.status}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
