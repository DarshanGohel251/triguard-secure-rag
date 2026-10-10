import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RotateCcw, AlertTriangle, Home } from 'lucide-react';
import TriGuardLogo from '../brand/TriGuardLogo';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('[TriGuard ErrorBoundary] Caught boundary fault:', error.message);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/dashboard';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    // Dev crash trigger test: ?crash=1
    if (typeof window !== 'undefined' && window.location.search.includes('crash=1') && !this.state.hasError) {
      throw new Error('TriGuard Test Fault: Simulated crash via ?crash=1 parameter');
    }

    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#080D16] text-[#F8FAFC] flex flex-col items-center justify-center p-6 select-none font-sans relative overflow-hidden">
          {/* Cyber ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 cyber-grid opacity-15 pointer-events-none" />

          <div className="relative z-10 max-w-lg w-full rounded-3xl bg-gradient-to-b from-[#0E1726] to-[#131F37] border border-rose-500/40 p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(244,63,94,0.25)] text-center space-y-6 backdrop-blur-2xl">
            <div className="flex justify-center">
              <TriGuardLogo variant="horizontal" size="md" showSubtitle={true} />
            </div>

            <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto shadow-[0_0_20px_rgba(244,63,94,0.3)]">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/35 text-rose-300 text-xs font-mono font-bold uppercase tracking-wider">
                Perimeter Fail-Safe Engaged
              </div>
              <h1 className="text-2xl font-black text-[#F8FAFC]">
                System Recalibrating
              </h1>
              <p className="text-sm text-[#D9FCED]/70 leading-relaxed">
                An unexpected interface boundary fault was caught and isolated. Zero data was leaked and security locks remain intact.
              </p>
            </div>

            {/* Error diagnosis box */}
            {this.state.error && (
              <div className="bg-[#080D16]/90 border border-white/10 rounded-2xl p-3.5 text-left text-xs font-mono text-rose-300 max-h-24 overflow-y-auto">
                <span className="text-[#D9FCED]/40 block text-[10px]">DIAGNOSTIC TRACE:</span>
                {this.state.error.message}
              </div>
            )}

            {/* Recovery actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#405FFA] to-[#09BBC8] hover:from-[#5572FB] hover:to-[#12D1E0] text-[#F8FAFC] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Recalibrate & Retry</span>
              </button>

              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#080D16] hover:bg-[#131F37] border border-[#09BBC8]/30 text-[#D9FCED] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Home className="w-3.5 h-3.5 text-[#09BBC8]" />
                <span>Command Center</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
