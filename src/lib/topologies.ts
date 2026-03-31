export type TopologyType = 'star' | 'bus' | 'ring' | 'mesh' | 'tree' | 'hybrid';

export interface SimNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface SimEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
}

export interface Topology {
  nodes: SimNode[];
  edges: SimEdge[];
}

const nodeLabel = (i: number) => String.fromCharCode(65 + i);

export function generateTopology(type: TopologyType, count: number): Topology {
  const n = Math.max(3, Math.min(count, 12));
  switch (type) {
    case 'star': return generateStar(n);
    case 'bus': return generateBus(n);
    case 'ring': return generateRing(n);
    case 'mesh': return generateMesh(n);
    case 'tree': return generateTree(n);
    case 'hybrid': return generateHybrid(n);
  }
}

function generateStar(n: number): Topology {
  const cx = 400, cy = 300, r = 200;
  const nodes: SimNode[] = [{ id: 'A', label: 'A (Hub)', x: cx, y: cy }];
  const edges: SimEdge[] = [];
  for (let i = 1; i < n; i++) {
    const angle = ((i - 1) / (n - 1)) * Math.PI * 2;
    const id = nodeLabel(i);
    nodes.push({ id, label: id, x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
    edges.push({ id: `A-${id}`, source: 'A', target: id, weight: 1 });
  }
  return { nodes, edges };
}

function generateBus(n: number): Topology {
  const nodes: SimNode[] = [];
  const edges: SimEdge[] = [];
  const spacing = 700 / (n - 1);
  for (let i = 0; i < n; i++) {
    const id = nodeLabel(i);
    nodes.push({ id, label: id, x: 50 + i * spacing, y: 300 });
    if (i > 0) {
      const prev = nodeLabel(i - 1);
      edges.push({ id: `${prev}-${id}`, source: prev, target: id, weight: 1 });
    }
  }
  return { nodes, edges };
}

function generateRing(n: number): Topology {
  const cx = 400, cy = 300, r = 200;
  const nodes: SimNode[] = [];
  const edges: SimEdge[] = [];
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    const id = nodeLabel(i);
    nodes.push({ id, label: id, x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
    if (i > 0) {
      const prev = nodeLabel(i - 1);
      edges.push({ id: `${prev}-${id}`, source: prev, target: id, weight: 1 });
    }
  }
  edges.push({ id: `${nodeLabel(n - 1)}-${nodeLabel(0)}`, source: nodeLabel(n - 1), target: nodeLabel(0), weight: 1 });
  return { nodes, edges };
}

function generateMesh(n: number): Topology {
  const cx = 400, cy = 300, r = 220;
  const nodes: SimNode[] = [];
  const edges: SimEdge[] = [];
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    const id = nodeLabel(i);
    nodes.push({ id, label: id, x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
  }
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const a = nodeLabel(i), b = nodeLabel(j);
      edges.push({ id: `${a}-${b}`, source: a, target: b, weight: Math.floor(Math.random() * 5) + 1 });
    }
  }
  return { nodes, edges };
}

function generateTree(n: number): Topology {
  const nodes: SimNode[] = [];
  const edges: SimEdge[] = [];
  for (let i = 0; i < n; i++) {
    const id = nodeLabel(i);
    const level = Math.floor(Math.log2(i + 1));
    const posInLevel = i - (Math.pow(2, level) - 1);
    const levelSize = Math.pow(2, level);
    const x = 400 + (posInLevel - (levelSize - 1) / 2) * (600 / (levelSize + 1));
    const y = 80 + level * 140;
    nodes.push({ id, label: id, x, y });
    if (i > 0) {
      const parent = nodeLabel(Math.floor((i - 1) / 2));
      edges.push({ id: `${parent}-${id}`, source: parent, target: id, weight: 1 });
    }
  }
  return { nodes, edges };
}

function generateHybrid(n: number): Topology {
  const half = Math.ceil(n / 2);
  const ring = generateRing(half);
  const nodes = [...ring.nodes];
  const edges = [...ring.edges];
  // Add star spokes from node A
  for (let i = half; i < n; i++) {
    const id = nodeLabel(i);
    const angle = ((i - half) / (n - half)) * Math.PI - Math.PI / 2;
    nodes.push({ id, label: id, x: 400 + Math.cos(angle) * 120, y: 300 + Math.sin(angle) * 120 });
    edges.push({ id: `A-${id}`, source: 'A', target: id, weight: 1 });
  }
  return { nodes, edges };
}
