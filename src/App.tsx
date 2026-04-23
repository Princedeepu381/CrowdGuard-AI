import { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, Menu, X,
  ArrowRight, Activity, Zap, Shield,
  Map as MapIcon, Database, Terminal,
  Users, Briefcase, Globe, Mail,
  ChevronRight, Play
} from 'lucide-react';
import { INITIAL_ZONES, simulateTelemetry } from './lib/mockApi';
import { logIncidentToFirebase } from './lib/firebaseService';
import { ZoneTelemetry, IncidentEvent } from './types';
import { Dashboard } from './components/Dashboard';
import { VenueMap } from './components/VenueMap';
import { IncidentLog } from './components/IncidentLog';
import { AdminPanel } from './components/AdminPanel';
import { GeminiInsight } from './components/GeminiInsight';
import { AnalyticsPanel } from './components/AnalyticsPanel';

export default function App() {
  const [telemetry, setTelemetry] = useState<ZoneTelemetry[]>(INITIAL_ZONES);
  const [events, setEvents] = useState<IncidentEvent[]>([]);
  const [overrides, setOverrides] = useState<Record<string, Partial<ZoneTelemetry>>>({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('live');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  // Toast helper
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Handle Scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Telemetry Loop
  const addEvent = useCallback((msg: string, severity: IncidentEvent['severity']) => {
    const e: IncidentEvent = {
      id: Math.random().toString(36).slice(2, 8),
      timestamp: new Date().toLocaleTimeString(),
      message: msg,
      severity,
    };
    logIncidentToFirebase(e);
    setEvents(prev => [...prev.slice(-99), e]);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => {
        const next = simulateTelemetry(prev, overrides);
        
        // Update History for Analytics
        const snapshot: any = { time: new Date().toLocaleTimeString() };
        next.forEach(z => { snapshot[z.id] = z.density; });
        setHistory(h => [...h.slice(-19), snapshot]);

        next.forEach(newZ => {
          const oldZ = prev.find(z => z.id === newZ.id);
          if (!oldZ) return;
          if (!oldZ.hazard && newZ.hazard) addEvent(`⚠️ HAZARD activated in ${newZ.name}`, 'critical');
          else if (oldZ.hazard && !newZ.hazard) addEvent(`✅ Hazard cleared in ${newZ.name}`, 'info');
          else if (oldZ.density < 80 && newZ.density >= 80) addEvent(`🔴 ${newZ.name} hit critical density (${newZ.density}%)`, 'warning');
          else if (oldZ.density >= 80 && newZ.density < 80) addEvent(`🟢 ${newZ.name} returned below critical`, 'info');
        });
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [overrides, addEvent]);

  const handleOverride = useCallback((id: string, updates: Partial<ZoneTelemetry>) => {
    setTelemetry(prev => prev.map(z => z.id === id ? { ...z, ...updates } : z));
    setOverrides(prev => ({ ...prev, [id]: { ...prev[id], ...updates } }));
  }, []);

  const handleReset = useCallback(() => {
    setOverrides({});
    setTelemetry(INITIAL_ZONES);
    addEvent('System reset to baseline state by admin', 'info');
  }, [addEvent]);

  const totalUnsafe = telemetry.filter(z => z.density > 80 || z.hazard).length;

  // Smooth scroll helper
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const NAV_LINKS = [
    { label: 'Home', id: 'home' },
    { label: 'Live Monitor', id: 'live-monitor' },
    { label: 'Analytics', id: 'analytics-section' },
    { label: 'Zones', id: 'zones-section' },
    { label: 'Contact', id: 'contact' },
  ];

  return (
    <div className="min-h-screen selection:bg-primary/20 text-text-main font-sans">

      {/* ── Toast Notification ── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 bg-primary text-background text-sm font-bold rounded-2xl shadow-[0_0_20px_rgba(0,240,255,0.4)] animate-slide-up">
          {toast}
        </div>
      )}

      {/* ── Mobile Menu Overlay ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[150] bg-background flex flex-col p-8 gap-6 backdrop-blur-3xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-background">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold">CrowdGuard</span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="p-3 bg-white/5 border border-white/10 rounded-xl">
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="flex flex-col gap-4 mt-8">
            {NAV_LINKS.map(link => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="text-left text-2xl font-black hover:text-primary transition-colors py-4 border-b border-white/5"
              >
                {link.label}
              </button>
            ))}
          </nav>
          <button
            onClick={() => { scrollTo('live-monitor'); setActiveTab('admin'); }}
            className="mt-auto btn-primary w-full justify-center"
          >
            Open Command Center
          </button>
        </div>
      )}

      {/* ── ICC Floating Nav ── */}
      <nav className={`icc-nav ${isScrolled ? 'scrolled px-6' : 'px-12 py-8'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => scrollTo('home')} className="flex items-center gap-3 group cursor-pointer">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-background shadow-[0_0_15px_rgba(0,240,255,0.3)] group-hover:rotate-12 transition-transform duration-500">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold tracking-tight leading-none mb-1">CrowdGuard</h1>
              <span className="text-[10px] font-black tracking-[0.4em] text-primary uppercase">Security Core</span>
            </div>
          </button>

          <div className="hidden lg:flex items-center gap-10">
            {NAV_LINKS.map(link => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="text-xs font-bold text-text-muted hover:text-primary transition-all uppercase tracking-[0.2em]"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => { scrollTo('live-monitor'); setActiveTab('admin'); }}
              className="hidden sm:flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
            >
              <Database className="w-3.5 h-3.5 text-primary" />
              Command Center
            </button>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-3 bg-white/5 border border-white/10 rounded-xl"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section id="home" className="pt-52 pb-24 px-6 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10 animate-slide-up">
            <div className="section-label">
              <Zap className="w-3 h-3" /> AI-Powered Safety
            </div>
            <h2 className="text-6xl md:text-8xl font-extrabold leading-[0.95] tracking-tighter">
              Empowering <br />
              <span className="hero-gradient-text">Venues with AI.</span>
            </h2>
            <p className="text-xl text-text-muted max-w-lg leading-relaxed font-light">
              CrowdGuard AI is the industry-leading safety platform for large-scale venues,
              fostering innovation, high-speed telemetry, and excellence in crowd management.
            </p>
            <div className="flex flex-wrap items-center gap-6 pt-4">
              <button onClick={() => scrollTo('live-monitor')} className="btn-primary">
                Explore Core <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => { scrollTo('live-monitor'); setActiveTab('map'); }}
                className="btn-outline flex items-center gap-3"
              >
                <Play className="w-4 h-4 fill-current" /> View Demo
              </button>
            </div>
          </div>

          <div className="relative animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/10 blur-[120px] rounded-full" />
            <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full" />
            <div className="relative glass-card p-2 overflow-hidden border-white/10 bg-white/[0.02]">
              <div className="bg-background/40 rounded-[1.25rem] aspect-[4/3] flex items-center justify-center overflow-hidden">
                <VenueMap telemetry={telemetry} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Section ── */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="stats-booster flex flex-col items-center justify-center text-center">
            <span className="text-6xl font-black text-primary mb-3 drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]">{telemetry.length}</span>
            <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Active Zones <br /> Monitored</span>
          </div>
          <div className="stats-booster flex flex-col items-center justify-center text-center">
            <span className="text-6xl font-black text-secondary mb-3 drop-shadow-[0_0_15px_rgba(138,43,226,0.3)]">{events.length}</span>
            <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Incidents <br /> Logged</span>
          </div>
          <div className="stats-booster flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-4 mb-3">
              <Shield className={`w-12 h-12 ${totalUnsafe > 0 ? 'text-danger animate-pulse' : 'text-success'}`} />
              <span className="text-6xl font-black">{totalUnsafe}</span>
            </div>
            <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Current <br /> Site Alerts</span>
          </div>
        </div>
      </section>

      {/* ── Live Monitor ── */}
      <section id="live-monitor" className="py-32 px-6">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-6">
            <div className="section-label mx-auto">
              <Activity className="w-3 h-3" /> Real-time Intelligence
            </div>
            <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight">Venue Safety Command</h2>
            <p className="text-text-muted max-w-2xl mx-auto text-lg font-light">
              Our advanced telemetry engine provides millisecond resolution for stadium security.
            </p>
          </div>

          {/* Gemini AI Insight Card */}
          <GeminiInsight telemetry={telemetry} />

          <div className="glass-card p-3 md:p-10 border-white/5 bg-white/[0.01]">
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Tab Navigation */}
              <div className="lg:w-56 flex lg:flex-col gap-3 overflow-x-auto pb-4 lg:pb-0 custom-scrollbar">
                {[
                  { id: 'live', label: 'Monitor', icon: Activity },
                  { id: 'map', label: 'Tactical', icon: MapIcon },
                  { id: 'analytics', label: 'Analytics', icon: Database },
                  { id: 'logs', label: 'History', icon: Terminal },
                  { id: 'admin', label: 'Overrides', icon: Shield },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-4 px-6 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shrink-0 border ${activeTab === tab.id ? 'bg-primary text-background border-primary shadow-[0_0_20px_rgba(0,240,255,0.25)]' : 'bg-white/5 text-text-muted border-white/5 hover:bg-white/10'}`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Dynamic Content */}
              <div className="flex-1 min-h-[650px] animate-slide-up" key={activeTab}>
                {activeTab === 'live' && <Dashboard telemetry={telemetry} />}
                {activeTab === 'map' && <VenueMap telemetry={telemetry} />}
                {activeTab === 'analytics' && (
                   <div className="space-y-10">
                      <AnalyticsPanel telemetry={telemetry} history={history} />
                   </div>
                )}
                {activeTab === 'logs' && <IncidentLog events={events} />}
                {activeTab === 'admin' && <AdminPanel telemetry={telemetry} onOverride={handleOverride} onReset={handleReset} />}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Analytics Section ── */}
      <section id="analytics-section" className="py-32 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto text-center space-y-10 relative">
          <div className="section-label mx-auto">
            <Database className="w-3 h-3" /> Deep Dive
          </div>
          <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight">Sector Analytics</h2>
          <p className="text-text-muted max-w-xl mx-auto text-lg font-light">View real-time density charts and historical incident logs for every zone.</p>
          <div className="flex flex-wrap justify-center gap-6">
            <button
              onClick={() => { scrollTo('live-monitor'); setActiveTab('live'); }}
              className="btn-primary"
            >
              <Activity className="w-4 h-4" /> Live Dashboard
            </button>
            <button
              onClick={() => { scrollTo('live-monitor'); setActiveTab('logs'); }}
              className="btn-outline flex items-center gap-2"
            >
              <Terminal className="w-4 h-4" /> Incident History
            </button>
          </div>
        </div>
      </section>

      {/* ── Zones Section ── */}
      <section id="zones-section" className="py-32 px-6 mx-6 glass-card border-white/10 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="flex flex-col md:flex-row justify-between items-end gap-10">
            <div className="space-y-6">
              <div className="section-label">
                <Users className="w-3 h-3" /> Security Quadrants
              </div>
              <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight">Active Site Zones</h2>
            </div>
            <button
              onClick={() => { scrollTo('live-monitor'); setActiveTab('map'); }}
              className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-primary hover:brightness-125 transition-all"
            >
              Open Tactical Map <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {telemetry.map(z => (
              <div key={z.id} className="p-10 bg-white/[0.03] border border-white/10 rounded-[2rem] hover:bg-white/[0.06] hover:border-primary/30 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-all" />
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(0,240,255,0.2)] transition-all">
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-3 uppercase tracking-tight">{z.name}</h3>
                <p className="text-text-muted text-sm leading-relaxed mb-8">
                  Current load: <span className={`font-bold ${z.density >= 80 ? 'text-red-400' : z.density >= 60 ? 'text-yellow-400' : 'text-primary'}`}>{z.density}%</span>. {z.hazard ? '⚠️ Hazard active.' : 'Running nominal.'}
                </p>
                <div className="w-full h-1.5 bg-white/5 rounded-full mb-8">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${z.density >= 80 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : z.density >= 60 ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'bg-primary shadow-[0_0_10px_rgba(0,240,255,0.5)]'}`}
                    style={{ width: `${z.density}%` }}
                  />
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  <span className={`text-[10px] font-black tracking-[0.2em] uppercase ${z.hazard ? 'text-red-400 animate-pulse' : 'text-primary'}`}>
                    {z.hazard ? 'Hazard Active' : 'Secure Node'}
                  </span>
                  <button
                    onClick={() => { scrollTo('live-monitor'); setActiveTab('admin'); }}
                    className="text-[10px] font-black text-text-muted hover:text-white transition-colors uppercase tracking-[0.2em]"
                  >
                    Manage →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer id="contact" className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 mb-24">
            <div className="lg:col-span-5 space-y-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-background">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-extrabold tracking-tighter">CrowdGuard AI</h2>
              </div>
              <p className="text-text-muted leading-relaxed max-w-sm text-lg font-light">
                Empowering venue managers to innovate, protect, and grow together
                in the world of smart infrastructure and safety technology.
              </p>
              <div className="flex items-center gap-5">
                {[
                  { Icon: Globe, action: () => showToast('🌐 Web Presence Active') },
                  { Icon: Mail, action: () => showToast('📧 support@crowdguard.ai') },
                  { Icon: Briefcase, action: () => showToast('💼 Enterprise Portal') },
                  { Icon: Zap, action: () => { scrollTo('live-monitor'); setActiveTab('live'); } },
                ].map(({ Icon, action }, idx) => (
                  <button key={idx} onClick={action} className="p-4 bg-white/5 rounded-2xl hover:bg-primary hover:text-background border border-white/10 hover:border-primary transition-all group">
                    <Icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
              <div className="space-y-8">
                <h4 className="font-black uppercase tracking-[0.3em] text-[10px] text-primary">Quick Links</h4>
                <ul className="space-y-5">
                  {NAV_LINKS.map(link => (
                    <li key={link.id}>
                      <button onClick={() => scrollTo(link.id)} className="text-sm font-bold text-text-muted hover:text-primary transition-colors">
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-8">
                <h4 className="font-black uppercase tracking-[0.3em] text-[10px] text-primary">Control Panel</h4>
                <ul className="space-y-5">
                  {[
                    { label: 'Live Monitor', tab: 'live' },
                    { label: 'Tactical Map', tab: 'map' },
                    { label: 'Incident Log', tab: 'logs' },
                    { label: 'Admin Overrides', tab: 'admin' },
                  ].map(item => (
                    <li key={item.tab}>
                      <button
                        onClick={() => { scrollTo('live-monitor'); setActiveTab(item.tab); }}
                        className="text-sm font-bold text-text-muted hover:text-primary transition-colors"
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-8">
                <h4 className="font-black uppercase tracking-[0.3em] text-[10px] text-primary">System Status</h4>
                <div className="flex items-center gap-3 text-sm font-bold text-success">
                  <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  Operational
                </div>
                <div className="text-xs text-text-muted space-y-3 font-medium">
                  <p className="flex items-center justify-between">Firebase: <span className="text-primary">Connected</span></p>
                  <p className="flex items-center justify-between">Telemetry: <span className="text-primary">Live</span></p>
                  <p className="flex items-center justify-between">Engine: <span className="text-primary">Aegis Core</span></p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black text-text-muted uppercase tracking-[0.4em]">
            <span>© 2026 CrowdGuard-AI Core. All rights reserved.</span>
            <div className="flex items-center gap-6">
              <button onClick={() => showToast('Privacy Policy')} className="hover:text-primary transition-colors">Privacy</button>
              <button onClick={() => showToast('Terms of Service')} className="hover:text-primary transition-colors">Terms</button>
              <span className="text-white/10 text-xs">|</span>
              <span className="text-primary/80">Made with ❤️ by Deepak_M</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
