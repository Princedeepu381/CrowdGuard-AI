import React from 'react';
import { Settings, RefreshCw, Smartphone, AlertTriangle } from 'lucide-react';
import { ZoneTelemetry } from '../types';

export const AdminPanel: React.FC<{ 
  telemetry: ZoneTelemetry[]; 
  onOverride: (id: string, updates: Partial<ZoneTelemetry>) => void;
  onReset: () => void;
}> = ({ telemetry, onOverride, onReset }) => {
  return (
    <div 
      className="glass-card p-10 flex flex-col gap-8 bg-white/[0.02] border border-white/10 shadow-2xl"
      role="region"
      aria-labelledby="admin-panel-heading"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <div className="section-label mb-0" aria-hidden="true">Manual Core Controls</div>
          <h2 id="admin-panel-heading" className="text-2xl font-bold tracking-tight flex items-center gap-4">
            <Settings className="w-8 h-8 text-primary" />
            Admin Overrides
          </h2>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3 border border-primary/20 text-primary rounded-xl bg-primary/10 hover:bg-primary/20 transition-all shadow-lg shadow-primary/5"
        >
          <RefreshCw className="w-4 h-4" />
          Reset Baseline
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[550px] overflow-y-auto pr-3 custom-scrollbar">
        {telemetry.map((zone) => {
          const isCritical = zone.density >= 80;
          const isHazard = zone.hazard;

          return (
            <div 
              key={zone.id} 
              className={`p-6 rounded-2xl border transition-all duration-300 ${isHazard ? 'bg-red-500/10 border-red-500/30' : 'bg-white/[0.03] border-white/10'}`}
            >
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-bold tracking-tight">{zone.name}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOverride(zone.id, { hazard: !zone.hazard })}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                      zone.hazard 
                        ? 'bg-red-500 text-background border-red-600 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                        : 'bg-background text-text-muted border-white/10 hover:border-red-500/50 hover:text-red-500'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Hazard
                  </button>
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex justify-between text-[10px] items-center">
                  <span className="text-text-muted font-black uppercase tracking-[0.2em]">Target Load</span>
                  <span className={`font-bold text-base tracking-tighter ${isHazard ? 'text-red-500' : isCritical ? 'text-amber-500' : 'text-primary'}`}>
                    {zone.density}%
                  </span>
                </div>
                
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={zone.density}
                  onChange={(e) => onOverride(zone.id, { density: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-6 border-t border-white/5">
        <div className="flex items-start gap-4 p-5 bg-primary/5 rounded-2xl border border-primary/10">
          <Smartphone className="w-6 h-6 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-text-muted leading-relaxed font-light">
            Manual overrides bypass real-time IoT telemetry. Use for stress-testing evacuation routes or simulated emergency scenarios. Changes propagate to the Gemini analysis engine immediately.
          </p>
        </div>
      </div>
    </div>
  );
};
