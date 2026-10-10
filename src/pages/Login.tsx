import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  KeyRound,
  ArrowRight,
  Loader2,
  Lock,
  UserCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import api from '../services/api';
import TriGuardLogo from '../components/brand/TriGuardLogo';
import DefenseEngine3D from '../components/3d/DefenseEngine3D';

const DEMO_PERSONAS = [
  {
    role: 'Employee',
    name: 'Ravi Employee',
    email: 'employee@triguard.com',
    dept: 'Finance',
    access: 'Public & General Internal',
    badgeClass: 'bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/30'
  },
  {
    role: 'Department Manager',
    name: 'Bob Manager',
    email: 'manager@triguard.com',
    dept: 'Finance',
    access: 'Finance Confidential',
    badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30'
  },
  {
    role: 'HR Manager',
    name: 'Alice HR',
    email: 'hr@triguard.com',
    dept: 'HR',
    access: 'Restricted & Executive HR',
    badgeClass: 'bg-[#059669]/10 text-[#10b981] border-[#059669]/30'
  },
  {
    role: 'Administrator',
    name: 'Eve Admin',
    email: 'admin@triguard.com',
    dept: 'IT',
    access: 'Full Security Clearance',
    badgeClass: 'bg-[#2563EB]/15 text-[#38BDF8] border-[#2563EB]/30'
  }
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      setError(err?.response?.data?.message || 'Authentication rejected. Verify credentials or contact security administrator.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide corporate email and password.');
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
    <div className="min-h-screen bg-[#0B0F17] text-[#F8FAFC] flex flex-col justify-center relative overflow-hidden font-sans">
      {/* Ambient Cyber Grid & Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(56,189,248,0.1),transparent_70%)] pointer-events-none" />
      <div className="cyber-grid absolute inset-0 opacity-25 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#2563EB]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#38BDF8]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl w-full mx-auto px-6 py-12 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Column: Brand, 3D Defense Engine Hero & Mission */}
        <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[#38BDF8] text-xs font-mono font-semibold uppercase tracking-wider shadow-lg">
            <ShieldCheck className="w-4 h-4 text-[#38BDF8]" />
            Enterprise Security Gateway • PS-01 Multi-Modal RAG
          </div>

          {/* 3D Defense Engine Centerpiece */}
          <div className="w-full max-w-md bg-[#141C2B] border border-[#253346] rounded-3xl p-4 shadow-2xl backdrop-blur-xl">
            <DefenseEngine3D status="secure" height={300} interactive={false} />
          </div>

          <div className="space-y-3">
            <TriGuardLogo variant="horizontal" size="lg" showSubtitle={true} />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#F8FAFC] leading-tight">
              Ask the knowledge.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] via-sky-200 to-[#2563EB]">
                Verify the access.
              </span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
              TriGuard Apex delivers deterministic pre-retrieval access control, vector scope boundary isolation, and zero unauthorized context leakage for enterprise AI.
            </p>
          </div>

          {/* Value Props Matrix */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-lg pt-2">
            <div className="p-4 rounded-2xl bg-[#141C2B] border border-[#253346] shadow-lg">
              <div className="text-[#38BDF8] text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Zero-Leak Context
              </div>
              <div className="text-slate-300 text-xs sm:text-sm mt-1">
                Deterministic pre-retrieval RBAC partition boundary filter
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[#141C2B] border border-[#253346] shadow-lg">
              <div className="text-[#059669] text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Grounded Citations
              </div>
              <div className="text-slate-300 text-xs sm:text-sm mt-1">
                Gemini synthesis anchored strictly to validated page coordinates
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Premium Authentication Card & 1-Click Persona Access */}
        <div className="lg:col-span-6 w-full max-w-lg mx-auto">
          <div className="bg-[#141C2B] border border-[#253346] rounded-3xl p-8 sm:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_35px_rgba(56,189,248,0.12)] backdrop-blur-2xl relative">
            <div className="flex items-center justify-between pb-6 border-b border-[#253346]">
              <div>
                <h2 className="text-2xl font-black text-[#F8FAFC] tracking-tight">Identity Authentication</h2>
                <p className="text-sm text-slate-300 mt-1">Sign in with authorized enterprise credentials</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#2563EB]/15 border border-[#2563EB]/30 flex items-center justify-center text-[#38BDF8] shadow-md">
                <Lock className="w-6 h-6" />
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5 mt-6">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Corporate Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="employee@triguard.com"
                    required
                    disabled={loading}
                    className="w-full bg-[#0B0F17] border border-[#253346] rounded-xl px-4 py-3.5 text-base text-[#F8FAFC] placeholder-slate-500 focus:outline-none focus:border-[#38BDF8] focus:ring-2 focus:ring-[#38BDF8]/20 transition-all font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className="w-full bg-[#0B0F17] border border-[#253346] rounded-xl px-4 py-3.5 text-base text-[#F8FAFC] placeholder-slate-500 focus:outline-none focus:border-[#38BDF8] focus:ring-2 focus:ring-[#38BDF8]/20 transition-all font-sans pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#F8FAFC] transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#f87171] text-sm flex items-start gap-3 shadow-lg">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#EF4444]" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-4 px-6 bg-[#2563EB] hover:bg-[#1d4ed8] text-[#F8FAFC] font-extrabold text-base rounded-xl shadow-lg shadow-[#2563EB]/25 flex items-center justify-center gap-3 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verifying Cryptographic Tokens...</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate & Access Command Center</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Access Buttons */}
            <div className="mt-8 pt-6 border-t border-[#253346]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#38BDF8]" />
                  Instant Live Demo Personas (1-Click Real Auth)
                </span>
                <span className="text-[11px] font-mono text-[#059669] bg-[#059669]/15 px-2 py-0.5 rounded border border-[#059669]/30 font-bold">
                  REAL JWT
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DEMO_PERSONAS.map((persona) => (
                  <button
                    key={persona.email}
                    type="button"
                    onClick={() => handleDemoSelect(persona.email)}
                    disabled={loading}
                    className="p-3.5 rounded-2xl bg-[#0B0F17] hover:bg-[#1A2438] border border-[#253346] hover:border-[#38BDF8]/50 text-left transition-all group cursor-pointer shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#F8FAFC] group-hover:text-[#38BDF8] transition-colors">
                        {persona.name}
                      </span>
                      <UserCheck className="w-4 h-4 text-slate-400 group-hover:text-[#38BDF8] transition-colors" />
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {persona.role} • {persona.dept}
                    </div>
                    <div className={`mt-2.5 inline-block px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${persona.badgeClass}`}>
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
