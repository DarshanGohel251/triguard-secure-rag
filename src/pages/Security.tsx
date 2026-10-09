import { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Lock,
  Search,
  Filter,
  RefreshCw,
  User
} from 'lucide-react';
import api from '../services/api';

export default function Security() {
  const [events, setEvents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [loading, setLoading] = useState(false);

  const fetchSecurityEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/security/events');
      setEvents(res.data || []);
    } catch (err) {
      console.error('Failed to fetch security events', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityEvents();
  }, []);

  const stats = useMemo(() => {
    const injections = events.filter((e) => e.type === 'PROMPT_INJECTION').length;
    const probes = events.filter((e) => e.type === 'UNAUTHORIZED_RETRIEVAL').length;
    return { total: events.length, injections, probes };
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchesSearch =
        ev.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.type?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'ALL' || ev.type === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [events, searchTerm, filterType]);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-400" />
            Threat Detection & Security Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry of prompt-injection attempts and unauthorized classification probes.
          </p>
        </div>

        <button
          onClick={fetchSecurityEvents}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-400/30 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Threat Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#070d1d] border border-white/10 rounded-2xl p-4 shadow-xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Threats Intercepted
            </span>
            <span className="text-2xl font-black text-white">{stats.total}</span>
          </div>
        </div>

        <div className="bg-[#070d1d] border border-white/10 rounded-2xl p-4 shadow-xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Prompt Injections Blocked
            </span>
            <span className="text-2xl font-black text-white">{stats.injections}</span>
          </div>
        </div>

        <div className="bg-[#070d1d] border border-white/10 rounded-2xl p-4 shadow-xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Unauthorized Probes Deflected
            </span>
            <span className="text-2xl font-black text-white">{stats.probes}</span>
          </div>
        </div>
      </div>

      {/* Threat Incident Feed */}
      <div className="bg-[#070d1d] border border-white/10 rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/40">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by username or payload detail..."
              className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-400"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-red-400" />
              Type:
            </span>
            {['ALL', 'PROMPT_INJECTION', 'UNAUTHORIZED_RETRIEVAL'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                  filterType === type
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                    : 'text-slate-400 hover:text-white border border-transparent hover:bg-white/5'
                }`}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Incidents Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-slate-900/60 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <th className="py-3 px-5">Incident Timestamp</th>
                <th className="py-3 px-5">Origin User</th>
                <th className="py-3 px-5">Threat Signature</th>
                <th className="py-3 px-5">Firewall Action</th>
                <th className="py-3 px-5">Incident Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-slate-300">
              {filteredEvents.map((ev) => (
                <tr key={ev.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-5 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {new Date(ev.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-5 font-medium text-white flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ev.username}</span>
                  </td>
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        ev.type === 'PROMPT_INJECTION'
                          ? 'bg-red-500/10 text-red-400 border-red-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {ev.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-400 px-2 py-0.5 rounded bg-red-950/40 border border-red-500/30">
                      <Lock className="w-3 h-3" />
                      {ev.status || 'BLOCKED'}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-300 max-w-md text-xs leading-relaxed">
                    {ev.details}
                  </td>
                </tr>
              ))}

              {filteredEvents.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-slate-500">
                    No threat events matching filter criteria.
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
