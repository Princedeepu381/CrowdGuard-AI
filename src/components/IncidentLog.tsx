import React, { useEffect, useRef } from 'react';
import { Terminal, AlertTriangle, Info, AlertOctagon } from 'lucide-react';
import { IncidentEvent } from '../types';

const SEV_STYLES = {
  info:     { icon: Info,         cls: 'text-accent',   dot: 'bg-accent',    row: 'border-white/5'              },
  warning:  { icon: AlertTriangle,cls: 'text-amber-400', dot: 'bg-amber-400', row: 'border-amber-500/15'         },
  critical: { icon: AlertOctagon, cls: 'text-red-400',   dot: 'bg-red-500',   row: 'border-red-500/20 bg-red-500/4' },
};

export const IncidentLog: React.FC<{ events: IncidentEvent[] }> = ({ events }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <div className="glass-card hud-border flex flex-col p-5 h-full min-h-[340px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="section-label mb-1">Live Feed</p>
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center border border-accent/30">
              <Terminal className="w-4 h-4 text-accent" />
            </div>
            Incident Log
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] text-gray-500 mono uppercase tracking-wider">Live</span>
        </div>
      </div>

      {/* Events */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-1.5 pr-1"
      >
        {events.length === 0 && (
          <div className="h-full flex items-center justify-center text-gray-600 text-sm">
            No incidents logged yet…
          </div>
        )}
        {events.map(event => {
          const sev = SEV_STYLES[event.severity];
          const Icon = sev.icon;
          return (
            <div
              key={event.id}
              className={`incident-row flex gap-3 items-start px-3 py-2.5 rounded-xl border ${sev.row} transition-all`}
            >
              {/* Severity dot */}
              <div className="flex flex-col items-center gap-1 pt-0.5 flex-shrink-0">
                <div className={`w-1.5 h-1.5 rounded-full ${sev.dot} ${event.severity === 'critical' ? 'animate-pulse' : ''}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <Icon className={`w-3 h-3 ${sev.cls} flex-shrink-0`} />
                  <span className="mono text-[10px] text-gray-600">{event.timestamp}</span>
                </div>
                <p className="text-xs text-gray-300 leading-snug">{event.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
