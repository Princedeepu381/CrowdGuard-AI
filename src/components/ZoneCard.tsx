import React from 'react';
import { ShieldAlert, Clock, TrendingUp } from 'lucide-react';
import { ZoneTelemetry } from '../types';

const STATUS_STYLE: Record<string, { badge: string; bar: string; glow: string; text: string }> = {
  CLEAR:     { badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', bar: 'bg-emerald-400', glow: 'rgba(52,211,153,0.12)',  text: 'text-emerald-400' },
  MODERATE:  { badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',       bar: 'bg-amber-400',   glow: 'rgba(251,191,36,0.10)',  text: 'text-amber-400'   },
  CONGESTED: { badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30',   bar: 'bg-orange-400',  glow: 'rgba(251,146,60,0.12)',  text: 'text-orange-400'  },
  CRITICAL:  { badge: 'bg-red-500/20 text-red-400 border-red-500/30',            bar: 'bg-red-500',     glow: 'rgba(239,68,68,0.15)',   text: 'text-red-400'     },
};

export const ZoneCard: React.FC<{ zone: ZoneTelemetry }> = ({ zone }) => {
  const key = zone.hazard ? 'CRITICAL' : zone.status;
  const styles = STATUS_STYLE[key] ?? STATUS_STYLE.CLEAR;
  const trend = zone.density > 70 ? 'HIGH' : zone.density > 45 ? 'MED' : 'LOW';

  return (
    <article
      className={`relative overflow-hidden rounded-2xl p-4 border transition-all duration-700 group ${zone.hazard ? 'pulse-hazard border-red-500/40' : 'border-white/6 hover:border-white/12'}`}
      style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)', boxShadow: `0 4px 30px ${styles.glow}` }}
      aria-label={`${zone.name}: density ${zone.density}%, status ${zone.status}${zone.hazard ? ', HAZARD ACTIVE' : ''}`}
      aria-live={zone.hazard ? 'assertive' : 'polite'}
      aria-atomic="false"
    >
      {/* Hazard blink overlay */}
      {zone.hazard && (
        <div className="absolute inset-0 bg-red-500/5 animate-pulse rounded-2xl pointer-events-none" aria-hidden="true" />
      )}

      {/* Top row */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="section-label mb-1" aria-hidden="true">Zone ID</p>
          <h3 className="font-bold text-sm text-white tracking-wide leading-tight">{zone.name}</h3>
        </div>
        <div className="flex items-center gap-2" role="group" aria-label={`Zone status indicators for ${zone.name}`}>
          {zone.hazard && (
            <span
              className="badge-blink inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40"
              role="status"
              aria-label="Hazard active"
            >
              <ShieldAlert className="w-3 h-3" aria-hidden="true" /> HAZARD
            </span>
          )}
          <span
            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${styles.badge}`}
            role="status"
            aria-label={`Zone status: ${zone.status}`}
          >
            {zone.status}
          </span>
        </div>
      </div>

      {/* Density value + wait time */}
      <div className="flex items-end justify-between mb-4">
        <div className="flex items-baseline gap-1">
          <span
            className={`text-4xl font-black mono counter-tick ${styles.text}`}
            aria-label={`Density: ${zone.density} percent`}
          >
            {zone.density}
          </span>
          <span className="text-lg font-bold text-gray-500" aria-hidden="true">%</span>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-1 mb-0.5" aria-hidden="true">
            <Clock className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-400">Wait</span>
          </div>
          <span
            className="mono text-base font-semibold text-white"
            aria-label={`Estimated wait time: ${zone.wait_time} seconds`}
          >
            {zone.wait_time}s
          </span>
        </div>
      </div>

      {/* Density progress bar */}
      <div
        role="progressbar"
        aria-valuenow={zone.density}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${zone.name} density level`}
        className="relative w-full h-1.5 rounded-full bg-white/5 overflow-hidden mb-2"
      >
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ease-in-out ${styles.bar}`}
          style={{ width: `${zone.density}%` }}
        />
        {/* shimmer */}
        <div
          className="absolute left-0 top-0 h-full rounded-full opacity-40 transition-all duration-1000"
          style={{ width: `${zone.density}%`, background: 'linear-gradient(90deg, transparent 40%, rgba(255,255,255,0.5) 60%, transparent 80%)', backgroundSize: '200% auto', animation: 'shimmer 2s linear infinite' }}
          aria-hidden="true"
        />
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-gray-600 mono" aria-hidden="true">DENSITY LEVEL</span>
        <div className="flex items-center gap-1" aria-label={`Trend: ${trend}`}>
          <TrendingUp className="w-3 h-3 text-gray-600" aria-hidden="true" />
          <span className="text-[10px] text-gray-600 mono">{trend}</span>
        </div>
      </div>
    </article>
  );
};
