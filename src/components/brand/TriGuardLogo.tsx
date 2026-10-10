interface TriGuardLogoProps {
  variant?: 'icon' | 'horizontal' | 'hero' | 'compact';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
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
    xs: 22,
    sm: 30,
    md: 40,
    lg: 56,
    xl: 78,
    '2xl': 114
  }[size];

  const Emblem = () => (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${
        glow ? 'drop-shadow-[0_0_20px_rgba(0,240,255,0.45)]' : ''
      }`}
      style={{ width: iconSizes, height: iconSizes }}
    >
      <svg
        viewBox="0 0 140 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full transition-transform duration-300 hover:scale-105"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="apexOuterShield" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="35%" stopColor="#0072F5" />
            <stop offset="70%" stopColor="#05286B" />
            <stop offset="100%" stopColor="#020B1F" />
          </linearGradient>

          <linearGradient id="apexShieldPlate" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#0B1730" />
            <stop offset="60%" stopColor="#050E21" />
            <stop offset="100%" stopColor="#02050E" />
          </linearGradient>

          <linearGradient id="apexFacetL1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0052D4" stopOpacity="0.25" />
          </linearGradient>

          <linearGradient id="apexFacetL2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0088FF" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0A183D" stopOpacity="0.3" />
          </linearGradient>

          <linearGradient id="apexCoreGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="50%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>

          <radialGradient id="apexQuantumCenter" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="30%" stopColor="#00F0FF" />
            <stop offset="70%" stopColor="#0066FF" />
            <stop offset="100%" stopColor="#03081E" stopOpacity="0" />
          </radialGradient>

          <filter id="apexNeonBloom" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Armored Aegis Perimeter - Precision Chamfered Shield */}
        <path
          d="M70 6 L124 28 C124 74 110 114 70 144 C30 114 16 74 16 28 L70 6 Z"
          fill="url(#apexShieldPlate)"
          stroke="url(#apexOuterShield)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Defense Layer 1 (Left Armored Wing): Identity & RBAC Clearance */}
        <path
          d="M70 18 L27 36 C27 76 38 108 70 132 L70 18 Z"
          fill="url(#apexFacetL1)"
          opacity="0.6"
        />

        {/* Defense Layer 2 (Right Armored Wing): Scoped Vector Partition Isolation */}
        <path
          d="M70 18 L113 36 C113 76 102 108 70 132 L70 18 Z"
          fill="url(#apexFacetL2)"
          opacity="0.6"
        />

        {/* Precision Internal Negative Space - Tactical Chevron Facets */}
        {/* Upper Chevron (Prompt Firewall & Ingress Gate) */}
        <polygon
          points="70,28 98,44 70,60 42,44"
          fill="#030C20"
          stroke="#00F0FF"
          strokeWidth="1.8"
          opacity="0.9"
        />

        {/* Lower Left Chevron (Policy Enforcer) */}
        <polygon
          points="40,52 65,66 56,98 33,78"
          fill="#020817"
          stroke="#0099FF"
          strokeWidth="1.8"
          opacity="0.85"
        />

        {/* Lower Right Chevron (Vector Sandbox Guard) */}
        <polygon
          points="100,52 107,78 84,98 75,66"
          fill="#020817"
          stroke="#0072F5"
          strokeWidth="1.8"
          opacity="0.85"
        />

        {/* Defense Layer 3: Central High-Security AI Core Engine */}
        <g filter="url(#apexNeonBloom)">
          {/* Central Hexagonal Containment Lattice */}
          <polygon
            points="70,50 86,60 86,80 70,90 54,80 54,60"
            fill="url(#apexCoreGlow)"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            opacity="0.95"
          />

          {/* Core Quantum Micro-Node */}
          <circle cx="70" cy="70" r="6.5" fill="url(#apexQuantumCenter)" />
          <circle cx="70" cy="70" r="2.5" fill="#FFFFFF" />

          {/* Cryptographic Neural Conduits */}
          <line x1="70" y1="50" x2="70" y2="30" stroke="#00F0FF" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="54" y1="70" x2="36" y2="70" stroke="#00F0FF" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="86" y1="70" x2="104" y2="70" stroke="#00F0FF" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="70" y1="90" x2="70" y2="112" stroke="#0099FF" strokeWidth="2.2" strokeLinecap="round" />
        </g>

        {/* Orbital Sentinel Pinpoint Markers */}
        <circle cx="70" cy="14" r="3" fill="#00F0FF" className="drop-shadow-[0_0_6px_#00F0FF]" />
        <circle cx="118" cy="86" r="2.5" fill="#0099FF" />
        <circle cx="22" cy="86" r="2.5" fill="#0099FF" />
        <circle cx="70" cy="136" r="2.5" fill="#10B981" />
      </svg>
    </div>
  );

  if (variant === 'icon') {
    return <Emblem />;
  }

  const textSizes = {
    xs: { title: 'text-sm', sub: 'text-[8px]', tracking: 'tracking-wider' },
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
          <div className="flex items-center tracking-tight font-black text-[#D9FCED]">
            <span className={`${textSizes.title} tracking-wider font-extrabold`}>
              TRI<span className="text-[#09BBC8] drop-shadow-[0_0_14px_rgba(9,187,200,0.7)]">GUARD</span>
              <span className="text-xs ml-2 px-2 py-0.5 rounded-full bg-[#405FFA]/20 border border-[#09BBC8]/40 font-mono text-[#D9FCED] font-bold uppercase tracking-wider">
                APEX
              </span>
            </span>
          </div>
          {showSubtitle && (
            <div className="flex items-center gap-2 mt-1.5">
              <span className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#09BBC8]/60" />
              <span className={`${textSizes.sub} font-mono uppercase tracking-[0.24em] text-[#D9FCED]/70 font-semibold`}>
                Deterministic AI Defense
              </span>
              <span className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[#09BBC8]/60" />
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
        <div className="flex items-center font-black text-[#D9FCED] tracking-wider">
          <span className={`${textSizes.title} font-black`}>
            TRI<span className="text-[#09BBC8] drop-shadow-[0_0_10px_rgba(9,187,200,0.6)]">GUARD</span>
          </span>
          <span className="ml-1.5 text-[9px] px-1.5 py-0.2 rounded bg-[#405FFA]/25 text-[#D9FCED] border border-[#09BBC8]/40 font-mono font-bold">
            APEX
          </span>
        </div>
        {showSubtitle && (
          <span className={`${textSizes.sub} font-mono uppercase tracking-[0.2em] text-[#D9FCED]/60 font-semibold mt-1`}>
            Secure AI Intelligence
          </span>
        )}
      </div>
    </div>
  );
}
