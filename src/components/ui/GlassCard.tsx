interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'glow-cyan' | 'glow-sapphire' | 'glow-lime' | 'glow-champagne';
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
      'bg-[#20231E]/95 border-[#363A31] shadow-[0_16px_40px_rgba(0,0,0,0.7)]',
    elevated:
      'bg-[#262A24]/95 border-[#363A31] hover:border-[#C4A878]/50 shadow-[0_24px_50px_rgba(0,0,0,0.8),0_0_20px_rgba(201,243,106,0.08)]',
    'glow-cyan':
      'bg-[#20231E]/95 border-[#C9F36A]/40 shadow-[0_0_25px_rgba(201,243,106,0.18)]',
    'glow-lime':
      'bg-[#20231E]/95 border-[#C9F36A]/40 shadow-[0_0_25px_rgba(201,243,106,0.18)]',
    'glow-sapphire':
      'bg-[#20231E]/95 border-[#C4A878]/40 shadow-[0_0_25px_rgba(196,168,120,0.18)]',
    'glow-champagne':
      'bg-[#20231E]/95 border-[#C4A878]/40 shadow-[0_0_25px_rgba(196,168,120,0.18)]',
  };

  const hoverClass = hoverEffect
    ? 'transition-all duration-300 hover:border-[#C4A878]/60 hover:shadow-[0_24px_60px_rgba(0,0,0,0.85),0_0_25px_rgba(201,243,106,0.15)] hover:-translate-y-0.5'
    : '';

  return (
    <div
      className={`relative rounded-3xl border backdrop-blur-xl overflow-hidden ${variantStyles[variant]} ${hoverClass} ${className}`}
      {...props}
    >
      {/* Subtle top laser highlight */}
      <div
        className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-[#C4A878]/40 to-transparent pointer-events-none"
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
