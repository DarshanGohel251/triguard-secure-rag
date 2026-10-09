import { useState } from 'react';
import {
  UserCheck,
  Shield,
  Filter,
  Lock,
  Cpu,
  FileCheck,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock
} from 'lucide-react';

export interface DecisionTraceInfo {
  identity?: string;
  permissionScope?: string;
  policyDecision?: string;
  candidatesScored?: number;
  authorizedChunksRetrieved?: number;
  restrictedChunksBlocked?: number;
  contextAuthorized?: boolean;
  llmModel?: string;
  citationsValidated?: number;
  executionTimeMs?: number;
  completedStages?: string[];
  status?: string;
}

interface RetrievalPipelineVisualProps {
  activeStage?: number;
  status?: 'AUTHORIZED' | 'RESTRICTED' | 'INJECTION_BLOCKED' | 'IDLE' | 'ERROR' | 'NO_INFO';
  decisionTrace?: DecisionTraceInfo;
  interactive?: boolean;
  layout?: 'auto' | 'vertical' | 'horizontal';
}

const PIPELINE_STAGES = [
  {
    id: 1,
    key: 'IDENTITY',
    title: '1. Identity Clearance',
    short: 'Identity',
    summary: 'JWT Token & Subject Verification',
    details: 'Validates cryptographic JWT signature, extracts caller subject ID, tenant, role, and department claim.',
    icon: UserCheck
  },
  {
    id: 2,
    key: 'POLICY',
    title: '2. Policy Gate',
    short: 'Policy Gate',
    summary: 'Deterministic RBAC Matrix',
    details: 'Evaluates user role against data classification boundaries. Blocks cross-department or privilege elevation attempts.',
    icon: Shield
  },
  {
    id: 3,
    key: 'RETRIEVAL',
    title: '3. Scoped Search',
    short: 'Vector Sandbox',
    summary: 'Constrained Cosine Distance',
    details: 'Generates query embedding and searches vector space ONLY across authorized document scopes. Excludes restricted partitions.',
    icon: Filter
  },
  {
    id: 4,
    key: 'PROMPT_FIREWALL',
    title: '4. Context Sandbox',
    short: 'Prompt Guard',
    summary: 'Zero-Leak Chunk Quarantine',
    details: 'Scans retrieved chunks and prompt for injection attacks, exfiltration commands, and system prompt leakage.',
    icon: Lock
  },
  {
    id: 5,
    key: 'SYNTHESIS',
    title: '5. LLM Synthesis',
    short: 'Gemini 2.5',
    summary: 'Grounded Generation',
    details: 'Generates deterministic natural language completion strictly anchored to validated retrieved evidence chunks.',
    icon: Cpu
  },
  {
    id: 6,
    key: 'CITATIONS',
    title: '6. Evidence Proof',
    short: 'Audit Proof',
    summary: 'Citation & Ledger Audit',
    details: 'Extracts page-level document coordinates and logs immutable audit trail with execution latency in compliance ledger.',
    icon: FileCheck
  }
];

