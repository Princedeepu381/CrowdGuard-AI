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
      className="glass-card p-8 flex flex-col gap-6 bg-white border border-gray-100 shadow-sm"
      role="region"
      aria-labelledby="admin-panel-heading"
    >
      <div className="flex items-center justify-between border-b border-gray-50 pb-6">
        <div className="space-y-1">
          <p className="section-label mb-0" aria-hidden="true">Manual Controls</p>
          <h2 id="admin-panel-heading" className="text-xl font-medium tracking-tight text-gray-900 flex items-center gap-3">
            <Settings className="w-6 h-6 text-gray-500" />
            Admin Overrides
          </h2>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-2 border border-blue-100 text-blue-600 rounded-full bg-blue-50 hover:bg-blue-100 transition-all shadow-sm"
        >
          <RefreshCw className="w-3 h-3" />
          Reset State
        </button>
      </div>

      <div className="space-y-5 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {telemetry.map((zone) => {
          const isCritical = zone.density >= 80;
          const isHazard = zone.hazard;

          return (
            <div 
              key={zone.id} 
              className={`p-5 rounded-2xl border transition-all duration-300 ${isHazard ? 'bg-red-50/50 border-red-100' : 'bg-gray-50/30 border-gray-50'}`}
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-gray-900 tracking-tight">{zone.name}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOverride(zone.id, { hazard: !zone.hazard })}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${
                      zone.hazard 
                        ? 'bg-red-500 text-white border-red-600 shadow-lg shadow-red-100' 
                        : 'bg-white text-gray-400 border-gray-200 hover:border-red-400 hover:text-red-500'
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3" />
                    Hazard
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-[10px] items-center">
                  <span className="text-gray-400 font-bold uppercase tracking-widest">Target Density</span>
                  <span className={`font-bold mono tracking-tighter text-sm ${isHazard ? 'text-red-600' : isCritical ? 'text-amber-600' : 'text-blue-600'}`}>
                    {zone.density}%
                  </span>
                </div>
                
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={zone.density}
                  onChange={(e) => onOverride(zone.id, { density: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-gray-50">
        <div className="flex items-start gap-4 p-4 bg-blue-50/30 rounded-2xl border border-blue-50">
          <Smartphone className="w-5 h-5 text-blue-400 shrink-0 mt-1" />
          <p className="text-xs text-gray-500 leading-relaxed">
            Manual overrides bypass real-time IoT telemetry. Use for stress-testing evacuation routes or simulated emergency scenarios.
          </p>
        </div>
      </div>
    </div>
  );
};
