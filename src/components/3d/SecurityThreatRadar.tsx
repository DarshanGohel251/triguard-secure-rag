import { useState } from 'react';
import { Crosshair, Radio } from 'lucide-react';

interface SecurityEventItem {
  id?: number | string;
  type?: string;
  username?: string;
  timestamp?: string;
  details?: string;
}

interface SecurityThreatRadarProps {
  events?: SecurityEventItem[];
}

export default function SecurityThreatRadar({ events = [] }: SecurityThreatRadarProps) {
  const [hoveredEvent, setHoveredEvent] = useState<SecurityEventItem | null>(null);

  // Group real events
  const injectionEvents = events.filter((e) => e.type === 'PROMPT_INJECTION');
  const probeEvents = events.filter((e) => e.type === 'UNAUTHORIZED_RETRIEVAL' || e.type !== 'PROMPT_INJECTION');

  // Compute spatial positions based on real event indices (deterministic angles and radii)
  const blipPoints = events.slice(0, 12).map((ev, idx) => {
    const angle = (idx * 57 + 35) % 360;
    const rad = (angle * Math.PI) / 180;
    const isInjection = ev.type === 'PROMPT_INJECTION';
    // Injections are deeper in core (radius 50-95), probes are mid/outer (radius 100-145)
    const distance = isInjection ? 60 + ((idx * 17) % 35) : 105 + ((idx * 23) % 40);
    const x = 160 + Math.cos(rad) * distance;
    const y = 160 + Math.sin(rad) * distance;

    return {
      event: ev,
      x,
      y,
      isInjection
    };
  });

  return (
    <div className="w-full bg-[#050B17]/95 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.06)_0%,transparent_70%)] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono uppercase tracking-wider mb-2">
            <Radio className="w-3.5 h-3.5 animate-pulse text-red-400" />
            Live Threat Interception Radar • Active Telemetry
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Spatial Cyber Defense Radar
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            Real-time multi-vector spatial interception of prompt injection attacks and unauthorized retrieval probes.
          </p>
        </div>

        {/* Real Metrics Counter */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2 rounded-xl bg-red-950/40 border border-red-500/30 text-left">
            <div className="text-[10px] font-mono uppercase text-red-400">Blocked Injections</div>
            <div className="text-xl font-black text-white">{injectionEvents.length}</div>
          </div>
          <div className="px-4 py-2 rounded-xl bg-amber-950/40 border border-amber-500/30 text-left">
            <div className="text-[10px] font-mono uppercase text-amber-400">Intercepted Probes</div>
            <div className="text-xl font-black text-white">{probeEvents.length}</div>
          </div>
        </div>
      </div>

      {/* Radar Main Visual and Event Inspector */}
      <div className="relative z-10 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Radar Circular Sweep Screen (lg:col-span-6) */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 select-none">
            {/* SVG Radar Grid */}
            <svg viewBox="0 0 320 320" className="w-full h-full">
              <defs>
                <radialGradient id="radarSweepGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity="0.3" />
                  <stop offset="70%" stopColor="#EF4444" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Concentric Defense Boundary Rings */}
              <circle cx="160" cy="160" r="145" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              <circle cx="160" cy="160" r="110" fill="none" stroke="rgba(245,158,11,0.2)" strokeWidth="1" strokeDasharray="4 6" />
              <circle cx="160" cy="160" r="75" fill="none" stroke="rgba(239,68,68,0.3)" strokeWidth="1" />
              <circle cx="160" cy="160" r="40" fill="none" stroke="rgba(0,229,255,0.4)" strokeWidth="1" />

              {/* Crosshair Axes */}
              <line x1="160" y1="15" x2="160" y2="305" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              <line x1="15" y1="160" x2="305" y2="160" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

              {/* Rotating Radar Sweep Cone */}
              <g className="animate-[spin_6s_linear_infinite] origin-center">
                <path
                  d="M160 160 L160 15 A145 145 0 0 1 262 57 Z"
                  fill="url(#radarSweepGlow)"
                />
                <line x1="160" y1="160" x2="160" y2="15" stroke="#EF4444" strokeWidth="1.5" opacity="0.8" />
              </g>

              {/* Real Threat Blips */}
              {blipPoints.map((pt, i) => (
                <g
                  key={i}
                  className="cursor-pointer transition-transform hover:scale-150"
                  onMouseEnter={() => setHoveredEvent(pt.event)}
                  onMouseLeave={() => setHoveredEvent(null)}
                >
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="4.5"
                    fill={pt.isInjection ? '#EF4444' : '#F59E0B'}
                    className={pt.isInjection ? 'drop-shadow-[0_0_8px_#EF4444]' : 'drop-shadow-[0_0_8px_#F59E0B]'}
                  />
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="9"
                    fill="none"
                    stroke={pt.isInjection ? '#EF4444' : '#F59E0B'}
                    strokeWidth="1"
                    className="animate-ping opacity-60"
                  />
                </g>
              ))}

              {/* Center Sentinel Shield Node */}
              <circle cx="160" cy="160" r="8" fill="#00E5FF" className="drop-shadow-[0_0_12px_#00E5FF]" />
              <circle cx="160" cy="160" r="3" fill="#FFFFFF" />
            </svg>

            {/* Radar Coordinates Overlay */}
            <div className="absolute top-2 left-2 text-[9px] font-mono text-slate-500">
              COORD: 37°N / 122°W
            </div>
            <div className="absolute bottom-2 right-2 text-[9px] font-mono text-red-400">
              MODE: AUTONOMOUS_DEFENSE
            </div>
          </div>
        </div>

        {/* Threat Inspector & Recent Attacks List (lg:col-span-6) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Threat Details & Telemetry</span>
            <span className="text-[11px] font-mono text-cyan-400">Hover blip to inspect</span>
          </div>

          {/* Active Hover Inspector Card */}
          {hoveredEvent ? (
            <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/40 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold uppercase text-red-400">
                  {hoveredEvent.type}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {hoveredEvent.timestamp ? new Date(hoveredEvent.timestamp).toLocaleTimeString() : 'Recent'}
                </span>
              </div>
              <div className="text-sm font-semibold text-white">
                Origin User: <span className="text-cyan-300">{hoveredEvent.username}</span>
              </div>
              <div className="text-xs text-slate-300 mt-1 bg-black/40 p-2.5 rounded border border-white/5 font-mono">
                {hoveredEvent.details || 'Blocked malicious payload.'}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 text-slate-400 text-xs flex items-center gap-3">
              <Crosshair className="w-5 h-5 text-red-400 shrink-0" />
              <span>Hover over any radar blip to inspect the intercepted attacker payload, origin identity, and defense mechanism.</span>
            </div>
          )}

          {/* Recent Intercept Log Rows */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {events.slice(0, 4).map((ev, idx) => (
              <div
                key={ev.id || idx}
                className="p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:border-red-500/30 flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${ev.type === 'PROMPT_INJECTION' ? 'bg-red-500' : 'bg-amber-400'}`} />
                  <div className="min-w-0">
                    <div className="font-semibold text-white truncate">{ev.username}</div>
                    <div className="text-[11px] text-slate-400 truncate">{ev.details}</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-500 shrink-0 ml-2">
                  {ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                </span>
              </div>
            ))}

            {events.length === 0 && (
              <div className="py-6 text-center text-slate-500 text-xs">
                No active threats recorded. System integrity optimal.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