export default function RetrievalPipelineVisual({
  activeStage = 6,
  status = 'AUTHORIZED',
  decisionTrace,
  interactive = true,
  layout = 'horizontal'
}: RetrievalPipelineVisualProps) {
  const [selectedStageId, setSelectedStageId] = useState<number>(activeStage || 1);
  const [expandedStageId, setExpandedStageId] = useState<number | null>(null);

  const getStageState = (stageId: number) => {
    if (status === 'INJECTION_BLOCKED') {
      if (stageId < 2) return 'PASSED';
      if (stageId === 2 || stageId === 4) return 'BLOCKED';
      return 'SKIPPED';
    }
    if (status === 'RESTRICTED') {
      if (stageId < 3) return 'PASSED';
      if (stageId === 3) return 'RESTRICTED';
      return 'SKIPPED';
    }
    if (stageId <= activeStage) return 'PASSED';
    return 'PENDING';
  };

  const getStageMetric = (stageId: number) => {
    if (!decisionTrace) return null;
    switch (stageId) {
      case 1:
        return decisionTrace.identity ? (
          <span className="text-cyan-300 font-mono truncate max-w-[200px]">{decisionTrace.identity}</span>
        ) : null;
      case 2:
        return decisionTrace.permissionScope ? (
          <span className="text-emerald-400 font-mono truncate max-w-[200px]">{decisionTrace.permissionScope}</span>
        ) : null;
      case 3:
        return decisionTrace.candidatesScored !== undefined ? (
          <span className="text-cyan-300 font-mono">{decisionTrace.candidatesScored} Scored ({decisionTrace.authorizedChunksRetrieved ?? 0} Auth)</span>
        ) : null;
      case 4:
        return decisionTrace.restrictedChunksBlocked !== undefined ? (
          <span className="text-emerald-400 font-mono">{decisionTrace.restrictedChunksBlocked} Excluded (Zero Leak)</span>
        ) : null;
      case 5:
        return (
          <span className="text-purple-300 font-mono">{decisionTrace.llmModel || 'gemini-2.5-flash'}</span>
        );
      case 6:
        return decisionTrace.citationsValidated !== undefined ? (
          <span className="text-emerald-400 font-mono">{decisionTrace.citationsValidated} Grounded Citations</span>
        ) : null;
      default:
        return null;
    }
  };

  const selectedStage = PIPELINE_STAGES.find((s) => s.id === selectedStageId) || PIPELINE_STAGES[0];
  const selectedState = getStageState(selectedStage.id);

  // Render vertical timeline layout (used in sidebars and compact inspection containers)
  if (layout === 'vertical') {
    return (
      <div className="w-full flex flex-col gap-3 font-sans">
        {/* Compact Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${status === 'AUTHORIZED' ? 'bg-emerald-400 animate-pulse' : status === 'INJECTION_BLOCKED' ? 'bg-red-400' : 'bg-amber-400'}`} />
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              6-Stage Decision Rail
            </span>
          </div>
          {decisionTrace?.executionTimeMs !== undefined && (
            <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              {decisionTrace.executionTimeMs} ms
            </span>
          )}
        </div>

        {/* Vertical Pipeline Sequence */}
        <div className="relative pl-6 space-y-3.5 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500/50 before:via-blue-500/30 before:to-emerald-500/40">
          {PIPELINE_STAGES.map((s) => {
            const Icon = s.icon;
            const state = getStageState(s.id);
            const isExpanded = expandedStageId === s.id;
            const metric = getStageMetric(s.id);

            let nodeClass = 'border-slate-700 bg-slate-900 text-slate-500';
            let cardBorder = 'border-white/10 bg-[#071126]/70';
            let statusPill = (
              <span className="text-[10px] text-slate-500 font-mono px-2 py-0.5 rounded bg-slate-900 border border-white/5">STANDBY</span>
            );

            if (state === 'PASSED') {
              nodeClass = 'border-cyan-400 bg-cyan-950 text-cyan-300 shadow-[0_0_10px_rgba(0,229,255,0.4)]';
              cardBorder = 'border-cyan-500/30 bg-[#07132B]/80 hover:border-cyan-400/50';
              statusPill = (
                <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3" /> PASS
                </span>
              );
            } else if (state === 'BLOCKED') {
              nodeClass = 'border-red-500 bg-red-950 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.5)] animate-pulse';
              cardBorder = 'border-red-500/40 bg-red-950/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
              statusPill = (
                <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-red-400 bg-red-500/15 border border-red-500/40 px-2 py-0.5 rounded">
                  <XCircle className="w-3 h-3" /> BLOCKED
                </span>
              );
            } else if (state === 'RESTRICTED') {
              nodeClass = 'border-amber-500 bg-amber-950 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.4)]';
              cardBorder = 'border-amber-500/40 bg-amber-950/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]';
              statusPill = (
                <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-400 bg-amber-500/15 border border-amber-500/40 px-2 py-0.5 rounded">
                  <AlertTriangle className="w-3 h-3" /> FILTERED
                </span>
              );
            } else if (state === 'SKIPPED') {
              nodeClass = 'border-slate-800 bg-slate-950 text-slate-600 opacity-60';
              cardBorder = 'border-slate-800/80 bg-slate-950/40 opacity-60';
              statusPill = (
                <span className="text-[10px] text-slate-600 font-mono px-2 py-0.5 rounded bg-slate-950">SKIPPED</span>
              );
            }

            return (
              <div key={s.id} className="relative group">
                {/* Node Dot on Vertical Rail */}
                <div
                  className={`absolute -left-[27px] top-3.5 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs z-10 transition-transform ${nodeClass}`}
                >
                  <Icon className="w-3 h-3" />
                </div>

                {/* Stage Container Card */}
                <div
                  onClick={() => setExpandedStageId(isExpanded ? null : s.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${cardBorder}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-white truncate">{s.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {statusPill}
                      <span className="text-slate-400 hover:text-white">
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                    {s.summary}
                  </div>

                  {/* Live Telemetry snippet */}
                  {metric && (
                    <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-mono text-[10px] uppercase">Telemetry:</span>
                      {metric}
                    </div>
                  )}

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="mt-2.5 pt-2 border-t border-white/10 text-xs text-slate-300 leading-relaxed bg-black/20 p-2.5 rounded-lg font-sans">
                      {s.details}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Render horizontal / full dashboard layout (used in main views)
  return (
    <div className="w-full bg-[#050C1B]/95 border border-white/10 rounded-2xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/10 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
              Deterministic 6-Stage RAG Pipeline Trace
            </h3>
            <p className="text-xs text-slate-400">
              Zero unauthorized knowledge leakage guaranteed by pre-retrieval policy gates
            </p>
          </div>
        </div>

        {/* Global Pipeline Status Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${
              status === 'AUTHORIZED'
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : status === 'RESTRICTED'
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                : status === 'INJECTION_BLOCKED'
                ? 'bg-red-500/10 text-red-300 border-red-500/30'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            {status === 'AUTHORIZED' && '✓ PIPELINE VERIFIED'}
            {status === 'RESTRICTED' && '⚠ ACCESS RESTRICTED'}
            {status === 'INJECTION_BLOCKED' && '⛔ INJECTION INTERCEPTED'}
            {status === 'IDLE' && '● STANDBY / READY'}
            {status === 'ERROR' && '✕ PIPELINE FAULT'}
          </span>
          {decisionTrace?.executionTimeMs !== undefined && (
            <span className="text-xs font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              {decisionTrace.executionTimeMs} ms
            </span>
          )}
        </div>
      </div>

      {/* 6-Stage Responsive Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 mt-5">
        {PIPELINE_STAGES.map((s, idx) => {
          const Icon = s.icon;
          const state = getStageState(s.id);
          const isSelected = selectedStageId === s.id;

          let cardBorder = 'border-white/10 bg-[#071126]/60 text-slate-400';
          let statusBadge = (
            <span className="text-[10px] text-slate-500 font-mono">STANDBY</span>
          );

          if (state === 'PASSED') {
            cardBorder = isSelected
              ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 shadow-[0_0_20px_rgba(0,229,255,0.25)]'
              : 'border-cyan-500/30 bg-[#08152e] text-slate-200 hover:border-cyan-400/50';
            statusBadge = (
              <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400">
                <CheckCircle2 className="w-3 h-3" /> VERIFIED
              </span>
            );
          } else if (state === 'BLOCKED') {
            cardBorder = 'border-red-500 bg-red-950/40 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse';
            statusBadge = (
              <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-red-400">
                <XCircle className="w-3 h-3" /> BLOCKED
              </span>
            );
          } else if (state === 'RESTRICTED') {
            cardBorder = 'border-amber-500 bg-amber-950/40 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)]';
            statusBadge = (
              <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-400">
                <AlertTriangle className="w-3 h-3" /> FILTERED
              </span>
            );
          } else if (state === 'SKIPPED') {
            cardBorder = 'border-slate-800 bg-slate-950/40 text-slate-600 opacity-60';
            statusBadge = (
              <span className="text-[10px] text-slate-600 font-mono">SKIPPED</span>
            );
          }

          return (
            <div
              key={s.id}
              onClick={() => interactive && setSelectedStageId(s.id)}
              className={`relative flex flex-col justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none group min-h-[140px] ${cardBorder}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="p-2 rounded-lg bg-black/40 border border-white/5 group-hover:scale-105 transition-transform text-cyan-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  {statusBadge}
                </div>

                <div className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {s.title}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 leading-snug line-clamp-2">
                  {s.summary}
                </div>
              </div>

              {/* Connector Chevron indicator for wide screens */}
              {idx < PIPELINE_STAGES.length - 1 && (
                <div className="hidden xl:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 text-slate-600 pointer-events-none">
                  <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Interactive Stage Deep Dive Drawer */}
      {interactive && selectedStage && (
        <div className="mt-5 p-4 rounded-xl bg-slate-900/80 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0 mt-0.5">
              <selectedStage.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{selectedStage.title}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-cyan-300">
                  {selectedStage.summary}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30 text-cyan-300">
                  State: {selectedState}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed max-w-3xl">
                {selectedStage.details}
              </p>
            </div>
          </div>

          {/* Real Execution Metrics for Selected Stage */}
          <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
            {selectedStage.id === 1 && decisionTrace?.identity && (
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Verified Subject</div>
                <div className="text-xs font-bold text-cyan-300">{decisionTrace.identity}</div>
              </div>
            )}
            {selectedStage.id === 2 && decisionTrace?.permissionScope && (
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Scope Granted</div>
                <div className="text-xs font-bold text-emerald-400">{decisionTrace.permissionScope}</div>
              </div>
            )}
            {selectedStage.id === 3 && decisionTrace?.candidatesScored !== undefined && (
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Candidates Filtered</div>
                <div className="text-xs font-bold text-cyan-300">{decisionTrace.candidatesScored} Scored</div>
              </div>
            )}
            {selectedStage.id === 4 && decisionTrace?.restrictedChunksBlocked !== undefined && (
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Zero-Leak Guard</div>
                <div className="text-xs font-bold text-emerald-400">
                  {decisionTrace.restrictedChunksBlocked} Chunks Excluded
                </div>
              </div>
            )}
            {selectedStage.id === 5 && (
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Model Engine</div>
                <div className="text-xs font-bold text-purple-300">
                  {decisionTrace?.llmModel || 'gemini-2.5-flash'}
                </div>
              </div>
            )}
            {selectedStage.id === 6 && decisionTrace?.citationsValidated !== undefined && (
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Validated Citations</div>
                <div className="text-xs font-bold text-emerald-400">
                  {decisionTrace.citationsValidated} Grounded
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
