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
  XCircle,
  Clock,
  Zap
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
    number: '01',
    key: 'IDENTITY',
    title: 'Identity Clearance',
    short: 'Identity Gate',
    summary: 'JWT Token & Subject Claim Extraction',
    details: 'Validates cryptographic RSA/HMAC signature on the incoming JWT token. Extracts caller subject ID, organization tenant, role claim, and department scope.',
    defenseLayer: 'Layer 1: Identity Gateway',
    icon: UserCheck
  },
  {
    id: 2,
    number: '02',
    key: 'POLICY',
    title: 'RBAC Policy Gate',
    short: 'Policy Matrix',
    summary: 'Deterministic Pre-Retrieval Clearance',
    details: 'Evaluates caller role against data classification boundaries (Public, Internal, Confidential, Restricted). Cross-department or privilege elevation queries are blocked prior to vector search.',
    defenseLayer: 'Layer 1: Deterministic Policy',
    icon: Shield
  },
  {
    id: 3,
    number: '03',
    key: 'RETRIEVAL',
    title: 'Scoped Vector Search',
    short: 'Vector Sandbox',
    summary: 'Constrained Cosine Distance in Scope',
    details: 'Generates text embedding and constrains cosine similarity search strictly across authorized document partitions. Excludes unauthorized document vectors from the scoring matrix.',
    defenseLayer: 'Layer 2: Scoped Embeddings',
    icon: Filter
  },
  {
    id: 4,
    number: '04',
    key: 'PROMPT_FIREWALL',
    title: 'Prompt & Context Firewall',
    short: 'Prompt Guard',
    summary: 'Zero-Leak Chunk Quarantine & Jailbreak Defense',
    details: 'Analyzes user query and retrieved candidate chunks for direct injection commands, jailbreak attempts, system prompt exfiltration, and prompt leakage before context synthesis.',
    defenseLayer: 'Layer 3: Zero-Leak Quarantine',
    icon: Lock
  },
  {
    id: 5,
    number: '05',
    key: 'SYNTHESIS',
    title: 'LLM Grounded Synthesis',
    short: 'Gemini Engine',
    summary: 'Deterministic Evidence-Bound Generation',
    details: 'Invokes Google Gemini with high-temperature suppression and strict system instructions to generate completions exclusively substantiated by validated chunks.',
    defenseLayer: 'Layer 3: Evidence Grounding',
    icon: Cpu
  },
  {
    id: 6,
    number: '06',
    key: 'CITATIONS',
    title: 'Evidence Audit & Citations',
    short: 'Audit Proof',
    summary: 'Page Coordinates & Immutable Ledger Logging',
    details: 'Extracts exact page-level citations and commits an immutable compliance audit record containing timestamp, execution latency, and policy decision to the system ledger.',
    defenseLayer: 'Compliance Audit Rail',
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
      if (stageId === 1 || stageId === 2) return 'PASSED';
      if (stageId === 4) return 'BLOCKED';
      return 'SKIPPED';
    }
    if (status === 'RESTRICTED') {
      if (stageId < 2) return 'PASSED';
      if (stageId === 2) return 'BLOCKED';
      return 'SKIPPED';
    }
    if (status === 'IDLE') return 'STANDBY';
    if (status === 'ERROR') {
      if (stageId < 2) return 'PASSED';
      return 'ERROR';
    }
    if (stageId <= activeStage) return 'PASSED';
    return 'STANDBY';
  };

  const getStageMetric = (stageId: number) => {
    if (!decisionTrace) return null;
    switch (stageId) {
      case 1:
        return decisionTrace.identity ? (
          <span className="text-[#09BBC8] font-mono truncate max-w-[180px]">{decisionTrace.identity}</span>
        ) : null;
      case 2:
        return decisionTrace.permissionScope ? (
          <span className="text-[#D9FCED] font-mono truncate max-w-[180px]">{decisionTrace.permissionScope}</span>
        ) : null;
      case 3:
        return decisionTrace.candidatesScored !== undefined ? (
          <span className="text-[#09BBC8] font-mono">
            {decisionTrace.candidatesScored} Scored ({decisionTrace.authorizedChunksRetrieved ?? 0} In-Scope)
          </span>
        ) : null;
      case 4:
        return decisionTrace.restrictedChunksBlocked !== undefined ? (
          <span className="text-[#09BBC8] font-mono">
            {decisionTrace.restrictedChunksBlocked} Excluded (Zero Leak)
          </span>
        ) : null;
      case 5:
        return (
          <span className="text-[#D9FCED] font-mono">{decisionTrace.llmModel || 'gemini-flash'}</span>
        );
      case 6:
        return decisionTrace.citationsValidated !== undefined ? (
          <span className="text-[#09BBC8] font-mono">{decisionTrace.citationsValidated} Grounded Citations</span>
        ) : null;
      default:
        return null;
    }
  };

  const selectedStage = PIPELINE_STAGES.find((s) => s.id === selectedStageId) || PIPELINE_STAGES[0];
  const selectedState = getStageState(selectedStage.id);

  // -----------------------------------------------------------
  // VERTICAL TIMELINE LAYOUT (Sidebars / Compact Views)
  // -----------------------------------------------------------
  if (layout === 'vertical') {
    return (
      <div className="w-full flex flex-col gap-3 font-sans">
        {/* Compact Timeline Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#09BBC8]/20">
          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                status === 'AUTHORIZED'
                  ? 'bg-[#09BBC8] animate-pulse'
                  : status === 'INJECTION_BLOCKED'
                  ? 'bg-red-400'
                  : status === 'RESTRICTED'
                  ? 'bg-amber-400'
                  : 'bg-[#405FFA]'
              }`}
            />
            <span className="text-xs font-bold text-[#D9FCED] uppercase tracking-wider font-mono">
              6-Stage Decision Rail
            </span>
          </div>
          {decisionTrace?.executionTimeMs !== undefined && (
            <span className="text-[11px] font-mono text-[#D9FCED] bg-[#405FFA]/30 border border-[#09BBC8]/30 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#09BBC8]" />
              {decisionTrace.executionTimeMs} ms
            </span>
          )}
        </div>

        {/* Vertical Pipeline Sequence */}
        <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-[#09BBC8]/60 before:via-[#405FFA]/40 before:to-[#09BBC8]/50">
          {PIPELINE_STAGES.map((s) => {
            const Icon = s.icon;
            const state = getStageState(s.id);
            const isExpanded = expandedStageId === s.id;
            const metric = getStageMetric(s.id);

            let nodeClass = 'border-[#3B3664] bg-[#07240F] text-[#D9FCED]/40';
            let cardBorder = 'border-[#09BBC8]/15 bg-[#3B3664]/30';
            let statusBadge = (
              <span className="text-[10px] text-[#D9FCED]/40 font-mono px-2 py-0.5 rounded bg-[#3B3664]/40 border border-[#09BBC8]/10">
                STANDBY
              </span>
            );

            if (state === 'PASSED') {
              nodeClass = 'border-[#09BBC8] bg-[#3B3664] text-[#D9FCED] shadow-[0_0_12px_rgba(9,187,200,0.4)]';
              cardBorder = 'border-[#09BBC8]/30 bg-[#3B3664]/40 hover:border-[#09BBC8]/60';
              statusBadge = (
                <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#09BBC8] bg-[#09BBC8]/15 border border-[#09BBC8]/30 px-2 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3" /> PASS
                </span>
              );
            } else if (state === 'BLOCKED') {
              nodeClass = 'border-red-500 bg-red-950 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.5)] animate-pulse';
              cardBorder = 'border-red-500/40 bg-red-950/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
              statusBadge = (
                <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-red-400 bg-red-500/15 border border-red-500/40 px-2 py-0.5 rounded">
                  <XCircle className="w-3 h-3" /> BLOCKED
                </span>
              );
            } else if (state === 'SKIPPED') {
              nodeClass = 'border-[#3B3664]/50 bg-[#07240F]/60 text-[#D9FCED]/30 opacity-50';
              cardBorder = 'border-[#09BBC8]/10 bg-[#3B3664]/15 opacity-50';
              statusBadge = (
                <span className="text-[10px] text-[#D9FCED]/40 font-mono px-2 py-0.5 rounded bg-[#3B3664]/20">SKIPPED</span>
              );
            }

            return (
              <div key={`vertical-stage-${s.id}`} className="relative group">
                {/* Node Indicator on Rail */}
                <div
                  className={`absolute -left-[27px] top-3.5 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs z-10 transition-transform ${nodeClass}`}
                >
                  <Icon className="w-3 h-3" />
                </div>

                {/* Stage Container Card */}
                <div
                  onClick={() => setExpandedStageId(isExpanded ? null : s.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${cardBorder}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-mono text-cyan-400 font-bold">{s.number}</span>
                      <span className="text-xs font-bold text-white truncate">{s.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {statusBadge}
                      <span className="text-slate-400 hover:text-white">
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                    {s.summary}
                  </div>

                  {/* Telemetry Readout */}
                  {metric && (
                    <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-mono text-[10px] uppercase">Telemetry:</span>
                      {metric}
                    </div>
                  )}

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-2.5 pt-2 border-t border-white/10 text-xs text-slate-300 leading-relaxed bg-black/30 p-2.5 rounded-lg font-sans">
                      <div className="text-[10px] font-mono text-cyan-400 mb-1">{s.defenseLayer}</div>
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

  // -----------------------------------------------------------
  // HORIZONTAL / SPACIOUS GRID WORKFLOW LAYOUT (Main Views)
  // -----------------------------------------------------------
  return (
    <div className="w-full bg-[#050C1B]/95 border border-cyan-500/25 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-2xl font-sans">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,240,255,0.08),transparent_70%)] pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono uppercase tracking-wider mb-2">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            Deterministic RAG Verification Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            6-Stage Deterministic Decision Pipeline
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Pre-retrieval clearance gates guarantee zero unauthorized context or embedding leakage to downstream LLMs.
          </p>
        </div>

        {/* Global Status Badge */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider border shadow-md ${
              status === 'AUTHORIZED'
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                : status === 'RESTRICTED'
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                : status === 'INJECTION_BLOCKED'
                ? 'bg-red-500/15 text-red-300 border-red-500/40'
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
            <span className="text-xs font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              {decisionTrace.executionTimeMs} ms
            </span>
          )}
        </div>
      </div>

      {/* 6-Stage Spacious Grid Layout (No overlapping text) */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 mt-6">
        {PIPELINE_STAGES.map((s, idx) => {
          const Icon = s.icon;
          const state = getStageState(s.id);
          const isSelected = selectedStageId === s.id;

          let cardBorder = 'border-[#09BBC8]/15 bg-[#3B3664]/30 text-[#D9FCED]/60';
          let statusBadge = <span className="text-[10px] text-[#D9FCED]/40 font-mono">STANDBY</span>;

          if (state === 'PASSED') {
            cardBorder = isSelected
              ? 'border-[#09BBC8] bg-[#405FFA]/30 text-[#D9FCED] shadow-[0_0_25px_rgba(9,187,200,0.35)] ring-1 ring-[#09BBC8]/50'
              : 'border-[#09BBC8]/30 bg-[#3B3664]/40 text-[#D9FCED] hover:border-[#09BBC8]/60';
            statusBadge = (
              <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#09BBC8]">
                <CheckCircle2 className="w-3 h-3" /> VERIFIED
              </span>
            );
          } else if (state === 'BLOCKED') {
            cardBorder = 'border-red-500 bg-red-950/40 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.35)] animate-pulse';
            statusBadge = (
              <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-red-400">
                <XCircle className="w-3 h-3" /> BLOCKED
              </span>
            );
          } else if (state === 'SKIPPED') {
            cardBorder = 'border-[#3B3664]/40 bg-[#07240F]/40 text-[#D9FCED]/30 opacity-50';
            statusBadge = <span className="text-[10px] text-[#D9FCED]/30 font-mono">SKIPPED</span>;
          }

          return (
            <div
              key={`horizontal-stage-${s.id}`}
              onClick={() => interactive && setSelectedStageId(s.id)}
              className={`relative flex flex-col justify-between p-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none group min-h-[160px] ${cardBorder}`}
            >
              <div>
                {/* Top Badge & Stage Icon */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono font-extrabold text-cyan-400">
                    {s.number}
                  </span>
                  {statusBadge}
                </div>

                <div className="w-8 h-8 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center text-cyan-400 mb-2.5 group-hover:scale-110 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>

                <div className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">
                  {s.title}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 leading-snug line-clamp-2">
                  {s.short}
                </div>
              </div>

              {/* Connecting Pulse Marker for wide screens */}
              {idx < PIPELINE_STAGES.length - 1 && (
                <div className="hidden xl:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 text-slate-600 pointer-events-none">
                  <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Interactive Deep-Dive Drawer for Selected Stage */}
      {interactive && selectedStage && (
        <div className="relative z-10 mt-6 p-5 sm:p-6 rounded-2xl bg-[#060D1E]/95 border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shrink-0 mt-0.5 shadow-md">
              <selectedStage.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-bold text-white">
                  Stage {selectedStage.number}: {selectedStage.title}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                  {selectedStage.defenseLayer}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">
                  State: {selectedState}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed max-w-3xl">
                {selectedStage.details}
              </p>
            </div>
          </div>

          {/* Real Telemetry Output */}
          <div className="flex items-center gap-3 shrink-0 self-end md:self-auto bg-slate-900/80 px-4 py-2.5 rounded-xl border border-white/10">
            {selectedStage.id === 1 && decisionTrace?.identity && (
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Verified Subject</div>
                <div className="text-xs font-bold text-cyan-300">{decisionTrace.identity}</div>
              </div>
            )}
            {selectedStage.id === 2 && decisionTrace?.permissionScope && (
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Clearance Scope</div>
                <div className="text-xs font-bold text-emerald-400">{decisionTrace.permissionScope}</div>
              </div>
            )}
            {selectedStage.id === 3 && decisionTrace?.candidatesScored !== undefined && (
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Scoped Candidates</div>
                <div className="text-xs font-bold text-cyan-300">{decisionTrace.candidatesScored} Scored</div>
              </div>
            )}
            {selectedStage.id === 4 && decisionTrace?.restrictedChunksBlocked !== undefined && (
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Zero-Leak Guard</div>
                <div className="text-xs font-bold text-emerald-400">
                  {decisionTrace.restrictedChunksBlocked} Excluded
                </div>
              </div>
            )}
            {selectedStage.id === 5 && (
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Synthesis Engine</div>
                <div className="text-xs font-bold text-purple-300">
                  {decisionTrace?.llmModel || 'gemini-2.5-flash'}
                </div>
              </div>
            )}
            {selectedStage.id === 6 && decisionTrace?.citationsValidated !== undefined && (
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Grounded Proofs</div>
                <div className="text-xs font-bold text-emerald-400">
                  {decisionTrace.citationsValidated} Page Citations
                </div>
              </div>
            )}
            {!decisionTrace && (
              <div className="text-[11px] font-mono text-slate-400">
                Ready to trace next user query.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
