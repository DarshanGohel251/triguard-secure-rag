import { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Check,
  Search,
  RefreshCw,
  User,
  Copy,
  CheckCheck,
  Lock,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import api from '../services/api';
import SecurityConstellation3D, { type SecurityEventData } from '../components/3d/SecurityConstellation3D';

export default function Audit() {
  const [logs, setLogs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [decisionFilter, setDecisionFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConstellation, setShowConstellation] = useState(false);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/audit/logs');
      setLogs(res.data || []);
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const copyRequestId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.requestId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
      const matchesDecision = decisionFilter === 'ALL' || log.decision === decisionFilter;

      return matchesSearch && matchesAction && matchesDecision;
    });
  }, [logs, searchTerm, actionFilter, decisionFilter]);

  const stats = useMemo(() => {
    const allows = logs.filter((l) => l.decision === 'ALLOW').length;
    const denies = logs.filter((l) => l.decision === 'DENY').length;
    return { total: logs.length, allows, denies };
  }, [logs]);

  // Transform logs into constellation events if requested
  const constellationEvents: SecurityEventData[] = useMemo(() => {
    return logs.map((l) => ({
      id: l.id,
      type: l.action === 'QUERY' ? (l.decision === 'DENY' ? 'UNAUTHORIZED_RETRIEVAL' : 'QUERY') : l.action,
      username: l.username || l.userEmail,
      userEmail: l.userEmail,
      details: l.details,
      timestamp: l.timestamp,
      decision: l.decision
    }));
  }, [logs]);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto font-sans pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[#38BDF8] text-xs font-mono uppercase tracking-wider mb-2">
            <Activity className="w-3.5 h-3.5 text-[#38BDF8]" />
            Immutable Enterprise Compliance Ledger
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#F8FAFC] tracking-tight">
            Security & Access Audit Ledger
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-1 max-w-2xl">
            Tamper-evident record of all identity authentications, retrieval queries, and policy gate decisions.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => setShowConstellation(!showConstellation)}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              showConstellation
                ? 'bg-[#2563EB]/25 text-[#38BDF8] border-[#38BDF8]/40 shadow-sm'
                : 'bg-[#141C2B] text-slate-300 border-[#253346] hover:text-[#F8FAFC]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>{showConstellation ? 'Hide 3D Nodes' : '3D Event Nodes'}</span>
          </button>

          <button
            onClick={fetchAuditLogs}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-[#141C2B] hover:bg-[#1A2438] border border-[#253346] hover:border-[#38BDF8]/40 text-[#F8FAFC] text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-[#38BDF8] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Ledger</span>
          </button>
        </div>
      </div>

      {/* Optional 3D Security Constellation View */}
      {showConstellation && (
        <SecurityConstellation3D events={constellationEvents} height={380} />
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-[#141C2B] border border-[#253346] shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Total Recorded Actions
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/20 flex items-center justify-center text-[#38BDF8]">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-[#F8FAFC] mt-4 tracking-tight">
            {stats.total}
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono">
            Cryptographically logged events
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#141C2B] border border-[#059669]/30 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#059669] uppercase tracking-wider">
              Authorized Decisions
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#059669]/10 border border-[#059669]/20 flex items-center justify-center text-[#059669]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-[#F8FAFC] mt-4 tracking-tight">
            {stats.allows}
          </div>
          <div className="text-xs text-[#059669] mt-1 font-mono font-semibold">
            Passed deterministic policy gate
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#141C2B] border border-[#EF4444]/30 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#EF4444] uppercase tracking-wider">
              Blocked / Denied Decisions
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center justify-center text-[#EF4444]">
              <Lock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-[#F8FAFC] mt-4 tracking-tight">
            {stats.denies}
          </div>
          <div className="text-xs text-[#EF4444] mt-1 font-mono font-semibold">
            Zero unauthorized chunks leaked
          </div>
        </div>
      </div>

      {/* Main Ledger Table & Filter Controls */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#141C2B] border border-[#253346] shadow-2xl backdrop-blur-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user, action, details, request ID..."
              className="w-full bg-[#0B0F17] border border-[#253346] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F8FAFC] placeholder-slate-500 focus:outline-none focus:border-[#38BDF8]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-[#0B0F17] border border-[#253346] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-[#38BDF8] cursor-pointer"
            >
              <option value="ALL">All Actions</option>
              <option value="QUERY">Query</option>
              <option value="LOGIN">Login</option>
              <option value="UPLOAD">Upload</option>
            </select>

            <select
              value={decisionFilter}
              onChange={(e) => setDecisionFilter(e.target.value)}
              className="bg-[#0B0F17] border border-[#253346] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-[#38BDF8] cursor-pointer"
            >
              <option value="ALL">All Decisions</option>
              <option value="ALLOW">Allow</option>
              <option value="DENY">Deny</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#253346] text-xs font-mono uppercase tracking-wider text-slate-300 bg-[#0B0F17]">
                <th className="py-3 px-4">Decision</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Subject User</th>
                <th className="py-3 px-4">Operation Details</th>
                <th className="py-3 px-4">Request ID</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#253346]">
              {filteredLogs.map((log, idx) => (
                <tr key={`audit-log-${log.id || idx}`} className="hover:bg-[#1A2438] transition-colors">
                  <td className="py-3.5 px-4 font-mono">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-md border flex items-center gap-1.5 w-fit ${
                        log.decision === 'ALLOW'
                          ? 'bg-[#059669]/15 text-[#10b981] border-[#059669]/30'
                          : 'bg-[#EF4444]/15 text-[#f87171] border-[#EF4444]/30'
                      }`}
                    >
                      {log.decision === 'ALLOW' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#059669]" />
                          ALLOW
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5 text-[#EF4444]" />
                          DENY
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs font-bold text-[#38BDF8]">
                    {log.action}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#F8FAFC] flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{log.username || log.userEmail || 'System'}</span>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-300 max-w-sm truncate font-mono">
                    {log.details || 'N/A'}
                  </td>
                  <td className="py-3.5 px-4">
                    {log.requestId ? (
                      <button
                        onClick={() => copyRequestId(log.requestId)}
                        className="px-2 py-1 rounded bg-[#0B0F17] border border-[#253346] hover:border-[#38BDF8]/40 text-[11px] font-mono text-slate-300 hover:text-[#F8FAFC] flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Copy Request ID"
                      >
                        <span className="truncate max-w-[80px]">{log.requestId}</span>
                        {copiedId === log.requestId ? (
                          <CheckCheck className="w-3 h-3 text-[#059669]" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    ) : (
                      <span className="text-[11px] font-mono text-slate-600">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-xs font-mono text-slate-400">
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Recent'}
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-sm">
                    No audit records matching filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
