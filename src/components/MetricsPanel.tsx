import { useSim } from '@/context/SimContext';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts';

export default function MetricsPanel() {
  const { state } = useSim();
  const { metrics, results } = state;

  const chartData = results.map((r, i) => ({
    sim: i + 1,
    latency: r.latency,
    loss: r.packetLoss,
    hops: r.hops,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="glass-card gradient-border rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Performance Metrics
        </h3>
        {results.length > 0 && (
          <span className="font-mono text-[10px] text-muted-foreground/50">
            {results.length} simulation{results.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {metrics ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <MetricCard label="Latency" value={`${metrics.latency}ms`} trend="primary" />
          <MetricCard label="Throughput" value={`${metrics.throughput} B/s`} trend="success" />
          <MetricCard label="Packet Loss" value={`${metrics.packetLoss}%`} trend={metrics.packetLoss > 0 ? 'destructive' : 'success'} />
          <MetricCard label="Hop Count" value={`${metrics.hops}`} trend="accent" />
        </div>
      ) : (
        <p className="text-xs text-muted-foreground/50 italic mb-4">Run a simulation to see metrics</p>
      )}

      {chartData.length > 1 && (
        <div className="h-36 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(270, 60%, 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(270, 60%, 60%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(260, 18%, 14%)" />
              <XAxis dataKey="sim" tick={{ fill: 'hsl(260, 10%, 40%)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(260, 10%, 40%)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(260, 22%, 12%)',
                  border: '1px solid hsl(260, 18%, 20%)',
                  borderRadius: 10,
                  fontSize: 11,
                  fontFamily: 'JetBrains Mono',
                  boxShadow: '0 8px 30px hsl(0 0% 0% / 0.3)',
                }}
                labelStyle={{ color: 'hsl(240, 5%, 85%)' }}
              />
              <Area type="monotone" dataKey="latency" stroke="hsl(270, 60%, 60%)" strokeWidth={2} fill="url(#latencyGrad)" dot={{ r: 3, fill: 'hsl(270, 60%, 60%)' }} name="Latency (ms)" />
              <Area type="monotone" dataKey="loss" stroke="hsl(0, 72%, 55%)" strokeWidth={2} fill="url(#lossGrad)" dot={{ r: 3, fill: 'hsl(0, 72%, 55%)' }} name="Packet Loss %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}

function MetricCard({ label, value, trend }: { label: string; value: string; trend: string }) {
  const colorMap: Record<string, string> = {
    primary: 'text-primary',
    success: 'text-success',
    destructive: 'text-destructive',
    accent: 'text-accent',
    warning: 'text-warning',
  };

  const bgMap: Record<string, string> = {
    primary: 'bg-primary/5 border-primary/10',
    success: 'bg-success/5 border-success/10',
    destructive: 'bg-destructive/5 border-destructive/10',
    accent: 'bg-accent/5 border-accent/10',
    warning: 'bg-warning/5 border-warning/10',
  };

  return (
    <div className={`rounded-lg p-3 border ${bgMap[trend] || 'bg-muted/30 border-border/30'}`}>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className={`font-display text-lg font-bold ${colorMap[trend] || 'text-foreground'}`}>{value}</p>
    </div>
  );
}
