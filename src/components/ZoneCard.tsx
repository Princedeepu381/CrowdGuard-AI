import React from 'react';
import { Users, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { ZoneTelemetry } from '../types';

export const ZoneCard: React.FC<{ zone: ZoneTelemetry }> = ({ zone }) => {
  const isCritical = zone.density >= 80;
  const isHazard = zone.hazard;

  return (
    <div 
      className={`relative group p-8 rounded-[2rem] border transition-all duration-500 bg-white ${
        isHazard ? 'border-red-500 shadow-xl shadow-red-500/10' : 
        isCritical ? 'border-amber-400 shadow-xl shadow-amber-500/10' : 
        'border-gray-50 hover:border-primary/30'
      }`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-black text-gray-900 tracking-tight">{zone.name}</h3>
            {isHazard ? (
               <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            ) : isCritical ? (
               <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            ) : (
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            )}
          </div>
          <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Sector Tracking Activated</p>
        </div>
        <div className={`p-3 rounded-2xl ${isHazard ? 'bg-red-50 text-red-500' : isCritical ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-primary'} transition-all group-hover:rotate-12`}>
          {isHazard ? <AlertTriangle className="w-5 h-5" /> : isCritical ? <Zap className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
             <div className="flex items-center gap-2">
               <Users className="w-3.5 h-3.5 text-gray-400" />
               <span className="text-2xl font-black text-gray-900">{zone.density}%</span>
             </div>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Density</p>
          </div>
          <div className="text-right">
             <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${isHazard ? 'bg-red-50 text-red-500' : isCritical ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-600'}`}>
                {isHazard ? 'HAZARD' : isCritical ? 'CRITICAL' : 'OPTIMAL'}
             </span>
          </div>
        </div>

        {/* Custom Progress Bar */}
        <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100/50">
          <div 
            className={`h-full transition-all duration-1000 ease-out rounded-full ${
              isHazard ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]' : 
              isCritical ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]' : 
              'bg-primary'
            }`}
            style={{ width: `${zone.density}%` }}
          />
        </div>

        <div className="pt-2 flex items-center justify-between">
           <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Node ID: {zone.id.slice(0, 8)}</span>
           <button className="text-[9px] font-black text-primary hover:text-gray-900 transition-colors uppercase tracking-widest">
             Audit Path →
           </button>
        </div>
      </div>
      
      {/* Decorative Glow */}
      <div className={`absolute -right-4 -bottom-4 w-32 h-32 rounded-full blur-[60px] opacity-10 transition-opacity duration-1000 ${isHazard ? 'bg-red-500' : isCritical ? 'bg-amber-500' : 'bg-primary'}`} />
    </div>
  );
};
