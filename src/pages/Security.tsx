import { useState, useEffect, useMemo } from 'react';
import {
  Lock,
  Search,
  RefreshCw,
  User,
  Radio,
  Flame,
  ShieldCheck
} from 'lucide-react';
import api from '../services/api';
import SecurityConstellation3D, { type SecurityEventData } from '../components/3d/SecurityConstellation3D';

export default function Security() {
  const [events, setEvents] = useState<SecurityEventData[]>([]);
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
    const probes = events.filter((e) => e.type === 'UNAUTHORIZED_RETRIEVAL' || e.type !== 'PROMPT_INJECTION').length;
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
    <div className="flex flex-col gap-8 max-w-7xl mx-auto font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono uppercase tracking-wider mb-2">
            <Radio className="w-3.5 h-3.5 animate-pulse text-red-400" />
            Autonomous Threat Interception Gateway
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Threat Detection & Security Center
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-1 max-w-2xl">
            Live multi-vector spatial interception of prompt injection attacks, exfiltration commands, and unauthorized retrieval probes.
          </p>
        </div>

        <button
          onClick={fetchSecurityEvents}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-red-500/40 text-slate-300 hover:text-white text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Experience D: Security Constellation 3D */}
      <SecurityConstellation3D events={events} height={400} />

      {/* KPI Threat Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-[#060D1E]/95 border border-red-500/30 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
              Prompt Injections Intercepted
            </span>
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white mt-4 tracking-tight">
            {stats.injections}
          </div>
          <div className="text-xs text-red-400 mt-1 font-mono">
            Direct override & system prompt exfiltration attempts
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#060D1E]/95 border border-amber-500/30 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Unauthorized Retrieval Probes
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white mt-4 tracking-tight">
            {stats.probes}
          </div>
          <div className="text-xs text-amber-400 mt-1 font-mono">
            Cross-department salary or restricted document queries
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#060D1E]/95 border border-emerald-500/30 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Defense Gate Status
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white mt-4 tracking-tight">
            Active
          </div>
          <div className="text-xs text-emerald-400 mt-1 font-mono">
            100% Pre-retrieval enforcement guaranteed
          </div>
        </div>
      </div>

      {/* Incident Log Ledger */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#060D1E]/95 border border-white/10 shadow-2xl backdrop-blur-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Intercepted Security Incidents
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Historical record of blocked attacks with attacker credentials and payload details
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user or payload..."
              className="w-full bg-[#091326] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-400"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2">
          {['ALL', 'PROMPT_INJECTION', 'UNAUTHORIZED_RETRIEVAL'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                filterType === f
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Incident Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs font-mono uppercase tracking-wider text-slate-400 bg-slate-900/40">
                <th className="py-3 px-4">Threat Classification</th>
                <th className="py-3 px-4">Origin Identity</th>
                <th className="py-3 px-4">Payload Snippet</th>
                <th className="py-3 px-4">Defense Enforcement</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredEvents.map((ev, idx) => (
                <tr key={`sec-ev-${ev.id || idx}`} className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4 font-mono">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                        ev.type === 'PROMPT_INJECTION'
                          ? 'bg-red-500/10 text-red-300 border-red-500/30'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {ev.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ev.username}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-300 max-w-md truncate">
                    {ev.details}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      INTERCEPTED & BLOCKED
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-mono text-slate-400">
                    {ev.timestamp ? new Date(ev.timestamp).toLocaleString() : 'Recent'}
                  </td>
                </tr>
              ))}

              {filteredEvents.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 text-sm">
                    No threat events matching filter criteria. System integrity optimal.
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
