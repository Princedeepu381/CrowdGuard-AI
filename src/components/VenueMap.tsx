import React from 'react';
import { LayoutDashboard } from 'lucide-react';
import { ZoneTelemetry } from '../types';

export const VenueMap: React.FC<{ telemetry: ZoneTelemetry[] }> = ({ telemetry }) => {
  const getZoneColor = (zone?: ZoneTelemetry): string => {
    if (!zone) return '#374151';
    if (zone.hazard) return '#dc2626';
    if (zone.density > 80) return '#ef4444';
    if (zone.density > 60) return '#d97706';
    return '#16a34a';
  };

  const getZoneBorder = (zone?: ZoneTelemetry): string => {
    if (!zone) return '#4b5563';
    if (zone.hazard || zone.density > 80) return '#f87171';
    if (zone.density > 60) return '#fbbf24';
    return '#4ade80';
  };

  const getZoneOpacity = (zone?: ZoneTelemetry): number => {
    if (!zone) return 0.4;
    return 0.85;
  };

  const getGlowFilter = (zone?: ZoneTelemetry): string => {
    if (!zone) return '';
    if (zone.hazard || zone.density > 80) return 'url(#glowRed)';
    if (zone.density > 60) return 'url(#glowAmber)';
    return 'url(#glowGreen)';
  };

  const findZone = (idChunk: string) => telemetry.find(z => z.id.includes(idChunk));

  const alpha = findZone('Alpha');
  const beta = findZone('Beta');
  const gamma = findZone('Gamma');
  const delta = findZone('Delta');
  const exitNorth = findZone('North');
  const exitSouth = findZone('South');
  const exitEast = findZone('East');
  const concourseA = findZone('Concourse_A');

  const ZoneLabel: React.FC<{ x: number; y: number; label: string; density?: number; small?: boolean }> = ({ x, y, label, density, small }) => (
    <>
      <text x={x} y={y} fill="white" fontSize={small ? 9 : 10} textAnchor="middle" fontWeight="700" fontFamily="Inter, sans-serif">
        {label}
      </text>
      {density !== undefined && (
        <text x={x} y={y + 12} fill="rgba(255,255,255,0.8)" fontSize={8} textAnchor="middle" fontFamily="Inter, sans-serif">
          {density}%
        </text>
      )}
    </>
  );

  return (
    <div className="glass-card hud-border flex flex-col p-5 h-full">
      {/* Header */}
      <div className="mb-4">
        <p className="section-label mb-1">Stadium Schematic</p>
        <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center border border-accent/30">
            <LayoutDashboard className="w-4 h-4 text-accent" />
          </div>
          Venue Map
        </h2>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-3 text-[10px] font-semibold">
        <span className="flex items-center gap-1.5 text-gray-400"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Clear</span>
        <span className="flex items-center gap-1.5 text-gray-400"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Moderate</span>
        <span className="flex items-center gap-1.5 text-gray-400"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Critical</span>
      </div>

      <div className="flex-1 relative min-h-[340px]">
        <svg viewBox="0 0 500 420" className="w-full h-full" style={{ filter: 'drop-shadow(0 0 20px rgba(0,212,255,0.08))' }}>
          <defs>
            <filter id="glowRed" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="glowGreen" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="glowAmber" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <radialGradient id="pitchGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#15803d" />
              <stop offset="60%" stopColor="#166534" />
              <stop offset="100%" stopColor="#14532d" />
            </radialGradient>
          </defs>

          {/* ── Outer stadium shell ── */}
          <ellipse cx="250" cy="200" rx="230" ry="185" fill="#111827" stroke="#1e293b" strokeWidth="2" />
          <ellipse cx="250" cy="200" rx="215" ry="172" fill="#0f172a" stroke="#1f2937" strokeWidth="1" />

          {/* ── Seating bowl sectors ── */}
          {/* North – Zone Alpha */}
          <path d="M 160,35 A 215,172 0 0 1 340,35 L 310,80 A 155,118 0 0 0 190,80 Z"
            fill={getZoneColor(alpha)} opacity={getZoneOpacity(alpha)} stroke={getZoneBorder(alpha)} strokeWidth="1.5" filter={getGlowFilter(alpha)} />
          {/* South – Zone Beta */}
          <path d="M 160,365 A 215,172 0 0 0 340,365 L 310,320 A 155,118 0 0 1 190,320 Z"
            fill={getZoneColor(beta)} opacity={getZoneOpacity(beta)} stroke={getZoneBorder(beta)} strokeWidth="1.5" filter={getGlowFilter(beta)} />
          {/* West – Zone Gamma */}
          <path d="M 35,115 A 215,172 0 0 0 35,285 L 95,262 A 155,118 0 0 1 95,138 Z"
            fill={getZoneColor(gamma)} opacity={getZoneOpacity(gamma)} stroke={getZoneBorder(gamma)} strokeWidth="1.5" filter={getGlowFilter(gamma)} />
          {/* East – Zone Delta */}
          <path d="M 465,115 A 215,172 0 0 1 465,285 L 405,262 A 155,118 0 0 0 405,138 Z"
            fill={getZoneColor(delta)} opacity={getZoneOpacity(delta)} stroke={getZoneBorder(delta)} strokeWidth="1.5" filter={getGlowFilter(delta)} />
          {/* NW Corner – Concourse A */}
          <path d="M 35,115 A 215,172 0 0 1 160,35 L 190,80 A 155,118 0 0 0 95,138 Z"
            fill={getZoneColor(concourseA)} opacity={getZoneOpacity(concourseA)} stroke={getZoneBorder(concourseA)} strokeWidth="1.5" filter={getGlowFilter(concourseA)} />
          {/* NE, SW, SE Corners */}
          <path d="M 340,35 A 215,172 0 0 1 465,115 L 405,138 A 155,118 0 0 0 310,80 Z" fill="#1f2937" opacity="0.5" stroke="#374151" strokeWidth="1" />
          <path d="M 35,285 A 215,172 0 0 0 160,365 L 190,320 A 155,118 0 0 1 95,262 Z" fill="#1f2937" opacity="0.5" stroke="#374151" strokeWidth="1" />
          <path d="M 340,365 A 215,172 0 0 0 465,285 L 405,262 A 155,118 0 0 1 310,320 Z" fill="#1f2937" opacity="0.5" stroke="#374151" strokeWidth="1" />

          {/* ── Running track ── */}
          <ellipse cx="250" cy="200" rx="155" ry="118" fill="#1e293b" stroke="#374151" strokeWidth="1" />
          <ellipse cx="250" cy="200" rx="148" ry="112" fill="none" stroke="#475569" strokeWidth="0.5" strokeDasharray="4,3" />

          {/* ── Football pitch ── */}
          <ellipse cx="250" cy="200" rx="140" ry="105" fill="url(#pitchGrad)" stroke="#15803d" strokeWidth="1.5" />
          {[-90, -60, -30, 0, 30, 60, 90].map(offset => (
            <line key={offset}
              x1={250 + offset}
              y1={200 - Math.sqrt(Math.max(0, 105 * 105 * (1 - (offset * offset) / (140 * 140))))}
              x2={250 + offset}
              y2={200 + Math.sqrt(Math.max(0, 105 * 105 * (1 - (offset * offset) / (140 * 140))))}
              stroke="#166534" strokeWidth="6" opacity="0.4" />
          ))}
          <circle cx="250" cy="200" r="28" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          <circle cx="250" cy="200" r="3" fill="rgba(255,255,255,0.7)" />
          <line x1="110" y1="200" x2="390" y2="200" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
          <rect x="155" y="170" width="60" height="60" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" rx="1" />
          <rect x="285" y="170" width="60" height="60" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" rx="1" />
          <rect x="112" y="185" width="26" height="30" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
          <rect x="362" y="185" width="26" height="30" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />

          {/* ── Exit gates ── */}
          <rect x="220" y="2" width="60" height="28" rx="5"
            fill={getZoneColor(exitNorth)} stroke={getZoneBorder(exitNorth)} strokeWidth="2"
            filter={getGlowFilter(exitNorth)} opacity="0.95" />
          <text x="250" y="13" fill="white" fontSize="8" textAnchor="middle" fontWeight="800" fontFamily="Inter, sans-serif">EXIT</text>
          <text x="250" y="24" fill="white" fontSize="8" textAnchor="middle" fontFamily="Inter, sans-serif">NORTH</text>
          {exitNorth && <text x="250" y="38" fill="rgba(255,255,255,0.7)" fontSize="7" textAnchor="middle">{exitNorth.density}%</text>}

          <rect x="220" y="390" width="60" height="28" rx="5"
            fill={getZoneColor(exitSouth)} stroke={getZoneBorder(exitSouth)} strokeWidth="2"
            filter={getGlowFilter(exitSouth)} opacity="0.95" />
          <text x="250" y="402" fill="white" fontSize="8" textAnchor="middle" fontWeight="800" fontFamily="Inter, sans-serif">EXIT</text>
          <text x="250" y="413" fill="white" fontSize="8" textAnchor="middle" fontFamily="Inter, sans-serif">SOUTH</text>
          {exitSouth && <text x="250" y="388" fill="rgba(255,255,255,0.7)" fontSize="7" textAnchor="middle">{exitSouth.density}%</text>}

          <rect x="462" y="182" width="34" height="36" rx="5"
            fill={getZoneColor(exitEast)} stroke={getZoneBorder(exitEast)} strokeWidth="2"
            filter={getGlowFilter(exitEast)} opacity="0.95" />
          <text x="479" y="197" fill="white" fontSize="7.5" textAnchor="middle" fontWeight="800" fontFamily="Inter, sans-serif">EXIT</text>
          <text x="479" y="207" fill="white" fontSize="7.5" textAnchor="middle" fontFamily="Inter, sans-serif">EAST</text>
          {exitEast && <text x="479" y="218" fill="rgba(255,255,255,0.7)" fontSize="7" textAnchor="middle">{exitEast.density}%</text>}

          {/* ── Zone labels ── */}
          <ZoneLabel x={250} y={56} label="Zone Alpha" density={alpha?.density} />
          <ZoneLabel x={250} y={346} label="Zone Beta" density={beta?.density} />
          <ZoneLabel x={64} y={196} label="Zone Gamma" density={gamma?.density} />
          <ZoneLabel x={436} y={196} label="Zone Delta" density={delta?.density} />
          <ZoneLabel x={110} y={90} label="Concourse A" density={concourseA?.density} small />

          {/* Hazard warnings */}
          {alpha?.hazard && <text x={250} y={72} fontSize="14" textAnchor="middle">⚠️</text>}
          {beta?.hazard && <text x={250} y={362} fontSize="14" textAnchor="middle">⚠️</text>}
          {gamma?.hazard && <text x={64} y={212} fontSize="14" textAnchor="middle">⚠️</text>}
          {delta?.hazard && <text x={436} y={212} fontSize="14" textAnchor="middle">⚠️</text>}
          {exitNorth?.hazard && <text x={250} y={46} fontSize="12" textAnchor="middle">⚠️</text>}
          {exitSouth?.hazard && <text x={250} y={383} fontSize="12" textAnchor="middle">⚠️</text>}
          {exitEast?.hazard && <text x={479} y={225} fontSize="12" textAnchor="middle">⚠️</text>}

          {/* Outer glow ring */}
          <ellipse cx="250" cy="200" rx="230" ry="185" fill="none" stroke="#00D4FF" strokeWidth="0.5" opacity="0.2" />
        </svg>
      </div>
    </div>
  );
};
