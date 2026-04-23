import React from 'react';
import { Target, Shield } from 'lucide-react';
import { ZoneTelemetry } from '../types';

export const VenueMap = React.memo(({ telemetry }: { telemetry: ZoneTelemetry[] }) => {
  const getZoneColor = (zone?: ZoneTelemetry): string => {
    if (!zone) return 'rgba(255, 255, 255, 0.05)';
    if (zone.hazard || zone.density > 80) return '#ef4444'; // Red
    if (zone.density > 60) return '#fbbf24'; // Yellow
    return '#00F0FF'; // Cyan (Primary)
  };

  const getZoneOpacity = (zone?: ZoneTelemetry): number => {
    if (!zone) return 0.1;
    return 0.3 + (zone.density / 100) * 0.4;
  };

  const findZone = (idChunk: string) => telemetry.find(z => z.id.toLowerCase().includes(idChunk.toLowerCase()));

  // Sector Data Mapping
  const alpha = findZone('Alpha');
  const beta = findZone('Beta');
  const gamma = findZone('Gamma');
  const delta = findZone('Delta');
  const concourse = findZone('Concourse');

  return (
    <div className="flex flex-col p-10 h-full bg-white/[0.02] border border-white/10 shadow-2xl overflow-hidden transition-all">
      <div className="mb-8 flex justify-between items-start">
        <div className="space-y-2">
          <p className="section-label mb-0" aria-hidden="true">Venue Intelligence</p>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-4">
            <Target className="w-8 h-8 text-primary" />
            Stadium Tactical View
          </h2>
        </div>
        <div className="bg-primary/10 px-4 py-2 rounded-xl border border-primary/20 flex items-center gap-3">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Live Security Feed</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative min-h-[450px] rounded-[2rem] bg-background/40 border border-white/10 overflow-hidden shadow-inner flex items-center justify-center p-8 group">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(var(--primary) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        
        <svg viewBox="0 0 500 500" className="w-full h-full relative z-10 drop-shadow-[0_0_30px_rgba(0,240,255,0.1)] transition-transform group-hover:scale-[1.02] duration-700">
          {/* External Stadium Concrete Wall */}
          <circle cx="250" cy="250" r="245" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <circle cx="250" cy="250" r="235" fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />

          {/* Seating Tiers */}
          <g className="seating-tiers">
            {/* Sector A (Alpha/Beta regions) */}
            <path d="M 50,150 A 220,220 0 0 1 250,30 L 250,120 A 130,130 0 0 0 120,190 Z" 
                  fill={getZoneColor(alpha)} fillOpacity={getZoneOpacity(alpha)} stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
            <path d="M 250,30 A 220,220 0 0 1 450,150 L 380,190 A 130,130 0 0 0 250,120 Z" 
                  fill={getZoneColor(beta)} fillOpacity={getZoneOpacity(beta)} stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
            
            {/* Sector B (Gamma/Delta regions) */}
            <path d="M 450,150 A 220,220 0 0 1 450,350 L 380,310 A 130,130 0 0 0 380,190 Z" 
                  fill={getZoneColor(gamma)} fillOpacity={getZoneOpacity(gamma)} stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
            <path d="M 450,350 A 220,220 0 0 1 250,470 L 250,380 A 130,130 0 0 0 380,310 Z" 
                  fill={getZoneColor(delta)} fillOpacity={getZoneOpacity(delta)} stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
            
            <path d="M 250,470 A 220,220 0 0 1 50,350 L 120,310 A 130,130 0 0 0 250,380 Z" 
                  fill={getZoneColor(concourse)} fillOpacity={getZoneOpacity(concourse)} stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
            
            {/* West Gate Area */}
            <path d="M 50,350 A 220,220 0 0 1 50,150 L 120,190 A 130,130 0 0 0 120,310 Z" 
                  fill="rgba(255,255,255,0.05)" fillOpacity="0.8" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
          </g>

          {/* Central Pitch */}
          <circle cx="250" cy="250" r="110" fill="rgba(0,240,255,0.03)" stroke="rgba(0,240,255,0.4)" strokeWidth="2" />
          
          {/* Pitch Markings */}
          <g opacity="0.3">
            <circle cx="250" cy="250" r="100" fill="none" stroke="var(--primary)" strokeWidth="0.5" />
            <circle cx="250" cy="250" r="30" fill="none" stroke="var(--primary)" strokeWidth="0.5" />
            <line x1="150" y1="250" x2="350" y2="250" stroke="var(--primary)" strokeWidth="0.5" />
            <line x1="250" y1="150" x2="250" y2="350" stroke="var(--primary)" strokeWidth="0.5" />
          </g>

          {/* Zone Callouts */}
          <g pointerEvents="none">
            <text x="140" y="110" fontSize="10" fill="white" fontWeight="900" textAnchor="middle" className="tracking-widest uppercase">ALPHA</text>
            <text x="360" y="110" fontSize="10" fill="white" fontWeight="900" textAnchor="middle" className="tracking-widest uppercase">BETA</text>
            <text x="410" y="250" fontSize="10" fill="white" fontWeight="900" textAnchor="middle" className="tracking-widest uppercase">GAMMA</text>
            <text x="360" y="390" fontSize="10" fill="white" fontWeight="900" textAnchor="middle" className="tracking-widest uppercase">DELTA</text>
          </g>
        </svg>

        {/* Floating Legend */}
        <div className="absolute top-6 right-6 flex flex-col gap-2.5 bg-background/80 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
            <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Optimal</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
            <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Warning</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
            <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Critical</span>
          </div>
        </div>
      </div>
    </div>
  );
});
