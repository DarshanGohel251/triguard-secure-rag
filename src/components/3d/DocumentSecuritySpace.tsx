import { useState } from 'react';
import { FileText, Shield, Lock, CheckCircle2 } from 'lucide-react';

interface DocumentMeta {
  id?: number | string;
  name?: string;
  filename?: string;
  classification?: string;
  department?: string;
  chunkCount?: number;
  uploadDate?: string;
  uploadedAt?: string;
}

interface DocumentSecuritySpaceProps {
  documents?: DocumentMeta[];
  userRole?: string;
  userDept?: string;
}

const SECURITY_TIERS = [
  {
    tier: 'RESTRICTED',
    label: 'Restricted Ring',
    color: 'border-red-500/50 text-red-400 bg-red-950/20',
    accent: '#EF4444',
    badge: 'bg-red-500/10 text-red-300 border-red-500/30',
    clearance: 'Admin & HR Executives Only',
    desc: 'Executive compensation, legal settlements, security keys'
  },
  {
    tier: 'CONFIDENTIAL',
    label: 'Confidential Ring',
    color: 'border-amber-500/50 text-amber-400 bg-amber-950/20',
    accent: '#F59E0B',
    badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    clearance: 'Department Managers & Above',
    desc: 'Financial audits, performance appraisals, supplier contracts'
  },
  {
    tier: 'INTERNAL',
    label: 'Internal Ring',
    color: 'border-cyan-500/50 text-cyan-300 bg-cyan-950/20',
    accent: '#00E5FF',
    badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    clearance: 'Department Employees',
    desc: 'Operational SOPs, team roadmaps, engineering specs'
  },
  {
    tier: 'PUBLIC',
    label: 'Public Ring',
    color: 'border-emerald-500/50 text-emerald-400 bg-emerald-950/20',
    accent: '#10B981',
    badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    clearance: 'All Authenticated Personas',
    desc: 'Company leave policy, handbook, benefits overview'
  }
];

