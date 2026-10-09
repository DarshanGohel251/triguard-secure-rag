import { UserCheck, Shield, Filter, Lock, Cpu, FileCheck } from 'lucide-react';

interface RetrievalPipelineVisualProps {
  activeStage?: number;
  status?: 'AUTHORIZED' | 'RESTRICTED' | 'INJECTION_BLOCKED' | 'IDLE';
}

const STAGES = [
  { id: 1, label: 'Identity', desc: 'JWT & Role Auth', icon: UserCheck },
  { id: 2, label: 'Policy Gate', desc: 'Deterministic RBAC', icon: Shield },
  { id: 3, label: 'Constrained Search', desc: 'Scoped Vector Candidates', icon: Filter },
  { id: 4, label: 'Zero-Leak Check', desc: 'No Restricted Chunks in Prompt', icon: Lock },
  { id: 5, label: 'Gemini LLM', desc: 'Grounded Synthesis', icon: Cpu },
  { id: 6, label: 'Evidence Audit', desc: 'Validated Citations', icon: FileCheck },
];

export default function RetrievalPipelineVisual({ activeStage = 6, status = 'AUTHORIZED' }: RetrievalPipelineVisualProps) {
  const getStageColor = (stageId: number) => {
    if (status === 'INJECTION_BLOCKED' && stageId >= 2) {
      return stageId === 2 ? 'border-red-500 text-red-400 bg-red-950/40 shadow-[0_0_12px_rgba(239,68,68,0.3)]' : 'border-white/10 text-slate-600 bg-slate-900/40';
    }
    if (status === 'RESTRICTED' && stageId >= 3) {
      return stageId === 3 ? 'border-amber-500 text-amber-400 bg-amber-950/40 shadow-[0_0_12px_rgba(245,158,11,0.3)]' : 'border-white/10 text-slate-600 bg-slate-900/40';
    }
    if (stageId <= activeStage) {
      return 'border-cyan-400 text-cyan-300 bg-cyan-950/30 shadow-[0_0_12px_rgba(0,240,255,0.25)]';
    }
    return 'border-white/10 text-slate-500 bg-slate-900/30';
  };

  return (
    <div className="w-full bg-[#070b14]/90 border border-white/10 rounded-xl p-4 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Secure Retrieval Pipeline Trace
          </span>
        </div>
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
          status === 'AUTHORIZED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
          status === 'RESTRICTED' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
          status === 'INJECTION_BLOCKED' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
          'bg-slate-800 text-slate-400 border-slate-700'
        }`}>
          {status}
        </span>
      </div>

      {/* Responsive Multi-Stage Progression */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 relative">
        {STAGES.map((s, idx) => {
          const Icon = s.icon;
          const stageStyle = getStageColor(s.id);
          return (
            <div
              key={s.id}
              className={`relative flex flex-col items-center text-center p-2.5 rounded-lg border transition-all duration-300 ${stageStyle}`}
            >
              <div className="p-1.5 rounded-md bg-black/40 mb-1.5">
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-semibold text-slate-200 leading-tight">
                {s.label}
              </span>
              <span className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">
                {s.desc}
              </span>

              {/* Connecting arrow indicator for desktop */}
              {idx < STAGES.length - 1 && (
                <div className="hidden lg:block absolute -right-1.5 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                  ›
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
