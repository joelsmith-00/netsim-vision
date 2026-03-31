import { SimProvider } from '@/context/SimContext';
import ControlPanel from '@/components/ControlPanel';
import NetworkCanvas from '@/components/NetworkCanvas';
import LogPanel from '@/components/LogPanel';
import MetricsPanel from '@/components/MetricsPanel';
import { motion } from 'framer-motion';

export default function Index() {
  return (
    <SimProvider>
      <div className="min-h-screen bg-background grid-bg relative">
        {/* Scan line overlay */}
        <div className="scan-line fixed inset-0 pointer-events-none z-50 h-[200%]" />

        <div className="relative z-10 flex flex-col h-screen p-3 gap-3 overflow-hidden">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 shrink-0"
          >
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse-neon" />
            <h1 className="font-display text-sm md:text-base font-bold tracking-[0.2em] text-primary text-glow-cyan">
              INTELLIGENT NETWORK TOPOLOGY SIMULATOR
            </h1>
            <div className="flex-1 h-px bg-gradient-to-r from-primary/40 to-transparent" />
            <span className="font-mono text-[10px] text-muted-foreground">v1.0</span>
          </motion.header>

          {/* Control Panel */}
          <div className="shrink-0">
            <ControlPanel />
          </div>

          {/* Main content */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3 min-h-0">
            <NetworkCanvas />
            <LogPanel />
          </div>

          {/* Metrics */}
          <div className="shrink-0">
            <MetricsPanel />
          </div>
        </div>
      </div>
    </SimProvider>
  );
}
