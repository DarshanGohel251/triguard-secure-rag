import { Outlet, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  ShieldAlert,
  Activity,
  LogOut,
  ChevronDown,
  UserCheck,
  Sparkles,
  Menu,
  X,
  ShieldCheck
} from 'lucide-react';
import { useState } from 'react';
import api from '../../services/api';
import TriGuardLogo from '../brand/TriGuardLogo';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Command Center', icon: LayoutDashboard, desc: 'Overview & Defense Engine' },
  { path: '/ask', label: 'Ask TriGuard', icon: MessageSquare, badge: 'AI RAG', desc: 'Secure AI Workspace' },
  { path: '/documents', label: 'Knowledge Base', icon: FileText, desc: 'Spatial Vault & Ingestion' },
  { path: '/security', label: 'Threat Center', icon: ShieldAlert, desc: 'Radar & Constellation' },
  { path: '/audit', label: 'Audit Ledger', icon: Activity, desc: 'Immutable Log Trail' },
];

const DEMO_PERSONAS = [
  { role: 'EMPLOYEE', label: 'Ravi Employee', email: 'employee@triguard.com', dept: 'Finance', badge: 'Public & Internal' },
  { role: 'DEPARTMENT_MANAGER', label: 'Bob Manager', email: 'manager@triguard.com', dept: 'Finance', badge: 'Confidential Dept' },
  { role: 'HR_MANAGER', label: 'Alice HR', email: 'hr@triguard.com', dept: 'HR', badge: 'Restricted Executive' },
  { role: 'ADMIN', label: 'Eve Admin', email: 'admin@triguard.com', dept: 'IT', badge: 'Full Clearance' }
];

