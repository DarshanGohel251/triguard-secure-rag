import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Activity,
  Cpu,
  ArrowRight,
  Lock
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import RetrievalPipelineVisual from '../components/3d/RetrievalPipelineVisual';
import SignatureShield from '../components/3d/SignatureShield';

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

        const allLogs = logsRes.data || [];
        const allEvents = eventsRes.data || [];
        const diagData = diagRes.data;

        const queries = allLogs.filter((l: any) => l.action === 'QUERY' && l.decision === 'ALLOW').length;
        const blocked = allLogs.filter((l: any) => l.action === 'QUERY' && l.decision === 'DENY').length;

        setStats({
          documents: (docsRes.data || []).length,
          queries,
          securityEvents: allEvents.length,
          blocked,
          chunks: diagData?.chunkCount || (docsRes.data || []).length * 3
        });

        if (diagData) {
          setDiagnostics(diagData);
        }

        // Recent Activity Feed
        const combined = [
          ...allLogs.map((l: any) => ({
            type: l.decision === 'DENY' ? 'DENY' : 'ALLOW',
            title: l.decision === 'DENY' ? 'Access Denied by Policy' : 'Authorized Retrieval Context',
            desc: l.details || `User "${l.userEmail}" executed ${l.action}`,
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
        setActivities(combined.slice(0, 5));

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
    <div className="flex flex-col gap-6 max-w-7xl mx-auto font-sans">
      {/* Top Welcome & Telemetry Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-[#070e20] to-[#0a142c] p-6 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-mono uppercase tracking-wider">
              PS-01 Security Console
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
              ZERO-LEAK INVARIANT ACTIVE
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Welcome, {user.name}
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            TriGuard Secure Intelligence is actively evaluating role scopes, blocking adversarial injections, and enforcing evidence citations.
          </p>
        </div>

        {/* Quick Launch Action */}
        <div className="relative z-10 flex gap-2">
          <Link
            to="/ask"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Launch AI Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-cyan-500/5 blur-3xl pointer-events-none" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Indexed Knowledge"
          value={stats.documents}
          subtext={`${stats.chunks} vector chunks`}
          icon={FileText}
          accentColor="cyan"
        />
        <KpiCard
          title="Authorized Retrievals"
          value={stats.queries}
          subtext="Verified role-compliant queries"
          icon={CheckCircle2}
          accentColor="emerald"
        />
        <KpiCard
          title="Breaches & Probes Blocked"
          value={stats.blocked}
          subtext="Withheld at retrieval boundary"
          icon={ShieldAlert}
          accentColor="amber"
        />
        <KpiCard
          title="Threat Interceptions"
          value={stats.securityEvents}
          subtext="Adversarial injections logged"
          icon={AlertTriangle}
          accentColor="red"
        />
      </div>

      {/* Interactive 6-Stage Pipeline Visualization */}
      <RetrievalPipelineVisual activeStage={6} status="AUTHORIZED" />

      {/* Middle Grid: Activity Charts & Security Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Query Volume & Live Feed */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Query Trends Chart */}
          <div className="bg-[#070d1d] border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Security Evaluation Volume
                </h2>
                <p className="text-[11px] text-slate-400">Authorized requests vs. policy-enforced blocks</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  <span className="text-slate-300">Authorized</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="text-slate-300">Blocked</span>
                </div>
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradAuthorized" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradBlocked" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#070d1d',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="authorized"
                    stroke="#00f0ff"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#gradAuthorized)"
                  />
                  <Area
                    type="monotone"
                    dataKey="blocked"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#gradBlocked)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Security Incidents & Audit Feed */}
          <div className="bg-[#070d1d] border border-white/10 rounded-2xl p-5 shadow-xl flex-1">
            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                Live Security & Audit Log
              </h2>
              <Link to="/audit" className="text-xs text-cyan-400 hover:underline">
                View All →
              </Link>
            </div>

            <div className="space-y-3">
              {activities.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No security events or audit logs recorded yet.
                </div>
              ) : (
                activities.map((act, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-start gap-3 hover:border-white/10 transition-colors"
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        act.type === 'ALLOW'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : act.type === 'DENY'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {act.type === 'ALLOW' ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : act.type === 'DENY' ? (
                        <Lock className="w-4 h-4" />
                      ) : (
                        <AlertTriangle className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{act.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatRelativeTime(act.time)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">{act.desc}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): AI Diagnostics & Signature Shield */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* AI Architecture Telemetry Card */}
          <div className="bg-[#070d1d] border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Engine Diagnostics
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-900/80 border border-white/5">
                <span className="text-slate-400">LLM Generation</span>
                <span className="font-mono text-cyan-300 font-semibold">gemini-2.5-flash</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-900/80 border border-white/5">
                <span className="text-slate-400">Vector Embeddings</span>
                <span className="font-mono text-cyan-300 font-semibold">gemini-embedding-2</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-900/80 border border-white/5">
                <span className="text-slate-400">Similarity Metric</span>
                <span className="font-mono text-slate-200">Cosine Dot-Product</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-900/80 border border-white/5">
                <span className="text-slate-400">Security Boundary</span>
                <span className="font-semibold text-emerald-400">Pre-Retrieval Strict</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-slate-400">Provider Health</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                {diagnostics?.systemStatus || 'OPERATIONAL'}
              </span>
            </div>
          </div>

          {/* Signature 3D Visual Widget */}
          <div className="bg-gradient-to-b from-[#081126] to-[#050b18] border border-cyan-500/20 rounded-2xl p-6 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
            <div className="my-2">
              <SignatureShield size="sm" status="secure" />
            </div>

            <h3 className="text-sm font-bold text-white mt-2">Zero-Trust RAG Shield</h3>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs leading-relaxed">
              Every document is categorized into Public, Internal, Confidential, or Restricted. Only verified chunks enter LLM synthesis.
            </p>

            <div className="mt-4 w-full grid grid-cols-2 gap-2 text-left text-[10px] font-mono">
              <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                <span className="text-cyan-400 block font-bold">100% Deterministic</span>
                <span className="text-slate-500">RBAC Enforcement</span>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                <span className="text-emerald-400 block font-bold">Page-Aware</span>
                <span className="text-slate-500">Verifiable Citations</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, subtext, icon: Icon, accentColor }: any) {
  const colorMap: any = {
    cyan: 'text-cyan-400 border-cyan-500/20 bg-cyan-950/20 shadow-cyan-500/10',
    emerald: 'text-emerald-400 border-emerald-500/20 bg-emerald-950/20 shadow-emerald-500/10',
    amber: 'text-amber-400 border-amber-500/20 bg-amber-950/20 shadow-amber-500/10',
    red: 'text-red-400 border-red-500/20 bg-red-950/20 shadow-red-500/10'
  };

  return (
    <div className="bg-[#070d1d] border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-white/20 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-xl border ${colorMap[accentColor]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
          {title}
        </span>
        <span className="text-3xl font-black text-white tracking-tight mt-0.5 block">
          {value}
        </span>
        <span className="text-[11px] text-slate-400 mt-1 block font-mono">{subtext}</span>
      </div>
    </div>
  );
}

function formatRelativeTime(timestamp: number) {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
