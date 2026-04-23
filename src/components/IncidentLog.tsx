import React from 'react';
import { Terminal, Info, AlertTriangle, AlertOctagon, History } from 'lucide-react';
import { IncidentEvent } from '../types';

const SEV_STYLES = {
  info:     { icon: Info,          cls: 'text-primary',    bg: 'bg-primary/10',    border: 'border-primary/20',  label: 'Info' },
  warning:  { icon: AlertTriangle, cls: 'text-amber-500',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20', label: 'Warning' },
  critical: { icon: AlertOctagon,  cls: 'text-red-500',    bg: 'bg-red-500/10',    border: 'border-red-500/20',   label: 'Critical' },
};

export const IncidentLog: React.FC<{ events: IncidentEvent[] }> = ({ events }) => {
  return (
    <div 
      className="glass-card flex flex-col p-10 h-full bg-white/[0.02] border border-white/10 shadow-2xl overflow-hidden"
      role="region"
      aria-labelledby="incident-log-heading"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <div className="section-label mb-0" aria-hidden="true">System History</div>
          <h2 id="incident-log-heading" className="text-2xl font-bold tracking-tight flex items-center gap-4">
             <Terminal className="w-8 h-8 text-primary" />
             Incident Log
          </h2>
        </div>
        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">
          <History className="w-4 h-4 text-primary" />
          <span>Real-time Feed</span>
        </div>
      </div>

      <div 
        className="flex-1 overflow-y-auto pr-3 space-y-4 custom-scrollbar"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {events.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-text-muted gap-4 opacity-40">
            <Info className="w-16 h-16" />
            <p className="text-xs font-black uppercase tracking-[0.3em]">No recent telemetry incidents</p>
          </div>
        ) : (
          [...events].reverse().map((event) => {
            const style = SEV_STYLES[event.severity] || SEV_STYLES.info;
            return (
              <div
                key={event.id}
                className={`p-6 rounded-2xl border ${style.bg} ${style.border} transition-all duration-300 hover:brightness-110 hover:translate-x-2`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${style.bg}`}>
                      <style.icon className={`w-4 h-4 ${style.cls}`} />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${style.cls}`}>
                      {style.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">{event.timestamp}</span>
                </div>
                <p className="text-sm leading-relaxed font-light text-text-main">{event.message}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
