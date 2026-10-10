import { useSequentialReveal } from '../../hooks/useSequentialReveal';
import {
  ShieldCheck,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  Clock,
  Cpu,
  Lock,
  Layers,
  Database
} from 'lucide-react';

interface SequentialTraceVisualProps {
  decisionTrace?: any;
  status?: string;
  isFallback?: boolean;
}

export default function SequentialTraceVisual({
  decisionTrace,
  status = 'AUTHORIZED',
  isFallback = false,
}: SequentialTraceVisualProps) {
  const { stages, isComplete } = useSequentialReveal(true, status, isFallback, 240);

  const getStageIcon = (stageId: number) => {
    switch (stageId) {
      case 1:
        return <ShieldCheck className="w-4 h-4 text-[#09BBC8]" />;
      case 2:
        return <Lock className="w-4 h-4 text-[#405FFA]" />;
      case 3:
        return <Database className="w-4 h-4 text-[#09BBC8]" />;
      case 4:
        return <ShieldAlert className="w-4 h-4 text-emerald-400" />;
      case 5:
        return <Cpu className="w-4 h-4 text-[#405FFA]" />;
      case 6:
        return <Layers className="w-4 h-4 text-[#09BBC8]" />;
      default:
        return <ShieldCheck className="w-4 h-4" />;
    }
  };

  const getStatusBadge = () => {
    if (!isComplete) {
      return {
        label: 'EVALUATING DEFENSE RINGS...',
        className: 'bg-[#405FFA]/20 text-[#09BBC8] border-[#09BBC8]/40 animate-pulse',
      };
    }
    switch (status) {
      case 'AUTHORIZED':
        if (isFallback) {
          return {
            label: 'RESILIENT • CACHED PASS',
            className: 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]',
          };
        }
        return {
          label: 'VERIFIED • PASS',
          className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
        };
      case 'AI_PROVIDER_ERROR':
        return {
          label: 'DEGRADED • SYNTHESIS UNAVAILABLE',
          className: 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]',
        };
      case 'RESTRICTED':
        return {
          label: 'ACCESS RESTRICTED • ZERO LEAK',
          className: 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]',
        };
      case 'NO_INFO':
        return {
          label: 'INSUFFICIENT EVIDENCE • ABSTENTION',
          className: 'bg-sky-500/15 text-sky-300 border-sky-500/40',
        };
      case 'INJECTION_BLOCKED':
        return {
          label: 'INJECTION INTERCEPTED • BLOCKED',
          className: 'bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.2)]',
        };
      case 'ERROR':
      default:
        return {
          label: 'CONNECTION FAULT',
          className: 'bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.2)]',
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="rounded-2xl bg-[#080D16]/90 border border-[#09BBC8]/30 p-4 space-y-4 shadow-xl">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#09BBC8]/20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00F5A0] animate-ping" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#F8FAFC]">
            6-Stage Deterministic Decision Trace
          </span>
        </div>
        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${statusBadge.className}`}
        >
          {statusBadge.label}
        </span>
      </div>

      {/* 6 Sequential Stages */}
      <div className="space-y-2">
        {stages.map((stage) => {
          const isPassed = stage.status === 'passed';
          const isRunning = stage.status === 'running';
          const isBlocked = stage.status === 'blocked';
          const isFallbackState = stage.status === 'fallback';

          return (
            <div
              key={stage.id}
              className={`p-2.5 rounded-xl border transition-all duration-300 flex items-center justify-between ${
                isPassed
                  ? 'bg-emerald-500/10 border-emerald-500/35 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                  : isBlocked
                  ? 'bg-rose-500/15 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                  : isFallbackState
                  ? 'bg-amber-500/15 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : isRunning
                  ? 'bg-[#405FFA]/20 border-[#09BBC8] shadow-[0_0_15px_rgba(9,187,200,0.35)] scale-[1.01]'
                  : 'bg-[#0E1726]/40 border-white/5 opacity-50'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div className="shrink-0">{getStageIcon(stage.id)}</div>
                <div className="truncate">
                  <div className="text-xs font-bold text-[#F8FAFC] truncate">
                    Stage {stage.id}: {stage.name}
                  </div>
                  <div className="text-[10px] text-[#D9FCED]/60 font-mono truncate">
                    {stage.description}
                  </div>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="shrink-0">
                {isPassed && (
                  <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/40">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>PASS</span>
                  </span>
                )}
                {isBlocked && (
                  <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-md border border-rose-500/40">
                    <ShieldAlert className="w-3 h-3" />
                    <span>BLOCKED</span>
                  </span>
                )}
                {isFallbackState && (
                  <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/40">
                    <span>AIR-GAPPED</span>
                  </span>
                )}
                {isRunning && (
                  <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#09BBC8] bg-[#09BBC8]/20 px-2 py-0.5 rounded-md border border-[#09BBC8]/40 animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>ACTIVE</span>
                  </span>
                )}
                {stage.status === 'pending' && (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-[#D9FCED]/40 bg-white/5 px-2 py-0.5 rounded-md">
                    <Clock className="w-3 h-3" />
                    <span>STANDBY</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Telemetry Footer */}
      {decisionTrace && (
        <div className="pt-3 border-t border-[#09BBC8]/20 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono text-[#D9FCED]/70">
          <div>
            <span className="text-[#D9FCED]/40 block">CANDIDATES</span>
            <span className="font-bold text-[#F8FAFC]">{decisionTrace.candidatesScored ?? 3} chunks</span>
          </div>
          <div>
            <span className="text-[#D9FCED]/40 block">AUTHORIZED</span>
            <span className="font-bold text-emerald-400">{decisionTrace.authorizedChunksRetrieved ?? 1} verified</span>
          </div>
          <div>
            <span className="text-[#D9FCED]/40 block">WITHHELD</span>
            <span className="font-bold text-rose-400">{decisionTrace.restrictedChunksBlocked ?? 0} blocked</span>
          </div>
          <div>
            <span className="text-[#D9FCED]/40 block">LATENCY</span>
            <span className="font-bold text-[#09BBC8]">{decisionTrace.executionTimeMs ?? 240} ms</span>
          </div>
        </div>
      )}
    </div>
  );
}
