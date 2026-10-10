import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';

interface SignatureShieldProps {
  size?: 'sm' | 'md' | 'lg';
  status?: 'secure' | 'warning' | 'alert';
}

export default function SignatureShield({ size = 'md', status = 'secure' }: SignatureShieldProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -20;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const dimensions = {
    sm: { container: 'w-24 h-24', icon: 'w-10 h-10', ring: 80 },
    md: { container: 'w-48 h-48', icon: 'w-20 h-20', ring: 160 },
    lg: { container: 'w-72 h-72', icon: 'w-32 h-32', ring: 240 }
  }[size];

  const colors = {
    secure: {
      primary: '#C4A878',
      secondary: '#C9F36A',
      glow: 'rgba(196, 168, 120, 0.3)',
      ringGlow: 'rgba(201, 243, 106, 0.2)'
    },
    warning: {
      primary: '#f59e0b',
      secondary: '#eab308',
      glow: 'rgba(245, 158, 11, 0.4)',
      ringGlow: 'rgba(234, 179, 8, 0.3)'
    },
    alert: {
      primary: '#ef4444',
      secondary: '#dc2626',
      glow: 'rgba(239, 68, 68, 0.45)',
      ringGlow: 'rgba(220, 38, 38, 0.35)'
    }
  }[status];

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative flex items-center justify-center cursor-default select-none perspective-1000 ${dimensions.container}`}
      style={{ perspective: '1000px' }}
    >
      {/* Dynamic 3D Transform Container */}
      <div
        className="relative flex items-center justify-center w-full h-full transition-transform duration-200 ease-out"
        style={{
          transform: `rotateY(${mousePos.x}deg) rotateX(${mousePos.y}deg)`,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Background Ambient Glow */}
        <div
          className="absolute inset-0 rounded-full blur-2xl transition-all duration-500"
          style={{ background: colors.glow }}
        />

        {/* Outer Orbital Ring with Pulse */}
        <svg
          className="absolute inset-0 w-full h-full animate-[spin_18s_linear_infinite]"
          viewBox="0 0 200 200"
          style={{ animationDuration: prefersReducedMotion ? '0s' : '20s' }}
        >
          <circle
            cx="100"
            cy="100"
            r="88"
            fill="none"
            stroke={colors.primary}
            strokeWidth="1.5"
            strokeDasharray="8 12"
            opacity="0.6"
          />
          {/* Orbital Nodes */}
          <circle cx="100" cy="12" r="3.5" fill={colors.primary} className="drop-shadow-[0_0_8px_#C4A878]" />
          <circle cx="188" cy="100" r="3" fill={colors.secondary} className="drop-shadow-[0_0_8px_#C9F36A]" />
          <circle cx="12" cy="100" r="3" fill={colors.secondary} className="drop-shadow-[0_0_8px_#C9F36A]" />
          <circle cx="100" cy="188" r="3.5" fill={colors.primary} className="drop-shadow-[0_0_8px_#C4A878]" />
        </svg>

        {/* Counter-Rotating Inner Cyber Ring */}
        <svg
          className="absolute inset-0 w-full h-full animate-[spin_12s_linear_infinite_reverse]"
          viewBox="0 0 200 200"
          style={{ animationDuration: prefersReducedMotion ? '0s' : '12s' }}
        >
          <circle
            cx="100"
            cy="100"
            r="70"
            fill="none"
            stroke={colors.secondary}
            strokeWidth="1"
            strokeDasharray="24 10"
            opacity="0.4"
          />
          <circle cx="150" cy="50" r="2.5" fill={colors.primary} />
          <circle cx="50" cy="150" r="2.5" fill={colors.primary} />
        </svg>

        {/* 3D Elevated Shield Core */}
        <div
          className="relative z-10 flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-[#262A24] via-[#20231E] to-[#10120F] border border-[#363A31] shadow-[0_0_30px_rgba(201,243,106,0.12)] transition-transform duration-300"
          style={{ transform: 'translateZ(30px)' }}
        >
          <div className="relative">
            <Shield
              className={`${dimensions.icon} transition-colors duration-500`}
              style={{
                color: colors.primary,
                filter: `drop-shadow(0 0 12px ${colors.glow})`
              }}
              strokeWidth={1.5}
            />
            {/* Inner Core Light Point */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full animate-ping opacity-75"
              style={{ backgroundColor: colors.secondary }}
            />
          </div>
        </div>

        {/* Subtle Decorative Crosshairs */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{ transform: 'translateZ(10px)' }}
        >
          <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-[#C4A878]/40"></div>
          <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-[#C4A878]/40"></div>
        </div>
      </div>
    </div>
  );
}
