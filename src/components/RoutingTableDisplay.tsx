import { useSim } from '@/context/SimContext';
import { generateTopology } from '@/lib/topologies';
import { buildRoutingTable } from '@/lib/algorithms';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

export default function RoutingTableDisplay() {
  const { state } = useSim();
  const topo = useMemo(() => generateTopology(state.topology, state.nodeCount), [state.topology, state.nodeCount]);
  const nodeIds = topo.nodes.map(n => n.id);

  const table = useMemo(
    () => buildRoutingTable(topo.edges, nodeIds, state.failedNodes, state.failedLinks),
    [topo, nodeIds, state.failedNodes, state.failedLinks]
  );

  const activeNodes = nodeIds.filter(id => !state.failedNodes.has(id));
  const [selectedNode, setSelectedNode] = useState(activeNodes[0] || 'A');

  const entries = table[selectedNode] || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card gradient-border rounded-xl p-4 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Routing Table
        </h3>
        <div className="flex gap-1">
          {activeNodes.map(id => (
            <button
              key={id}
              onClick={() => setSelectedNode(id)}
              className={`w-6 h-6 rounded-md text-[10px] font-display font-bold transition-all ${
                selectedNode === id
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-[10px] font-mono">
          <thead>
            <tr className="border-b border-border/30">
              <th className="text-left py-1.5 text-muted-foreground font-medium">Dest</th>
              <th className="text-left py-1.5 text-muted-foreground font-medium">Next Hop</th>
              <th className="text-right py-1.5 text-muted-foreground font-medium">Cost</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(entries).map(([dst, info]) => (
              <tr
                key={dst}
                className={`border-b border-border/10 ${
                  state.activePath.includes(dst) ? 'bg-primary/5' : ''
                }`}
              >
                <td className="py-1.5 text-foreground font-semibold">{dst}</td>
                <td className="py-1.5 text-accent">{info.nextHop}</td>
                <td className="py-1.5 text-right text-warning">{info.cost}</td>
              </tr>
            ))}
            {Object.keys(entries).length === 0 && (
              <tr>
                <td colSpan={3} className="py-4 text-center text-muted-foreground/50 italic">
                  No routes available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
