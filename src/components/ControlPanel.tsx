import { useSim } from '@/context/SimContext';
import { generateTopology, type TopologyType } from '@/lib/topologies';
import { runSimulation } from '@/lib/simulation';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';

const TOPOLOGIES: { value: TopologyType; label: string }[] = [
  { value: 'star', label: '⭐ Star' },
  { value: 'bus', label: '🚌 Bus' },
  { value: 'ring', label: '💍 Ring' },
  { value: 'mesh', label: '🕸️ Mesh' },
  { value: 'tree', label: '🌲 Tree' },
  { value: 'hybrid', label: '🔀 Hybrid' },
];

export default function ControlPanel() {
  const { state, dispatch } = useSim();
  const topo = generateTopology(state.topology, state.nodeCount);
  const nodeIds = topo.nodes.map(n => n.id);

  const handleSimulate = () => {
    dispatch({ type: 'CLEAR_LOGS' });
    dispatch({ type: 'SET_RUNNING', payload: true });

    const result = runSimulation({
      source: state.source,
      destination: state.destination,
      edges: topo.edges,
      nodeIds,
      failedNodes: state.failedNodes,
      failedLinks: state.failedLinks,
      congestion: state.congestion,
      packetSize: state.packetSize,
      topology: state.topology,
    });

    dispatch({ type: 'SET_ACTIVE_PATH', payload: result.path });
    dispatch({ type: 'SET_METRICS', payload: { latency: result.latency, throughput: result.throughput, packetLoss: result.packetLoss, hops: result.hops } });
    dispatch({ type: 'ADD_RESULT', payload: result });

    // Animate logs one by one
    result.logs.forEach((log, i) => {
      setTimeout(() => {
        dispatch({ type: 'ADD_LOGS', payload: [log] });
        if (i === result.logs.length - 1) {
          dispatch({ type: 'SET_RUNNING', payload: false });
        }
      }, (i + 1) * (400 / state.speed));
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-glow rounded-lg bg-card p-4 space-y-4"
    >
      <h2 className="font-display text-sm font-bold tracking-wider text-primary text-glow-cyan">
        CONTROL PANEL
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* Topology */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Topology</label>
          <Select value={state.topology} onValueChange={(v) => dispatch({ type: 'SET_TOPOLOGY', payload: v as TopologyType })}>
            <SelectTrigger className="bg-muted border-border text-foreground h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TOPOLOGIES.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Node Count */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Nodes: {state.nodeCount}</label>
          <Slider
            min={3} max={12} step={1}
            value={[state.nodeCount]}
            onValueChange={([v]) => dispatch({ type: 'SET_NODE_COUNT', payload: v })}
            className="mt-2"
          />
        </div>

        {/* Source */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Source</label>
          <Select value={state.source} onValueChange={(v) => dispatch({ type: 'SET_SOURCE', payload: v })}>
            <SelectTrigger className="bg-muted border-border text-foreground h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {nodeIds.map(id => (
                <SelectItem key={id} value={id}>{id}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Destination */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Destination</label>
          <Select value={state.destination} onValueChange={(v) => dispatch({ type: 'SET_DESTINATION', payload: v })}>
            <SelectTrigger className="bg-muted border-border text-foreground h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {nodeIds.map(id => (
                <SelectItem key={id} value={id}>{id}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Packet Size */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Packet: {state.packetSize}B</label>
          <Slider
            min={64} max={4096} step={64}
            value={[state.packetSize]}
            onValueChange={([v]) => dispatch({ type: 'SET_PACKET_SIZE', payload: v })}
            className="mt-2"
          />
        </div>

        {/* Speed */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Speed: {state.speed}x</label>
          <Slider
            min={0.5} max={5} step={0.5}
            value={[state.speed]}
            onValueChange={([v]) => dispatch({ type: 'SET_SPEED', payload: v })}
            className="mt-2"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <Switch checked={state.showPaths} onCheckedChange={(v) => dispatch({ type: 'SET_SHOW_PATHS', payload: v })} />
          Show Paths
        </label>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <Switch checked={state.congestion} onCheckedChange={(v) => dispatch({ type: 'SET_CONGESTION', payload: v })} />
          Congestion Mode
        </label>

        <button
          onClick={handleSimulate}
          disabled={state.isRunning || state.source === state.destination}
          className="ml-auto px-6 py-2 rounded-md font-display text-xs font-bold tracking-wider bg-primary text-primary-foreground glow-cyan disabled:opacity-40 hover:brightness-110 transition-all"
        >
          {state.isRunning ? '⏳ SIMULATING...' : '▶ SEND PACKET'}
        </button>
      </div>
    </motion.div>
  );
}
