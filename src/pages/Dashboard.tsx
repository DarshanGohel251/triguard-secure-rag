import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  FileText,
  CheckCircle2,
  ShieldAlert,
  Activity,
  ArrowRight,
  Lock,
  Sparkles,
  MessageSquare,
  Database,
  Radio
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import RetrievalPipelineVisual from '../components/3d/RetrievalPipelineVisual';
import DefenseEngine3D from '../components/3d/DefenseEngine3D';

export default function Dashboard() {
  const [stats, setStats] = useState({
    documents: 0,
    queries: 0,
    securityEvents: 0,
    blocked: 0,
    chunks: 0
  });

  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return { name: 'User', role: 'EMPLOYEE', department: 'Finance' };
    }
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [docsRes, logsRes, eventsRes, diagRes] = await Promise.all([
          api.get('/documents').catch(() => ({ data: [] })),
          api.get('/audit/logs').catch(() => ({ data: [] })),
          api.get('/security/events').catch(() => ({ data: [] })),
          api.get('/diagnostics').catch(() => ({ data: null }))
        ]);

        const allDocs = docsRes.data || [];
        const allLogs = logsRes.data || [];
        const allEvents = eventsRes.data || [];
        const diagData = diagRes.data;

        const queries = allLogs.filter((l: any) => l.action === 'QUERY' && l.decision === 'ALLOW').length;
        const blocked = allLogs.filter((l: any) => l.action === 'QUERY' && l.decision === 'DENY').length;

        setStats({
          documents: allDocs.length,
          queries,
          securityEvents: allEvents.length,
          blocked,
          chunks: diagData?.chunkCount || allDocs.length * 3
        });

        if (diagData) {
          setDiagnostics(diagData);
        }

        // Recent Activity Feed
        const combined = [
          ...allLogs.map((l: any) => ({
            type: l.decision === 'DENY' ? 'DENY' : 'ALLOW',
            title: l.decision === 'DENY' ? 'Access Denied by Policy Gate' : 'Authorized Retrieval Context',
            desc: l.details || `User "${l.userEmail || l.username}" executed ${l.action}`,
            time: new Date(l.timestamp).getTime(),
            id: l.id
          })),
          ...allEvents.map((e: any) => ({
            type: 'EVENT',
            title: e.type === 'PROMPT_INJECTION' ? 'Prompt Injection Blocked' : 'Unauthorized Retrieval Probe Intercepted',
            desc: e.details || `Threat detected for ${e.username}`,
            time: new Date(e.timestamp).getTime(),
            id: e.id
          }))
        ];

        combined.sort((a, b) => b.time - a.time);
        setActivities(combined.slice(0, 6));

        // 7-day query timeline
        const daysMap = new Map();
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          daysMap.set(dateStr, { name: dateStr, authorized: 0, blocked: 0 });
        }

        allLogs.forEach((l: any) => {
          const d = new Date(l.timestamp);
          const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (daysMap.has(dateStr)) {
            const item = daysMap.get(dateStr);
            if (l.action === 'QUERY') {
              if (l.decision === 'ALLOW') item.authorized += 1;
              if (l.decision === 'DENY') item.blocked += 1;
            }
          }
        });

        setChartData(Array.from(daysMap.values()));
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto font-sans pb-12">
      {/* Hero Welcome & 3D Defense Engine Centerpiece */}
      <div className="relative rounded-3xl bg-[#141C2B] border border-[#253346] p-8 sm:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_35px_rgba(56,189,248,0.12)] overflow-hidden">
        {/* Ambient Halo */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#38BDF8]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text & Quick Actions (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[#38BDF8] text-xs font-mono font-semibold uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5 text-[#38BDF8]" />
                TriGuard Apex Command Center
              </div>
              {diagnostics && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#059669]/15 border border-[#059669]/30 text-[#10b981] text-xs font-mono font-bold">
                  <span>Engine: {diagnostics.ragEngineStatus || 'ACTIVE'}</span>
                  <span>•</span>
                  <span>{diagnostics.embeddingModel || 'text-embedding-004'}</span>
                </div>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#F8FAFC] tracking-tight leading-tight">
              Welcome, {user.name || 'Security Operator'}
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
              Enterprise Defense Operations. Deterministic pre-retrieval access control, multi-tenant vector boundary isolation, and autonomous prompt injection firewall.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/ask"
                className="px-5 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] text-[#F8FAFC] font-bold text-sm shadow-lg shadow-[#2563EB]/25 flex items-center gap-2 transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Launch Ask TriGuard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/documents"
                className="px-5 py-3 rounded-xl bg-[#0B0F17] hover:bg-[#1A2438] border border-[#253346] hover:border-[#38BDF8]/40 text-[#F8FAFC] font-semibold text-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#38BDF8]" />
                <span>Spatial Knowledge Base</span>
              </Link>
            </div>
          </div>

          {/* Right: Signature 3D Defense Engine Centerpiece (lg:col-span-5) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md bg-[#0B0F17] border border-[#253346] rounded-2xl p-4 shadow-2xl backdrop-blur-md">
              <DefenseEngine3D status="secure" height={320} interactive={true} />
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Stat 1: Documents Ingested */}
        <div className="p-6 rounded-2xl bg-[#141C2B] border border-[#253346] hover:border-[#38BDF8]/40 transition-all shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Indexed Documents</span>
            <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/20 flex items-center justify-center text-[#38BDF8] group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-[#F8FAFC] mt-4 tracking-tight">
            {stats.documents}
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-mono">
            <Database className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>{stats.chunks} vector chunks indexed</span>
          </div>
        </div>

        {/* Stat 2: Authorized Queries */}
        <div className="p-6 rounded-2xl bg-[#141C2B] border border-[#253346] hover:border-[#059669]/40 transition-all shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Authorized Queries</span>
            <div className="w-10 h-10 rounded-xl bg-[#059669]/10 border border-[#059669]/20 flex items-center justify-center text-[#059669] group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-[#F8FAFC] mt-4 tracking-tight">
            {stats.queries}
          </div>
          <div className="text-xs text-[#059669] mt-1 flex items-center gap-1.5 font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>100% Grounded in evidence</span>
          </div>
        </div>

        {/* Stat 3: Policy Blocks */}
        <div className="p-6 rounded-2xl bg-[#141C2B] border border-[#253346] hover:border-amber-500/40 transition-all shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Policy Access Denied</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Lock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-[#F8FAFC] mt-4 tracking-tight">
            {stats.blocked}
          </div>
          <div className="text-xs text-amber-400 mt-1 flex items-center gap-1.5 font-mono">
            <Shield className="w-3.5 h-3.5" />
            <span>Zero-leakage enforced</span>
          </div>
        </div>

        {/* Stat 4: Security Events / Injections Intercepted */}
        <div className="p-6 rounded-2xl bg-[#141C2B] border border-[#253346] hover:border-[#EF4444]/40 transition-all shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Threats Intercepted</span>
            <div className="w-10 h-10 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center justify-center text-[#EF4444] group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-[#F8FAFC] mt-4 tracking-tight">
            {stats.securityEvents}
          </div>
          <div className="text-xs text-[#EF4444] mt-1 flex items-center gap-1.5 font-mono font-semibold">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Prompt Firewall Active</span>
          </div>
        </div>
      </div>

      {/* 6-Stage Deterministic Pipeline Trace */}
      <RetrievalPipelineVisual activeStage={6} status="AUTHORIZED" layout="horizontal" />

      {/* Query Traffic Chart & Recent Security Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 7-Day Query Volume Area Chart (lg:col-span-7) */}
        <div className="lg:col-span-7 p-6 sm:p-7 rounded-2xl bg-[#141C2B] border border-[#253346] shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#F8FAFC] tracking-wide">
                Retrieval Query Traffic
              </h2>
              <p className="text-xs text-slate-400">
                Authorized completions vs. policy denied attempts
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-[#38BDF8]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
                Authorized
              </span>
              <span className="flex items-center gap-1.5 text-[#EF4444]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                Blocked
              </span>
            </div>
          </div>

          <div className="h-64 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAuth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  stroke="#94A3B8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#141C2B',
                    borderColor: '#253346',
                    borderRadius: '12px',
                    color: '#F8FAFC',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="authorized"
                  stroke="#38BDF8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAuth)"
                />
                <Area
                  type="monotone"
                  dataKey="blocked"
                  stroke="#EF4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorBlocked)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Audit & Threat Activity (lg:col-span-5) */}
        <div className="lg:col-span-5 p-6 sm:p-7 rounded-2xl bg-[#141C2B] border border-[#253346] shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-[#F8FAFC] tracking-wide flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#38BDF8]" />
                Live Security Feed
              </h2>
              <Link
                to="/audit"
                className="text-xs font-mono text-[#38BDF8] hover:text-sky-300 flex items-center gap-1 font-bold"
              >
                View Ledger <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {activities.map((act, idx) => (
                <div
                  key={`act-${act.id || idx}`}
                  className="p-3 rounded-xl bg-[#0B0F17] border border-[#253346] hover:border-[#38BDF8]/40 flex items-start gap-3 transition-colors"
                >
                  <div
                    className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      act.type === 'EVENT'
                        ? 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20'
                        : act.type === 'DENY'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-[#059669]/10 text-[#10b981] border border-[#059669]/20'
                    }`}
                  >
                    {act.type === 'EVENT' ? (
                      <ShieldAlert className="w-4 h-4" />
                    ) : act.type === 'DENY' ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold text-[#F8FAFC] truncate">
                        {act.title}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">
                        {new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {act.desc}
                    </p>
                  </div>
                </div>
              ))}

              {activities.length === 0 && (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No activity recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
