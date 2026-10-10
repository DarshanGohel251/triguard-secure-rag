import { useRef, useState, useEffect, type ButtonHTMLAttributes, type ReactNode, type MouseEvent } from 'react';

interface MagneticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'cyan' | 'ghost' | 'danger' | 'surface';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  strength?: number;
}

export default function MagneticButton({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  strength = 14,
  className = '',
  disabled,
  onClick,
  ...props
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(motionQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    motionQuery.addEventListener('change', handler);
    return () => motionQuery.removeEventListener('change', handler);
  }, []);

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled || reducedMotion || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) / (rect.width / 2);
    const deltaY = (e.clientY - centerY) / (rect.height / 2);

    setPosition({
      x: deltaX * strength,
      y: deltaY * strength,
    });
  };

  const handleMouseEnter = () => {
    if (!disabled) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setPosition({ x: 0, y: 0 });
  };

  // Variant styling
  const variantStyles = {
    primary:
      'bg-gradient-to-r from-[#405FFA] to-[#5572FB] hover:to-[#09BBC8] text-[#F8FAFC] border border-[#09BBC8]/40 shadow-[0_0_20px_rgba(64,95,250,0.45)] hover:shadow-[0_0_30px_rgba(9,187,200,0.65)]',
    cyan:
      'bg-gradient-to-r from-[#09BBC8] to-[#12D1E0] text-[#080D16] font-black border border-[#D9FCED]/50 shadow-[0_0_20px_rgba(9,187,200,0.5)] hover:shadow-[0_0_30px_rgba(9,187,200,0.8)]',
    surface:
      'bg-[#0E1726]/90 hover:bg-[#131F37] text-[#D9FCED] border border-[#09BBC8]/30 hover:border-[#09BBC8] shadow-md hover:shadow-[0_0_20px_rgba(9,187,200,0.3)]',
    ghost:
      'bg-transparent hover:bg-[#09BBC8]/10 text-[#D9FCED] hover:text-white border border-transparent hover:border-[#09BBC8]/30',
    danger:
      'bg-rose-500/20 hover:bg-rose-500/35 text-rose-200 border border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.3)]',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'px-5 py-2.5 text-sm rounded-2xl gap-2 font-bold',
    lg: 'px-7 py-3.5 text-base rounded-2xl gap-2.5 font-black uppercase tracking-wider',
  };

  const transformStyle =
    !reducedMotion && isHovered
      ? {
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }
      : {
          transform: 'translate(0px, 0px)',
          transition: 'transform 0.3s ease-out',
        };

  return (
    <button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      disabled={disabled}
      style={transformStyle}
      className={`relative inline-flex items-center justify-center cursor-pointer select-none transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#09BBC8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D16] disabled:opacity-40 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {/* Dynamic ambient highlight glow */}
      {isHovered && !disabled && (
        <span
          className="absolute inset-0 rounded-[inherit] bg-white/10 pointer-events-none transition-opacity duration-200"
          aria-hidden="true"
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
