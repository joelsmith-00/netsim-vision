import { useMemo, useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  type NodeTypes,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useSim } from '@/context/SimContext';
import { generateTopology } from '@/lib/topologies';
import { motion, AnimatePresence } from 'framer-motion';

function NetworkNode({ data }: { data: { label: string; status: 'active' | 'failed' | 'source' | 'dest' | 'path' | 'default' } }) {
  const styles: Record<string, string> = {
    active: 'bg-success/20 border-success shadow-[0_0_20px_hsl(155_65%_48%/0.4)]',
    failed: 'bg-destructive/20 border-destructive shadow-[0_0_20px_hsl(0_72%_55%/0.4)]',
    source: 'bg-primary/20 border-primary shadow-[0_0_25px_hsl(270_60%_60%/0.5)]',
    dest: 'bg-accent/20 border-accent shadow-[0_0_25px_hsl(200_90%_55%/0.5)]',
    path: 'bg-warning/20 border-warning shadow-[0_0_20px_hsl(38_92%_55%/0.4)]',
    default: 'bg-muted/60 border-border/60 hover:border-primary/40',
  };

  return (
    <div className={`relative flex items-center justify-center w-12 h-12 rounded-xl border transition-all duration-300 ${styles[data.status]}`}>
      <Handle type="target" position={Position.Top} className="!bg-primary/60 !border-none !w-1.5 !h-1.5" />
      <Handle type="source" position={Position.Bottom} className="!bg-primary/60 !border-none !w-1.5 !h-1.5" />
      <span className="font-display text-[11px] font-bold text-foreground">{data.label}</span>
    </div>
  );
}

const nodeTypes: NodeTypes = { network: NetworkNode };

export default function NetworkCanvas() {
  const { state, dispatch } = useSim();
  const topo = useMemo(() => generateTopology(state.topology, state.nodeCount), [state.topology, state.nodeCount]);

  // Packet animation state
  const [packetPos, setPacketPos] = useState<{ x: number; y: number } | null>(null);
  const [packetStep, setPacketStep] = useState(-1);

  const nodePositionMap = useMemo(() => {
    const map: Record<string, { x: number; y: number }> = {};
    for (const n of topo.nodes) {
      map[n.id] = { x: n.x + 24, y: n.y + 24 }; // center of 48px node
    }
    return map;
  }, [topo]);

  // Animate packet along the active path
  useEffect(() => {
    if (!state.isRunning || state.activePath.length < 2) {
      setPacketPos(null);
      setPacketStep(-1);
      return;
    }

    const path = state.activePath;
    let step = 0;
    const stepDelay = 600 / state.speed;

    // Start at source
    const src = nodePositionMap[path[0]];
    if (src) setPacketPos({ x: src.x, y: src.y });
    setPacketStep(0);

    const interval = setInterval(() => {
      step++;
      if (step >= path.length) {
        clearInterval(interval);
        // Keep packet at destination briefly then hide
        setTimeout(() => {
          setPacketPos(null);
          setPacketStep(-1);
        }, 400);
        return;
      }
      const pos = nodePositionMap[path[step]];
      if (pos) {
        setPacketPos({ x: pos.x, y: pos.y });
        setPacketStep(step);
      }
    }, stepDelay);

    return () => clearInterval(interval);
  }, [state.isRunning, state.activePath, state.speed, nodePositionMap]);

  const getNodeStatus = useCallback((id: string) => {
    if (state.failedNodes.has(id)) return 'failed';
    if (id === state.source) return 'source';
    if (id === state.destination) return 'dest';
    if (state.activePath.includes(id)) return 'path';
    return 'default';
  }, [state.failedNodes, state.source, state.destination, state.activePath]);

  const initialNodes: Node[] = useMemo(() => topo.nodes.map(n => ({
    id: n.id,
    type: 'network',
    position: { x: n.x, y: n.y },
    data: { label: n.label, status: getNodeStatus(n.id) },
  })), [topo, getNodeStatus]);

  const isEdgeOnPath = useCallback((source: string, target: string) => {
    const p = state.activePath;
    for (let i = 0; i < p.length - 1; i++) {
      if ((p[i] === source && p[i + 1] === target) || (p[i] === target && p[i + 1] === source)) return true;
    }
    return false;
  }, [state.activePath]);

  const initialEdges: Edge[] = useMemo(() => topo.edges.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    animated: state.showPaths && isEdgeOnPath(e.source, e.target),
    style: {
      stroke: state.failedLinks.has(e.id)
        ? 'hsl(0, 72%, 55%)'
        : isEdgeOnPath(e.source, e.target)
          ? 'hsl(270, 60%, 60%)'
          : 'hsl(260, 18%, 22%)',
      strokeWidth: isEdgeOnPath(e.source, e.target) ? 2.5 : 1,
      strokeDasharray: state.failedLinks.has(e.id) ? '5,5' : undefined,
    },
    label: state.showPaths ? `w:${e.weight}` : undefined,
    labelStyle: { fill: 'hsl(260, 10%, 50%)', fontSize: 10, fontFamily: 'JetBrains Mono' },
    labelBgStyle: { fill: 'hsl(260, 22%, 9%)', fillOpacity: 0.9 },
  })), [topo, state.showPaths, state.failedLinks, isEdgeOnPath]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useMemo(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.id !== state.source && node.id !== state.destination) {
      dispatch({ type: 'TOGGLE_FAILED_NODE', payload: node.id });
    }
  }, [dispatch, state.source, state.destination]);

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    dispatch({ type: 'TOGGLE_FAILED_LINK', payload: edge.id });
  }, [dispatch]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="glass-card gradient-border rounded-xl overflow-hidden relative"
      style={{ height: '100%', minHeight: 400 }}
    >
      <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
        <span className="font-display text-[10px] text-muted-foreground tracking-wider uppercase">
          {state.topology} topology
        </span>
        <span className="text-border">·</span>
        <span className="font-mono text-[10px] text-muted-foreground/60">
          Click nodes/edges to toggle failures
        </span>
      </div>

      {/* Animated packet overlay */}
      <AnimatePresence>
        {packetPos && (
          <motion.div
            key="packet"
            className="absolute z-20 pointer-events-none"
            animate={{ left: packetPos.x - 10, top: packetPos.y - 10 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25, mass: 0.5 }}
            exit={{ opacity: 0, scale: 0 }}
          >
            <div className="relative w-5 h-5 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-primary/40 animate-ping" />
              <div className="w-4 h-4 rounded-sm bg-gradient-to-br from-primary to-accent shadow-[0_0_12px_hsl(270_60%_60%/0.7)] flex items-center justify-center rotate-45">
                <span className="text-[7px] font-bold text-white -rotate-45">📦</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} color="hsl(270, 60%, 60%)" gap={35} size={1} style={{ opacity: 0.08 }} />
        <Controls />
      </ReactFlow>
    </motion.div>
  );
}
