import { useState, useEffect, useRef } from 'react';

interface TypingRevealProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}

export default function TypingReveal({
  text,
  speed = 14,
  onComplete,
  className = '',
}: TypingRevealProps) {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [isSkipped, setIsSkipped] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Reset state on text change
    setDisplayedLength(0);
    setIsSkipped(false);

    if (!text) return;

    let current = 0;
    const interval = () => {
      // Advance by 1 to 3 characters for realistic, smooth cadence
      current = Math.min(text.length, current + Math.floor(Math.random() * 2) + 1);
      setDisplayedLength(current);

      if (current < text.length) {
        timerRef.current = setTimeout(interval, speed);
      } else {
        if (onComplete) onComplete();
      }
    };

    timerRef.current = setTimeout(interval, speed);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text, speed, onComplete]);

  const handleSkip = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsSkipped(true);
    setDisplayedLength(text.length);
    if (onComplete) onComplete();
  };

  const isTyping = !isSkipped && displayedLength < text.length;
  const content = isSkipped ? text : text.substring(0, displayedLength);

  return (
    <div className={`relative group ${className}`}>
      <span className="whitespace-pre-wrap">{content}</span>
      {isTyping && (
        <span
          className="inline-block w-1.5 h-4 ml-0.5 bg-[#09BBC8] animate-pulse align-middle"
          aria-hidden="true"
        />
      )}

      {isTyping && (
        <button
          onClick={handleSkip}
          className="ml-2 text-[10px] font-mono text-[#09BBC8]/60 hover:text-[#09BBC8] underline cursor-pointer select-none"
        >
          Skip typing
        </button>
      )}
    </div>
  );
}
