import type { SimEdge } from './topologies';

export interface AlgorithmResult {
  name: string;
  path: string[];
  hops: number;
  totalWeight: number;
  nodesVisited: number;
  success: boolean;
}

function buildAdj(edges: SimEdge[], failedNodes: Set<string>, failedLinks: Set<string>) {
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

export function dijkstraAlgo(edges: SimEdge[], src: string, dst: string, failedNodes: Set<string>, failedLinks: Set<string>): AlgorithmResult {
  const adj = buildAdj(edges, failedNodes, failedLinks);
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const visited = new Set<string>();
  const queue: string[] = [];

  for (const n of Object.keys(adj)) { dist[n] = Infinity; prev[n] = null; }
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
      if (alt < dist[v]) { dist[v] = alt; prev[v] = u; queue.push(v); }
    }
  }

  if (dist[dst] === Infinity || dist[dst] === undefined) {
    return { name: 'Dijkstra', path: [], hops: 0, totalWeight: 0, nodesVisited: visited.size, success: false };
  }

  const path: string[] = [];
  let curr: string | null = dst;
  while (curr) { path.unshift(curr); curr = prev[curr]; }
  return { name: 'Dijkstra', path, hops: path.length - 1, totalWeight: dist[dst], nodesVisited: visited.size, success: true };
}

export function bfsAlgo(edges: SimEdge[], src: string, dst: string, failedNodes: Set<string>, failedLinks: Set<string>): AlgorithmResult {
  const adj = buildAdj(edges, failedNodes, failedLinks);
  const visited = new Set<string>();
  const prev: Record<string, string | null> = {};
  const queue: string[] = [src];
  visited.add(src);
  prev[src] = null;

  while (queue.length > 0) {
    const u = queue.shift()!;
    if (u === dst) break;
    for (const { node: v } of (adj[u] || [])) {
      if (!visited.has(v)) {
        visited.add(v);
        prev[v] = u;
        queue.push(v);
      }
    }
  }

  if (!visited.has(dst)) {
    return { name: 'BFS', path: [], hops: 0, totalWeight: 0, nodesVisited: visited.size, success: false };
  }

  const path: string[] = [];
  let curr: string | null = dst;
  while (curr) { path.unshift(curr); curr = prev[curr]; }
  
  let totalWeight = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const edge = edges.find(e => 
      (e.source === path[i] && e.target === path[i+1]) || 
      (e.target === path[i] && e.source === path[i+1])
    );
    if (edge) totalWeight += edge.weight;
  }

  return { name: 'BFS', path, hops: path.length - 1, totalWeight, nodesVisited: visited.size, success: true };
}

export function floodingAlgo(edges: SimEdge[], src: string, dst: string, failedNodes: Set<string>, failedLinks: Set<string>): AlgorithmResult {
  const adj = buildAdj(edges, failedNodes, failedLinks);
  const visited = new Set<string>();
  let found = false;
  const prev: Record<string, string | null> = {};
  
  // Flooding visits ALL reachable nodes (broadcasts to all neighbors)
  const queue: string[] = [src];
  visited.add(src);
  prev[src] = null;

  while (queue.length > 0) {
    const u = queue.shift()!;
    for (const { node: v } of (adj[u] || [])) {
      if (!visited.has(v)) {
        visited.add(v);
        prev[v] = u;
        queue.push(v);
        if (v === dst) found = true;
      }
    }
  }

  if (!found) {
    return { name: 'Flooding', path: [], hops: 0, totalWeight: 0, nodesVisited: visited.size, success: false };
  }

  const path: string[] = [];
  let curr: string | null = dst;
  while (curr) { path.unshift(curr); curr = prev[curr]; }

  let totalWeight = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const edge = edges.find(e => 
      (e.source === path[i] && e.target === path[i+1]) || 
      (e.target === path[i] && e.source === path[i+1])
    );
    if (edge) totalWeight += edge.weight;
  }

  return { name: 'Flooding', path, hops: path.length - 1, totalWeight, nodesVisited: visited.size, success: true };
}

export function buildRoutingTable(edges: SimEdge[], nodeIds: string[], failedNodes: Set<string>, failedLinks: Set<string>): Record<string, Record<string, { nextHop: string; cost: number }>> {
  const table: Record<string, Record<string, { nextHop: string; cost: number }>> = {};
  
  for (const src of nodeIds) {
    if (failedNodes.has(src)) continue;
    table[src] = {};
    for (const dst of nodeIds) {
      if (src === dst || failedNodes.has(dst)) continue;
      const result = dijkstraAlgo(edges, src, dst, failedNodes, failedLinks);
      if (result.success && result.path.length >= 2) {
        table[src][dst] = { nextHop: result.path[1], cost: result.totalWeight };
      }
    }
  }
  return table;
}
