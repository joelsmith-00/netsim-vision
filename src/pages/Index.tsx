import { SimProvider } from '@/context/SimContext';
import ControlPanel from '@/components/ControlPanel';
import NetworkCanvas from '@/components/NetworkCanvas';
import LogPanel from '@/components/LogPanel';
import MetricsPanel from '@/components/MetricsPanel';
import AlgorithmComparison from '@/components/AlgorithmComparison';
import RoutingTableDisplay from '@/components/RoutingTableDisplay';
import QueueVisualization from '@/components/QueueVisualization';
import PerformanceDashboard from '@/components/PerformanceDashboard';
import ExportReport from '@/components/ExportReport';
import { motion } from 'framer-motion';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Index() {
  return (
    <SimProvider>
      <div className="min-h-screen bg-background hero-gradient relative overflow-hidden">
        <div className="grid-bg fixed inset-0 pointer-events-none" />
        <div className="scan-line fixed inset-0 pointer-events-none z-50 h-[200%]" />
        <div className="fixed top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent z-50" />

        <div className="relative z-10 flex flex-col h-screen p-3 md:p-4 gap-3 overflow-hidden">
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
            <ExportReport />
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-neon" />
              <span className="font-mono text-[10px] text-muted-foreground">SYSTEM ONLINE</span>
            </div>
          </motion.header>

          {/* Control Panel */}
          <div className="shrink-0">
            <ControlPanel />
          </div>

          {/* Main content area */}
          <div className="flex-1 min-h-0">
            <ResizablePanelGroup direction="horizontal" className="h-full rounded-xl">
              {/* Left: Network + Analysis tabs */}
              <ResizablePanel defaultSize={65} minSize={35}>
                <div className="h-full flex flex-col gap-3">
                  <div className="flex-1 min-h-0">
                    <NetworkCanvas />
                  </div>
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle className="mx-1 bg-border/30 hover:bg-primary/30 transition-colors" />

              {/* Right sidebar: Tabbed panels */}
              <ResizablePanel defaultSize={35} minSize={22}>
                <Tabs defaultValue="logs" className="h-full flex flex-col">
                  <TabsList className="shrink-0 bg-card/50 border border-border/30 rounded-lg p-0.5 gap-0.5">
                    <TabsTrigger value="logs" className="text-[10px] px-2.5 py-1 font-display">Logs</TabsTrigger>
                    <TabsTrigger value="routing" className="text-[10px] px-2.5 py-1 font-display">Routing Table</TabsTrigger>
                    <TabsTrigger value="queue" className="text-[10px] px-2.5 py-1 font-display">Queue</TabsTrigger>
                  </TabsList>
                  <TabsContent value="logs" className="flex-1 min-h-0 mt-2">
                    <LogPanel />
                  </TabsContent>
                  <TabsContent value="routing" className="flex-1 min-h-0 mt-2">
                    <RoutingTableDisplay />
                  </TabsContent>
                  <TabsContent value="queue" className="flex-1 min-h-0 mt-2">
                    <QueueVisualization />
                  </TabsContent>
                </Tabs>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>

          {/* Bottom: Algorithm comparison + Performance Dashboard */}
          <div className="shrink-0 grid grid-cols-1 lg:grid-cols-2 gap-3">
            <AlgorithmComparison />
            <PerformanceDashboard />
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
