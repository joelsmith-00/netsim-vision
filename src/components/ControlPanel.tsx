import { useSim } from '@/context/SimContext';
import { generateTopology, type TopologyType } from '@/lib/topologies';
import { runSimulation } from '@/lib/simulation';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';

const TOPOLOGIES: { value: TopologyType; label: string; icon: string; desc: string }[] = [
  { value: 'star', label: 'Star', icon: '✦', desc: 'All nodes connect to a central hub. Data routes through the hub — simple but single point of failure.' },
  { value: 'bus', label: 'Bus', icon: '—', desc: 'All nodes share a single communication line. Collisions can occur when multiple nodes transmit simultaneously.' },
  { value: 'ring', label: 'Ring', icon: '○', desc: 'Each node connects to exactly two neighbors forming a circle. Data travels sequentially around the ring.' },
  { value: 'mesh', label: 'Mesh', icon: '◇', desc: 'Nodes are interconnected with multiple paths. Highly redundant — if one link fails, traffic reroutes automatically.' },
  { value: 'tree', label: 'Tree', icon: '▽', desc: 'Hierarchical structure with parent-child relationships. Data traverses up and down through the tree branches.' },
  { value: 'hybrid', label: 'Hybrid', icon: '⬡', desc: 'Combines star and mesh patterns. Balances redundancy with efficiency for complex network layouts.' },
];

