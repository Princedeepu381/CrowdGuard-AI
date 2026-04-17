import React from 'react';
import { ZoneTelemetry } from '../types';
import { ZoneCard } from './ZoneCard';
import { Activity } from 'lucide-react';

export const Dashboard: React.FC<{ telemetry: ZoneTelemetry[] }> = ({ telemetry }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="section-label mb-1">IoT Telemetry</p>
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center border border-accent/30">
              <Activity className="w-4 h-4 text-accent" />
            </div>
            Live Zone Feed
          </h2>
        </div>
        <div className="flex items-center gap-2 text-[10px] mono text-gray-500 bg-white/3 border border-white/6 rounded-lg px-3 py-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Updating every 3s
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {telemetry.map(zone => (
          <ZoneCard key={zone.id} zone={zone} />
        ))}
      </div>
    </div>
  );
};
