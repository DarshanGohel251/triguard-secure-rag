import { useEffect, useState } from 'react';
import { Shield, FileText, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    documents: 0,
    queries: 0,
    securityEvents: 0,
    blocked: 0
  });

  useEffect(() => {
    // Simple fetch for MVP stats
    const fetchStats = async () => {
      try {
        const [docs, logs, events] = await Promise.all([
          api.get('/documents'),
          api.get('/audit/logs'),
          api.get('/security/events')
        ]);
        
        const allLogs = logs.data;
        const queries = allLogs.filter((l: any) => l.action === 'RETRIEVAL' && l.decision === 'ALLOW').length;
        const blocked = allLogs.filter((l: any) => l.action === 'RETRIEVAL' && l.decision === 'DENY').length;

        setStats({
          documents: docs.data.length,
          queries,
          securityEvents: events.data.length,
          blocked
        });
      } catch (err) {
        console.error("Failed to load stats", err);
      }
    };
    fetchStats();
  }, []);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white tracking-widest">COMMAND CENTER</h1>
        <div className="flex items-center space-x-3 bg-graphite_light px-4 py-2 rounded-full border border-gray-800">
          <div className="w-2 h-2 rounded-full bg-emerald_auth animate-pulse" />
          <span className="text-sm font-medium text-emerald-400">System Secure</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Indexed Documents" value={stats.documents} icon={FileText} color="text-cyan_ai" />
        <StatCard title="Authorized Queries" value={stats.queries} icon={CheckCircle2} color="text-emerald_auth" />
        <StatCard title="Blocked Access" value={stats.blocked} icon={Shield} color="text-red_blocked" />
        <StatCard title="Security Events" value={stats.securityEvents} icon={AlertTriangle} color="text-amber_warn" />
      </div>

      <div className="mt-8 bg-graphite_light border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Identity Context</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InfoBox label="User" value={user.name} />
          <InfoBox label="Role" value={user.role} />
          <InfoBox label="Department" value={user.department} />
          <InfoBox label="Session" value="Active" color="text-emerald_auth" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-graphite_light border border-gray-800 rounded-xl p-6 flex items-center shadow-lg">
      <div className={`p-4 rounded-lg bg-black/50 ${color}`}>
        <Icon className="w-8 h-8" />
      </div>
      <div className="ml-5">
        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
      </div>
    </div>
  );
}

function InfoBox({ label, value, color = "text-white" }: any) {
  return (
    <div className="bg-[#111] border border-gray-800 rounded-lg p-4">
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{label}</p>
      <p className={`font-semibold ${color}`}>{value}</p>
    </div>
  );
}
