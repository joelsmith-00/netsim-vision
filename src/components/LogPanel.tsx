import { useSim } from '@/context/SimContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';

const typeColors = {
  info: 'text-primary',
  warning: 'text-warning',
  error: 'text-destructive',
  success: 'text-neon-green',
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
      transition={{ delay: 0.3 }}
      className="border-glow rounded-lg bg-card flex flex-col h-full"
    >
      <div className="p-3 border-b border-border">
        <h3 className="font-display text-xs font-bold tracking-wider text-primary text-glow-cyan">
          LIVE TRANSMISSION LOG
        </h3>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-1 font-mono text-xs min-h-0">
        {state.logs.length === 0 && (
          <p className="text-muted-foreground italic">Awaiting simulation...</p>
        )}
        <AnimatePresence>
          {state.logs.map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex gap-2 ${typeColors[log.type]}`}
            >
              <span className="text-muted-foreground shrink-0">[{String(log.time).padStart(3, '0')}]</span>
              <span>{log.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
