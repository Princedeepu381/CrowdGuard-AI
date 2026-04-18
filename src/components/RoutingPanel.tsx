import React, { useState } from 'react';
import { MapPin, ArrowRight, Zap, Navigation, ChevronDown } from 'lucide-react';
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
    }, 800);
  };

  const isUnsafe = (routeData?.time_saved_minutes ?? 0) > 0;

  return (
    <div className="glass-card p-8 flex flex-col gap-6 bg-white border border-gray-100 shadow-sm relative overflow-hidden">
      {/* Header */}
      <div className="space-y-1">
        <p className="section-label mb-0" aria-hidden="true">Travel Optimizer</p>
        <h2 className="text-xl font-medium tracking-tight text-gray-900 flex items-center gap-3">
          <Navigation className="w-6 h-6 text-blue-500" />
          Safety Routing
        </h2>
      </div>

      {/* Selects */}
      <div className="space-y-4 relative z-10">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Origin</label>
          <div className="relative group">
            <select
              className="w-full bg-gray-50 border border-gray-100 text-gray-800 rounded-2xl p-4 outline-none appearance-none cursor-pointer focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50/50 transition-all text-sm font-medium"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            >
              <option value="">Choose origin sector…</option>
              {telemetry.map(z => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-focus-within:text-blue-500" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Destination</label>
          <div className="relative group">
            <select
              className="w-full bg-gray-50 border border-gray-100 text-gray-800 rounded-2xl p-4 outline-none appearance-none cursor-pointer focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50/50 transition-all text-sm font-medium"
              value={dest}
              onChange={(e) => setDest(e.target.value)}
            >
              <option value="">Choose destination…</option>
              {telemetry.map(z => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-focus-within:text-blue-500" />
          </div>
        </div>

        <button
          onClick={handleRoute}
          disabled={!start || !dest || computing}
          className="w-full mt-2 flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-blue-700 hover:shadow-lg focus:ring-4 focus:ring-blue-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          {computing ? <Zap className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
          {computing ? 'Calculating Path...' : 'Get Safe Route'}
        </button>
      </div>

      {routeData && (
        <div className="animate-slide-up space-y-4 pt-4 border-t border-gray-50">
          <div className={`rounded-3xl p-5 border ${isUnsafe ? 'bg-red-50 border-red-100 text-red-800' : 'bg-green-50 border-green-100 text-green-800'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                {isUnsafe ? '⚠️ Alert Found' : '✅ Route Scanned'}
              </span>
            </div>
            <p className="text-sm font-medium leading-relaxed">{routeData.threat_analysis}</p>
          </div>

          <div className="bg-gray-50/50 rounded-3xl p-5 border border-gray-100">
            <p className="section-label mb-3">Proposed Vector</p>
            <div className="flex flex-wrap items-center gap-2">
              {routeData.safe_route.map((step, idx) => (
                <React.Fragment key={idx}>
                  <span className="px-3 py-1.5 bg-white border border-gray-100 text-gray-700 rounded-lg text-xs font-bold uppercase tracking-tight shadow-sm">{step}</span>
                  {idx < routeData.safe_route.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-blue-400 flex-shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
            {routeData.time_saved_minutes > 0 && (
              <div className="mt-5 text-blue-600 text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 w-fit">
                <Zap className="w-3 h-3" /> Efficiency Gain: ~{routeData.time_saved_minutes} MIN
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
