export type BadgeVariant =
  | 'PUBLIC'
  | 'INTERNAL'
  | 'CONFIDENTIAL'
  | 'RESTRICTED'
  | 'ACTIVE'
  | 'VERIFIED'
  | 'BLOCKED'
  | 'FALLBACK'
  | 'SECURE';

interface BadgeProps {
  variant: BadgeVariant | string;
  label?: string;
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

export default function Badge({
  variant,
  label,
  size = 'md',
  pulse = false,
  className = '',
}: BadgeProps) {
  const normalized = (variant || '').toUpperCase();

  const variantMap: Record<
    string,
    { text: string; bg: string; border: string; dot: string; glow: string }
  > = {
    PUBLIC: {
      text: 'text-emerald-300',
      bg: 'bg-emerald-500/15',
      border: 'border-emerald-500/35',
      dot: 'bg-emerald-400',
      glow: 'shadow-[0_0_10px_rgba(16,185,129,0.3)]',
    },
    INTERNAL: {
      text: 'text-[#09BBC8]',
      bg: 'bg-[#09BBC8]/15',
      border: 'border-[#09BBC8]/35',
      dot: 'bg-[#09BBC8]',
      glow: 'shadow-[0_0_10px_rgba(9,187,200,0.3)]',
    },
    CONFIDENTIAL: {
      text: 'text-amber-300',
      bg: 'bg-amber-500/15',
      border: 'border-amber-500/35',
      dot: 'bg-amber-400',
      glow: 'shadow-[0_0_10px_rgba(245,158,11,0.3)]',
    },
    RESTRICTED: {
      text: 'text-rose-300',
      bg: 'bg-rose-500/15',
      border: 'border-rose-500/35',
      dot: 'bg-rose-400',
      glow: 'shadow-[0_0_10px_rgba(244,63,94,0.3)]',
    },
    ACTIVE: {
      text: 'text-emerald-300',
      bg: 'bg-emerald-500/15',
      border: 'border-emerald-500/35',
      dot: 'bg-emerald-400',
      glow: 'shadow-[0_0_10px_rgba(16,185,129,0.3)]',
    },
    VERIFIED: {
      text: 'text-[#D9FCED]',
      bg: 'bg-[#405FFA]/20',
      border: 'border-[#09BBC8]/40',
      dot: 'bg-[#09BBC8]',
      glow: 'shadow-[0_0_12px_rgba(9,187,200,0.4)]',
    },
    BLOCKED: {
      text: 'text-rose-300',
      bg: 'bg-rose-500/20',
      border: 'border-rose-500/40',
      dot: 'bg-rose-400',
      glow: 'shadow-[0_0_12px_rgba(244,63,94,0.4)]',
    },
    FALLBACK: {
      text: 'text-amber-200',
      bg: 'bg-amber-500/20',
      border: 'border-amber-400/40',
      dot: 'bg-amber-300',
      glow: 'shadow-[0_0_12px_rgba(245,158,11,0.4)]',
    },
    SECURE: {
      text: 'text-[#00F5A0]',
      bg: 'bg-[#00F5A0]/15',
      border: 'border-[#00F5A0]/35',
      dot: 'bg-[#00F5A0]',
      glow: 'shadow-[0_0_12px_rgba(0,245,160,0.35)]',
    },
  };

  const style = variantMap[normalized] || {
    text: 'text-[#D9FCED]',
    bg: 'bg-[#3B3664]/30',
    border: 'border-[#09BBC8]/25',
    dot: 'bg-[#09BBC8]',
    glow: 'shadow-sm',
  };

  const displayText = label || normalized;
  const sizeClass =
    size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs font-bold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-mono tracking-wider uppercase select-none ${style.bg} ${style.border} ${style.text} ${style.glow} ${sizeClass} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${style.dot} ${pulse ? 'animate-ping' : ''}`}
      />
      <span>{displayText}</span>
    </span>
  );
}
