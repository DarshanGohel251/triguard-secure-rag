import { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Check,
  X,
  Search,
  RefreshCw,
  User,
  Copy,
  CheckCheck
} from 'lucide-react';
import api from '../services/api';

export default function Audit() {
  const [logs, setLogs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [decisionFilter, setDecisionFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
        log.requestId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
      const matchesDecision = decisionFilter === 'ALL' || log.decision === decisionFilter;

      return matchesSearch && matchesAction && matchesDecision;
    });
  }, [logs, searchTerm, actionFilter, decisionFilter]);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-cyan-400" />
            Compliance & Audit Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable trace of all authentication events, retrieval decisions, and document operations.
          </p>
        </div>

        <button
          onClick={fetchAuditLogs}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-400/30 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Main Ledger Card */}
      <div className="bg-[#070d1d] border border-white/10 rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-white/5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/40">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user, action, or request ID..."
              className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Action Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Action:</span>
              {['ALL', 'QUERY', 'LOGIN', 'DOCUMENT_UPLOAD'].map((act) => (
                <button
                  key={act}
                  onClick={() => setActionFilter(act)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                    actionFilter === act
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {act}
                </button>
              ))}
            </div>

            {/* Decision Filter */}
            <div className="flex items-center gap-1.5 pl-3 border-l border-white/10">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Decision:</span>
              {['ALL', 'ALLOW', 'DENY'].map((dec) => (
                <button
                  key={dec}
                  onClick={() => setDecisionFilter(dec)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                    decisionFilter === dec
                      ? dec === 'ALLOW'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-red-500/20 text-red-300 border border-red-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {dec}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-slate-900/60 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <th className="py-3 px-5">Timestamp</th>
                <th className="py-3 px-5">Actor</th>
                <th className="py-3 px-5">Role Scope</th>
                <th className="py-3 px-5">Action</th>
                <th className="py-3 px-5">Security Decision</th>
                <th className="py-3 px-5">Request ID</th>
                <th className="py-3 px-5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-slate-300">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-5 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-5 font-medium text-white flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>{log.username}</span>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-slate-300 border border-white/5">
                      {log.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 font-semibold text-cyan-300">
                    {log.action}
                  </td>
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    {log.decision === 'ALLOW' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30">
                        <Check className="w-3 h-3" />
                        ALLOW
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-400 px-2 py-0.5 rounded bg-red-950/40 border border-red-500/30">
                        <X className="w-3 h-3" />
                        DENY
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-5 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {log.requestId ? (
                      <button
                        onClick={() => copyRequestId(log.requestId)}
                        className="inline-flex items-center gap-1 hover:text-cyan-300 transition-colors cursor-pointer group"
                        title="Click to copy full request ID"
                      >
                        <span>{log.requestId.substring(0, 8)}...</span>
                        {copiedId === log.requestId ? (
                          <CheckCheck className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 opacity-40 group-hover:opacity-100" />
                        )}
                      </button>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-slate-400 max-w-xs text-xs truncate">
                    {log.details}
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-500">
                    No audit records match the current criteria.
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
