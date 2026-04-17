import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, CartesianGrid
} from 'recharts';
import { BarChart2 } from 'lucide-react';
import { ZoneTelemetry } from '../types';

const ZONE_COLORS = [
  '#00D4FF','#a78bfa','#34d399','#fbbf24','#f472b6','#60a5fa','#fb923c','#4ade80'
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d1323] border border-white/10 rounded-xl p-3 shadow-2xl text-xs space-y-1.5 max-w-[180px]">
      <p className="text-gray-400 mono mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-3">
          <span style={{ color: p.color }}>{p.dataKey.replace('_', ' ')}</span>
          <span className="font-bold text-white mono">{p.value}%</span>
        </div>
      ))}
    </div>
  );
};

export const AnalyticsPanel: React.FC<{ telemetry: ZoneTelemetry[], history: any[] }> = ({ telemetry, history }) => {
  const totalCapacity = useMemo(() => Math.round(
    telemetry.reduce((acc, z) => acc + z.density, 0) / telemetry.length
  ), [telemetry]);

  const unsafeZones = telemetry.filter(z => z.density > 80 || z.hazard).length;
  const clearExits = telemetry.filter(z => z.id.startsWith('Exit_') && z.density < 60 && !z.hazard).length;

  const metrics = [
    { label: 'Venue Capacity', value: `${totalCapacity}%`, color: totalCapacity > 75 ? 'text-red-400' : 'text-accent', sub: 'avg across all zones' },
    { label: 'Unsafe Zones',   value: unsafeZones,          color: unsafeZones > 0 ? 'text-red-400' : 'text-emerald-400', sub: 'density > 80% or hazard' },
    { label: 'Clear Exits',    value: clearExits,            color: 'text-emerald-400', sub: 'open & safe' },
  ];

  return (
    <div className="glass-card hud-border p-6 flex flex-col gap-6">
      {/* Header */}
      <div>
        <p className="section-label mb-1">Analytics</p>
        <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center border border-accent/30">
            <BarChart2 className="w-4 h-4 text-accent" />
          </div>
          Crowd Analytics
        </h2>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-3 gap-4">
        {metrics.map(m => (
          <div key={m.label} className="bg-white/3 border border-white/6 rounded-xl p-4 text-center">
            <p className="section-label mb-1.5">{m.label}</p>
            <p className={`text-3xl font-black mono ${m.color}`}>{m.value}</p>
            <p className="text-[10px] text-gray-600 mt-1">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Line chart */}
      <div>
        <p className="section-label mb-3">Density over time (last 30s)</p>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="time" hide />
              <YAxis domain={[0, 100]} hide />
              <Tooltip content={<CustomTooltip />} />
              {telemetry.map((zone, i) => (
                <Line
                  key={zone.id}
                  type="monotone"
                  dataKey={zone.id}
                  stroke={ZONE_COLORS[i % ZONE_COLORS.length]}
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-3">
          {telemetry.map((z, i) => (
            <span key={z.id} className="flex items-center gap-1.5 text-[10px] text-gray-400">
              <span className="w-3 h-1.5 rounded-full inline-block" style={{ backgroundColor: ZONE_COLORS[i % ZONE_COLORS.length] }} />
              {z.name}
            </span>
          ))}
        </div>
      </div>

      {/* Bar chart */}
      <div>
        <p className="section-label mb-3">Current Density Comparison</p>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={telemetry} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 9, fontFamily: 'Inter' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 8 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="density" radius={[5, 5, 0, 0]}>
                {telemetry.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.hazard || entry.density > 80 ? '#ef4444' : entry.density > 60 ? '#f59e0b' : '#34d399'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
