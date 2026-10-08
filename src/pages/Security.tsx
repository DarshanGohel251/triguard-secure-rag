import { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import api from '../services/api';

export default function Security() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    api.get('/security/events').then(res => setEvents(res.data)).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white tracking-widest">SECURITY CONSOLE</h1>

      <div className="bg-graphite_light border border-gray-800 rounded-xl overflow-hidden shadow-lg">
        <div className="px-6 py-4 border-b border-gray-800 bg-[#111] flex items-center">
          <ShieldAlert className="w-5 h-5 text-red_blocked mr-2" />
          <h2 className="text-lg font-bold text-white">Blocked Access Events</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-[#161618]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {new Date(event.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-medium">
                  {event.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="px-2.5 py-1 text-xs font-bold rounded bg-red-900/30 text-red-500 border border-red-800/50 flex items-center w-fit">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {event.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">
                  {event.details}
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No security events recorded.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
