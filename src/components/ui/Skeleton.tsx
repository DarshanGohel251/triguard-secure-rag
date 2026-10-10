interface SkeletonProps {
  variant?: 'text' | 'card' | 'table' | 'stat' | 'badge' | 'avatar' | 'rect';
  width?: string | number;
  height?: string | number;
  className?: string;
  lines?: number;
}

export default function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
  lines = 3,
}: SkeletonProps) {
  const baseShimmer =
    'relative overflow-hidden bg-[#20231E]/70 rounded-xl border border-[#363A31]/50 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-[#C9F36A]/10 before:to-transparent';

  if (variant === 'text') {
    return (
      <div
        className={`space-y-2.5 ${className}`}
        role="status"
        aria-busy="true"
        aria-label="Loading text content"
      >
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`h-3.5 rounded-lg ${baseShimmer}`}
            style={{
              width: i === lines - 1 ? '65%' : i === 0 ? '90%' : '100%',
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div
        className={`p-6 rounded-3xl bg-[#20231E]/90 border border-[#363A31] space-y-4 ${className}`}
        role="status"
        aria-busy="true"
        aria-label="Loading card content"
      >
        <div className="flex items-center justify-between">
          <div className={`w-10 h-10 rounded-2xl ${baseShimmer}`} />
          <div className={`w-20 h-5 rounded-full ${baseShimmer}`} />
        </div>
        <div className={`h-5 w-3/4 rounded-lg ${baseShimmer}`} />
        <div className="space-y-2 pt-2">
          <div className={`h-3 rounded-lg ${baseShimmer}`} />
          <div className={`h-3 w-5/6 rounded-lg ${baseShimmer}`} />
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-[#363A31]">
          <div className={`w-24 h-6 rounded-xl ${baseShimmer}`} />
          <div className={`w-8 h-8 rounded-xl ${baseShimmer}`} />
        </div>
      </div>
    );
  }

  if (variant === 'stat') {
    return (
      <div
        className={`p-4 rounded-2xl bg-[#181A15]/90 border border-[#363A31] flex items-center gap-3.5 ${className}`}
        role="status"
        aria-busy="true"
        aria-label="Loading telemetry statistic"
      >
        <div className={`w-10 h-10 rounded-xl ${baseShimmer} shrink-0`} />
        <div className="space-y-1.5 flex-1">
          <div className={`h-2.5 w-20 rounded ${baseShimmer}`} />
          <div className={`h-5 w-28 rounded-lg ${baseShimmer}`} />
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div
        className={`rounded-2xl border border-[#363A31] bg-[#181A15]/80 p-4 space-y-3 ${className}`}
        role="status"
        aria-busy="true"
        aria-label="Loading data table"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#363A31]">
          <div className={`h-4 w-32 rounded ${baseShimmer}`} />
          <div className={`h-4 w-20 rounded ${baseShimmer}`} />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-[#363A31]/50">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg ${baseShimmer}`} />
              <div className={`h-3.5 w-40 rounded ${baseShimmer}`} />
            </div>
            <div className={`h-5 w-20 rounded-md ${baseShimmer}`} />
            <div className={`h-3.5 w-16 rounded ${baseShimmer}`} />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div
        className={`h-6 w-20 rounded-full ${baseShimmer} ${className}`}
        role="status"
        aria-busy="true"
        aria-label="Loading badge"
      />
    );
  }

  if (variant === 'avatar') {
    return (
      <div
        className={`w-10 h-10 rounded-xl ${baseShimmer} ${className}`}
        role="status"
        aria-busy="true"
        aria-label="Loading avatar"
      />
    );
  }

  return (
    <div
      className={`${baseShimmer} ${className}`}
      style={{
        width: width ?? '100%',
        height: height ?? '1rem',
      }}
      role="status"
      aria-busy="true"
      aria-label="Loading content"
    />
  );
}
