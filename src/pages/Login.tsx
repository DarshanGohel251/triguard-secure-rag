import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, KeyRound, ArrowRight, Loader2, Lock, UserCheck, AlertCircle } from 'lucide-react';
import api from '../services/api';
import SignatureShield from '../components/3d/SignatureShield';

const DEMO_PERSONAS = [
  {
    role: 'Employee',
    name: 'Ravi Employee',
    email: 'employee@triguard.com',
    dept: 'Finance',
    access: 'Public & General Internal',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  },
  {
    role: 'Department Manager',
    name: 'Bob Manager',
    email: 'manager@triguard.com',
    dept: 'Finance',
    access: 'Finance Confidential',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  },
  {
    role: 'HR Manager',
    name: 'Alice HR',
    email: 'hr@triguard.com',
    dept: 'HR',
    access: 'Restricted & Executive',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  },
  {
    role: 'Administrator',
    name: 'Eve Admin',
    email: 'admin@triguard.com',
    dept: 'IT',
    access: 'Full Security Clearance',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  }
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const executeAuth = async (loginEmail: string, loginPass: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email: loginEmail, password: loginPass });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid credentials or access denied by policy.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email and password.');
      return;
    }
    executeAuth(email, password);
  };

  const handleDemoSelect = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password');
    executeAuth(demoEmail, 'password');
  };

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col justify-center relative overflow-hidden font-sans">
      {/* Ambient Cyber Grid & Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0b152915_1px,transparent_1px),linear-gradient(to_bottom,#0b152915_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl w-full mx-auto px-6 py-12 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Brand & Signature 3D Visual */}
        <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Enterprise Security Gateway • PS-01
          </div>

          <div className="py-2">
            <SignatureShield size="lg" status="secure" />
          </div>

          <div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
              TRI<span className="text-cyan-400">GUARD</span>
            </h1>
            <p className="mt-2 text-lg font-medium text-slate-300">
              Ask the knowledge. Verify the access.
            </p>
            <p className="mt-1 text-sm text-slate-400 max-w-md">
              Authorized intelligence, grounded in evidence. Zero unauthorized chunks leaked by design.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full max-w-md pt-2">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 backdrop-blur-sm">
              <div className="text-cyan-400 text-xs font-bold uppercase tracking-wider">Zero-Leak Context</div>
              <div className="text-slate-400 text-[11px] mt-0.5">Pre-retrieval clearance filter</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 backdrop-blur-sm">
              <div className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Grounded Evidence</div>
              <div className="text-slate-400 text-[11px] mt-0.5">Gemini 2.5 + Page Citations</div>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Card & One-Click Personas */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="bg-[#080d1a]/90 border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative">
            <div className="flex items-center justify-between pb-6 border-b border-white/5">
              <div>
                <h2 className="text-xl font-bold text-white">Sign In</h2>
                <p className="text-xs text-slate-400 mt-0.5">Authenticate with your enterprise credentials</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Lock className="w-4 h-4" />
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 mt-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Corporate Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@triguard.com"
                    required
                    disabled={loading}
                    className="w-full bg-[#0d1527] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className="w-full bg-[#0d1527] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Identity...</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate & Access</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Access Buttons */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                  Instant Demo Roles (1-Click Real Auth)
                </span>
                <span className="text-[10px] text-slate-500">Live API</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {DEMO_PERSONAS.map((persona) => (
                  <button
                    key={persona.email}
                    type="button"
                    onClick={() => handleDemoSelect(persona.email)}
                    disabled={loading}
                    className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-white/5 hover:border-cyan-400/30 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {persona.name}
                      </span>
                      <UserCheck className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{persona.role} • {persona.dept}</div>
                    <div className={`mt-2 inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold border ${persona.badgeClass}`}>
                      {persona.access}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
