import { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Menu, X,
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

export default function App() {
  const [telemetry, setTelemetry] = useState<ZoneTelemetry[]>(INITIAL_ZONES);
  const [events, setEvents] = useState<IncidentEvent[]>([]);
  const [overrides, setOverrides] = useState<Record<string, Partial<ZoneTelemetry>>>({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('live');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

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
    <div className="min-h-screen selection:bg-primary/20">

      {/* ── Toast Notification ── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 bg-gray-900 text-white text-sm font-bold rounded-2xl shadow-2xl animate-slide-up">
          {toast}
        </div>
      )}

      {/* ── Mobile Menu Overlay ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[150] bg-white flex flex-col p-8 gap-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-gray-900">CrowdGuard</span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="p-3 bg-gray-100 rounded-xl">
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="flex flex-col gap-4 mt-8">
            {NAV_LINKS.map(link => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="text-left text-2xl font-black text-gray-900 hover:text-primary transition-colors py-2 border-b border-gray-50"
              >
                {link.label}
              </button>
            ))}
          </nav>
          <button
            onClick={() => { scrollTo('live-monitor'); setActiveTab('admin'); }}
            className="mt-auto btn-primary text-center"
          >
            Open Command Center
          </button>
        </div>
      )}

      {/* ── ICC Floating Nav ── */}
      <nav className={`icc-nav ${isScrolled ? 'scrolled px-6' : 'px-12 py-6'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => scrollTo('home')} className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900 leading-none">CrowdGuard</h1>
              <span className="text-[10px] font-black tracking-[0.3em] text-primary uppercase">Security Core</span>
            </div>
          </button>

          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="text-sm font-bold text-gray-500 hover:text-primary transition-colors uppercase tracking-widest"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => { scrollTo('live-monitor'); setActiveTab('admin'); }}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary transition-all shadow-xl"
            >
              <Database className="w-3.5 h-3.5" />
              Command Center
            </button>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-3 bg-white border border-gray-100 rounded-xl shadow-sm"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section id="home" className="pt-40 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-slide-up">
            <div className="section-label">AI-Powered Safety</div>
            <h2 className="text-6xl md:text-7xl font-black leading-[1.05] tracking-tight text-gray-900">
              Empowering Future <br />
              <span className="hero-gradient-text">Venues with AI.</span>
            </h2>
            <p className="text-xl text-gray-500 max-w-lg leading-relaxed">
              CrowdGuard AI is the industry-leading safety platform for large-scale venues,
              fostering innovation, high-speed telemetry, and excellence in crowd management.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button onClick={() => scrollTo('live-monitor')} className="btn-primary flex items-center gap-3">
                Explore Core <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => { scrollTo('live-monitor'); setActiveTab('map'); }}
                className="btn-outline flex items-center gap-3"
              >
                <Play className="w-4 h-4" /> View Demo
              </button>
            </div>
          </div>

          <div className="relative animate-slide-up">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/20 blur-[100px] rounded-full floating" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-accent/20 blur-[100px] rounded-full floating" style={{ animationDelay: '2s' }} />
            <div className="relative glass-card p-4 overflow-hidden border-gray-100/30">
              <div className="bg-gray-900 rounded-[2rem] aspect-[4/3] flex items-center justify-center overflow-hidden">
                <VenueMap telemetry={telemetry} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Section ── */}
      <section className="py-20 px-6 bg-gray-50/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="stats-booster">
            <span className="text-5xl font-black text-primary mb-2">{telemetry.length}</span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Active Zones <br /> Monitored</span>
          </div>
          <div className="stats-booster">
            <span className="text-5xl font-black text-secondary mb-2">{events.length}</span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Incidents <br /> Logged</span>
          </div>
          <div className="stats-booster">
            <div className="flex items-center gap-3 mb-2">
              <Shield className={`w-10 h-10 ${totalUnsafe > 0 ? 'text-danger' : 'text-success'}`} />
              <span className="text-5xl font-black text-gray-900">{totalUnsafe}</span>
            </div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Current <br /> Site Alerts</span>
          </div>
        </div>
      </section>

      {/* ── Live Monitor ── */}
      <section id="live-monitor" className="py-32 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <div className="section-label">Real-time Intelligence</div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900">Venue Safety Command</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Our advanced telemetry engine provides millisecond resolution for stadium security.
            </p>
          </div>

          {/* Gemini AI Insight Card */}
          <GeminiInsight telemetry={telemetry} />

          <div className="glass-card p-2 md:p-8 xl:p-12">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Tab Navigation */}
              <div className="lg:w-48 flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 custom-scrollbar">
                {[
                  { id: 'live', label: 'Monitor', icon: Activity },
                  { id: 'map', label: 'Tactical', icon: MapIcon },
                  { id: 'logs', label: 'History', icon: Terminal },
                  { id: 'admin', label: 'Overrides', icon: Shield },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all shrink-0 ${activeTab === tab.id ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Dynamic Content */}
              <div className="flex-1 min-h-[600px] animate-slide-up" key={activeTab}>
                {activeTab === 'live' && <Dashboard telemetry={telemetry} />}
                {activeTab === 'map' && <VenueMap telemetry={telemetry} />}
                {activeTab === 'logs' && <IncidentLog events={events} />}
                {activeTab === 'admin' && <AdminPanel telemetry={telemetry} onOverride={handleOverride} onReset={handleReset} />}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Analytics Section (new, gives nav target) ── */}
      <section id="analytics-section" className="py-20 px-6 bg-gray-50/50">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <div className="section-label">Deep Dive</div>
          <h2 className="text-4xl font-black text-gray-900">Sector Analytics</h2>
          <p className="text-gray-500 max-w-xl mx-auto">View real-time density charts and historical incident logs for every zone.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => { scrollTo('live-monitor'); setActiveTab('live'); }}
              className="btn-primary flex items-center gap-2"
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

      {/* ── Zones / Community Section ── */}
      <section id="zones-section" className="py-32 px-6 bg-gray-900 text-white rounded-[4rem] mx-6">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="space-y-4">
              <div className="px-4 py-1.5 bg-white/10 rounded-full text-primary font-black text-[10px] tracking-widest uppercase inline-block">Security Quadrants</div>
              <h2 className="text-4xl md:text-5xl font-black">Active Site Zones</h2>
            </div>
            <button
              onClick={() => { scrollTo('live-monitor'); setActiveTab('map'); }}
              className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors"
            >
              Open Tactical Map <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {telemetry.map(z => (
              <div key={z.id} className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/10 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2 uppercase tracking-tight">{z.name}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  Current load: <span className={`font-bold ${z.density >= 80 ? 'text-red-400' : z.density >= 60 ? 'text-yellow-400' : 'text-green-400'}`}>{z.density}%</span>. {z.hazard ? '⚠️ Hazard active.' : 'Running nominal.'}
                </p>
                <div className="w-full h-1.5 bg-white/10 rounded-full mb-6">
                  <div
                    className={`h-full rounded-full transition-all ${z.density >= 80 ? 'bg-red-500' : z.density >= 60 ? 'bg-yellow-400' : 'bg-primary'}`}
                    style={{ width: `${z.density}%` }}
                  />
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className={`text-[10px] font-black tracking-widest uppercase ${z.hazard ? 'text-red-400' : 'text-green-400'}`}>
                    {z.hazard ? 'Hazard Active' : 'Secure Node'}
                  </span>
                  <button
                    onClick={() => { scrollTo('live-monitor'); setActiveTab('admin'); }}
                    className="text-[10px] font-bold text-gray-400 hover:text-white transition-colors"
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
      <footer id="contact" className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 leading-none">CrowdGuard AI</h2>
              </div>
              <p className="text-gray-500 leading-relaxed max-w-sm">
                Empowering venue managers to innovate, protect, and grow together
                in the world of smart infrastructure and safety technology.
              </p>
              <div className="flex items-center gap-4">
                {[
                  { Icon: Globe, action: () => showToast('🌐 Visit our website coming soon!') },
                  { Icon: Mail, action: () => showToast('📧 crowdguard@gmail.com') },
                  { Icon: Briefcase, action: () => showToast('💼 Enterprise plans available') },
                  { Icon: Zap, action: () => { scrollTo('live-monitor'); setActiveTab('live'); } },
                ].map(({ Icon, action }, idx) => (
                  <button key={idx} onClick={action} className="p-3 bg-gray-50 rounded-xl hover:bg-primary hover:text-white transition-all">
                    <Icon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
              <div className="space-y-6">
                <h4 className="font-bold uppercase tracking-widest text-[10px] text-gray-400">Quick Links</h4>
                <ul className="space-y-4">
                  {NAV_LINKS.map(link => (
                    <li key={link.id}>
                      <button onClick={() => scrollTo(link.id)} className="text-sm font-bold text-gray-600 hover:text-primary transition-colors">
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="font-bold uppercase tracking-widest text-[10px] text-gray-400">Control Panel</h4>
                <ul className="space-y-4">
                  {[
                    { label: 'Live Monitor', tab: 'live' },
                    { label: 'Tactical Map', tab: 'map' },
                    { label: 'Incident Log', tab: 'logs' },
                    { label: 'Admin Overrides', tab: 'admin' },
                  ].map(item => (
                    <li key={item.tab}>
                      <button
                        onClick={() => { scrollTo('live-monitor'); setActiveTab(item.tab); }}
                        className="text-sm font-bold text-gray-600 hover:text-primary transition-colors"
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="font-bold uppercase tracking-widest text-[10px] text-gray-400">System Status</h4>
                <div className="flex items-center gap-2 text-sm font-bold text-success">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  All Systems Operational
                </div>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>Firebase: <span className="text-green-500 font-bold">Connected</span></p>
                  <p>Telemetry: <span className="text-green-500 font-bold">Live</span></p>
                  <p>Cloud Run: <span className="text-green-500 font-bold">Active</span></p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
            <span>© 2026 CrowdGuard-AI Core. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <button onClick={() => showToast('Privacy Policy — Coming Soon')} className="hover:text-primary transition-colors">Privacy</button>
              <button onClick={() => showToast('Terms of Service — Coming Soon')} className="hover:text-primary transition-colors">Terms</button>
              <span className="text-gray-200">|</span>
              <span>Made with ❤️ by The Safety Innovators</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
