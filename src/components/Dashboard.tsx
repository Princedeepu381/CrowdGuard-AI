import React from 'react';
import { Activity, Users, AlertCircle, ShieldCheck } from 'lucide-react';
import { ZoneTelemetry } from '../types';
import { ZoneCard } from './ZoneCard';

export const Dashboard: React.FC<{ telemetry: ZoneTelemetry[] }> = ({ telemetry }) => {
  const avgDensity = Math.round(telemetry.reduce((acc, z) => acc + z.density, 0) / telemetry.length);
  const totalHazards = telemetry.filter(z => z.hazard).length;

  return (
    <div className="space-y-10 animate-slide-up">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'System Load', val: `${avgDensity}%`, icon: Activity, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Active Zones', val: telemetry.length, icon: Users, color: 'text-secondary', bg: 'bg-secondary/10' },
          { label: 'Hazards', val: totalHazards, icon: AlertCircle, color: totalHazards > 0 ? 'text-red-500' : 'text-text-muted', bg: totalHazards > 0 ? 'bg-red-500/10' : 'bg-white/5' },
          { label: 'Protocol', val: 'Active', icon: ShieldCheck, color: 'text-green-400', bg: 'bg-green-400/10' },
        ].map((stat, i) => (
          <div key={i} className="p-8 bg-white/[0.03] border border-white/10 rounded-3xl flex items-center justify-between group overflow-hidden relative transition-all hover:bg-white/[0.06] hover:border-primary/20">
            <div className="space-y-2 relative z-10">
              <p className="text-[10px] font-black tracking-[0.2em] text-text-muted uppercase">{stat.label}</p>
              <h4 className="text-3xl font-bold text-text-main">{stat.val}</h4>
            </div>
            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} transition-all group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] relative z-10`}>
              <stat.icon className="w-6 h-6 transition-transform" />
            </div>
            {/* Background Decorative Element */}
            <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full ${stat.bg} opacity-10 blur-3xl group-hover:scale-150 transition-transform`} />
          </div>
        ))}
      </div>

      {/* Primary Alerts area if any */}
      {totalHazards > 0 && (
         <div className="p-8 bg-red-500/10 border border-red-500/30 text-white rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl shadow-red-500/5 hazard-glow">
            <div className="flex items-center gap-6">
               <div className="p-4 bg-red-500/20 rounded-2xl text-red-500">
                  <AlertCircle className="w-8 h-8 animate-pulse" />
               </div>
               <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight text-red-500">Immediate Action Required</h3>
                  <p className="text-sm font-medium text-text-muted">{totalHazards} hazardous conditions detected in active sectors.</p>
               </div>
            </div>
            <button className="w-full sm:w-auto px-8 py-4 bg-red-500 text-background font-bold rounded-2xl text-xs uppercase tracking-widest hover:brightness-110 transition-all">Details</button>
         </div>
      )}

      {/* Grid of Zone Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
        {telemetry.map(zone => (
          <ZoneCard key={zone.id} zone={zone} />
        ))}
      </div>
    </div>
  );
};
