import { useSim } from '@/context/SimContext';
import { generateTopology } from '@/lib/topologies';
import { dijkstraAlgo, bfsAlgo, floodingAlgo, buildRoutingTable } from '@/lib/algorithms';
import { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function ExportReport() {
  const { state } = useSim();
  const topo = useMemo(() => generateTopology(state.topology, state.nodeCount), [state.topology, state.nodeCount]);
  const nodeIds = topo.nodes.map(n => n.id);

  const exportToText = () => {
    const destination = state.destination === '__ALL__' ? 'B' : state.destination;
    const dij = dijkstraAlgo(topo.edges, state.source, destination, state.failedNodes, state.failedLinks);
    const bfs = bfsAlgo(topo.edges, state.source, destination, state.failedNodes, state.failedLinks);
    const flood = floodingAlgo(topo.edges, state.source, destination, state.failedNodes, state.failedLinks);
    const routingTable = buildRoutingTable(topo.edges, nodeIds, state.failedNodes, state.failedLinks);

    let report = `
╔══════════════════════════════════════════════════════════════╗
║              NETWORK TOPOLOGY SIMULATION REPORT              ║
╚══════════════════════════════════════════════════════════════╝

Generated: ${new Date().toLocaleString()}

━━━ TOPOLOGY CONFIGURATION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Type:        ${state.topology.toUpperCase()}
  Nodes:       ${state.nodeCount} (${nodeIds.join(', ')})
  Edges:       ${topo.edges.length}
  Source:      ${state.source}
  Destination: ${state.destination === '__ALL__' ? 'ALL (Broadcast)' : state.destination}
  Packet Size: ${state.packetSize} bytes
  Congestion:  ${state.congestion ? 'Enabled' : 'Disabled'}
  Failed Nodes: ${state.failedNodes.size > 0 ? [...state.failedNodes].join(', ') : 'None'}
  Failed Links: ${state.failedLinks.size > 0 ? [...state.failedLinks].join(', ') : 'None'}

━━━ ALGORITHM COMPARISON ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Algorithm    | Path                | Hops | Cost | Visited
  -------------|---------------------|------|------|--------
  Dijkstra     | ${(dij.path.join('→') || 'N/A').padEnd(19)} | ${String(dij.hops).padEnd(4)} | ${String(dij.totalWeight).padEnd(4)} | ${dij.nodesVisited}
  BFS          | ${(bfs.path.join('→') || 'N/A').padEnd(19)} | ${String(bfs.hops).padEnd(4)} | ${String(bfs.totalWeight).padEnd(4)} | ${bfs.nodesVisited}
  Flooding     | ${(flood.path.join('→') || 'N/A').padEnd(19)} | ${String(flood.hops).padEnd(4)} | ${String(flood.totalWeight).padEnd(4)} | ${flood.nodesVisited}

━━━ ROUTING TABLES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

    for (const src of nodeIds) {
      if (!routingTable[src]) continue;
      report += `\n  Node ${src}:\n`;
      report += `    Dest | Next Hop | Cost\n`;
      report += `    -----|----------|-----\n`;
      for (const [dst, info] of Object.entries(routingTable[src])) {
        report += `    ${dst.padEnd(4)} | ${info.nextHop.padEnd(8)} | ${info.cost}\n`;
      }
    }

    if (state.results.length > 0) {
      report += `\n━━━ SIMULATION HISTORY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
      state.results.forEach((r, i) => {
        report += `  Run #${i + 1}: ${r.success ? '✅' : '❌'} | Latency: ${r.latency}ms | Hops: ${r.hops} | Loss: ${r.packetLoss}% | Throughput: ${r.throughput} B/s\n`;
      });

      const avgLat = Math.round(state.results.reduce((s, r) => s + r.latency, 0) / state.results.length * 10) / 10;
      const avgLoss = Math.round(state.results.reduce((s, r) => s + r.packetLoss, 0) / state.results.length);
      report += `\n  Averages: Latency=${avgLat}ms, Loss=${avgLoss}%\n`;
    }

    report += `\n━━━ EDGE LIST ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
    topo.edges.forEach(e => {
      const failed = state.failedLinks.has(e.id) ? ' [FAILED]' : '';
      report += `  ${e.source} ↔ ${e.target}  (weight: ${e.weight})${failed}\n`;
    });

    report += `\n══════════════════════════════════════════════════════════════\n`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `network-sim-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={exportToText}
      className="px-4 py-2 rounded-lg text-[11px] font-display font-semibold bg-gradient-to-r from-accent/20 to-primary/20 text-foreground border border-accent/30 hover:border-accent/50 transition-all flex items-center gap-2"
    >
      <span>📄</span>
      <span>Export Report</span>
    </motion.button>
  );
}
