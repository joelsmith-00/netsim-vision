import { SimProvider } from '@/context/SimContext';
import ControlPanel from '@/components/ControlPanel';
import NetworkCanvas from '@/components/NetworkCanvas';
import LogPanel from '@/components/LogPanel';
import MetricsPanel from '@/components/MetricsPanel';
import { motion } from 'framer-motion';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

export default function Index() {
  return (
    <SimProvider>
      <div className="min-h-screen bg-background hero-gradient relative overflow-hidden">
        {/* Subtle grid overlay */}
        <div className="grid-bg fixed inset-0 pointer-events-none" />
        
        {/* Scan line overlay */}
        <div className="scan-line fixed inset-0 pointer-events-none z-50 h-[200%]" />
        
        {/* Top gradient accent line */}
        <div className="fixed top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent z-50" />

        <div className="relative z-10 flex flex-col h-screen p-4 md:p-5 gap-4 overflow-hidden">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4 shrink-0"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="5" r="2" />
                  <circle cx="5" cy="19" r="2" />
                  <circle cx="19" cy="19" r="2" />
                  <line x1="12" y1="7" x2="5" y2="17" />
                  <line x1="12" y1="7" x2="19" y2="17" />
                  <line x1="5" y1="19" x2="19" y2="19" />
                </svg>
              </div>
              <div>
                <h1 className="font-display text-sm md:text-base font-bold tracking-tight text-foreground">
                  Network Topology Simulator
                </h1>
                <p className="text-[10px] text-muted-foreground tracking-wide">
                  Intelligent routing & failure analysis
                </p>
              </div>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-neon" />
              <span className="font-mono text-[10px] text-muted-foreground">SYSTEM ONLINE</span>
            </div>
          </motion.header>

          {/* Control Panel */}
          <div className="shrink-0">
            <ControlPanel />
          </div>

          {/* Main content */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 min-h-0">
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