export default function Layout() {
  const token = localStorage.getItem('token');
  const location = useLocation();
  const navigate = useNavigate();
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    <div className="flex flex-col h-screen bg-[#080D16] text-[#F8FAFC] font-sans overflow-hidden">
      {/* Top Enterprise Command Header */}
      <header className="h-18 bg-[#3B3664]/35 border-b border-[#09BBC8]/20 flex items-center justify-between px-5 sm:px-8 shrink-0 z-30 shadow-2xl backdrop-blur-xl">
        {/* Left: Mobile Toggle & Apex Brand Logo */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-[#D9FCED]/70 hover:text-[#D9FCED] hover:bg-[#3B3664]/30 transition-colors cursor-pointer"
            aria-label="Toggle navigation drawer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link to="/dashboard" className="flex items-center gap-3 group">
            <TriGuardLogo variant="horizontal" size="md" showSubtitle={true} />
          </Link>

          {/* Defense Architecture Tags */}
          <div className="hidden xl:flex items-center gap-2.5 text-[#D9FCED]/70 text-xs border-l border-[#09BBC8]/20 pl-6 font-mono">
            <span className="flex items-center gap-1.5 text-[#09BBC8] font-bold">
              <ShieldCheck className="w-4 h-4 text-[#09BBC8]" />
              PS-01 RAG
            </span>
            <span className="text-[#09BBC8]/40">•</span>
            <span className="text-[#D9FCED]/70">Deterministic RBAC</span>
            <span className="text-[#09BBC8]/40">•</span>
            <span className="text-[#D9FCED]/70">Zero Leakage</span>
            <span className="text-[#09BBC8]/40">•</span>
            <span className="text-[#09BBC8] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#09BBC8] animate-pulse" />
              Active
            </span>
          </div>
        </div>

        {/* Right: Security Status Pill & Persona Switcher */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Live Defense Status Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#09BBC8]/10 border border-[#09BBC8]/30 text-[#09BBC8] text-xs font-mono font-bold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#09BBC8] animate-ping" />
            <span>PERIMETER VERIFIED</span>
          </div>

          {/* 1-Click Persona Switcher for Hackathon Judges */}
          <div className="relative">
            <button
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              disabled={switching}
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-[#3B3664]/40 hover:bg-[#3B3664]/70 border border-[#09BBC8]/30 hover:border-[#09BBC8] text-sm transition-all cursor-pointer shadow-lg"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-[#09BBC8] animate-pulse" />
              <div className="flex flex-col text-left">
                <span className="text-xs sm:text-sm font-bold text-[#D9FCED] truncate max-w-[130px] sm:max-w-[180px]">
                  {userObj.name}
                </span>
                <span className="text-[11px] text-[#09BBC8] font-mono uppercase tracking-tight">
                  {userObj.role.replace('_', ' ')} • {userObj.department}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-[#D9FCED]/60 shrink-0" />
            </button>

            {/* Persona Switch Dropdown */}
            {showPersonaMenu && (
              <div className="absolute right-0 mt-2 w-76 bg-[#3B3664]/95 border border-[#09BBC8]/40 rounded-2xl shadow-2xl p-2.5 z-50 backdrop-blur-2xl">
                <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#D9FCED] border-b border-[#09BBC8]/20 flex items-center justify-between">
                  <span>Switch Live Persona</span>
                  <span className="text-[10px] text-[#09BBC8] font-mono">1-Click Real JWT</span>
                </div>
                <div className="space-y-1.5 mt-2">
                  {DEMO_PERSONAS.map((p) => (
                    <button
                      key={p.email}
                      onClick={() => handleQuickSwitch(p.email)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs flex flex-col gap-0.5 transition-all cursor-pointer ${
                        userObj.email === p.email
                          ? 'bg-[#405FFA]/40 text-[#D9FCED] font-bold border border-[#09BBC8]/40 shadow-sm'
                          : 'text-[#D9FCED]/80 hover:bg-[#405FFA]/20 hover:text-[#D9FCED]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#D9FCED]">{p.label}</span>
                        {userObj.email === p.email && <UserCheck className="w-4 h-4 text-[#09BBC8]" />}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#D9FCED]/60">
                        <span>{p.dept} Department</span>
                        <span className="text-[#09BBC8] font-mono text-[10px]">{p.badge}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl text-[#D9FCED]/60 hover:text-[#D9FCED] hover:bg-[#3B3664]/30 border border-transparent hover:border-[#09BBC8]/30 transition-colors cursor-pointer"
            title="Sign out of TriGuard"
            aria-label="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-68 bg-[#3B3664]/25 border-r border-[#09BBC8]/20 backdrop-blur-xl flex flex-col transition-transform duration-300 md:static md:translate-x-0 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Mobile Drawer Header */}
          <div className="p-4 border-b border-[#09BBC8]/20 flex items-center justify-between md:hidden">
            <TriGuardLogo variant="horizontal" size="sm" />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 text-[#D9FCED]/70 hover:text-[#D9FCED] rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-6 px-3">
            <div className="px-3 mb-2 text-xs font-mono uppercase tracking-wider text-[#D9FCED]/60 font-bold">
              Command Modules
            </div>
            <ul className="space-y-1.5">
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#405FFA] text-[#D9FCED] border border-[#09BBC8]/40 shadow-[0_0_24px_rgba(9,187,200,0.4)] font-bold'
                          : 'text-[#D9FCED]/75 hover:text-[#D9FCED] hover:bg-[#3B3664]/35 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-[#D9FCED]' : 'text-[#09BBC8]'}`} />
                        <div>
                          <div>{item.label}</div>
                          <div className="text-[11px] text-[#D9FCED]/60 font-normal font-sans">{item.desc}</div>
                        </div>
                      </div>
                      {item.badge && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#09BBC8]/20 text-[#09BBC8] border border-[#09BBC8]/40">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Sidebar Footer: Model & Engine Badge */}
          <div className="p-4 border-t border-[#09BBC8]/20 bg-[#3B3664]/20">
            <div className="p-3.5 rounded-xl bg-[#3B3664]/40 border border-[#09BBC8]/20 shadow-md">
              <div className="flex items-center justify-between text-[#09BBC8] text-xs font-bold mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#09BBC8]" />
                  Gemini Active
                </span>
                <span className="text-[10px] font-mono text-[#09BBC8] bg-[#09BBC8]/10 px-1.5 py-0.2 rounded border border-[#09BBC8]/30">
                  ONLINE
                </span>
              </div>
              <p className="text-xs text-[#D9FCED]/70 leading-relaxed">
                Deterministic pre-retrieval clearance with page-level verifiable citations.
              </p>
            </div>
          </div>
        </aside>

        {/* Mobile Backdrop */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 md:hidden"
          />
        )}

        {/* Dynamic Outlet Main Screen */}
        <main className="flex-1 overflow-y-auto bg-transparent p-6 lg:p-8 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
