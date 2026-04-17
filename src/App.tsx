import { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Clock, Wifi, AlertTriangle } from 'lucide-react';
import { INITIAL_ZONES, simulateTelemetry } from './lib/mockApi';
import { logIncidentToFirebase } from './lib/firebaseService';
import { ZoneTelemetry, IncidentEvent } from './types';
import { Dashboard } from './components/Dashboard';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { VenueMap } from './components/VenueMap';
import { RoutingPanel } from './components/RoutingPanel';
import { IncidentLog } from './components/IncidentLog';
import { AdminPanel } from './components/AdminPanel';

export default function App() {
  const [telemetry, setTelemetry] = useState<ZoneTelemetry[]>(INITIAL_ZONES);
  const [history, setHistory] = useState<any[]>([]);
  const [events, setEvents] = useState<IncidentEvent[]>([]);
  const [overrides, setOverrides] = useState<Record<string, Partial<ZoneTelemetry>>>({});
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [tick, setTick] = useState(0);

  // live clock
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(t);
  }, []);

  // seed history
  useEffect(() => {
    const seed: any = { time: new Date().toLocaleTimeString() };
    INITIAL_ZONES.forEach(z => { seed[z.id] = z.density; });
    setHistory([seed]);
  }, []);

  const addEvent = useCallback((msg: string, severity: IncidentEvent['severity']) => {
    const e: IncidentEvent = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      timestamp: new Date().toLocaleTimeString(),
      message: msg,
      severity,
    };
    // Persist to Firebase Realtime Database for audit trail
    logIncidentToFirebase(e);
    setEvents(prev => [...prev.slice(-99), e]);
  }, []);

  // telemetry loop — runs every 3 seconds simulating live IoT sensors
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => {
        const next = simulateTelemetry(prev, overrides);

        // update history ringbuffer (last 30 data points)
        setHistory(h => {
          const point: any = { time: new Date().toLocaleTimeString() };
          next.forEach(z => { point[z.id] = z.density; });
          return [...h.slice(-29), point];
        });

        // Detect and log incident transitions
        next.forEach(newZ => {
          const oldZ = prev.find(z => z.id === newZ.id);
          if (!oldZ) return;
          if (!oldZ.hazard && newZ.hazard) addEvent(`⚠️ HAZARD activated in ${newZ.name}`, 'critical');
          else if (oldZ.hazard && !newZ.hazard) addEvent(`✅ Hazard cleared in ${newZ.name}`, 'info');
          else if (oldZ.density < 80 && newZ.density >= 80) addEvent(`🔴 ${newZ.name} hit critical density (${newZ.density}%)`, 'warning');
          else if (oldZ.density >= 80 && newZ.density < 80) addEvent(`🟢 ${newZ.name} returned below critical`, 'info');
        });

        setTick(t => t + 1);
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [overrides, addEvent]);

  const handleOverride = useCallback((id: string, updates: Partial<ZoneTelemetry>) => {
    setOverrides(prev => ({ ...prev, [id]: { ...prev[id], ...updates } }));
    setTelemetry(prev => prev.map(z => {
      if (z.id !== id) return z;
      return { ...z, ...updates };
    }));
    if (updates.hazard !== undefined) addEvent(`Admin set hazard=${updates.hazard} on ${id.replace('_', ' ')}`, updates.hazard ? 'critical' : 'info');
    if (updates.density !== undefined) addEvent(`Admin set density=${updates.density}% on ${id.replace('_', ' ')}`, 'warning');
  }, [addEvent]);

  const handleReset = useCallback(() => {
    setOverrides({});
    setTelemetry(INITIAL_ZONES);
    addEvent('System reset to baseline state by admin', 'info');
  }, [addEvent]);

  const totalUnsafe = telemetry.filter(z => z.density > 80 || z.hazard).length;

  return (
    // Landmark: application root
    <div className="min-h-screen px-4 md:px-6 xl:px-8 py-5 selection:bg-accent/30 selection:text-white">

      {/* Skip navigation link for keyboard / screen reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-black focus:font-bold focus:rounded-lg focus:no-underline"
      >
        Skip to main content
      </a>

      {/* ═══ HEADER ═══ */}
      <header
        role="banner"
        className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-5 border-b border-white/6"
        aria-label="CrowdGuard-AI Command Center Header"
      >
        {/* Brand */}
        <div className="flex items-center gap-3.5">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#00D4FF22,#00D4FF44)', border: '1px solid rgba(0,212,255,0.4)', boxShadow: '0 0 20px rgba(0,212,255,0.2)' }}
            aria-hidden="true"
          >
            <ShieldCheck className="w-6 h-6 text-accent" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-xl font-black tracking-tight text-white">CrowdGuard</h1>
              <span className="text-xl font-black text-accent" aria-label="AI">AI</span>
            </div>
            <p className="text-[10px] tracking-widest text-gray-500 uppercase font-semibold">Venue Safety Command Center</p>
          </div>
        </div>

        {/* Status bar */}
        <div
          className="flex items-center gap-3 flex-wrap"
          role="status"
          aria-live="assertive"
          aria-atomic="true"
        >
          {totalUnsafe > 0 && (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-bold animate-pulse"
              role="alert"
              aria-label={`${totalUnsafe} unsafe zone${totalUnsafe > 1 ? 's' : ''} detected`}
            >
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
              {totalUnsafe} UNSAFE ZONE{totalUnsafe > 1 ? 'S' : ''}
            </div>
          )}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/3 border border-white/8 text-xs text-gray-400"
            aria-label={`IoT Feed Active, tick number ${tick}`}
          >
            <Wifi className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
            <span className="mono">IoT Feed Active</span>
            <span className="text-gray-600" aria-hidden="true">·</span>
            <span className="mono text-gray-500" aria-label={`Tick ${tick}`}>Tick #{tick}</span>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/3 border border-white/8"
            aria-label={`Current time is ${currentTime}`}
          >
            <Clock className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
            <span className="mono text-sm text-white font-medium" aria-live="polite">{currentTime}</span>
          </div>
        </div>
      </header>

      {/* ═══ MAIN LAYOUT ═══ */}
      <main
        id="main-content"
        className="grid grid-cols-1 xl:grid-cols-12 gap-5"
        role="main"
        aria-label="Venue Safety Dashboard"
      >
        {/* LEFT: main content */}
        <div className="xl:col-span-8 flex flex-col gap-5">
          {/* Zone grid */}
          <section aria-labelledby="zone-feed-heading">
            <Dashboard telemetry={telemetry} />
          </section>

          {/* Map + Incident side-by-side */}
          <section
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
            aria-label="Venue Map and Incident Log"
          >
            <VenueMap telemetry={telemetry} />
            <IncidentLog events={events} />
          </section>

          {/* Analytics full-width */}
          <section aria-labelledby="analytics-heading">
            <AnalyticsPanel telemetry={telemetry} history={history} />
          </section>
        </div>

        {/* RIGHT: sidebar */}
        <div className="xl:col-span-4 flex flex-col gap-5" role="complementary" aria-label="Controls and Routing">
          <RoutingPanel telemetry={telemetry} />
          <AdminPanel telemetry={telemetry} onOverride={handleOverride} onReset={handleReset} />
        </div>

      </main>

      {/* Footer */}
      <footer
        role="contentinfo"
        className="mt-8 pb-2 flex justify-between items-center text-[10px] text-gray-700 mono border-t border-white/4 pt-4"
        aria-label="Application footer"
      >
        <span>CrowdGuard-AI v1.0.0 — Venue Safety Intelligence</span>
        <span>Powered by Google Cloud Run &amp; Firebase · {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
