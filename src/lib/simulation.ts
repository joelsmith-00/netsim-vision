import type { SimEdge } from './topologies';

export interface SimulationResult {
  path: string[];
  hops: number;
  latency: number;
  packetLoss: number;
  throughput: number;
  logs: LogEntry[];
  success: boolean;
  fragments: number;
}

export interface LogEntry {
  time: number;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
}

interface SimConfig {
  source: string;
  destination: string;
  edges: SimEdge[];
  nodeIds: string[];
  failedNodes: Set<string>;
  failedLinks: Set<string>;
  congestion: boolean;
  packetSize: number;
  topology: string;
}

function buildAdjacency(edges: SimEdge[], failedNodes: Set<string>, failedLinks: Set<string>) {
  const adj: Record<string, { node: string; weight: number }[]> = {};
  for (const e of edges) {
    if (failedNodes.has(e.source) || failedNodes.has(e.target)) continue;
    if (failedLinks.has(e.id)) continue;
    if (!adj[e.source]) adj[e.source] = [];
    if (!adj[e.target]) adj[e.target] = [];
    adj[e.source].push({ node: e.target, weight: e.weight });
    adj[e.target].push({ node: e.source, weight: e.weight });
  }
  return adj;
}

function dijkstra(adj: Record<string, { node: string; weight: number }[]>, src: string, dst: string): string[] | null {
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const visited = new Set<string>();
  const queue: string[] = [];

  for (const n of Object.keys(adj)) {
    dist[n] = Infinity;
    prev[n] = null;
  }
  dist[src] = 0;
  queue.push(src);

  while (queue.length > 0) {
    queue.sort((a, b) => dist[a] - dist[b]);
    const u = queue.shift()!;
    if (visited.has(u)) continue;
    visited.add(u);
    if (u === dst) break;

    for (const { node: v, weight } of (adj[u] || [])) {
      if (visited.has(v)) continue;
      const alt = dist[u] + weight;
      if (alt < dist[v]) {
        dist[v] = alt;
        prev[v] = u;
        queue.push(v);
      }
    }
  }

  if (dist[dst] === Infinity || dist[dst] === undefined) return null;

  const path: string[] = [];
  let curr: string | null = dst;
  while (curr) {
    path.unshift(curr);
    curr = prev[curr];
  }
  return path;
}

export function runSimulation(config: SimConfig): SimulationResult {
  const logs: LogEntry[] = [];
  let t = 0;
  const addLog = (type: LogEntry['type'], msg: string) => {
    logs.push({ time: t, type, message: msg });
    t += 1;
  };

  const { source, destination, edges, failedNodes, failedLinks, congestion, packetSize } = config;

  if (failedNodes.has(source)) {
    addLog('error', `Source node ${source} is failed — cannot send packet`);
    return { path: [], hops: 0, latency: 0, packetLoss: 100, throughput: 0, logs, success: false, fragments: 0 };
  }
  if (failedNodes.has(destination)) {
    addLog('error', `Destination node ${destination} is failed — unreachable`);
    return { path: [], hops: 0, latency: 0, packetLoss: 100, throughput: 0, logs, success: false, fragments: 0 };
  }

  addLog('info', `📦 Packet created at Node ${source} (${packetSize} bytes)`);

  const fragments = Math.ceil(packetSize / 512);
  if (fragments > 1) {
    addLog('info', `🔪 Packet fragmented into ${fragments} parts (MTU: 512 bytes)`);
  }

  const adj = buildAdjacency(edges, failedNodes, failedLinks);
  const path = dijkstra(adj, source, destination);

  if (!path) {
    addLog('error', `❌ No route from ${source} to ${destination} — network partition detected`);
    return { path: [], hops: 0, latency: 0, packetLoss: 100, throughput: 0, logs, success: false, fragments };
  }

  addLog('success', `🗺️ Route calculated: ${path.join(' → ')}`);

  let totalLatency = 0;
  let dropped = false;

  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i];
    const to = path[i + 1];
    let hopDelay = 10 + Math.random() * 5;

    addLog('info', `📡 Forwarding from ${from} → ${to}`);

    if (congestion && Math.random() < 0.3) {
      const congestionDelay = 20 + Math.random() * 30;
      hopDelay += congestionDelay;
      addLog('warning', `⚠️ Congestion at ${from} — queue delay +${congestionDelay.toFixed(0)}ms`);
    }

    if (config.topology === 'bus' && Math.random() < 0.15) {
      addLog('warning', `💥 Collision detected on bus between ${from}-${to}`);
      const retryDelay = 5 + Math.random() * 15;
      hopDelay += retryDelay;
      addLog('info', `🔄 Retransmitting after ${retryDelay.toFixed(0)}ms backoff`);
    }

    if (Math.random() < 0.05) {
      addLog('error', `📉 Packet dropped at ${to} — retransmitting`);
      hopDelay += 20;
    }

    totalLatency += hopDelay;
  }

  if (!dropped) {
    addLog('success', `✅ Packet delivered to ${destination} in ${totalLatency.toFixed(1)}ms`);
  }

  const hops = path.length - 1;
  const packetLoss = dropped ? 100 : Math.random() < 0.05 ? 5 : 0;
  const throughput = packetSize / (totalLatency / 1000);

  return {
    path,
    hops,
    latency: Math.round(totalLatency * 10) / 10,
    packetLoss,
    throughput: Math.round(throughput),
    logs,
    success: !dropped,
    fragments,
  };
}
