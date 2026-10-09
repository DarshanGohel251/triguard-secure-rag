import { useState, useEffect, useRef } from 'react';
import TriGuardLogo from '../brand/TriGuardLogo';

interface HeroSecurityCoreProps {
  status?: 'secure' | 'warning' | 'alert';
  size?: 'md' | 'lg' | 'xl';
  showTelemetry?: boolean;
}

export default function HeroSecurityCore({
  status = 'secure',
  size = 'lg',
  showTelemetry = true
}: HeroSecurityCoreProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 24;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -24;
    setRotate({ x: Math.max(-16, Math.min(16, y)), y: Math.max(-16, Math.min(16, x)) });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  const scaleDimensions = {
    md: 'w-64 h-64 sm:w-72 sm:h-72',
    lg: 'w-80 h-80 sm:w-96 sm:h-96',
    xl: 'w-96 h-96 sm:w-[440px] sm:h-[440px]'
  }[size];

  const statusTheme = {
    secure: {
      primary: '#00E5FF',
      secondary: '#0072F5',
      accent: '#10B981',
      glow: 'rgba(0, 229, 255, 0.28)',
      statusLabel: 'PERIMETER VERIFIED • ZERO-LEAK ACTIVE',
      badgeClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    },
    warning: {
      primary: '#F59E0B',
      secondary: '#D97706',
      accent: '#EAB308',
      glow: 'rgba(245, 158, 11, 0.35)',
      statusLabel: 'ACCESS RESTRICTION ENFORCED',
      badgeClass: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    },
    alert: {
      primary: '#EF4444',
      secondary: '#DC2626',
      accent: '#B91C1C',
      glow: 'rgba(239, 68, 68, 0.4)',
      statusLabel: 'PROMPT THREAT INTERCEPTED',
      badgeClass: 'text-red-400 bg-red-500/10 border-red-500/30'
    }
  }[status];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative flex items-center justify-center select-none perspective-1000 ${scaleDimensions}`}
      style={{ perspective: '1200px' }}
    >
      {/* 3D Transform Stage */}
      <div
        className="relative flex items-center justify-center w-full h-full transition-transform duration-300 ease-out transform-style-3d"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Layer 0: Depth Ambient Halo Light */}
        <div
          className="absolute inset-4 rounded-full blur-3xl opacity-60 transition-all duration-700 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${statusTheme.glow} 0%, rgba(3, 8, 20, 0) 70%)`,
            transform: 'translateZ(-50px)'
          }}
        />

        {/* Layer 1: Outer Defensive Orbit (Identity & RBAC Boundary Ring) */}
        <div
          className="absolute inset-2 sm:inset-4 rounded-full border border-cyan-500/20 pointer-events-none"
          style={{
            transform: 'translateZ(-20px) rotateX(65deg)',
            boxShadow: `0 0 25px ${statusTheme.glow}`
          }}
        >
          <div
            className={`w-full h-full rounded-full border border-dashed border-cyan-400/40 ${
              prefersReducedMotion ? '' : 'animate-[spin_24s_linear_infinite]'
            }`}
          />
        </div>

        {/* Layer 2: Middle Transversal Orbit (Vector Retrieval Sandbox) */}
        <div
          className="absolute inset-8 sm:inset-10 rounded-full border border-blue-500/30 pointer-events-none"
          style={{
            transform: 'translateZ(0px) rotateY(65deg)',
          }}
        >
          <div
            className={`w-full h-full rounded-full border border-cyan-300/30 ${
              prefersReducedMotion ? '' : 'animate-[spin_16s_linear_infinite_reverse]'
            }`}
          />
        </div>

        {/* Concentric Cyber Grid Hexagon Base */}
        <svg
          className={`absolute w-full h-full pointer-events-none opacity-40 ${
            prefersReducedMotion ? '' : 'animate-[spin_40s_linear_infinite]'
          }`}
          viewBox="0 0 400 400"
          style={{ transform: 'translateZ(-30px)' }}
        >
          <circle cx="200" cy="200" r="170" fill="none" stroke="rgba(0,229,255,0.12)" strokeWidth="1" />
          <circle cx="200" cy="200" r="140" fill="none" stroke="rgba(0,229,255,0.18)" strokeWidth="1" strokeDasharray="6 8" />
          <circle cx="200" cy="200" r="105" fill="none" stroke="rgba(0,114,245,0.25)" strokeWidth="1.5" />

          {/* Telemetry Coordinate Ticks */}
          <line x1="200" y1="18" x2="200" y2="34" stroke="#00E5FF" strokeWidth="2" opacity="0.8" />
          <line x1="200" y1="366" x2="200" y2="382" stroke="#00E5FF" strokeWidth="2" opacity="0.8" />
          <line x1="18" y1="200" x2="34" y2="200" stroke="#00E5FF" strokeWidth="2" opacity="0.8" />
          <line x1="366" y1="200" x2="382" y2="200" stroke="#00E5FF" strokeWidth="2" opacity="0.8" />

          {/* Orbiting Sentinel Nodes */}
          <circle cx="200" cy="30" r="4" fill="#00E5FF" className="drop-shadow-[0_0_8px_#00E5FF]" />
          <circle cx="370" cy="200" r="3.5" fill="#10B981" className="drop-shadow-[0_0_8px_#10B981]" />
          <circle cx="30" cy="200" r="3.5" fill="#0072F5" className="drop-shadow-[0_0_8px_#0072F5]" />
          <circle cx="200" cy="370" r="4" fill="#00E5FF" className="drop-shadow-[0_0_8px_#00E5FF]" />
        </svg>

        {/* Layer 3: Central 3D Elevated Shield Plinth */}
        <div
          className="relative z-20 flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#0a162e]/90 via-[#060e1f]/95 to-[#030712] border border-cyan-400/30 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(0,229,255,0.2)] backdrop-blur-xl transition-all duration-300"
          style={{ transform: 'translateZ(45px)' }}
        >
          {/* TriGuard Custom Emblem with 3D elevation */}
          <div
            className="transition-transform duration-300 hover:scale-105"
            style={{ transform: 'translateZ(25px)' }}
          >
            <TriGuardLogo
              variant="icon"
              size={size === 'xl' ? '2xl' : size === 'lg' ? 'xl' : 'lg'}
              glow={true}
            />
          </div>

          {/* Core Telemetry Tagline */}
          {showTelemetry && (
            <div
              className="mt-4 flex flex-col items-center gap-1"
              style={{ transform: 'translateZ(30px)' }}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-white">
                  3-LAYER DEFENSE
                </span>
              </div>
              <span className={`text-[9px] font-mono tracking-wider px-2 py-0.5 rounded-full border ${statusTheme.badgeClass}`}>
                {statusTheme.statusLabel}
              </span>
            </div>
          )}
        </div>

        {/* Layer 4: Floating Atmospheric Particles & Depth Markers */}
        <div
          className="absolute -top-3 left-6 px-2.5 py-1 rounded-md bg-slate-900/80 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 backdrop-blur-md shadow-lg pointer-events-none"
          style={{ transform: 'translateZ(60px)' }}
        >
          L1: RBAC_ENFORCED
        </div>

        <div
          className="absolute -bottom-3 right-6 px-2.5 py-1 rounded-md bg-slate-900/80 border border-blue-500/30 text-[10px] font-mono text-blue-300 backdrop-blur-md shadow-lg pointer-events-none"
          style={{ transform: 'translateZ(55px)' }}
        >
          L2: SCOPED_EMBEDDINGS
        </div>

        <div
          className="absolute top-1/2 -right-6 -translate-y-1/2 px-2.5 py-1 rounded-md bg-slate-900/80 border border-emerald-500/30 text-[10px] font-mono text-emerald-300 backdrop-blur-md shadow-lg pointer-events-none hidden sm:block"
          style={{ transform: 'translateZ(50px)' }}
        >
          L3: PROMPT_FIREWALL
        </div>
      </div>
    </div>
  );
}
