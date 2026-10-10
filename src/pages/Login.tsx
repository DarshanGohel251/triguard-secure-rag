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
    badgeClass: 'bg-[#C4A878]/10 text-[#C4A878] border-[#C4A878]/30'
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
    badgeClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
  },
  {
    role: 'Administrator',
    name: 'Eve Admin',
    email: 'admin@triguard.com',
    dept: 'IT',
    access: 'Full Security Clearance',
    badgeClass: 'bg-[#C9F36A]/10 text-[#C9F36A] border-[#C9F36A]/30'
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
      const serverMsg = err?.response?.data?.message || (typeof err?.response?.data === 'string' ? err.response.data : '');
      setError(serverMsg ? `${serverMsg} (Default password is "password")` : 'Authentication rejected. Default demo password is "password", or click a 1-click persona below.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();
    if (!cleanEmail || !cleanPass) {
      setError('Please provide corporate email and password.');
      return;
    }
    executeAuth(cleanEmail, cleanPass);
  };

  const handleDemoSelect = (demoEmail: string) => {
    const cleanEmail = demoEmail.trim().toLowerCase();
    setEmail(cleanEmail);
    setPassword('password');
    executeAuth(cleanEmail, 'password');
  };

  return (
    <div className="min-h-screen bg-[#10120F] text-[#F1EEE5] flex flex-col justify-center relative overflow-hidden font-sans">
      {/* Ambient Cyber Grid & Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(201,243,106,0.06),transparent_70%)] pointer-events-none" />
      <div className="cyber-grid absolute inset-0 opacity-15 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#C4A878]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#C9F36A]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl w-full mx-auto px-6 py-12 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Column: Brand, 3D Defense Engine Hero & Mission */}
        <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#C4A878]/15 border border-[#C4A878]/30 text-[#C4A878] text-xs font-mono font-semibold uppercase tracking-wider shadow-lg">
            <ShieldCheck className="w-4 h-4 text-[#C4A878]" />
            Enterprise Security Gateway • PS-01 Multi-Modal RAG
          </div>

          {/* 3D Defense Engine Centerpiece */}
          <div className="w-full max-w-md bg-[#20231E]/90 border border-[#363A31] rounded-3xl p-4 shadow-2xl backdrop-blur-xl">
            <DefenseEngine3D status="secure" height={300} interactive={false} />
          </div>

          <div className="space-y-3">
            <TriGuardLogo variant="horizontal" size="lg" showSubtitle={true} />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#F1EEE5] leading-tight">
              Ask the knowledge.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F1EEE5] via-[#C9F36A] to-[#C4A878]">
                Verify the access.
              </span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-[#B8B5AB] max-w-xl leading-relaxed">
              TriGuard Apex delivers deterministic pre-retrieval access control, vector scope boundary isolation, and zero unauthorized context leakage for enterprise AI.
            </p>
          </div>

          {/* Value Props Matrix */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-lg pt-2">
            <div className="p-4 rounded-2xl bg-[#20231E]/80 border border-[#363A31] backdrop-blur-md shadow-lg">
              <div className="text-[#C9F36A] text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Zero-Leak Context
              </div>
              <div className="text-[#B8B5AB] text-xs sm:text-sm mt-1">
                Deterministic pre-retrieval RBAC partition boundary filter
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[#20231E]/80 border border-[#363A31] backdrop-blur-md shadow-lg">
              <div className="text-[#C4A878] text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Grounded Citations
              </div>
              <div className="text-[#B8B5AB] text-xs sm:text-sm mt-1">
                Gemini synthesis anchored strictly to validated page coordinates
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Premium Authentication Card & 1-Click Persona Access */}
        <div className="lg:col-span-6 w-full max-w-lg mx-auto">
          <div className="bg-[#181A15] border border-[#363A31] rounded-3xl p-8 sm:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_35px_rgba(201,243,106,0.08)] backdrop-blur-2xl relative">
            <div className="flex items-center justify-between pb-6 border-b border-[#363A31]">
              <div>
                <h2 className="text-2xl font-black text-[#F1EEE5] tracking-tight">Identity Authentication</h2>
                <p className="text-sm text-[#B8B5AB] mt-1">Sign in with authorized enterprise credentials</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#20231E] border border-[#363A31] flex items-center justify-center text-[#C9F36A] shadow-md">
                <Lock className="w-6 h-6" />
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5 mt-6">
              <div>
                <label className="block text-xs font-bold text-[#B8B5AB] uppercase tracking-wider mb-2">
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
                    className="w-full bg-[#20231E] border border-[#363A31] rounded-xl px-4 py-3.5 text-base text-[#F1EEE5] placeholder-[#B8B5AB]/40 focus:outline-none focus:border-[#C9F36A] focus:ring-2 focus:ring-[#C9F36A]/20 transition-all font-sans"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-[#B8B5AB] uppercase tracking-wider">
                    Password
                  </label>
                  <span className="text-[11px] font-mono text-[#C9F36A] bg-[#C9F36A]/10 px-2 py-0.5 rounded border border-[#C9F36A]/30">
                    Demo Password: password
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className="w-full bg-[#20231E] border border-[#363A31] rounded-xl px-4 py-3.5 text-base text-[#F1EEE5] placeholder-[#B8B5AB]/40 focus:outline-none focus:border-[#C9F36A] focus:ring-2 focus:ring-[#C9F36A]/20 transition-all font-sans pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#B8B5AB] hover:text-[#F1EEE5] transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-sm flex items-start gap-3 shadow-lg">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-4 px-6 bg-[#C9F36A] hover:bg-[#d6f785] text-[#10120F] font-black text-base rounded-xl shadow-lg shadow-[rgba(201,243,106,0.2)] hover:shadow-[0_0_24px_rgba(201,243,106,0.4)] flex items-center justify-center gap-3 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-[#10120F]" />
                    <span>Verifying Cryptographic Tokens...</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate & Access Command Center</span>
                    <ArrowRight className="w-5 h-5 text-[#10120F]" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Access Buttons */}
            <div className="mt-8 pt-6 border-t border-[#363A31]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-[#B8B5AB] uppercase tracking-wider flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#C4A878]" />
                  Instant Live Demo Personas (1-Click Real Auth)
                </span>
                <span className="text-[11px] font-mono text-[#C9F36A] bg-[#C9F36A]/10 px-2 py-0.5 rounded border border-[#C9F36A]/30 font-semibold">
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
                    className="p-3.5 rounded-2xl bg-[#20231E]/80 hover:bg-[#262A24] border border-[#363A31] hover:border-[#C4A878]/50 text-left transition-all group cursor-pointer shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#F1EEE5] group-hover:text-[#C9F36A] transition-colors">
                        {persona.name}
                      </span>
                      <UserCheck className="w-4 h-4 text-[#B8B5AB] group-hover:text-[#C9F36A] transition-colors" />
                    </div>
                    <div className="text-xs text-[#B8B5AB] mt-1">
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
