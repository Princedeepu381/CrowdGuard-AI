import React from 'react';
import { Users, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { ZoneTelemetry } from '../types';

export const ZoneCard: React.FC<{ zone: ZoneTelemetry }> = ({ zone }) => {
  const isCritical = zone.density >= 80;
  const isHazard = zone.hazard;

  return (
    <div 
      className={`relative group p-10 rounded-[2rem] border transition-all duration-500 bg-white/[0.03] ${
        isHazard ? 'border-red-500/50 shadow-xl shadow-red-500/10' : 
        isCritical ? 'border-amber-400/50 shadow-xl shadow-amber-500/10' : 
        'border-white/10 hover:border-primary/40'
      }`}
    >
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-bold tracking-tight">{zone.name}</h3>
            {isHazard ? (
               <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            ) : isCritical ? (
               <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            ) : (
               <div className="w-2 h-2 rounded-full bg-primary" />
            )}
          </div>
          <p className="text-[10px] font-black tracking-[0.3em] text-text-muted uppercase">Sector Tracking Active</p>
        </div>
        <div className={`p-4 rounded-2xl ${isHazard ? 'bg-red-500/10 text-red-500' : isCritical ? 'bg-amber-500/10 text-amber-500' : 'bg-primary/10 text-primary'} transition-all group-hover:rotate-12`}>
          {isHazard ? <AlertTriangle className="w-6 h-6" /> : isCritical ? <Zap className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
             <div className="flex items-center gap-3">
               <Users className="w-5 h-5 text-text-muted" />
               <span className="text-3xl font-bold">{zone.density}%</span>
             </div>
             <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Live Density</p>
          </div>
          <div className="text-right">
             <span className={`text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1.5 rounded-lg border ${isHazard ? 'bg-red-500/10 text-red-500 border-red-500/20' : isCritical ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                {isHazard ? 'HAZARD' : isCritical ? 'CRITICAL' : 'OPTIMAL'}
             </span>
          </div>
        </div>

        {/* Custom Progress Bar */}
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
          <div 
            className={`h-full transition-all duration-1000 ease-out rounded-full ${
              isHazard ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 
              isCritical ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 
              'bg-primary shadow-[0_0_15px_rgba(0,240,255,0.5)]'
            }`}
            style={{ width: `${zone.density}%` }}
          />
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-white/5">
           <span className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em]">Node ID: {zone.id.slice(0, 8)}</span>
           <button className="text-[9px] font-black text-primary hover:brightness-125 transition-all uppercase tracking-[0.2em]">
             Audit Path →
           </button>
        </div>
      </div>
      
      {/* Decorative Glow */}
      <div className={`absolute -right-6 -bottom-6 w-40 h-40 rounded-full blur-[80px] opacity-10 transition-opacity duration-1000 ${isHazard ? 'bg-red-500' : isCritical ? 'bg-amber-500' : 'bg-primary'}`} />
    </div>
  );
};