export default function DocumentSecuritySpace({
  documents = [],
  userRole = 'EMPLOYEE',
  userDept = 'Finance'
}: DocumentSecuritySpaceProps) {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [hoveredDoc, setHoveredDoc] = useState<DocumentMeta | null>(null);

  // Group real documents by classification
  const groupedDocs = {
    RESTRICTED: documents.filter((d) => (d.classification || '').toUpperCase() === 'RESTRICTED'),
    CONFIDENTIAL: documents.filter((d) => (d.classification || '').toUpperCase() === 'CONFIDENTIAL'),
    INTERNAL: documents.filter((d) => (d.classification || '').toUpperCase() === 'INTERNAL'),
    PUBLIC: documents.filter((d) => (d.classification || '').toUpperCase() === 'PUBLIC')
  };

  const isTierAuthorized = (tier: string) => {
    if (userRole === 'ADMIN') return true;
    if (tier === 'PUBLIC') return true;
    if (tier === 'INTERNAL') return true;
    if (tier === 'CONFIDENTIAL' && (userRole === 'DEPARTMENT_MANAGER' || userRole === 'HR_MANAGER')) return true;
    if (tier === 'RESTRICTED' && (userRole === 'HR_MANAGER' || userRole === 'ADMIN')) return true;
    return false;
  };

  return (
    <div className="w-full bg-[#050B17]/95 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      {/* Background Cyber Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,229,255,0.08),rgba(255,255,255,0))] pointer-events-none" />

      {/* Header with Clearance Summary */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-white/10 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            Spatial Knowledge Architecture • Multi-Tenant Boundaries
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Document Security Classification Space
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-1 max-w-2xl">
            Pre-retrieval deterministic partition. Documents are cryptographically scoped into 4 concentric isolation envelopes.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/80 border border-white/10 px-4 py-2.5 rounded-xl shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div className="flex flex-col text-xs">
            <span className="font-semibold text-white">Your Clearance: {userRole}</span>
            <span className="text-slate-400 text-[11px] font-mono">Scope: {userDept}</span>
          </div>
        </div>
      </div>

      {/* 3D Tiered Rings Matrix */}
      <div className="relative z-10 mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {SECURITY_TIERS.map((tierInfo) => {
          const tierDocs = groupedDocs[tierInfo.tier as keyof typeof groupedDocs] || [];
          const authorized = isTierAuthorized(tierInfo.tier);
          const isSelected = selectedTier === tierInfo.tier;

          return (
            <div
              key={tierInfo.tier}
              onClick={() => setSelectedTier(isSelected ? null : tierInfo.tier)}
              className={`relative rounded-2xl p-5 border transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
                isSelected
                  ? 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_25px_rgba(0,229,255,0.2)]'
                  : authorized
                  ? 'border-white/10 bg-[#071022]/80 hover:border-cyan-500/40 hover:bg-[#09152e]'
                  : 'border-red-500/20 bg-slate-950/60 opacity-80 hover:opacity-100 hover:border-red-500/40'
              }`}
            >
              {/* Top Bar */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase border ${tierInfo.badge}`}>
                    {tierInfo.tier}
                  </span>
                  {authorized ? (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      Accessible
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                      <Lock className="w-3 h-3" />
                      Restricted
                    </span>
                  )}
                </div>

                <div className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {tierInfo.label}
                </div>
                <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {tierInfo.desc}
                </div>
              </div>

              {/* Bottom Metrics & Document Count */}
              <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-bold text-white">{tierDocs.length}</span>
                  <span className="text-slate-400 text-[11px]">Enrolled Files</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {tierInfo.clearance}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Tier Document Explorer or Global Knowledge Snapshot */}
      <div className="relative z-10 mt-6 pt-6 border-t border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <h3 className="text-base sm:text-lg font-bold text-white">
              {selectedTier ? `${selectedTier} Knowledge Assets` : 'Active Document Corpus in Scope'}
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              ({(selectedTier ? groupedDocs[selectedTier as keyof typeof groupedDocs] : documents).length} items)
            </span>
          </div>
          <div className="flex items-center gap-3">
            {hoveredDoc && (
              <span className="hidden sm:inline-block text-xs font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
                Inspecting: {hoveredDoc.name || hoveredDoc.filename} ({hoveredDoc.classification})
              </span>
            )}
            {selectedTier && (
              <button
                onClick={() => setSelectedTier(null)}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium underline cursor-pointer"
              >
                Show All Tiers
              </button>
            )}
          </div>
        </div>

        {/* Real Documents Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(selectedTier ? groupedDocs[selectedTier as keyof typeof groupedDocs] : documents.slice(0, 6)).map((doc, idx) => {
            const authorized = isTierAuthorized(doc.classification || 'INTERNAL');

            return (
              <div
                key={doc.id || idx}
                onMouseEnter={() => setHoveredDoc(doc)}
                onMouseLeave={() => setHoveredDoc(null)}
                className={`p-4 rounded-xl border transition-all ${
                  authorized
                    ? 'bg-slate-900/60 border-white/10 hover:border-cyan-400/40 hover:bg-slate-800/80 shadow-md'
                    : 'bg-red-950/20 border-red-500/20 hover:border-red-500/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-white truncate" title={doc.name || doc.filename}>
                        {doc.name || doc.filename || 'Untitled Document'}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Dept: {doc.department || 'General'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      doc.classification === 'RESTRICTED'
                        ? 'bg-red-500/10 text-red-300 border-red-500/30'
                        : doc.classification === 'CONFIDENTIAL'
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        : doc.classification === 'INTERNAL'
                        ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                        : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {doc.classification || 'INTERNAL'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {doc.chunkCount ? `${doc.chunkCount} vector chunks` : 'Indexed'}
                  </span>
                </div>
              </div>
            );
          })}

          {documents.length === 0 && (
            <div className="col-span-full py-8 text-center text-slate-400 text-sm bg-slate-900/40 rounded-xl border border-white/5">
              No documents ingested yet. Upload your first enterprise document to populate the 3D security space.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
