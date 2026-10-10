import React from 'react';

interface GeneratingLoaderProps {
  /** Text to animate letter by letter (default: "Generating") */
  text?: string;
  /** Optional secondary subtitle or stage detail */
  subtitle?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Extra container classes */
  className?: string;
}

export const GeneratingLoader: React.FC<GeneratingLoaderProps> = ({
  text = 'Generating',
  subtitle = 'Evaluating cryptographic clearance & verifiable citations...',
  size = 'md',
  className = ''
}) => {
  const letters = Array.from(text);

  // Compute staggered delay so full word animates within ~0.8s cycle
  // Total cycle is 0.8s, step is 0.8 / letters.length
  const step = 0.8 / Math.max(letters.length, 1);

  const sizeStyles = {
    sm: {
      container: 'py-2 px-3.5',
      letter: 'text-xs sm:text-sm tracking-widest',
      sub: 'text-[10px]'
    },
    md: {
      container: 'py-3.5 px-5',
      letter: 'text-sm sm:text-base tracking-[0.2em]',
      sub: 'text-[11px]'
    },
    lg: {
      container: 'py-5 px-7',
      letter: 'text-base sm:text-lg tracking-[0.25em]',
      sub: 'text-xs'
    }
  }[size];

  return (
    <div
      role="status"
      aria-label={`${text} response`}
      aria-live="polite"
      className={`triguard-loader-wrapper relative overflow-hidden rounded-2xl border border-[#253346] bg-[#141C2B]/95 shadow-[0_0_30px_rgba(56,189,248,0.18)] backdrop-blur-xl ${sizeStyles.container} ${className}`}
    >
      {/* 1. Ambient Animated Radial Light Gradient Layer */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-70 animate-triguard-radial-pulse"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(56, 189, 248, 0.22) 0%, rgba(37, 99, 235, 0.16) 45%, transparent 75%)'
        }}
      />

      {/* 2. Masked Animated Scan-Line Sweep Layer */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-30 animate-triguard-scanline"
        style={{
          backgroundImage:
            'linear-gradient(180deg, transparent 0%, rgba(56, 189, 248, 0.35) 50%, transparent 100%)',
          backgroundSize: '100% 200%'
        }}
      />

      {/* 3. Subtle Cyber Grid Texture */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-15"
        style={{
          backgroundImage:
            'linear-gradient(rgba(56,189,248,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.15) 1px, transparent 1px)',
          backgroundSize: '16px 16px'
        }}
      />

      {/* 4. Active Letter Animation Assembly */}
      <div className="flex items-center gap-3">
        {/* Glowing Status Indicator Core */}
        <div className="relative flex items-center justify-center w-3 h-3">
          <span className="absolute w-3 h-3 rounded-full bg-[#38BDF8]/40 animate-ping" />
          <span className="relative w-2 h-2 rounded-full bg-[#38BDF8] shadow-[0_0_8px_#38BDF8]" />
        </div>

        {/* Text Container with Staggered Keyframe Animation */}
        <div className="flex items-center">
          <span className={`font-mono font-extrabold uppercase text-[#F8FAFC] ${sizeStyles.letter} flex select-none`}>
            {letters.map((char, index) => (
              <span
                key={index}
                className="inline-block animate-triguard-letter-glow will-change-transform"
                style={{
                  animationDuration: '0.8s',
                  animationDelay: `${(index * step).toFixed(3)}s`,
                  animationIterationCount: 'infinite',
                  animationTimingFunction: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </span>

          {/* Restrained Cobalt/Sky Trailing Dot Pulse */}
          <span className="ml-1 inline-flex gap-1">
            <span
              className="w-1 h-1 rounded-full bg-[#38BDF8] animate-pulse"
              style={{ animationDuration: '0.8s', animationDelay: '0s' }}
            />
            <span
              className="w-1 h-1 rounded-full bg-[#2563EB] animate-pulse"
              style={{ animationDuration: '0.8s', animationDelay: '0.2s' }}
            />
            <span
              className="w-1 h-1 rounded-full bg-[#059669] animate-pulse"
              style={{ animationDuration: '0.8s', animationDelay: '0.4s' }}
            />
          </span>
        </div>
      </div>

      {/* 5. Stage Subtitle (if supplied) */}
      {subtitle && (
        <div className={`mt-1.5 pl-6 font-mono text-slate-300 truncate flex items-center gap-1.5 ${sizeStyles.sub}`}>
          <span className="text-[#38BDF8]">▸</span>
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
};

export default GeneratingLoader;
