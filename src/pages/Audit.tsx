import { useState, useEffect } from 'react';
import { Activity, Check, X } from 'lucide-react';
import api from '../services/api';

export default function Audit() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    api.get('/audit/logs').then(res => setLogs(res.data)).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white tracking-widest">SYSTEM AUDIT</h1>

      <div className="bg-graphite_light border border-gray-800 rounded-xl overflow-hidden shadow-lg">
        <div className="px-6 py-4 border-b border-gray-800 bg-[#111] flex items-center">
          <Activity className="w-5 h-5 text-cyan_ai mr-2" />
          <h2 className="text-lg font-bold text-white">Action Logs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-[#161618]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Decision</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Request ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-300 font-medium">
                    {log.username}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-xs text-gray-400">
                    <span className="bg-gray-800 px-2 py-1 rounded">{log.role}</span>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm font-semibold text-cyan-200">
                    {log.action}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm">
                    {log.decision === 'ALLOW' ? (
                      <span className="flex items-center text-emerald-400"><Check className="w-4 h-4 mr-1" /> ALLOW</span>
                    ) : (
                      <span className="flex items-center text-red-400"><X className="w-4 h-4 mr-1" /> DENY</span>
                    )}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-xs text-gray-500 font-mono">
                    {log.requestId}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No audit logs recorded.
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
