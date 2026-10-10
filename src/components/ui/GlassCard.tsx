interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'glow-cyan' | 'glow-sapphire';
  hoverEffect?: boolean;
  scanlines?: boolean;
  className?: string;
}

export default function GlassCard({
  children,
  variant = 'default',
  hoverEffect = true,
  scanlines = false,
  className = '',
  ...props
}: GlassCardProps) {
  const variantStyles = {
    default:
      'bg-gradient-to-b from-[#0E1726]/90 to-[#131F37]/85 border-[#09BBC8]/25 shadow-[0_16px_40px_rgba(0,0,0,0.6)]',
    elevated:
      'bg-gradient-to-b from-[#0E1726]/95 to-[#131F37]/90 border-[#09BBC8]/35 shadow-[0_24px_50px_rgba(0,0,0,0.7),0_0_25px_rgba(9,187,200,0.15)]',
    'glow-cyan':
      'bg-gradient-to-b from-[#0E1726]/95 to-[#131F37]/90 border-[#09BBC8]/45 shadow-[0_0_30px_rgba(9,187,200,0.25)]',
    'glow-sapphire':
      'bg-gradient-to-b from-[#0E1726]/95 to-[#131F37]/90 border-[#405FFA]/45 shadow-[0_0_30px_rgba(64,95,250,0.3)]',
  };

  const hoverClass = hoverEffect
    ? 'transition-all duration-300 hover:border-[#09BBC8]/60 hover:shadow-[0_24px_60px_rgba(0,0,0,0.8),0_0_35px_rgba(9,187,200,0.3)] hover:-translate-y-0.5'
    : '';

  return (
    <div
      className={`relative rounded-3xl border backdrop-blur-xl overflow-hidden ${variantStyles[variant]} ${hoverClass} ${className}`}
      {...props}
    >
      {/* Subtle top laser highlight */}
      <div
        className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-[#09BBC8]/50 to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {/* Optional cyber scanlines overlay */}
      {scanlines && (
        <div
          className="absolute inset-0 scanlines opacity-20 pointer-events-none"
          aria-hidden="true"
        />
      )}

      {children}
    </div>
  );
}
