import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, CartesianGrid
} from 'recharts';
import { Activity } from 'lucide-react';
import { ZoneTelemetry } from '../types';
import { GeminiInsight } from './GeminiInsight';

const COSMIC_COLORS = [
  '#00F0FF', '#8A2BE2', '#ef4444', '#fbbf24', '#10b981', '#00B8CC', '#6A1CB2', '#f43f5e'
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background/90 backdrop-blur-xl p-4 rounded-xl border border-white/10 shadow-2xl text-[10px] space-y-3 font-black uppercase tracking-widest">
      <p className="text-white mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-8 items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-text-muted">{p.dataKey.replace('_', ' ')}</span>
          </div>
          <span className="text-white">{p.value}%</span>
        </div>
      ))}
    </div>
  );
};

export const AnalyticsPanel = React.memo(({ telemetry, history }: { telemetry: ZoneTelemetry[], history: any[] }) => {
  const totalCapacity = useMemo(() => Math.round(
    telemetry.reduce((acc, z) => acc + z.density, 0) / telemetry.length
  ), [telemetry]);

  const unsafeZones = telemetry.filter(z => z.density > 80 || z.hazard).length;
  const clearExits = telemetry.filter(z => z.id.startsWith('Exit_') && z.density < 60 && !z.hazard).length;

  const metrics = [
    { label: 'Avg Density', value: `${totalCapacity}%`, color: totalCapacity > 75 ? 'text-red-500' : 'text-primary', sub: 'overall site load' },
    { label: 'Hazard Count',   value: unsafeZones,          color: unsafeZones > 0 ? 'text-red-500' : 'text-green-400', sub: 'critical sectors' },
    { label: 'Safe Exits',     value: clearExits,            color: 'text-primary', sub: 'exits operational' },
  ];

  return (
    <div className="glass-card p-10 flex flex-col gap-10 bg-white/[0.02] border border-white/10 shadow-2xl">
      <div>
        <div className="section-label mb-2">Advanced Telemetry</div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-4">
          <Activity className="w-8 h-8 text-primary" />
          Real-time Analytics
        </h2>
      </div>

      <GeminiInsight telemetry={telemetry} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {metrics.map(m => (
          <div key={m.label} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:bg-white/[0.06] hover:border-primary/30 transition-all duration-300">
            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-text-muted mb-3">{m.label}</p>
            <p className={`text-5xl font-bold tracking-tighter ${m.color}`}>{m.value}</p>
            <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-3 opacity-60">{m.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-4">
        {/* Line chart */}
        <div className="space-y-6">
          <div className="section-label mb-0">Trend (30s Window)</div>
          <div className="h-56 border border-white/10 rounded-3xl p-4 bg-white/[0.01]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="white" className="opacity-5" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis domain={[0, 100]} hide />
                <Tooltip content={<CustomTooltip />} />
                {telemetry.map((zone, i) => (
                  <Line
                    key={zone.id}
                    type="monotone"
                    dataKey={zone.id}
                    stroke={COSMIC_COLORS[i % COSMIC_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar chart */}
        <div className="space-y-6">
          <div className="section-label mb-0">Sector Intensity</div>
          <div className="h-56 border border-white/10 rounded-3xl p-4 bg-white/[0.01]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={telemetry} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="white" className="opacity-5" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: 900 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis domain={[0, 100]} hide />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="density" radius={[6, 6, 0, 0]}>
                  {telemetry.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.hazard || entry.density > 80 ? '#ef4444' : entry.density > 60 ? '#fbbf24' : '#00F0FF'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
});
