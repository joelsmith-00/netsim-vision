import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  {
    title: 'Welcome to Network Topology Simulator',
    desc: 'This tool lets you simulate and analyze network routing algorithms across different topologies. Follow this guide to learn all features!',
    icon: '👋',
  },
  {
    title: 'Control Panel',
    desc: 'Choose your topology (Star, Bus, Ring, Mesh, Tree, Hybrid), set node count, select source/destination, and configure packet size. Toggle congestion simulation and path visibility.',
    icon: '🎛️',
  },
  {
    title: 'Network Canvas',
    desc: 'The interactive graph shows your network. Click nodes or edges to simulate failures — the system auto-reroutes! Watch the animated packet travel along the calculated path.',
    icon: '🕸️',
  },
  {
    title: 'Failure Simulation',
    desc: 'Click any node (except source/destination) or edge to toggle failure. Red dashed lines = failed links. The routing algorithms recalculate paths automatically.',
    icon: '💥',
  },
  {
    title: 'Congestion Heatmap',
    desc: 'Enable congestion to see real-time color coding (green→yellow→red) on nodes and edges based on simulated traffic load.',
    icon: '🌡️',
  },
  {
    title: 'Algorithm Comparison',
    desc: 'See Dijkstra, BFS, and Flooding algorithms compared side-by-side with metrics: path, hops, cost, and nodes visited.',
    icon: '📊',
  },
  {
    title: 'Routing Table',
    desc: 'View the routing table for each node — showing destination, next hop, and cost. Tables update in real-time as you change topology or fail nodes.',
    icon: '📋',
  },
  {
    title: 'Packet Queue',
    desc: 'Simulate multi-packet congestion with the Flood Queue button. Watch buffer usage, queuing delays, and packet drops in real-time.',
    icon: '📦',
  },
  {
    title: 'Performance Dashboard',
    desc: 'Run multiple simulations to see latency trends, hop counts, and fragment analysis across simulation runs with interactive charts.',
    icon: '📈',
  },
  {
    title: 'Export Report',
    desc: 'Download a comprehensive text report with topology config, algorithm comparison, routing tables, and simulation history. Perfect for documentation!',
    icon: '📄',
  },
  {
    title: 'You\'re Ready!',
    desc: 'Start by selecting a topology, setting source/destination, and clicking "Send Packet". Try failing nodes, enabling congestion, and comparing algorithms. Have fun!',
    icon: '🚀',
  },
];

export default function GuidedTutorial() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => { setIsOpen(true); setStep(0); }}
        className="px-3 py-1.5 rounded-lg text-[10px] font-display font-semibold bg-gradient-to-r from-warning/20 to-accent/20 text-foreground border border-warning/30 hover:border-warning/50 transition-all flex items-center gap-1.5"
      >
        <span>🎓</span>
        <span>Tutorial</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card gradient-border rounded-2xl p-6 max-w-md w-full mx-4 relative"
            >
              {/* Progress bar */}
              <div className="flex gap-1 mb-4">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      i <= step ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>

              {/* Step content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-4xl mb-3">{STEPS[step].icon}</div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-2">
                    {STEPS[step].title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    {STEPS[step].desc}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-muted-foreground">
                  {step + 1} / {STEPS.length}
                </span>
                <div className="flex gap-2">
                  {step > 0 && (
                    <button
                      onClick={() => setStep(s => s - 1)}
                      className="px-4 py-2 rounded-lg text-xs font-display font-semibold bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                    >
                      ← Back
                    </button>
                  )}
                  {step < STEPS.length - 1 ? (
                    <button
                      onClick={() => setStep(s => s + 1)}
                      className="px-4 py-2 rounded-lg text-xs font-display font-semibold bg-gradient-to-r from-primary to-accent text-primary-foreground hover:brightness-110 transition-all"
                    >
                      Next →
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 rounded-lg text-xs font-display font-semibold bg-gradient-to-r from-success to-accent text-primary-foreground hover:brightness-110 transition-all"
                    >
                      Start Exploring! 🚀
                    </button>
                  )}
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-3 right-3 w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors text-xs"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
