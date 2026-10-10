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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#09BBC8]/10 border border-[#09BBC8]/30 text-[#D9FCED] text-xs font-mono uppercase tracking-wider mb-2">
            <Activity className="w-3.5 h-3.5 text-[#09BBC8]" />
            Immutable Enterprise Compliance Ledger
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#D9FCED] tracking-tight">
            Security & Access Audit Ledger
          </h1>
          <p className="text-sm sm:text-base text-[#D9FCED]/75 mt-1 max-w-2xl">
            Tamper-evident record of all identity authentications, retrieval queries, and policy gate decisions.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => setShowConstellation(!showConstellation)}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              showConstellation
                ? 'bg-[#405FFA] text-[#D9FCED] border-[#09BBC8] shadow-[0_0_15px_rgba(9,187,200,0.35)]'
                : 'bg-[#3B3664]/40 text-[#D9FCED]/70 border-[#09BBC8]/20 hover:text-[#D9FCED]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#09BBC8]" />
            <span>{showConstellation ? 'Hide 3D Nodes' : '3D Event Nodes'}</span>
          </button>

          <button
            onClick={fetchAuditLogs}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-[#3B3664]/50 hover:bg-[#3B3664]/80 border border-[#09BBC8]/30 hover:border-[#09BBC8]/60 text-[#D9FCED] text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-[#09BBC8] ${loading ? 'animate-spin' : ''}`} />
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
        <div className="p-6 rounded-2xl bg-[#3B3664]/30 backdrop-blur-md border border-[#09BBC8]/20 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#D9FCED]/70 uppercase tracking-wider">
              Total Recorded Actions
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#09BBC8]/10 border border-[#09BBC8]/30 flex items-center justify-center text-[#09BBC8]">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-[#D9FCED] mt-4 tracking-tight">
            {stats.total}
          </div>
          <div className="text-xs text-[#D9FCED]/60 mt-1 font-mono">
            Cryptographically logged events
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#3B3664]/30 backdrop-blur-md border border-[#09BBC8]/20 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#09BBC8] uppercase tracking-wider">
              Authorized Decisions
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#09BBC8]/10 border border-[#09BBC8]/30 flex items-center justify-center text-[#09BBC8]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-[#D9FCED] mt-4 tracking-tight">
            {stats.allows}
          </div>
          <div className="text-xs text-[#09BBC8] mt-1 font-mono">
            Passed deterministic policy gate
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#3B3664]/30 backdrop-blur-md border border-amber-500/30 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Blocked / Denied Decisions
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-[#D9FCED] mt-4 tracking-tight">
            {stats.denies}
          </div>
          <div className="text-xs text-amber-400 mt-1 font-mono">
            Zero unauthorized chunks leaked
          </div>
        </div>
      </div>

      {/* Main Ledger Table & Filter Controls */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#3B3664]/30 border border-[#09BBC8]/25 shadow-2xl backdrop-blur-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#D9FCED]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user, action, details, request ID..."
              className="w-full bg-[#3B3664]/40 border border-[#09BBC8]/25 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#D9FCED] placeholder-[#D9FCED]/40 focus:outline-none focus:border-[#09BBC8]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-[#3B3664]/40 border border-[#09BBC8]/25 rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#D9FCED] focus:outline-none focus:border-[#09BBC8] cursor-pointer"
            >
              <option value="ALL" className="bg-[#07240F]">All Actions</option>
              <option value="QUERY" className="bg-[#07240F]">Query</option>
              <option value="LOGIN" className="bg-[#07240F]">Login</option>
              <option value="UPLOAD" className="bg-[#07240F]">Upload</option>
            </select>

            <select
              value={decisionFilter}
              onChange={(e) => setDecisionFilter(e.target.value)}
              className="bg-[#3B3664]/40 border border-[#09BBC8]/25 rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#D9FCED] focus:outline-none focus:border-[#09BBC8] cursor-pointer"
            >
              <option value="ALL" className="bg-[#07240F]">All Decisions</option>
              <option value="ALLOW" className="bg-[#07240F]">Allow</option>
              <option value="DENY" className="bg-[#07240F]">Deny</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#09BBC8]/20 text-xs font-mono uppercase tracking-wider text-[#D9FCED]/70 bg-[#3B3664]/40">
                <th className="py-3 px-4">Decision</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Subject User</th>
                <th className="py-3 px-4">Operation Details</th>
                <th className="py-3 px-4">Request ID</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#09BBC8]/10">
              {filteredLogs.map((log, idx) => (
                <tr key={`audit-log-${log.id || idx}`} className="hover:bg-[#09BBC8]/5 transition-colors">
                  <td className="py-3.5 px-4 font-mono">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-md border flex items-center gap-1.5 w-fit ${
                        log.decision === 'ALLOW'
                          ? 'bg-[#09BBC8]/10 text-[#09BBC8] border-[#09BBC8]/30'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {log.decision === 'ALLOW' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#09BBC8]" />
                          ALLOW
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          DENY
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs font-bold text-[#09BBC8]">
                    {log.action}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#D9FCED] flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[#09BBC8]" />
                    <span>{log.username || log.userEmail || 'System'}</span>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-[#D9FCED]/80 max-w-sm truncate font-mono">
                    {log.details || 'N/A'}
                  </td>
                  <td className="py-3.5 px-4">
                    {log.requestId ? (
                      <button
                        onClick={() => copyRequestId(log.requestId)}
                        className="px-2 py-1 rounded bg-[#3B3664]/50 border border-[#09BBC8]/20 hover:border-[#09BBC8]/50 text-[11px] font-mono text-[#D9FCED]/70 hover:text-[#D9FCED] flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Copy Request ID"
                      >
                        <span className="truncate max-w-[80px]">{log.requestId}</span>
                        {copiedId === log.requestId ? (
                          <CheckCheck className="w-3 h-3 text-[#09BBC8]" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    ) : (
                      <span className="text-[11px] font-mono text-[#D9FCED]/40">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-xs font-mono text-[#D9FCED]/50">
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Recent'}
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#D9FCED]/40 text-sm">
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
