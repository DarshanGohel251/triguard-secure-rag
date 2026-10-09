
interface TriGuardLogoProps {
  variant?: 'icon' | 'horizontal' | 'hero' | 'compact';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showSubtitle?: boolean;
  className?: string;
  glow?: boolean;
}

export default function TriGuardLogo({
  variant = 'horizontal',
  size = 'md',
  showSubtitle = true,
  className = '',
  glow = true
}: TriGuardLogoProps) {
  const iconSizes = {
    sm: 28,
    md: 38,
    lg: 52,
    xl: 72,
    '2xl': 108
  }[size];

  const Emblem = () => (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${
        glow ? 'drop-shadow-[0_0_18px_rgba(0,212,232,0.4)]' : ''
      }`}
      style={{ width: iconSizes, height: iconSizes }}
    >
      <svg
        viewBox="0 0 120 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full transition-transform duration-300 hover:scale-105"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="shieldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="45%" stopColor="#0072F5" />
            <stop offset="100%" stopColor="#0A1E4A" />
          </linearGradient>

          <linearGradient id="shieldPlateDark" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#0F1F38" />
            <stop offset="100%" stopColor="#050B16" />
          </linearGradient>

          <linearGradient id="layerLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0066FF" stopOpacity="0.2" />
          </linearGradient>

          <linearGradient id="layerRight" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0072F5" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#002966" stopOpacity="0.2" />
          </linearGradient>

          <linearGradient id="coreGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="60%" stopColor="#0072F5" />
            <stop offset="100%" stopColor="#7928CA" />
          </linearGradient>

          <radialGradient id="quantumCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="35%" stopColor="#00F0FF" />
            <stop offset="80%" stopColor="#0052D4" />
            <stop offset="100%" stopColor="#002244" stopOpacity="0" />
          </radialGradient>

          <filter id="neonBloom" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Armored Aegis Perimeter */}
        <path
          d="M60 4 L108 24 C108 64 96 98 60 124 C24 98 12 64 12 24 L60 4 Z"
          fill="url(#shieldPlateDark)"
          stroke="url(#shieldBorder)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Defense Layer 1 (Left Wing): Identity & RBAC Enforcement */}
        <path
          d="M60 16 L22 32 C22 66 32 94 60 114 L60 16 Z"
          fill="url(#layerLeft)"
          opacity="0.5"
        />

        {/* Defense Layer 2 (Right Wing): Scoped Vector Boundary */}
        <path
          d="M60 16 L98 32 C98 66 88 94 60 114 L60 16 Z"
          fill="url(#layerRight)"
          opacity="0.5"
        />

        {/* Triad Geometry: 3 Chevron Shield Facets */}
        {/* Facet Top/Center (Prompt Firewall) */}
        <polygon
          points="60,26 84,40 60,54 36,40"
          fill="#001833"
          stroke="#00E5FF"
          strokeWidth="1.5"
          opacity="0.85"
        />

        {/* Facet Bottom-Left (Access Policy) */}
        <polygon
          points="34,46 56,58 48,86 28,68"
          fill="#00132A"
          stroke="#00A3FF"
          strokeWidth="1.5"
          opacity="0.8"
        />

        {/* Facet Bottom-Right (Vector Sandbox) */}
        <polygon
          points="86,46 92,68 72,86 64,58"
          fill="#00132A"
          stroke="#0072F5"
          strokeWidth="1.5"
          opacity="0.8"
        />

        {/* Defense Layer 3: Central AI Knowledge Core Lattice */}
        <g filter="url(#neonBloom)">
          {/* Core Hexagonal Chassis */}
          <polygon
            points="60,45 74,53 74,69 60,77 46,69 46,53"
            fill="url(#coreGlow)"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            opacity="0.9"
          />

          {/* Central Quantum Node */}
          <circle cx="60" cy="61" r="5" fill="url(#quantumCore)" />
          <circle cx="60" cy="61" r="2" fill="#FFFFFF" />

          {/* Neural Data Conduits */}
          <line x1="60" y1="45" x2="60" y2="28" stroke="#00F0FF" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="46" y1="61" x2="32" y2="61" stroke="#00F0FF" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="74" y1="61" x2="88" y2="61" stroke="#00F0FF" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="60" y1="77" x2="60" y2="96" stroke="#00A3FF" strokeWidth="1.8" strokeLinecap="round" />
        </g>

        {/* Triad Sentinel Orbital Nodes */}
        <circle cx="60" cy="10" r="2.5" fill="#00F0FF" />
        <circle cx="102" cy="74" r="2" fill="#00A3FF" />
        <circle cx="18" cy="74" r="2" fill="#00A3FF" />
      </svg>
    </div>
  );

  if (variant === 'icon') {
    return <Emblem />;
  }

  const textSizes = {
    sm: { title: 'text-base', sub: 'text-[9px]', tracking: 'tracking-wider' },
    md: { title: 'text-xl', sub: 'text-[11px]', tracking: 'tracking-widest' },
    lg: { title: 'text-2xl', sub: 'text-xs', tracking: 'tracking-widest' },
    xl: { title: 'text-3xl', sub: 'text-sm', tracking: 'tracking-widest' },
    '2xl': { title: 'text-5xl', sub: 'text-base', tracking: 'tracking-widest' }
  }[size];

  if (variant === 'hero') {
    return (
      <div className={`flex flex-col items-center text-center gap-4 ${className}`}>
        <Emblem />
        <div className="flex flex-col items-center">
          <div className="flex items-center tracking-tight font-black text-white">
            <span className={`${textSizes.title} tracking-wider font-extrabold`}>
              TRI<span className="text-cyan-400 drop-shadow-[0_0_12px_rgba(0,229,255,0.6)]">GUARD</span>
            </span>
          </div>
          {showSubtitle && (
            <div className="flex items-center gap-2 mt-1">
              <span className="h-[1px] w-6 bg-gradient-to-r from-transparent to-cyan-500/50" />
              <span className={`${textSizes.sub} font-mono uppercase tracking-[0.22em] text-slate-300 font-medium`}>
                Secure AI Intelligence
              </span>
              <span className="h-[1px] w-6 bg-gradient-to-l from-transparent to-cyan-500/50" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <Emblem />
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-center font-black text-white tracking-wider">
          <span className={`${textSizes.title} font-extrabold`}>
            TRI<span className="text-cyan-400 drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]">GUARD</span>
          </span>
        </div>
        {showSubtitle && (
          <span className={`${textSizes.sub} font-mono uppercase tracking-[0.18em] text-slate-400 font-semibold mt-1`}>
            Secure AI Intelligence
          </span>
        )}
      </div>
    </div>
  );
}
