import { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Radio, Crosshair, CheckCircle2, User, Clock } from 'lucide-react';

export interface SecurityEventData {
  id?: number | string;
  type?: string;
  username?: string;
  userEmail?: string;
  details?: string;
  timestamp?: string;
  decision?: string;
}

interface SecurityConstellation3DProps {
  events?: SecurityEventData[];
  height?: number | string;
  onSelectEvent?: (event: SecurityEventData) => void;
}

export default function SecurityConstellation3D({
  events = [],
  height = 420,
  onSelectEvent
}: SecurityConstellation3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEventData | null>(events[0] || null);
  const [hoveredEvent, setHoveredEvent] = useState<SecurityEventData | null>(null);

  const realEvents = useMemo(() => events.slice(0, 24), [events]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b0f17, 0.04);

    const width = container.clientWidth || 500;
    const h = typeof height === 'number' ? height : container.clientHeight || 420;

    const camera = new THREE.PerspectiveCamera(45, width / h, 0.1, 100);
    camera.position.set(0, 0, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // Ambient Lighting
    const ambientLight = new THREE.AmbientLight(0x141c2b, 1.8);
    scene.add(ambientLight);

    const coreLight = new THREE.PointLight(0x38bdf8, 2.5, 12);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    // Master Group for Constellation
    const constellationGroup = new THREE.Group();
    scene.add(constellationGroup);

    // Central Security Core Anchor
    const coreGeo = new THREE.OctahedronGeometry(0.5, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x2563eb,
      emissiveIntensity: 0.8,
      roughness: 0.2
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    constellationGroup.add(coreMesh);

    // Concentric Radar Range Rings
    [2.0, 3.2, 4.4].forEach((radius) => {
      const ringGeo = new THREE.TorusGeometry(radius, 0.012, 12, 72);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x253346, transparent: true, opacity: 0.5 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      constellationGroup.add(ring);
    });

    // Create 3D Nodes for Real Events
    const nodeMeshes: { mesh: THREE.Mesh; event: SecurityEventData }[] = [];
    const pointsPositions: number[] = [];

    const nodeSphereGeo = new THREE.SphereGeometry(0.14, 16, 16);

    realEvents.forEach((ev, idx) => {
      const isInjection = ev.type === 'PROMPT_INJECTION';
      const isDeny = ev.decision === 'DENY' || ev.type === 'UNAUTHORIZED_RETRIEVAL';
      const color = isInjection ? 0xef4444 : isDeny ? 0xef4444 : 0x059669;

      // Distribute nodes in a spherical constellation shell
      const phi = Math.acos(-1 + (2 * idx) / Math.max(realEvents.length, 1));
      const theta = Math.sqrt(Math.max(realEvents.length, 1) * Math.PI) * phi;
      const radius = isInjection ? 2.2 : isDeny ? 3.3 : 4.2;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      pointsPositions.push(x, y, z);

      const nodeMat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.9,
        roughness: 0.1
      });

      const mesh = new THREE.Mesh(nodeSphereGeo, nodeMat);
      mesh.position.set(x, y, z);
      constellationGroup.add(mesh);
      nodeMeshes.push({ mesh, event: ev });
    });

    // Constellation Filament Lines connecting consecutive events
    if (pointsPositions.length >= 6) {
      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(pointsPositions, 3));
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.28
      });
      const lines = new THREE.Line(lineGeo, lineMat);
      constellationGroup.add(lines);
    }

    // Background Particle Stardust
    const starCount = 100;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 14;
      starPositions[i + 1] = (Math.random() - 0.5) * 14;
      starPositions[i + 2] = (Math.random() - 0.5) * 14;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.035, transparent: true, opacity: 0.5 });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Raycaster for Hover & Click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-1000, -1000);

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes.map((n) => n.mesh));
      if (intersects.length > 0) {
        const hit = nodeMeshes.find((n) => n.mesh === intersects[0].object);
        if (hit) {
          setSelectedEvent(hit.event);
          onSelectEvent?.(hit.event);
        }
      }
    };

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('click', onClick);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        constellationGroup.rotation.y += 0.003;
        constellationGroup.rotation.x = Math.sin(time * 0.4) * 0.15;
        coreMesh.rotation.y += 0.02;
        coreMesh.rotation.x += 0.01;
      }

      // Check Hover
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes.map((n) => n.mesh));
      if (intersects.length > 0) {
        const hit = nodeMeshes.find((n) => n.mesh === intersects[0].object);
        if (hit) {
          setHoveredEvent(hit.event);
          container.style.cursor = 'pointer';
        }
      } else {
        setHoveredEvent(null);
        container.style.cursor = 'default';
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newH = typeof height === 'number' ? height : container.clientHeight;
      camera.aspect = newWidth / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('click', onClick);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      nodeSphereGeo.dispose();
      starGeo.dispose();
      starMat.dispose();
    };
  }, [realEvents, height]);

  return (
    <div className="w-full bg-[#141C2B] border border-[#253346] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
      {/* Background Cyber Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(239,68,68,0.06),transparent_70%)] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#253346] gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] text-xs font-mono uppercase tracking-wider mb-2">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#EF4444]" />
            3D Security Event Constellation • Spatial Telemetry
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#F8FAFC] tracking-tight">
            Security Threat Constellation
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Spatial node visualization mapping prompt injection intercept vectors and unauthorized retrieval attempts.
          </p>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2 rounded-xl bg-[#0B0F17] border border-[#EF4444]/40 text-left">
            <div className="text-[10px] font-mono uppercase text-[#EF4444]">Blocked Injections</div>
            <div className="text-xl font-black text-[#F8FAFC]">
              {events.filter((e) => e.type === 'PROMPT_INJECTION').length}
            </div>
          </div>
          <div className="px-4 py-2 rounded-xl bg-[#0B0F17] border border-[#253346] text-left">
            <div className="text-[10px] font-mono uppercase text-slate-400">Denied Probes</div>
            <div className="text-xl font-black text-[#F8FAFC]">
              {events.filter((e) => e.type !== 'PROMPT_INJECTION' || e.decision === 'DENY').length}
            </div>
          </div>
        </div>
      </div>

      {/* 3D Scene + Constellation Node Inspector */}
      <div className="relative z-10 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* WebGL Canvas (lg:col-span-8) */}
        <div className="lg:col-span-8 relative rounded-2xl bg-[#0B0F17] border border-[#253346] overflow-hidden shadow-inner">
          <div ref={mountRef} className="w-full" style={{ height }} />

          {/* Viewport HUD */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-slate-400 bg-[#0B0F17]/90 border border-[#253346] px-3.5 py-1.5 rounded-xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[#EF4444]">
                <span className="w-2 h-2 rounded-full bg-[#EF4444]" /> Prompt Injections
              </span>
              <span className="flex items-center gap-1.5 text-[#EF4444]">
                <span className="w-2 h-2 rounded-full bg-[#EF4444]" /> Policy Denied
              </span>
              <span className="flex items-center gap-1.5 text-[#059669]">
                <span className="w-2 h-2 rounded-full bg-[#059669]" /> Authorized
              </span>
            </div>
            <span className="text-slate-500 hidden sm:inline">Click star to inspect payload</span>
          </div>

          {hoveredEvent && (
            <div className="absolute top-3 left-4 px-3 py-1 rounded-lg bg-[#141C2B]/90 border border-[#EF4444]/40 text-[#EF4444] text-xs font-mono backdrop-blur-md">
              Target: {hoveredEvent.type} • {hoveredEvent.username || hoveredEvent.userEmail}
            </div>
          )}
        </div>

        {/* Selected Incident Inspector (lg:col-span-4) */}
        <div className="lg:col-span-4 p-5 sm:p-6 rounded-2xl bg-[#141C2B] border border-[#253346] shadow-2xl flex flex-col justify-between h-full min-h-[360px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#253346] mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                <Crosshair className="w-4 h-4 text-[#EF4444]" />
                Constellation Node
              </span>
              {selectedEvent && (
                <span
                  className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border ${
                    selectedEvent.type === 'PROMPT_INJECTION'
                      ? 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/40'
                      : 'bg-[#2563EB]/15 text-[#38BDF8] border-[#2563EB]/40'
                  }`}
                >
                  {selectedEvent.type || 'EVENT'}
                </span>
              )}
            </div>

            {selectedEvent ? (
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-slate-400 font-mono">Origin Identity:</div>
                  <div className="text-base font-bold text-[#F8FAFC] flex items-center gap-2 mt-0.5">
                    <User className="w-4 h-4 text-[#38BDF8]" />
                    <span>{selectedEvent.username || selectedEvent.userEmail || 'Unknown Caller'}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-[#253346] text-xs space-y-1.5">
                  <div className="text-slate-400 font-mono text-[10px] uppercase">Payload / Query Content:</div>
                  <div className="text-slate-200 font-mono text-xs bg-[#0B0F17] p-2.5 rounded-lg border border-[#253346] break-words max-h-28 overflow-y-auto">
                    "{selectedEvent.details || 'Blocked malicious attempt.'}"
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#059669]/10 border border-[#059669]/30 text-xs flex items-center justify-between">
                  <span className="text-slate-300 font-mono">Enforcement:</span>
                  <span className="text-[#059669] font-bold font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> INTERCEPTED & QUARANTINED
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    {selectedEvent.timestamp
                       ? new Date(selectedEvent.timestamp).toLocaleString()
                       : 'Real-time telemetry'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                Hover or click any constellation star node in 3D to inspect the intercepted threat or access decision.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#253346] flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>CONSTELLATION: SPATIAL 3D</span>
            <span>{events.length} LOGGED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
