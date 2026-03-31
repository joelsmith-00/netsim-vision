import { useSim } from '@/context/SimContext';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="border-glow rounded-lg bg-card p-4 space-y-4"
    >
      <h3 className="font-display text-xs font-bold tracking-wider text-primary text-glow-cyan">
        PERFORMANCE METRICS
      </h3>

      {metrics ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Latency" value={`${metrics.latency}ms`} color="text-primary" />
          <MetricCard label="Throughput" value={`${metrics.throughput} B/s`} color="text-neon-green" />
          <MetricCard label="Packet Loss" value={`${metrics.packetLoss}%`} color={metrics.packetLoss > 0 ? 'text-destructive' : 'text-neon-green'} />
          <MetricCard label="Hop Count" value={`${metrics.hops}`} color="text-accent" />
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic">Run a simulation to see metrics</p>
      )}

      {chartData.length > 1 && (
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 20%)" />
              <XAxis dataKey="sim" tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 10 }} />
              <YAxis tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: 'hsl(220, 18%, 10%)', border: '1px solid hsl(220, 15%, 20%)', borderRadius: 6, fontSize: 11 }}
                labelStyle={{ color: 'hsl(180, 10%, 90%)' }}
              />
              <Line type="monotone" dataKey="latency" stroke="hsl(175, 80%, 50%)" strokeWidth={2} dot={{ r: 3 }} name="Latency (ms)" />
              <Line type="monotone" dataKey="loss" stroke="hsl(0, 75%, 55%)" strokeWidth={2} dot={{ r: 3 }} name="Packet Loss %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-muted rounded-md p-3 text-center">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={`font-display text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}
