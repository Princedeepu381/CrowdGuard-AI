import React from 'react';
import { Activity, Users, AlertCircle, ShieldCheck } from 'lucide-react';
import { ZoneTelemetry } from '../types';
import { ZoneCard } from './ZoneCard';

export const Dashboard: React.FC<{ telemetry: ZoneTelemetry[] }> = ({ telemetry }) => {
  const avgDensity = Math.round(telemetry.reduce((acc, z) => acc + z.density, 0) / telemetry.length);
  const totalHazards = telemetry.filter(z => z.hazard).length;

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'System Load', val: `${avgDensity}%`, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Active Zones', val: telemetry.length, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50' },
          { label: 'Hazards', val: totalHazards, icon: AlertCircle, color: totalHazards > 0 ? 'text-red-500' : 'text-gray-400', bg: totalHazards > 0 ? 'bg-red-50' : 'bg-gray-50' },
          { label: 'Protocol', val: 'Active', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm flex items-center justify-between group overflow-hidden relative">
            <div className="space-y-1 relative z-10">
              <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">{stat.label}</p>
              <h4 className="text-2xl font-black text-gray-900">{stat.val}</h4>
            </div>
            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} transition-all group-hover:scale-110 relative z-10`}>
              <stat.icon className="w-5 h-5 transition-transform" />
            </div>
            {/* Background Decorative Element */}
            <div className={`absolute -right-4 -bottom-4 w-16 h-16 rounded-full ${stat.bg} opacity-20 blur-2xl group-hover:scale-150 transition-transform`} />
          </div>
        ))}
      </div>

      {/* Primary Alerts area if any */}
      {totalHazards > 0 && (
         <div className="p-6 bg-red-500 text-white rounded-[2rem] flex items-center justify-between shadow-xl shadow-red-500/20">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-white/20 rounded-2xl">
                  <AlertCircle className="w-6 h-6 animate-pulse" />
               </div>
               <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Immediate Action Required</h3>
                  <p className="text-sm font-medium opacity-80">{totalHazards} hazardous conditions detected in active sectors.</p>
               </div>
            </div>
            <button className="px-6 py-3 bg-white text-red-500 font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-white/90 transition-all">Details</button>
         </div>
      )}

      {/* Grid of Zone Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
        {telemetry.map(zone => (
          <ZoneCard key={zone.id} zone={zone} />
        ))}
      </div>
    </div>
  );
};
