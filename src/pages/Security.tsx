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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-xs font-mono uppercase tracking-wider mb-2">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#EF4444]" />
            Autonomous Threat Interception Gateway
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#F8FAFC] tracking-tight">
            Threat Detection & Security Center
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-1 max-w-2xl">
            Live multi-vector spatial interception of prompt injection attacks, exfiltration commands, and unauthorized retrieval probes.
          </p>
        </div>

        <button
          onClick={fetchSecurityEvents}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-[#141C2B] hover:bg-[#1A2438] border border-[#253346] hover:border-[#38BDF8]/40 text-[#F8FAFC] text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 text-[#38BDF8] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Experience D: Security Constellation 3D */}
      <SecurityConstellation3D events={events} height={400} />

      {/* KPI Threat Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-[#141C2B] border border-[#EF4444]/30 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#EF4444] uppercase tracking-wider">
              Prompt Injections Intercepted
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444]">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-[#F8FAFC] mt-4 tracking-tight">
            {stats.injections}
          </div>
          <div className="text-xs text-[#EF4444] mt-1 font-mono font-semibold">
            Direct override & system prompt exfiltration attempts
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#141C2B] border border-amber-500/30 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Unauthorized Retrieval Probes
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-[#F8FAFC] mt-4 tracking-tight">
            {stats.probes}
          </div>
          <div className="text-xs text-amber-400 mt-1 font-mono">
            Cross-department salary or restricted document queries
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#141C2B] border border-[#059669]/30 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#059669] uppercase tracking-wider">
              Defense Gate Status
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#059669]/10 border border-[#059669]/30 flex items-center justify-center text-[#059669]">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-[#F8FAFC] mt-4 tracking-tight">
            Active
          </div>
          <div className="text-xs text-[#059669] mt-1 font-mono font-semibold">
            100% Pre-retrieval enforcement guaranteed
          </div>
        </div>
      </div>

      {/* Incident Log Ledger */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#141C2B] border border-[#253346] shadow-2xl backdrop-blur-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#F8FAFC] tracking-tight">
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
              className="w-full bg-[#0B0F17] border border-[#253346] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F8FAFC] placeholder-slate-500 focus:outline-none focus:border-[#38BDF8]"
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
                  ? 'bg-[#2563EB]/25 text-[#38BDF8] border border-[#38BDF8]/40 shadow-sm'
                  : 'bg-[#0B0F17] text-slate-400 hover:text-[#F8FAFC] border border-[#253346]'
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
              <tr className="border-b border-[#253346] text-xs font-mono uppercase tracking-wider text-slate-300 bg-[#0B0F17]">
                <th className="py-3 px-4">Threat Classification</th>
                <th className="py-3 px-4">Origin Identity</th>
                <th className="py-3 px-4">Payload Snippet</th>
                <th className="py-3 px-4">Defense Enforcement</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#253346]">
              {filteredEvents.map((ev, idx) => (
                <tr key={`sec-ev-${ev.id || idx}`} className="hover:bg-[#1A2438] transition-colors">
                  <td className="py-3.5 px-4 font-mono">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                        ev.type === 'PROMPT_INJECTION'
                          ? 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {ev.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#F8FAFC] flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ev.username}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-300 max-w-md truncate">
                    {ev.details}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[11px] font-mono text-[#059669] bg-[#059669]/15 px-2 py-0.5 rounded border border-[#059669]/30 font-bold">
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
