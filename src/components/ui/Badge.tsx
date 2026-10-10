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
      text: 'text-[#C4A878]',
      bg: 'bg-[#C4A878]/15',
      border: 'border-[#C4A878]/35',
      dot: 'bg-[#C4A878]',
      glow: 'shadow-[0_0_10px_rgba(196,168,120,0.25)]',
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
      text: 'text-[#C9F36A]',
      bg: 'bg-[#C9F36A]/15',
      border: 'border-[#C9F36A]/35',
      dot: 'bg-[#C9F36A]',
      glow: 'shadow-[0_0_10px_rgba(201,243,106,0.3)]',
    },
    VERIFIED: {
      text: 'text-emerald-300',
      bg: 'bg-emerald-500/15',
      border: 'border-emerald-500/35',
      dot: 'bg-emerald-400',
      glow: 'shadow-[0_0_12px_rgba(16,185,129,0.35)]',
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
      text: 'text-[#C9F36A]',
      bg: 'bg-[#C9F36A]/15',
      border: 'border-[#C9F36A]/35',
      dot: 'bg-[#C9F36A]',
      glow: 'shadow-[0_0_12px_rgba(201,243,106,0.35)]',
    },
  };

  const style = variantMap[normalized] || {
    text: 'text-[#F1EEE5]',
    bg: 'bg-[#20231E]',
    border: 'border-[#363A31]',
    dot: 'bg-[#C4A878]',
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
