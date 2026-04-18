import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, CartesianGrid
} from 'recharts';
import { Activity } from 'lucide-react';
import { ZoneTelemetry } from '../types';
import { GeminiInsight } from './GeminiInsight';

const GOOGLE_COLORS = [
  '#4285F4', '#34A853', '#FBBC05', '#EA4335', '#673AB7', '#009688', '#FF5722', '#607D8B'
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-xl text-xs space-y-2">
      <p className="font-bold text-gray-900 mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-6 items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-gray-500 font-medium">{p.dataKey.replace('_', ' ')}</span>
          </div>
          <span className="text-gray-900 font-bold">{p.value}%</span>
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
    { label: 'Avg Density', value: `${totalCapacity}%`, color: totalCapacity > 75 ? 'text-red-500' : 'text-blue-600', sub: 'overall load' },
    { label: 'Hazard Count',   value: unsafeZones,          color: unsafeZones > 0 ? 'text-red-500' : 'text-green-600', sub: 'critical sectors' },
    { label: 'Safe Exits',     value: clearExits,            color: 'text-blue-500', sub: 'operational' },
  ];

  return (
    <div className="glass-card p-8 flex flex-col gap-8 bg-white border border-gray-100">
      <div>
        <p className="section-label mb-1">Advanced Telemetry</p>
        <h2 className="text-xl font-medium tracking-tight text-gray-900 flex items-center gap-3">
          <Activity className="w-6 h-6 text-blue-500" />
          Real-time Analytics
        </h2>
      </div>

      <GeminiInsight telemetry={telemetry} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map(m => (
          <div key={m.label} className="bg-gray-50/50 border border-gray-100 rounded-2xl p-5 hover:bg-white hover:shadow-lg hover:border-blue-100 transition-all duration-300">
            <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">{m.label}</p>
            <p className={`text-4xl font-light tracking-tighter ${m.color}`}>{m.value}</p>
            <p className="text-[10px] text-gray-400 font-medium mt-2">{m.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        {/* Line chart */}
        <div className="space-y-4">
          <p className="section-label mb-0">Trend (30s Window)</p>
          <div className="h-48 border border-gray-50 rounded-2xl p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis domain={[0, 100]} hide />
                <Tooltip content={<CustomTooltip />} />
                {telemetry.map((zone, i) => (
                  <Line
                    key={zone.id}
                    type="monotone"
                    dataKey={zone.id}
                    stroke={GOOGLE_COLORS[i % GOOGLE_COLORS.length]}
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
        <div className="space-y-4">
          <p className="section-label mb-0">Sector Intensity</p>
          <div className="h-48 border border-gray-50 rounded-2xl p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={telemetry} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#9aa0a6', fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis domain={[0, 100]} hide />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8f9fa' }} />
                <Bar dataKey="density" radius={[4, 4, 0, 0]}>
                  {telemetry.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.hazard || entry.density > 80 ? '#EA4335' : entry.density > 60 ? '#FBBC05' : '#4285F4'}
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
