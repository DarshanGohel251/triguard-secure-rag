import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, MessageSquare, FileText, Activity, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/ask', label: 'Ask TriGuard', icon: MessageSquare },
  { path: '/documents', label: 'Documents', icon: FileText },
  { path: '/security', label: 'Security', icon: Shield },
  { path: '/audit', label: 'Audit Log', icon: Activity },
];

export default function Layout() {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen bg-graphite text-gray-200">
      {/* Sidebar */}
      <aside className="w-64 bg-graphite_light border-r border-gray-800 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <Shield className="w-6 h-6 text-cyan_ai mr-2" />
          <span className="font-bold text-lg tracking-wider text-white">TRIGUARD</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    location.pathname === item.path
                      ? "bg-cyan_ai/10 text-cyan_ai"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-400 rounded-md hover:bg-gray-800 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto bg-[#161618] p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
