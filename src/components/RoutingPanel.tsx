import React, { useState } from 'react';
import { MapPin, Target, ShieldCheck, ShieldAlert, ArrowRight, Zap, Navigation } from 'lucide-react';
import { ZoneTelemetry, RouteResponse } from '../types';
import { getSafeRoute } from '../lib/routingEngine';

export const RoutingPanel: React.FC<{ telemetry: ZoneTelemetry[] }> = ({ telemetry }) => {
  const [start, setStart] = useState('');
  const [dest, setDest] = useState('');
  const [routeData, setRouteData] = useState<RouteResponse | null>(null);
  const [computing, setComputing] = useState(false);

  const handleRoute = () => {
    if (!start || !dest) return;
    setComputing(true);
    setRouteData(null);
    setTimeout(() => {
      const result = getSafeRoute(start, dest, telemetry);
      setRouteData(result);
      setComputing(false);
    }, 700);
  };

  const isUnsafe = (routeData?.time_saved_minutes ?? 0) > 0;

  return (
    <div className="glass-card hud-border flex flex-col gap-5 p-6 h-full">
      {/* Header */}
      <div>
        <p className="section-label mb-1">Routing Engine</p>
        <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center border border-accent/30">
            <Navigation className="w-4 h-4 text-accent" />
          </div>
          AI Safety Routing
        </h2>
      </div>

      {/* Inputs */}
      <div className="space-y-3">
        <div>
          <label className="section-label block mb-1.5">Origin Zone</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
            <select
              id="routing-origin"
              className="w-full border border-white/10 text-white text-sm rounded-xl pl-9 pr-3 py-2.5 outline-none transition-colors appearance-none cursor-pointer"
              style={{ backgroundColor: '#0d1525', color: 'white', colorScheme: 'dark' }}
              value={start}
              onChange={(e) => setStart(e.target.value)}
            >
              <option value="" style={{ backgroundColor: '#0d1525', color: '#9ca3af' }}>Select origin…</option>
              {telemetry.map(z => (
                <option key={z.id} value={z.id} style={{ backgroundColor: '#0d1525', color: 'white' }}>
                  {z.name} — {z.density}%
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="w-px h-4 bg-white/10" />
        </div>

        <div>
          <label className="section-label block mb-1.5">Destination</label>
          <div className="relative">
            <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
            <select
              id="routing-destination"
              className="w-full border border-white/10 text-white text-sm rounded-xl pl-9 pr-3 py-2.5 outline-none transition-colors appearance-none cursor-pointer"
              style={{ backgroundColor: '#0d1525', color: 'white', colorScheme: 'dark' }}
              value={dest}
              onChange={(e) => setDest(e.target.value)}
            >
              <option value="" style={{ backgroundColor: '#0d1525', color: '#9ca3af' }}>Select destination…</option>
              {telemetry.map(z => (
                <option key={z.id} value={z.id} style={{ backgroundColor: '#0d1525', color: 'white' }}>
                  {z.name} — {z.density}%
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          id="get-safe-route-btn"
          onClick={handleRoute}
          disabled={!start || !dest || computing}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 bg-accent text-black hover:bg-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ boxShadow: '0 0 24px rgba(0,212,255,0.35)' }}
        >
          {computing ? (
            <>
              <div className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
              Computing Route…
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Get Safe Route
            </>
          )}
        </button>
      </div>

      {/* Result */}
      {routeData && (
        <div className="animate-fade-slide-up space-y-3">
          {/* Threat box */}
          <div className={`rounded-xl p-4 border ${isUnsafe ? 'bg-red-500/8 border-red-500/25' : 'bg-emerald-500/8 border-emerald-500/25'}`}>
            <div className="flex items-center gap-2 mb-2">
              {isUnsafe
                ? <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
                : <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
              <span className={`text-xs font-bold tracking-wider ${isUnsafe ? 'text-red-400' : 'text-emerald-400'}`}>
                {isUnsafe ? 'THREAT DETECTED' : 'PATH CLEAR'}
              </span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed mb-1">{routeData.threat_analysis}</p>
            <p className="text-xs font-semibold text-white">{routeData.action_directive}</p>
          </div>

          {/* Route path */}
          <div className="bg-white/3 rounded-xl p-4 border border-white/6">
            <p className="section-label mb-3">Safe Route</p>
            <div className="flex flex-wrap items-center gap-2">
              {routeData.safe_route.map((step, idx) => (
                <React.Fragment key={idx}>
                  <span className="px-3 py-1 rounded-lg bg-white/8 text-xs font-semibold text-white border border-white/10">{step}</span>
                  {idx < routeData.safe_route.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-gray-600 flex-shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
            {routeData.time_saved_minutes > 0 && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-400 text-xs font-bold">
                <Zap className="w-3 h-3" />
                Reroute saves ~{routeData.time_saved_minutes} min
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
