import { Outlet, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  MessageSquare,
  FileText,
  ShieldAlert,
  Activity,
  LogOut,
  ChevronDown,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { useState } from 'react';
import api from '../../services/api';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Command Center', icon: LayoutDashboard },
  { path: '/ask', label: 'Ask TriGuard (RAG)', icon: MessageSquare, badge: 'AI' },
  { path: '/documents', label: 'Knowledge Base', icon: FileText },
  { path: '/security', label: 'Threat Center', icon: ShieldAlert },
  { path: '/audit', label: 'Audit Ledger', icon: Activity },
];

const DEMO_PERSONAS = [
  { role: 'EMPLOYEE', label: 'Ravi (Employee - Finance)', email: 'employee@triguard.com' },
  { role: 'DEPARTMENT_MANAGER', label: 'Bob (Manager - Finance)', email: 'manager@triguard.com' },
  { role: 'HR_MANAGER', label: 'Alice (HR Manager)', email: 'hr@triguard.com' },
  { role: 'ADMIN', label: 'Eve (IT Admin)', email: 'admin@triguard.com' }
];

export default function Layout() {
  const token = localStorage.getItem('token');
  const location = useLocation();
  const navigate = useNavigate();
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [switching, setSwitching] = useState(false);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  let userObj = { name: 'User', role: 'EMPLOYEE', department: 'Finance', email: 'user@triguard.com' };
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      userObj = JSON.parse(userStr);
    }
  } catch (e) {
    // fallback
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleQuickSwitch = async (email: string) => {
    setSwitching(true);
    setShowPersonaMenu(false);
    try {
      const res = await api.post('/auth/login', { email, password: 'password' });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      window.location.reload();
    } catch (err) {
      console.error('Failed to switch persona', err);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#040711] text-slate-100 font-sans overflow-hidden">
      {/* Top Enterprise Command Header */}
      <header className="h-16 bg-[#070d1d] border-b border-white/10 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform shadow-lg shadow-cyan-500/10">
              <Shield className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-wider text-white">
                TRI<span className="text-cyan-400">GUARD</span>
              </span>
              <span className="text-[9px] text-slate-400 font-mono -mt-1 tracking-tight">
                Secure Intelligence Platform
              </span>
            </div>
          </Link>

          <div className="hidden xl:flex items-center gap-2 text-slate-400 text-xs border-l border-white/10 pl-6 font-medium">
            <span>Ask the knowledge</span>
            <span className="w-1 h-1 rounded-full bg-cyan-400/50"></span>
            <span>Verify the access</span>
            <span className="w-1 h-1 rounded-full bg-cyan-400/50"></span>
            <span className="text-cyan-400 font-mono">PS-01 RAG</span>
          </div>
        </div>

        {/* Right Session Controls & Quick Persona Switcher */}
        <div className="flex items-center gap-4">
          {/* Quick Persona Switcher for Hackathon Live Demo */}
          <div className="relative">
            <button
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              disabled={switching}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-cyan-400/30 text-xs transition-all cursor-pointer"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-bold text-white truncate max-w-[120px] sm:max-w-[160px]">
                  {userObj.name}
                </span>
                <span className="text-[9px] text-cyan-300 font-mono uppercase">
                  {userObj.role.replace('_', ' ')} • {userObj.department}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Persona Switch Dropdown */}
            {showPersonaMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-[#0a1124] border border-white/10 rounded-2xl shadow-2xl p-2 z-50">
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/5">
                  Switch Persona (Instant Auth)
                </div>
                <div className="space-y-1 mt-1">
                  {DEMO_PERSONAS.map((p) => (
                    <button
                      key={p.email}
                      onClick={() => handleQuickSwitch(p.email)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        userObj.email === p.email
                          ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <span>{p.label}</span>
                      {userObj.email === p.email && <UserCheck className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-[#060b18] border-r border-white/5 flex flex-col shrink-0">
          <nav className="flex-1 overflow-y-auto py-6">
            <ul className="space-y-1.5 px-3">
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                          : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Sidebar Footer Badge */}
          <div className="p-4 border-t border-white/5 bg-slate-950/60">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
              <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gemini 2.5 Active</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Deterministic RBAC pre-retrieval enforcement with page-level citations.
              </p>
            </div>
          </div>
        </aside>

        {/* Dynamic Outlet Main Screen */}
        <main className="flex-1 overflow-y-auto bg-[#040711] p-6 lg:p-8 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
