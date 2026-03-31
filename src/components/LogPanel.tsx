import { useSim } from '@/context/SimContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';

const typeColors: Record<string, string> = {
  info: 'text-accent',
  warning: 'text-warning',
  error: 'text-destructive',
  success: 'text-success',
};

const typeDots: Record<string, string> = {
  info: 'bg-accent',
  warning: 'bg-warning',
  error: 'bg-destructive',
  success: 'bg-success',
};

export default function LogPanel() {
  const { state } = useSim();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.logs.length]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="glass-card gradient-border rounded-xl flex flex-col h-full"
    >
      <div className="p-4 border-b border-border/30">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Transmission Log
          </h3>
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${state.isRunning ? 'bg-warning animate-pulse' : 'bg-success'}`} />
            <span className="font-mono text-[9px] text-muted-foreground">
              {state.isRunning ? 'ACTIVE' : 'IDLE'}
            </span>
          </div>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1.5 font-mono text-[11px] min-h-0">
        {state.logs.length === 0 && (
          <p className="text-muted-foreground/50 italic text-center py-8">
            Awaiting simulation...
          </p>
        )}
        <AnimatePresence>
          {state.logs.map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-start gap-2 py-0.5"
            >
              <div className={`w-1 h-1 rounded-full mt-1.5 shrink-0 ${typeDots[log.type]}`} />
              <span className="text-muted-foreground/40 shrink-0 tabular-nums">{String(log.time).padStart(3, '0')}</span>
              <span className={typeColors[log.type]}>{log.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
