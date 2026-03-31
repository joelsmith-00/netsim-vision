import { useMemo, useCallback } from 'react';
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
import { motion } from 'framer-motion';

function NetworkNode({ data }: { data: { label: string; status: 'active' | 'failed' | 'source' | 'dest' | 'path' | 'default' } }) {
  const colors = {
    active: 'bg-neon-green border-neon-green shadow-[0_0_15px_hsl(145_70%_45%/0.5)]',
    failed: 'bg-destructive border-destructive shadow-[0_0_15px_hsl(0_75%_55%/0.5)]',
    source: 'bg-primary border-primary shadow-[0_0_20px_hsl(175_80%_50%/0.6)]',
    dest: 'bg-secondary border-secondary shadow-[0_0_20px_hsl(280_60%_55%/0.6)]',
    path: 'bg-accent border-accent shadow-[0_0_15px_hsl(45_100%_55%/0.5)]',
    default: 'bg-muted border-border',
  };

  return (
    <div className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${colors[data.status]}`}>
      <Handle type="target" position={Position.Top} className="!bg-primary !border-none !w-2 !h-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-primary !border-none !w-2 !h-2" />
      <span className="font-display text-xs font-bold text-foreground">{data.label}</span>
    </div>
  );
}

const nodeTypes: NodeTypes = { network: NetworkNode };

export default function NetworkCanvas() {
  const { state, dispatch } = useSim();
  const topo = useMemo(() => generateTopology(state.topology, state.nodeCount), [state.topology, state.nodeCount]);

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
        ? 'hsl(0, 75%, 55%)'
        : isEdgeOnPath(e.source, e.target)
          ? 'hsl(175, 80%, 50%)'
          : 'hsl(220, 15%, 25%)',
      strokeWidth: isEdgeOnPath(e.source, e.target) ? 3 : 1.5,
      strokeDasharray: state.failedLinks.has(e.id) ? '5,5' : undefined,
    },
    label: state.showPaths ? `w:${e.weight}` : undefined,
    labelStyle: { fill: 'hsl(220, 10%, 55%)', fontSize: 10, fontFamily: 'JetBrains Mono' },
    labelBgStyle: { fill: 'hsl(220, 18%, 10%)', fillOpacity: 0.8 },
  })), [topo, state.showPaths, state.failedLinks, isEdgeOnPath]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync when topology/state changes
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="border-glow rounded-lg bg-card overflow-hidden relative"
      style={{ height: '100%', minHeight: 400 }}
    >
      <div className="absolute top-2 left-3 z-10 font-display text-[10px] text-muted-foreground tracking-widest">
        NETWORK TOPOLOGY — {state.topology.toUpperCase()} | CLICK NODES/EDGES TO FAIL
      </div>
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
        <Background variant={BackgroundVariant.Dots} color="hsl(175, 80%, 50%)" gap={30} size={1} style={{ opacity: 0.15 }} />
        <Controls />
      </ReactFlow>
    </motion.div>
  );
}
