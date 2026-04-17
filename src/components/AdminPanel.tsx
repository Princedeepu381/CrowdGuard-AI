import React from 'react';
import { Settings, RefreshCw, AlertTriangle } from 'lucide-react';
import { ZoneTelemetry } from '../types';

export const AdminPanel: React.FC<{
  telemetry: ZoneTelemetry[],
  onOverride: (id: string, updates: Partial<ZoneTelemetry>) => void,
  onReset: () => void
}> = ({ telemetry, onOverride, onReset }) => {
  return (
    <section
      className="glass-card hud-border flex flex-col p-5 h-full"
      aria-labelledby="admin-panel-heading"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="section-label mb-1" aria-hidden="true">Control Room</p>
          <h2
            id="admin-panel-heading"
            className="text-lg font-bold text-white flex items-center gap-2.5"
          >
            <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center border border-accent/30" aria-hidden="true">
              <Settings className="w-4 h-4 text-accent" aria-hidden="true" />
            </div>
            Admin Override
          </h2>
        </div>
        <button
          id="reset-all-btn"
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          aria-label="Reset all zones to baseline state"
        >
          <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" /> Reset All
        </button>
      </div>

      <div
        className="overflow-y-auto space-y-2 flex-1 pr-1"
        role="list"
        aria-label="Zone override controls"
      >
        {telemetry.map(zone => {
          const isHazard = zone.hazard;
          const isCritical = zone.density > 80 || isHazard;
          return (
            <div
              key={zone.id}
              className={`rounded-xl p-3 border transition-colors ${isHazard ? 'bg-red-500/6 border-red-500/20' : 'bg-white/2 border-white/6'}`}
              role="listitem"
              aria-label={`Controls for ${zone.name}`}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isCritical ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}
                    aria-hidden="true"
                  />
                  <span className="text-xs font-semibold text-white">{zone.name}</span>
                </div>

                {/* Hazard toggle */}
                <label
                  className="flex items-center gap-2 cursor-pointer select-none"
                  htmlFor={`hazard-toggle-${zone.id}`}
                  aria-label={`Toggle hazard for ${zone.name}, currently ${zone.hazard ? 'active' : 'inactive'}`}
                >
                  <span className="flex items-center gap-1 text-[10px] text-gray-500" aria-hidden="true">
                    <AlertTriangle className="w-3 h-3" aria-hidden="true" /> Hazard
                  </span>
                  <div className="relative" aria-hidden="true">
                    <input
                      id={`hazard-toggle-${zone.id}`}
                      type="checkbox"
                      checked={zone.hazard}
                      onChange={(e) => onOverride(zone.id, { hazard: e.target.checked })}
                      className="sr-only peer"
                      aria-checked={zone.hazard}
                    />
                    <div className={`w-9 h-5 rounded-full transition-colors duration-200 ${zone.hazard ? 'bg-red-500' : 'bg-gray-700'} peer-focus:ring-1 peer-focus:ring-red-500/50`} />
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${zone.hazard ? 'translate-x-4' : ''}`} />
                  </div>
                </label>
              </div>

              {/* Density slider */}
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <label
                    htmlFor={`density-slider-${zone.id}`}
                    className="text-gray-500 mono"
                  >
                    DENSITY
                  </label>
                  <span className={`font-bold mono ${isCritical ? 'text-red-400' : zone.density > 60 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {zone.density}%
                  </span>
                </div>
                <input
                  id={`density-slider-${zone.id}`}
                  type="range"
                  min="0"
                  max="100"
                  value={zone.density}
                  onChange={(e) => onOverride(zone.id, { density: parseInt(e.target.value) })}
                  className="w-full h-1 rounded-lg appearance-none cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                  aria-label={`Set density for ${zone.name}`}
                  aria-valuenow={zone.density}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  style={{
                    accentColor: isCritical ? '#ef4444' : zone.density > 60 ? '#f59e0b' : '#34d399',
                    background: `linear-gradient(to right, ${isCritical ? '#ef4444' : zone.density > 60 ? '#f59e0b' : '#34d399'} ${zone.density}%, rgba(255,255,255,0.1) ${zone.density}%)`
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
