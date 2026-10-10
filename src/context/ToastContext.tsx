import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, ShieldAlert, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'security';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  security: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 4000 }: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [...prev.slice(-4), newToast]); // Keep max 5 visible

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, title = 'Operation Successful') => {
      showToast({ type: 'success', title, message });
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, title = 'System Alert') => {
      showToast({ type: 'error', title, message });
    },
    [showToast]
  );

  const warning = useCallback(
    (message: string, title = 'System Advisory') => {
      showToast({ type: 'warning', title, message });
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, title = 'Notice') => {
      showToast({ type: 'info', title, message });
    },
    [showToast]
  );

  const security = useCallback(
    (message: string, title = 'Perimeter Security Event') => {
      showToast({ type: 'security', title, message, duration: 6000 });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning, security }}>
      {children}
      {/* Toast Notification Container */}
      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full px-4 sm:px-0"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-2xl p-4 shadow-2xl border backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in flex items-start gap-3 relative overflow-hidden ${
              t.type === 'success'
                ? 'bg-[#20231E]/95 border-emerald-500/40 shadow-[0_10px_30px_rgba(16,185,129,0.2)]'
                : t.type === 'error'
                ? 'bg-[#20231E]/95 border-red-500/50 shadow-[0_10px_30px_rgba(239,68,68,0.25)]'
                : t.type === 'security'
                ? 'bg-[#20231E]/95 border-[#C9F36A]/50 shadow-[0_10px_30px_rgba(201,243,106,0.2)]'
                : t.type === 'warning'
                ? 'bg-[#20231E]/95 border-amber-500/50 shadow-[0_10px_30px_rgba(245,158,11,0.2)]'
                : 'bg-[#20231E]/95 border-[#363A31] shadow-[0_10px_30px_rgba(0,0,0,0.6)]'
            }`}
          >
            {/* Ambient status beam */}
            <div
              className={`absolute top-0 left-0 right-0 h-[2px] ${
                t.type === 'success'
                  ? 'bg-emerald-400'
                  : t.type === 'error'
                  ? 'bg-red-500'
                  : t.type === 'warning'
                  ? 'bg-amber-400'
                  : t.type === 'security'
                  ? 'bg-[#C9F36A]'
                  : 'bg-[#C4A878]'
              }`}
            />

            <div className="shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
              {t.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-400" />}
              {t.type === 'security' && <ShieldAlert className="w-5 h-5 text-[#C9F36A]" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-[#C4A878]" />}
            </div>

            <div className="flex-1 min-w-0 pr-4">
              {t.title && (
                <div className="text-xs font-mono font-bold tracking-wider text-[#F1EEE5] uppercase mb-0.5">
                  {t.title}
                </div>
              )}
              <div className="text-xs text-[#A6AAA0] leading-snug break-words">
                {t.message}
              </div>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 text-[#A6AAA0]/60 hover:text-[#F1EEE5] transition-colors p-1 rounded-lg cursor-pointer"
              aria-label="Dismiss toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
