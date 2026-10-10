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
        <div className="min-h-screen bg-[#10120F] text-[#F1EEE5] flex flex-col items-center justify-center p-6 select-none font-sans relative overflow-hidden">
          {/* Cyber ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 cyber-grid opacity-15 pointer-events-none" />

          <div className="relative z-10 max-w-lg w-full rounded-3xl bg-[#20231E] border border-red-500/40 p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(239,68,68,0.25)] text-center space-y-6 backdrop-blur-2xl">
            <div className="flex justify-center">
              <TriGuardLogo variant="horizontal" size="md" showSubtitle={true} />
            </div>

            <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/40 flex items-center justify-center text-red-400 mx-auto shadow-[0_0_20px_rgba(239,68,68,0.3)]">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/35 text-red-300 text-xs font-mono font-bold uppercase tracking-wider">
                Perimeter Fail-Safe Engaged
              </div>
              <h1 className="text-2xl font-black text-[#F1EEE5]">
                System Recalibrating
              </h1>
              <p className="text-sm text-[#A6AAA0] leading-relaxed">
                An unexpected interface boundary fault was caught and isolated. Zero data was leaked and security locks remain intact.
              </p>
            </div>

            {/* Error diagnosis box */}
            {this.state.error && (
              <div className="bg-[#181A15] border border-[#363A31] rounded-2xl p-3.5 text-left text-xs font-mono text-red-300 max-h-24 overflow-y-auto">
                <span className="text-[#A6AAA0]/50 block text-[10px]">DIAGNOSTIC TRACE:</span>
                {this.state.error.message}
              </div>
            )}

            {/* Recovery actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#C9F36A] hover:bg-[#b8e357] text-[#10120F] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#C9F36A]/20 cursor-pointer transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Recalibrate & Retry</span>
              </button>

              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#181A15] hover:bg-[#262A22] border border-[#363A31] text-[#F1EEE5] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Home className="w-3.5 h-3.5 text-[#C4A878]" />
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
