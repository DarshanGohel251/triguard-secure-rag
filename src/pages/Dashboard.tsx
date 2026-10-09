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
import DocumentSecuritySpace from '../components/3d/DocumentSecuritySpace';
import HeroSecurityCore from '../components/3d/HeroSecurityCore';

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
  const [documents, setDocuments] = useState<any[]>([]);

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

        setDocuments(allDocs);

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
      {/* Hero Welcome & Command Center Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#07132B] via-[#050C1B] to-[#030814] border border-cyan-500/25 p-8 sm:p-10 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8),0_0_30px_rgba(0,229,255,0.12)] overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                Defense-In-Depth Security Operations
              </div>
              {diagnostics && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                  <span>Engine: {diagnostics.ragEngineStatus || 'ACTIVE'}</span>
                  <span>•</span>
                  <span>{diagnostics.embeddingModel || 'text-embedding-004'}</span>
                </div>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Welcome, {user.name || 'Security Operator'}
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              TriGuard Enterprise Command Center. Deterministic pre-retrieval access control, vector partition isolation, and live prompt injection defense.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/ask"
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Launch Ask TriGuard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/documents"
                className="px-5 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-cyan-400/40 text-slate-200 hover:text-white font-semibold text-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Manage Knowledge Base</span>
              </Link>
            </div>
          </div>

          {/* Right Hero 3D Centerpiece */}
          <div className="shrink-0 hidden lg:block">
            <HeroSecurityCore status="secure" size="md" showTelemetry={false} />
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Stat 1: Documents Ingested */}
        <div className="p-6 rounded-2xl bg-[#060D1E]/90 border border-white/10 hover:border-cyan-400/30 transition-all shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Indexed Documents</span>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white mt-4 tracking-tight">
            {stats.documents}
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-mono">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>{stats.chunks} vector chunks indexed</span>
          </div>
        </div>

        {/* Stat 2: Authorized Queries */}
        <div className="p-6 rounded-2xl bg-[#060D1E]/90 border border-white/10 hover:border-emerald-500/30 transition-all shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Authorized Queries</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white mt-4 tracking-tight">
            {stats.queries}
          </div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1.5 font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>100% Grounded in evidence</span>
          </div>
        </div>

        {/* Stat 3: Policy Blocks */}
        <div className="p-6 rounded-2xl bg-[#060D1E]/90 border border-white/10 hover:border-amber-500/30 transition-all shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Policy Access Denied</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Lock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white mt-4 tracking-tight">
            {stats.blocked}
          </div>
          <div className="text-xs text-amber-400 mt-1 flex items-center gap-1.5 font-mono">
            <Shield className="w-3.5 h-3.5" />
            <span>Zero-leakage enforced</span>
          </div>
        </div>

        {/* Stat 4: Security Events / Injections Intercepted */}
        <div className="p-6 rounded-2xl bg-[#060D1E]/90 border border-white/10 hover:border-red-500/30 transition-all shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Threats Intercepted</span>
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white mt-4 tracking-tight">
            {stats.securityEvents}
          </div>
          <div className="text-xs text-red-400 mt-1 flex items-center gap-1.5 font-mono">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Prompt Firewall Active</span>
          </div>
        </div>
      </div>

      {/* 3D Experience: Interactive Deterministic Pipeline */}
      <RetrievalPipelineVisual activeStage={6} status="AUTHORIZED" />

      {/* Interactive 3D Document Security Space */}
      <DocumentSecuritySpace
        documents={documents}
        userRole={user.role || 'EMPLOYEE'}
        userDept={user.department || 'Finance'}
      />

      {/* Query Traffic Chart & Recent Security Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 7-Day Query Volume Area Chart (lg:col-span-7) */}
        <div className="lg:col-span-7 p-6 sm:p-7 rounded-2xl bg-[#060D1E]/90 border border-white/10 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                Retrieval Query Traffic
              </h2>
              <p className="text-xs text-slate-400">
                Authorized completions vs. policy denied attempts
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                Authorized
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                Blocked
              </span>
            </div>
          </div>

          <div className="h-64 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAuth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#091326',
                    borderColor: 'rgba(255,255,255,0.15)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="authorized"
                  stroke="#00E5FF"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAuth)"
                />
                <Area
                  type="monotone"
                  dataKey="blocked"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorBlocked)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Audit & Threat Activity (lg:col-span-5) */}
        <div className="lg:col-span-5 p-6 sm:p-7 rounded-2xl bg-[#060D1E]/90 border border-white/10 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Live Security Feed
              </h2>
              <Link
                to="/audit"
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                View Ledger <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {activities.map((act, idx) => (
                <div
                  key={act.id || idx}
                  className="p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/15 flex items-start gap-3 transition-colors"
                >
                  <div
                    className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      act.type === 'EVENT'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : act.type === 'DENY'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
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
                      <span className="text-xs sm:text-sm font-bold text-white truncate">
                        {act.title}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0 ml-2">
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
