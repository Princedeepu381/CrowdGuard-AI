import React from 'react';
import { Terminal, Info, AlertTriangle, AlertOctagon, History } from 'lucide-react';
import { IncidentEvent } from '../types';

const SEV_STYLES = {
  info:     { icon: Info,          cls: 'text-blue-500',    bg: 'bg-blue-50',    border: 'border-blue-100',  label: 'Info' },
  warning:  { icon: AlertTriangle, cls: 'text-amber-500',   bg: 'bg-amber-50',   border: 'border-amber-100', label: 'Warning' },
  critical: { icon: AlertOctagon,  cls: 'text-red-500',    bg: 'bg-red-50',    border: 'border-red-100',   label: 'Critical' },
};

export const IncidentLog: React.FC<{ events: IncidentEvent[] }> = ({ events }) => {
  return (
    <div 
      className="glass-card flex flex-col p-8 h-full bg-white border border-gray-100 shadow-sm overflow-hidden"
      role="region"
      aria-labelledby="incident-log-heading"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <p className="section-label mb-0" aria-hidden="true">System History</p>
          <h2 id="incident-log-heading" className="text-xl font-medium tracking-tight text-gray-900 flex items-center gap-3">
             <Terminal className="w-6 h-6 text-gray-700" />
             Incident Log
          </h2>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full border border-gray-100 shadow-sm text-[11px] font-bold text-gray-500 mono uppercase tracking-wider">
          <History className="w-3 h-3" />
          <span>Real-time</span>
        </div>
      </div>

      <div 
        className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {events.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-2 opacity-60">
            <Info className="w-10 h-10" />
            <p className="text-xs font-medium uppercase tracking-widest">No recent incidents</p>
          </div>
        ) : (
          [...events].reverse().map((event) => {
            const style = SEV_STYLES[event.severity] || SEV_STYLES.info;
            return (
              <div
                key={event.id}
                className={`p-4 rounded-2xl border ${style.bg} ${style.border} transition-all duration-300 hover:shadow-md hover:translate-x-1`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <style.icon className={`w-3.5 h-3.5 ${style.cls}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${style.cls}`}>
                      {style.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-widest">{event.timestamp}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed font-medium">{event.message}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
