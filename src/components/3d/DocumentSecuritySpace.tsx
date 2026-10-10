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
    color: 'border-rose-500/50 text-rose-400 bg-rose-950/20',
    accent: '#EF4444',
    badge: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
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
    color: 'border-[#C4A878]/50 text-[#C4A878] bg-[#C4A878]/10',
    accent: '#C4A878',
    badge: 'bg-[#C4A878]/10 text-[#C4A878] border-[#C4A878]/30',
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
    <div className="w-full bg-[#20231E]/95 border border-[#363A31] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl text-[#F1EEE5]">
      {/* Background Cyber Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(201,243,106,0.06),transparent_70%)] pointer-events-none" />

      {/* Header with Clearance Summary */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#363A31] gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C4A878]/15 border border-[#C4A878]/30 text-[#C4A878] text-xs font-mono uppercase tracking-wider mb-2 font-semibold">
            <Shield className="w-3.5 h-3.5 text-[#C4A878]" />
            Spatial Knowledge Architecture • Multi-Tenant Boundaries
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#F1EEE5] tracking-tight">
            Document Security Classification Space
          </h2>
          <p className="text-sm sm:text-base text-[#B8B5AB] mt-1 max-w-2xl">
            Pre-retrieval deterministic partition. Documents are cryptographically scoped into 4 concentric isolation envelopes.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#181A15] border border-[#363A31] px-4 py-2.5 rounded-xl shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-[#C9F36A] animate-pulse" />
          <div className="flex flex-col text-xs">
            <span className="font-semibold text-[#F1EEE5]">Your Clearance: {userRole}</span>
            <span className="text-[#B8B5AB] text-[11px] font-mono">Scope: {userDept}</span>
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
                  ? 'border-[#C9F36A] bg-[#262A24] shadow-[0_0_25px_rgba(201,243,106,0.18)] ring-1 ring-[#C9F36A]/40'
                  : authorized
                  ? 'border-[#363A31] bg-[#181A15]/80 hover:border-[#C4A878]/50 hover:bg-[#20231E]'
                  : 'border-rose-500/20 bg-[#181A15]/40 opacity-80 hover:opacity-100 hover:border-rose-500/40'
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
                    <span className="flex items-center gap-1 text-[11px] font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                      <Lock className="w-3 h-3" />
                      Restricted
                    </span>
                  )}
                </div>

                <div className="text-base font-bold text-[#F1EEE5] group-hover:text-[#C9F36A] transition-colors">
                  {tierInfo.label}
                </div>
                <div className="text-xs text-[#B8B5AB] mt-1 leading-relaxed">
                  {tierInfo.desc}
                </div>
              </div>

              {/* Bottom Metrics & Document Count */}
              <div className="mt-5 pt-4 border-t border-[#363A31] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-[#B8B5AB]">
                  <FileText className="w-3.5 h-3.5 text-[#C4A878]" />
                  <span className="font-bold text-[#F1EEE5]">{tierDocs.length}</span>
                  <span className="text-[#B8B5AB] text-[11px]">Enrolled Files</span>
                </div>
                <div className="text-[10px] text-[#B8B5AB] font-mono">
                  {tierInfo.clearance}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Tier Document Explorer or Global Knowledge Snapshot */}
      <div className="relative z-10 mt-6 pt-6 border-t border-[#363A31]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#C4A878]" />
            <h3 className="text-base sm:text-lg font-bold text-[#F1EEE5]">
              {selectedTier ? `${selectedTier} Knowledge Assets` : 'Active Document Corpus in Scope'}
            </h3>
            <span className="text-xs text-[#B8B5AB] font-mono">
              ({(selectedTier ? groupedDocs[selectedTier as keyof typeof groupedDocs] : documents).length} items)
            </span>
          </div>
          <div className="flex items-center gap-3">
            {hoveredDoc && (
              <span className="hidden sm:inline-block text-xs font-mono text-[#F1EEE5] bg-[#181A15] border border-[#C9F36A]/40 px-2.5 py-0.5 rounded-full">
                Inspecting: {hoveredDoc.name || hoveredDoc.filename} ({hoveredDoc.classification})
              </span>
            )}
            {selectedTier && (
              <button
                onClick={() => setSelectedTier(null)}
                className="text-xs text-[#C9F36A] hover:underline font-medium cursor-pointer"
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
                    ? 'bg-[#181A15] border-[#363A31] hover:border-[#C4A878]/50 hover:bg-[#20231E] shadow-md'
                    : 'bg-rose-950/20 border-rose-500/20 hover:border-rose-500/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#20231E] border border-[#363A31] flex items-center justify-center text-[#C4A878] shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-[#F1EEE5] truncate" title={doc.name || doc.filename}>
                        {doc.name || doc.filename || 'Untitled Document'}
                      </div>
                      <div className="text-[11px] text-[#B8B5AB] font-mono">
                        Dept: {doc.department || 'General'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#363A31]/50">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      doc.classification === 'RESTRICTED'
                        ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                        : doc.classification === 'CONFIDENTIAL'
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        : doc.classification === 'INTERNAL'
                        ? 'bg-[#C4A878]/10 text-[#C4A878] border-[#C4A878]/30'
                        : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {doc.classification || 'INTERNAL'}
                  </span>
                  <span className="text-[11px] text-[#B8B5AB] font-mono">
                    {doc.chunkCount ? `${doc.chunkCount} vector chunks` : 'Indexed'}
                  </span>
                </div>
              </div>
            );
          })}

          {documents.length === 0 && (
            <div className="col-span-full py-8 text-center text-[#B8B5AB] text-sm bg-[#181A15] rounded-xl border border-[#363A31]">
              No documents ingested yet. Upload your first enterprise document to populate the 3D security space.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
