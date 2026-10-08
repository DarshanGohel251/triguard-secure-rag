import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      navigate('/dashboard');
    } catch (err: any) {
      setError('Invalid credentials or access denied.');
    } finally {
      setLoading(false);
    }
  };

  const useDemoUser = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password');
  };

  return (
    <div className="min-h-screen bg-graphite flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Shield className="w-16 h-16 text-cyan_ai" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-widest">
          TRIGUARD
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Secure Intelligence Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-graphite_light py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-800">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-300">Email address</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm bg-[#161618] text-white placeholder-gray-500 focus:outline-none focus:ring-cyan_ai focus:border-cyan_ai sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm bg-[#161618] text-white placeholder-gray-500 focus:outline-none focus:ring-cyan_ai focus:border-cyan_ai sm:text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="text-red_blocked text-sm text-center font-medium bg-red-900/20 py-2 rounded">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-cyan_ai hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan_ai disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-graphite_light text-gray-400">Demo Accounts</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={() => useDemoUser('employee@triguard.com')} className="w-full inline-flex justify-center py-2 px-4 border border-gray-700 rounded-md shadow-sm bg-[#161618] text-xs font-medium text-gray-300 hover:bg-gray-800">
                Employee
              </button>
              <button onClick={() => useDemoUser('hr@triguard.com')} className="w-full inline-flex justify-center py-2 px-4 border border-gray-700 rounded-md shadow-sm bg-[#161618] text-xs font-medium text-gray-300 hover:bg-gray-800">
                HR Manager
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
