import { useRef, useState, useEffect, type ButtonHTMLAttributes, type ReactNode, type MouseEvent } from 'react';

interface MagneticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'cyan' | 'ghost' | 'danger' | 'surface' | 'champagne' | 'lime';
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

  // Obsidian Apex Variant styling
  const variantStyles = {
    primary:
      'bg-[#C9F36A] hover:bg-[#D6F886] text-[#10120F] font-bold border border-[#C9F36A] shadow-[0_0_20px_rgba(201,243,106,0.35)] hover:shadow-[0_0_28px_rgba(201,243,106,0.6)]',
    lime:
      'bg-[#C9F36A] hover:bg-[#D6F886] text-[#10120F] font-bold border border-[#C9F36A] shadow-[0_0_20px_rgba(201,243,106,0.35)] hover:shadow-[0_0_28px_rgba(201,243,106,0.6)]',
    cyan:
      'bg-[#C9F36A] hover:bg-[#D6F886] text-[#10120F] font-bold border border-[#C9F36A] shadow-[0_0_20px_rgba(201,243,106,0.35)]',
    champagne:
      'bg-[#C4A878] hover:bg-[#D1B88B] text-[#10120F] font-bold border border-[#C4A878] shadow-[0_0_18px_rgba(196,168,120,0.35)] hover:shadow-[0_0_26px_rgba(196,168,120,0.55)]',
    surface:
      'bg-[#20231E] hover:bg-[#282C25] text-[#F1EEE5] border border-[#363A31] hover:border-[#C4A878]/50 shadow-md',
    ghost:
      'bg-transparent hover:bg-[#20231E] text-[#B8B5AB] hover:text-[#F1EEE5] border border-transparent hover:border-[#363A31]',
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
      className={`relative inline-flex items-center justify-center cursor-pointer select-none transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#C9F36A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#10120F] disabled:opacity-40 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
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
