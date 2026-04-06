import { useSim } from '@/context/SimContext';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Area, AreaChart, Cell, Legend,
} from 'recharts';

export default function PerformanceDashboard() {
  const { state } = useSim();
  const { results } = state;

  if (results.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card gradient-border rounded-xl p-4"
      >
        <h3 className="font-display text-xs font-semibold tracking-wide text-muted-foreground uppercase mb-2">
          Performance Dashboard
        </h3>
        <p className="text-[11px] text-muted-foreground/50 italic text-center py-6">
          Run multiple simulations to see performance trends
        </p>
      </motion.div>
    );
  }

  const chartData = results.map((r, i) => ({
    sim: `#${i + 1}`,
    latency: r.latency,
    throughput: Math.round(r.throughput / 1000),
    loss: r.packetLoss,
    hops: r.hops,
    fragments: r.fragments,
  }));

  const avgLatency = Math.round(results.reduce((s, r) => s + r.latency, 0) / results.length * 10) / 10;
  const avgThroughput = Math.round(results.reduce((s, r) => s + r.throughput, 0) / results.length);
  const totalSuccess = results.filter(r => r.success).length;

  const tooltipStyle = {
    background: 'hsl(260, 22%, 12%)',
    border: '1px solid hsl(260, 18%, 20%)',
    borderRadius: 8,
    fontSize: 10,
    fontFamily: 'JetBrains Mono',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card gradient-border rounded-xl p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Performance Dashboard
        </h3>
        <div className="flex gap-3 font-mono text-[9px]">
          <span className="text-muted-foreground">Avg Latency: <span className="text-primary">{avgLatency}ms</span></span>
          <span className="text-muted-foreground">Avg Throughput: <span className="text-accent">{avgThroughput} B/s</span></span>
          <span className="text-muted-foreground">Success: <span className="text-success">{totalSuccess}/{results.length}</span></span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Latency trend */}
        <div>
          <p className="text-[9px] font-mono text-muted-foreground/60 mb-1">Latency Over Time (ms)</p>
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="latGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(270, 60%, 60%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(270, 60%, 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(260, 18%, 14%)" />
                <XAxis dataKey="sim" tick={{ fill: 'hsl(260, 10%, 40%)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(260, 10%, 40%)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="latency" stroke="hsl(270, 60%, 60%)" strokeWidth={2} fill="url(#latGrad)" dot={{ r: 2, fill: 'hsl(270, 60%, 60%)' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hops bar chart */}
        <div>
          <p className="text-[9px] font-mono text-muted-foreground/60 mb-1">Hops & Fragments per Simulation</p>
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(260, 18%, 14%)" />
                <XAxis dataKey="sim" tick={{ fill: 'hsl(260, 10%, 40%)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(260, 10%, 40%)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="hops" fill="hsl(200, 90%, 55%)" radius={[3, 3, 0, 0]} fillOpacity={0.7} name="Hops" />
                <Bar dataKey="fragments" fill="hsl(38, 92%, 55%)" radius={[3, 3, 0, 0]} fillOpacity={0.7} name="Fragments" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
