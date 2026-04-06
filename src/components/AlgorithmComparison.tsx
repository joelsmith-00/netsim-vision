import { useSim } from '@/context/SimContext';
import { generateTopology } from '@/lib/topologies';
import { dijkstraAlgo, bfsAlgo, floodingAlgo } from '@/lib/algorithms';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

const ALGO_COLORS = ['hsl(270, 60%, 60%)', 'hsl(200, 90%, 55%)', 'hsl(155, 65%, 48%)'];

export default function AlgorithmComparison() {
  const { state } = useSim();
  const topo = useMemo(() => generateTopology(state.topology, state.nodeCount), [state.topology, state.nodeCount]);
  const nodeIds = topo.nodes.map(n => n.id);

  const destination = state.destination === '__ALL__' ? (nodeIds.find(id => id !== state.source) || 'B') : state.destination;

  const results = useMemo(() => [
    dijkstraAlgo(topo.edges, state.source, destination, state.failedNodes, state.failedLinks),
    bfsAlgo(topo.edges, state.source, destination, state.failedNodes, state.failedLinks),
    floodingAlgo(topo.edges, state.source, destination, state.failedNodes, state.failedLinks),
  ], [topo, state.source, destination, state.failedNodes, state.failedLinks]);

  const chartData = results.map((r, i) => ({
    name: r.name,
    hops: r.hops,
    weight: r.totalWeight,
    visited: r.nodesVisited,
    color: ALGO_COLORS[i],
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card gradient-border rounded-xl p-4"
    >
      <h3 className="font-display text-xs font-semibold tracking-wide text-muted-foreground uppercase mb-3">
        Algorithm Comparison
        <span className="ml-2 text-primary font-mono normal-case">{state.source} → {destination}</span>
      </h3>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {results.map((r, i) => (
          <div key={r.name} className="rounded-lg p-2.5 border border-border/30 bg-muted/20">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: ALGO_COLORS[i] }} />
              <span className="font-display text-[10px] font-semibold text-foreground">{r.name}</span>
            </div>
            <div className="space-y-0.5 font-mono text-[10px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Path:</span>
                <span className="text-foreground">{r.success ? r.path.join('→') : 'No path'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hops:</span>
                <span className="text-foreground">{r.hops}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cost:</span>
                <span className="text-foreground">{r.totalWeight}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Visited:</span>
                <span className="text-foreground">{r.nodesVisited} nodes</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="h-28">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(260, 18%, 14%)" />
            <XAxis dataKey="name" tick={{ fill: 'hsl(260, 10%, 50%)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'hsl(260, 10%, 40%)', fontSize: 9 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: 'hsl(260, 22%, 12%)',
                border: '1px solid hsl(260, 18%, 20%)',
                borderRadius: 8,
                fontSize: 10,
                fontFamily: 'JetBrains Mono',
              }}
            />
            <Bar dataKey="hops" name="Hops" radius={[4, 4, 0, 0]}>
              {chartData.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.8} />)}
            </Bar>
            <Bar dataKey="visited" name="Nodes Visited" radius={[4, 4, 0, 0]}>
              {chartData.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.4} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
