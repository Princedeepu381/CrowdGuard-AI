import React, { useState, useCallback } from 'react';
import { Sparkles, RefreshCw, Brain, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { analyzeTelemetryWithGemini } from '../lib/geminiService';
import { ZoneTelemetry } from '../types';

type Status = 'idle' | 'loading' | 'done' | 'error';

export const GeminiInsight: React.FC<{ telemetry: ZoneTelemetry[] }> = ({ telemetry }) => {
  const [status, setStatus] = useState<Status>('idle');
  const [insight, setInsight] = useState('');
  const [requestCount, setRequestCount] = useState(0);

  const hasCritical = telemetry.some(z => z.hazard || z.density >= 80);
  const hasWarning = telemetry.some(z => z.density >= 60 && z.density < 80);

  const statusColor = hasCritical
    ? 'text-red-500'
    : hasWarning
    ? 'text-amber-500'
    : 'text-emerald-500';

  const statusLabel = hasCritical ? 'Critical Conditions Detected'
    : hasWarning ? 'Warning Conditions Present'
    : 'All Systems Nominal';

  const statusIcon = hasCritical ? AlertTriangle : hasWarning ? Zap : ShieldCheck;
  const StatusIcon = statusIcon;

  const handleAnalyze = useCallback(async () => {
    setStatus('loading');
    setInsight('');
    try {
      const result = await analyzeTelemetryWithGemini(telemetry);
      setInsight(result);
      setStatus('done');
      setRequestCount(c => c + 1);
    } catch {
      setInsight('Analysis temporarily unavailable. Please retry.');
      setStatus('error');
    }
  }, [telemetry]);

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-primary/20 bg-white/[0.02] p-10 group transition-all hover:bg-white/[0.04]">
      {/* Background Decoration */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary/10 blur-[100px] rounded-full group-hover:bg-primary/20 transition-all duration-700" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-secondary/10 blur-[100px] rounded-full" />

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 relative z-10">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-background shadow-[0_0_20px_rgba(0,240,255,0.3)] group-hover:scale-110 transition-transform">
              <Brain className="w-8 h-8" />
            </div>
            {/* Pulse ring when loading */}
            {status === 'loading' && (
              <div className="absolute inset-0 rounded-2xl bg-primary/30 animate-ping" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              Gemini AI Analysis
              <Sparkles className="w-5 h-5 text-primary" />
            </h3>
            <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] ${statusColor}`}>
              <StatusIcon className="w-4 h-4" />
              {statusLabel}
            </div>
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={status === 'loading'}
          className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
            status === 'loading'
              ? 'bg-white/5 text-text-muted cursor-not-allowed border border-white/5'
              : 'bg-primary text-background shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] hover:-translate-y-1 active:scale-95'
          }`}
        >
          {status === 'loading' ? (
            <><RefreshCw className="w-4 h-4 animate-spin" /> Processing…</>
          ) : (
            <><Sparkles className="w-4 h-4" /> {requestCount > 0 ? 'Re-Analyze' : 'Request Insight'}</>
          )}
        </button>
      </div>

      {/* Content Area */}
      <div className="relative z-10 min-h-[100px]">
        {status === 'idle' && (
          <div className="flex items-center gap-4 text-text-muted">
            <div className="w-2.5 h-2.5 rounded-full bg-primary/40 animate-pulse" />
            <p className="text-base font-light italic">
              Click <span className="font-bold text-primary not-italic">Request Insight</span> to get a real-time tactical analysis based on live venue telemetry.
            </p>
          </div>
        )}

        {status === 'loading' && (
          <div className="space-y-4">
            <div className="h-4 bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10 rounded-full animate-pulse w-full" />
            <div className="h-4 bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10 rounded-full animate-pulse w-5/6" />
            <div className="h-4 bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10 rounded-full animate-pulse w-4/6" />
            <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.3em] pt-4">
              Gemini is analyzing {telemetry.length} sector telemetry nodes…
            </p>
          </div>
        )}

        {status === 'done' && insight && (
          <div className="space-y-6">
            <div className={`p-6 rounded-2xl border ${hasCritical ? 'bg-red-500/10 border-red-500/20 text-red-100' : hasWarning ? 'bg-amber-500/10 border-amber-500/20 text-amber-100' : 'bg-primary/5 border-primary/20 text-blue-50'}`}>
              <p className="text-lg font-light leading-relaxed">
                "{insight}"
              </p>
            </div>
            <div className="flex items-center justify-between text-[10px] text-text-muted font-black uppercase tracking-[0.3em] pt-2">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
                Gemini AI Core · Tactical Analysis #{requestCount}
              </span>
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl">
            <p className="text-sm text-red-400 font-bold">{insight}</p>
          </div>
        )}
      </div>
    </div>
  );
};
