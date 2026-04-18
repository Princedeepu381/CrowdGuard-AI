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
    <div className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-blue-50/60 via-white to-indigo-50/50 p-8 group">
      {/* Background Decoration */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 blur-[60px] rounded-full group-hover:bg-primary/10 transition-all duration-700" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/5 blur-[60px] rounded-full" />

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Brain className="w-6 h-6" />
            </div>
            {/* Pulse ring when loading */}
            {status === 'loading' && (
              <div className="absolute inset-0 rounded-2xl bg-primary/30 animate-ping" />
            )}
          </div>
          <div>
            <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
              Gemini AI Analysis
              <Sparkles className="w-4 h-4 text-primary" />
            </h3>
            <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${statusColor}`}>
              <StatusIcon className="w-3 h-3" />
              {statusLabel}
            </div>
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={status === 'loading'}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
            status === 'loading'
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-95'
          }`}
        >
          {status === 'loading' ? (
            <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processing…</>
          ) : (
            <><Sparkles className="w-3.5 h-3.5" /> {requestCount > 0 ? 'Re-Analyze' : 'Request Insight'}</>
          )}
        </button>
      </div>

      {/* Content Area */}
      <div className="relative z-10 min-h-[80px]">
        {status === 'idle' && (
          <div className="flex items-center gap-3 text-gray-400">
            <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" />
            <p className="text-sm font-medium italic">
              Click <span className="font-black text-primary not-italic">Request Insight</span> to get a real-time tactical analysis based on live venue telemetry.
            </p>
          </div>
        )}

        {status === 'loading' && (
          <div className="space-y-3">
            <div className="h-4 bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 rounded-full animate-pulse w-full" />
            <div className="h-4 bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 rounded-full animate-pulse w-4/5" />
            <div className="h-4 bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 rounded-full animate-pulse w-3/5" />
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pt-2">
              Gemini is analyzing {telemetry.length} sector telemetry nodes…
            </p>
          </div>
        )}

        {status === 'done' && insight && (
          <div className="space-y-4">
            <div className={`p-4 rounded-2xl border ${hasCritical ? 'bg-red-50 border-red-100' : hasWarning ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'}`}>
              <p className="text-sm font-medium text-gray-800 leading-relaxed">
                "{insight}"
              </p>
            </div>
            <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Gemini AI Core · Analysis #{requestCount}
              </span>
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
            <p className="text-sm text-red-600 font-medium">{insight}</p>
          </div>
        )}
      </div>
    </div>
  );
};