export default function ControlPanel() {
  const { state, dispatch } = useSim();
  const topo = generateTopology(state.topology, state.nodeCount);
  const nodeIds = topo.nodes.map(n => n.id);

  const isBroadcast = state.destination === '__ALL__';

  const handleSimulate = () => {
    dispatch({ type: 'CLEAR_LOGS' });
    dispatch({ type: 'SET_RUNNING', payload: true });

    if (isBroadcast) {
      // Broadcast: send to all other nodes
      const targets = nodeIds.filter(id => id !== state.source && !state.failedNodes.has(id));
      const allLogs: import('@/lib/simulation').LogEntry[] = [];
      let allPaths: string[] = [];
      let totalLatency = 0;
      let totalHops = 0;
      let totalLoss = 0;
      let totalThroughput = 0;
      let successCount = 0;

      allLogs.push({ time: 0, type: 'info', message: `📢 Broadcasting from ${state.source} to ${targets.length} nodes` });

      targets.forEach((dest) => {
        const result = runSimulation({
          source: state.source,
          destination: dest,
          edges: topo.edges,
          nodeIds,
          failedNodes: state.failedNodes,
          failedLinks: state.failedLinks,
          congestion: state.congestion,
          packetSize: state.packetSize,
          topology: state.topology,
        });
        allPaths = [...new Set([...allPaths, ...result.path])];
        totalLatency += result.latency;
        totalHops += result.hops;
        totalLoss += result.packetLoss;
        totalThroughput += result.throughput;
        if (result.success) successCount++;
        result.logs.forEach(l => allLogs.push(l));
      });

      const avgLatency = totalLatency / targets.length;
      const avgLoss = totalLoss / targets.length;
      allLogs.push({ time: 99, type: 'success', message: `📢 Broadcast complete: ${successCount}/${targets.length} delivered` });

      dispatch({ type: 'SET_ACTIVE_PATH', payload: allPaths });
      dispatch({ type: 'SET_METRICS', payload: { latency: Math.round(avgLatency * 10) / 10, throughput: Math.round(totalThroughput / targets.length), packetLoss: Math.round(avgLoss), hops: totalHops } });

      allLogs.forEach((log, i) => {
        setTimeout(() => {
          dispatch({ type: 'ADD_LOGS', payload: [log] });
          if (i === allLogs.length - 1) {
            dispatch({ type: 'SET_RUNNING', payload: false });
          }
        }, (i + 1) * (250 / state.speed));
      });
    } else {
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

      result.logs.forEach((log, i) => {
        setTimeout(() => {
          dispatch({ type: 'ADD_LOGS', payload: [log] });
          if (i === result.logs.length - 1) {
            dispatch({ type: 'SET_RUNNING', payload: false });
          }
        }, (i + 1) * (400 / state.speed));
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card gradient-border rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Control Panel
        </h2>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <Switch checked={state.showPaths} onCheckedChange={(v) => dispatch({ type: 'SET_SHOW_PATHS', payload: v })} />
            <span>Paths</span>
          </label>
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <Switch checked={state.congestion} onCheckedChange={(v) => dispatch({ type: 'SET_CONGESTION', payload: v })} />
            <span>Congestion</span>
          </label>
        </div>
      </div>

      {/* Topology description */}
      <motion.div
        key={state.topology}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        transition={{ duration: 0.3 }}
        className="mb-1 flex items-start gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10"
      >
        <span className="text-primary text-sm mt-0.5">ℹ</span>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          <span className="text-foreground font-semibold">{TOPOLOGIES.find(t => t.value === state.topology)?.label}:</span>{' '}
          {TOPOLOGIES.find(t => t.value === state.topology)?.desc}
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 items-end">
        {/* Topology */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-muted-foreground">Topology</label>
          <Select value={state.topology} onValueChange={(v) => dispatch({ type: 'SET_TOPOLOGY', payload: v as TopologyType })}>
            <SelectTrigger className="bg-muted/50 border-border/50 text-foreground h-9 text-xs rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TOPOLOGIES.map(t => (
                <SelectItem key={t.value} value={t.value}>
                  <span className="mr-1.5 opacity-60">{t.icon}</span> {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Node Count */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-muted-foreground">
            Nodes <span className="text-primary font-semibold">{state.nodeCount}</span>
          </label>
          <Slider
            min={3} max={12} step={1}
            value={[state.nodeCount]}
            onValueChange={([v]) => dispatch({ type: 'SET_NODE_COUNT', payload: v })}
            className="mt-3"
          />
        </div>

        {/* Source */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-muted-foreground">Source</label>
          <Select value={state.source} onValueChange={(v) => dispatch({ type: 'SET_SOURCE', payload: v })}>
            <SelectTrigger className="bg-muted/50 border-border/50 text-foreground h-9 text-xs rounded-lg">
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
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-muted-foreground">Destination</label>
          <Select value={state.destination} onValueChange={(v) => dispatch({ type: 'SET_DESTINATION', payload: v })}>
            <SelectTrigger className="bg-muted/50 border-border/50 text-foreground h-9 text-xs rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__ALL__">
                <span className="mr-1.5 opacity-60">📢</span> All Nodes (Broadcast)
              </SelectItem>
              {nodeIds.map(id => (
                <SelectItem key={id} value={id}>{id}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Packet Size */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-muted-foreground">
            Packet <span className="text-primary font-semibold">{state.packetSize}B</span>
          </label>
          <Slider
            min={64} max={4096} step={64}
            value={[state.packetSize]}
            onValueChange={([v]) => dispatch({ type: 'SET_PACKET_SIZE', payload: v })}
            className="mt-3"
          />
        </div>

        {/* Speed */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-muted-foreground">
            Speed <span className="text-primary font-semibold">{state.speed}×</span>
          </label>
          <Slider
            min={0.5} max={5} step={0.5}
            value={[state.speed]}
            onValueChange={([v]) => dispatch({ type: 'SET_SPEED', payload: v })}
            className="mt-3"
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSimulate}
          disabled={state.isRunning || state.source === state.destination}
          className="h-9 px-5 rounded-lg font-display text-xs font-semibold tracking-wide bg-gradient-to-r from-primary to-primary/80 text-primary-foreground glow-primary disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 active:scale-[0.98] transition-all duration-200"
        >
          {state.isRunning ? 'Simulating...' : '▶ Send Packet'}
        </button>
      </div>
    </motion.div>
  );
}
