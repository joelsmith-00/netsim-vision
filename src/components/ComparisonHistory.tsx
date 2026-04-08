import { useSim } from '@/context/SimContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface SavedRun {
  id: number;
  topology: string;
  source: string;
  destination: string;
  latency: number;
  hops: number;
  packetLoss: number;
  throughput: number;
  success: boolean;
  timestamp: number;
  failedNodes: number;
  failedLinks: number;
}

export default function ComparisonHistory() {
  const { state } = useSim();
  const [savedRuns, setSavedRuns] = useState<SavedRun[]>([]);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedRuns, setSelectedRuns] = useState<Set<number>>(new Set());

  const saveCurrentRun = () => {
    if (!state.metrics) return;
    const run: SavedRun = {
      id: Date.now(),
      topology: state.topology,
      source: state.source,
      destination: state.destination,
      latency: state.metrics.latency,
      hops: state.metrics.hops,
      packetLoss: state.metrics.packetLoss,
      throughput: state.metrics.throughput,
      success: state.metrics.packetLoss < 100,
      timestamp: Date.now(),
      failedNodes: state.failedNodes.size,
      failedLinks: state.failedLinks.size,
    };
    setSavedRuns(prev => [...prev, run]);
  };

  const toggleSelect = (id: number) => {
    setSelectedRuns(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 3) next.add(id);
      return next;
    });
  };

  const selected = savedRuns.filter(r => selectedRuns.has(r.id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card gradient-border rounded-xl p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Comparison History
        </h3>
        <div className="flex gap-2">
          <button
            onClick={saveCurrentRun}
            disabled={!state.metrics}
            className="px-2.5 py-1 rounded-md text-[10px] font-display font-semibold bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            💾 Save Run
          </button>
          {savedRuns.length >= 2 && (
            <button
              onClick={() => setCompareMode(!compareMode)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-display font-semibold border transition-colors ${
                compareMode 
                  ? 'bg-accent/20 text-accent border-accent/30' 
                  : 'bg-muted text-muted-foreground border-border/30 hover:bg-muted/80'
              }`}
            >
              ⚡ Compare
            </button>
          )}
        </div>
      </div>

      {savedRuns.length === 0 ? (
        <p className="text-[10px] text-muted-foreground/50 italic text-center py-4">
          Run a simulation and click "Save Run" to start comparing
        </p>
      ) : (
        <div className="space-y-1.5 max-h-40 overflow-y-auto">
          <AnimatePresence>
            {savedRuns.map((run, i) => (
              <motion.div
                key={run.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md border text-[10px] font-mono cursor-pointer transition-all ${
                  selectedRuns.has(run.id)
                    ? 'bg-primary/10 border-primary/40'
                    : 'bg-muted/20 border-border/20 hover:border-border/40'
                }`}
                onClick={() => compareMode && toggleSelect(run.id)}
              >
                {compareMode && (
                  <div className={`w-3 h-3 rounded-sm border flex items-center justify-center text-[7px] ${
                    selectedRuns.has(run.id) ? 'bg-primary border-primary text-primary-foreground' : 'border-border'
                  }`}>
                    {selectedRuns.has(run.id) && '✓'}
                  </div>
                )}
                <span className="text-muted-foreground">#{i + 1}</span>
                <span className="text-foreground font-semibold uppercase">{run.topology}</span>
                <span className="text-accent">{run.source}→{run.destination}</span>
                <span className={run.success ? 'text-success' : 'text-destructive'}>{run.success ? '✅' : '❌'}</span>
                <span className="ml-auto text-primary">{run.latency}ms</span>
                <span className="text-warning">{run.hops}h</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Comparison table */}
      {compareMode && selected.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 border-t border-border/20 pt-3"
        >
          <p className="text-[9px] font-mono text-muted-foreground mb-2">Side-by-Side Comparison</p>
          <table className="w-full text-[9px] font-mono">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left py-1 text-muted-foreground">Metric</th>
                {selected.map((r, i) => (
                  <th key={r.id} className="text-right py-1 text-foreground">Run #{savedRuns.indexOf(r) + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Topology', key: 'topology' },
                { label: 'Latency', key: 'latency', suffix: 'ms' },
                { label: 'Hops', key: 'hops' },
                { label: 'Packet Loss', key: 'packetLoss', suffix: '%' },
                { label: 'Throughput', key: 'throughput', suffix: ' B/s' },
                { label: 'Failed Nodes', key: 'failedNodes' },
                { label: 'Failed Links', key: 'failedLinks' },
              ].map(metric => (
                <tr key={metric.label} className="border-b border-border/10">
                  <td className="py-1 text-muted-foreground">{metric.label}</td>
                  {selected.map(r => {
                    const val = r[metric.key as keyof SavedRun];
                    return (
                      <td key={r.id} className="text-right py-1 text-foreground">
                        {typeof val === 'string' ? val.toUpperCase() : val}{metric.suffix || ''}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </motion.div>
  );
}
