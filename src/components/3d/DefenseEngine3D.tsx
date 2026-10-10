import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Shield, Lock, Cpu, Eye, Sparkles } from 'lucide-react';

interface DefenseEngine3DProps {
  status?: 'secure' | 'warning' | 'alert';
  className?: string;
  height?: number | string;
  interactive?: boolean;
}

export default function DefenseEngine3D({
  status = 'secure',
  className = '',
  height = 380,
  interactive = true
}: DefenseEngine3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeLayer, setActiveLayer] = useState<number>(3); // 1 = RBAC, 2 = Vector, 3 = Core

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07240F, 0.04);

    const width = container.clientWidth || 400;
    const h = typeof height === 'number' ? height : container.clientHeight || 380;

    const camera = new THREE.PerspectiveCamera(45, width / h, 0.1, 100);
    camera.position.set(0, 0, 8.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Color definitions based on God-Level palette
    // FROZEN WATER: #D9FCED (0xD9FCED)
    // ELECTRIC SAPPHIRE: #405FFA (0x405FFA)
    // STRONG CYAN: #09BBC8 (0x09BBC8)
    // TWILIGHT INDIGO: #3B3664 (0x3B3664)
    // EVERGREEN: #07240F (0x07240F)
    const primaryColor = status === 'secure' ? 0x09BBC8 : status === 'warning' ? 0xF59E0B : 0xFF3B5C;
    const sapphireColor = 0x405FFA;
    const strongCyanColor = 0x09BBC8;
    const frozenWaterColor = 0xD9FCED;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x07240F, 1.5);
    scene.add(ambientLight);

    const coreLight = new THREE.PointLight(primaryColor, 3.5, 12);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    const keyLight = new THREE.DirectionalLight(frozenWaterColor, 1.0);
    keyLight.position.set(5, 6, 8);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(sapphireColor, 1.8);
    rimLight.position.set(-6, -4, -4);
    scene.add(rimLight);

    // Master Rotation Group for mouse parallax
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // ----------------------------------------------------
    // LAYER 1: OUTER LAYER — Cryptographic RBAC Perimeter Shield
    // ----------------------------------------------------
    const layer1Group = new THREE.Group();
    masterGroup.add(layer1Group);

    // Outer Geodesic Wireframe Sphere (Electric Sapphire)
    const l1Geo = new THREE.IcosahedronGeometry(3.2, 1);
    const l1WireGeo = new THREE.WireframeGeometry(l1Geo);
    const l1WireMat = new THREE.LineBasicMaterial({
      color: sapphireColor,
      transparent: true,
      opacity: 0.35
    });
    const l1Mesh = new THREE.LineSegments(l1WireGeo, l1WireMat);
    layer1Group.add(l1Mesh);

    // Outer Equatorial Tactical Rail Ring (Strong Cyan)
    const outerRingGeo = new THREE.TorusGeometry(3.3, 0.02, 16, 80);
    const outerRingMat = new THREE.MeshBasicMaterial({ color: strongCyanColor, transparent: true, opacity: 0.65 });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRing.rotation.x = Math.PI / 2;
    layer1Group.add(outerRing);

    // Orbital Nodes on Outer Ring (Strong Cyan)
    const nodeGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: strongCyanColor,
      emissive: strongCyanColor,
      emissiveIntensity: 0.85,
      roughness: 0.2
    });
    const nodeCount = 6;
    const nodes: THREE.Mesh[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.set(Math.cos(angle) * 3.3, 0, Math.sin(angle) * 3.3);
      layer1Group.add(node);
      nodes.push(node);
    }

    // ----------------------------------------------------
    // LAYER 2: MIDDLE LAYER — Vector Scope Isolation Gimbals
    // ----------------------------------------------------
    const layer2Group = new THREE.Group();
    masterGroup.add(layer2Group);

    // Gimbal Ring A (Inclined 55 deg) - Electric Sapphire
    const gimbalAGeo = new THREE.TorusGeometry(2.2, 0.04, 16, 72);
    const gimbalAMat = new THREE.MeshStandardMaterial({
      color: sapphireColor,
      emissive: sapphireColor,
      emissiveIntensity: 0.55,
      metalness: 0.85,
      roughness: 0.2
    });
    const gimbalA = new THREE.Mesh(gimbalAGeo, gimbalAMat);
    gimbalA.rotation.x = Math.PI / 3;
    layer2Group.add(gimbalA);

    // Gimbal Ring B (Inclined -55 deg counter-angle) - Strong Cyan
    const gimbalBGeo = new THREE.TorusGeometry(2.0, 0.035, 16, 72);
    const gimbalBMat = new THREE.MeshStandardMaterial({
      color: strongCyanColor,
      emissive: strongCyanColor,
      emissiveIntensity: 0.55,
      metalness: 0.85,
      roughness: 0.2
    });
    const gimbalB = new THREE.Mesh(gimbalBGeo, gimbalBMat);
    gimbalB.rotation.y = Math.PI / 3;
    layer2Group.add(gimbalB);

    // Vector Sandbox Data Crystals orbiting gimbal B (Strong Cyan / Frozen Water)
    const crystalGeo = new THREE.OctahedronGeometry(0.12, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: strongCyanColor,
      emissive: strongCyanColor,
      emissiveIntensity: 0.9,
      roughness: 0.15
    });
    const crystals: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const c = new THREE.Mesh(crystalGeo, crystalMat);
      layer2Group.add(c);
      crystals.push(c);
    }

    // ----------------------------------------------------
    // LAYER 3: INNER LAYER — Luminous AI Knowledge Core
    // ----------------------------------------------------
    const layer3Group = new THREE.Group();
    masterGroup.add(layer3Group);

    // Quantum Core Dodecahedron (Pulsating)
    const coreGeo = new THREE.DodecahedronGeometry(1.0, 0);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: primaryColor,
      emissive: primaryColor,
      emissiveIntensity: 0.75,
      roughness: 0.15,
      metalness: 0.1,
      transmission: 0.65,
      thickness: 1.2,
      wireframe: false,
      transparent: true,
      opacity: 0.92
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    layer3Group.add(coreMesh);

    // Core Wireframe Cage (Frozen Water #D9FCED)
    const coreWireGeo = new THREE.WireframeGeometry(new THREE.DodecahedronGeometry(1.15, 0));
    const coreWireMat = new THREE.LineBasicMaterial({
      color: frozenWaterColor,
      transparent: true,
      opacity: 0.8
    });
    const coreWire = new THREE.LineSegments(coreWireGeo, coreWireMat);
    layer3Group.add(coreWire);

    // Floating Cyber Dust Particle Field (Strong Cyan & Frozen Water)
    const particleCount = 140;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      const r = 1.2 + Math.random() * 2.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      particlePositions[i] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePositions[i + 2] = r * Math.cos(phi);
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: strongCyanColor,
      size: 0.045,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    const particleCloud = new THREE.Points(particleGeo, particleMat);
    masterGroup.add(particleCloud);

    // Mouse Parallax Interaction
    let targetRotX = 0;
    let targetRotY = 0;
    const onMouseMove = (e: MouseEvent) => {
      if (prefersReducedMotion) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      targetRotY = x * 0.45;
      targetRotX = -y * 0.35;
    };

    container.addEventListener('mousemove', onMouseMove);

    // Animation Loop with Tab Visibility Optimization (Task 3)
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let isTabVisible = !document.hidden;

    const onVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible) {
        clock.start();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Task 3: Zero GPU consumption if document is hidden
      if (!isTabVisible || document.hidden) return;

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Continuous organic rotation
        layer1Group.rotation.y += delta * 0.12;
        layer1Group.rotation.x += delta * 0.04;

        layer2Group.rotation.y -= delta * 0.22;
        layer2Group.rotation.z += delta * 0.15;

        layer3Group.rotation.y += delta * 0.4;
        layer3Group.rotation.x += delta * 0.25;

        particleCloud.rotation.y += delta * 0.08;

        // Animate vector crystals around gimbal B
        crystals.forEach((c, i) => {
          const a = time * 0.8 + (i * Math.PI) / 2;
          c.position.set(Math.cos(a) * 2.0, Math.sin(a) * 2.0 * 0.5, Math.sin(a) * 2.0 * 0.86);
          c.rotation.x += 0.02;
          c.rotation.y += 0.03;
        });

        // Pulsate inner quantum core
        const pulse = 1.0 + Math.sin(time * 3.0) * 0.06;
        coreMesh.scale.set(pulse, pulse, pulse);
        coreLight.intensity = 3.0 + Math.sin(time * 4.0) * 0.8;

        // Smooth Parallax Lerp
        masterGroup.rotation.x += (targetRotX - masterGroup.rotation.x) * 0.06;
        masterGroup.rotation.y += (targetRotY - masterGroup.rotation.y) * 0.06;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newH = typeof height === 'number' ? height : container.clientHeight;
      camera.aspect = newWidth / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newH);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      l1Geo.dispose();
      l1WireGeo.dispose();
      l1WireMat.dispose();
      outerRingGeo.dispose();
      outerRingMat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      gimbalAGeo.dispose();
      gimbalAMat.dispose();
      gimbalBGeo.dispose();
      gimbalBMat.dispose();
      crystalGeo.dispose();
      crystalMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      coreWireGeo.dispose();
      coreWireMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, [status, height]);

  const layerTelemetry = {
    1: {
      title: 'Layer 1: Identity & RBAC Clearance',
      badge: 'PERIMETER ENFORCEMENT',
      desc: 'Cryptographic JWT verification and deterministic policy gate. Blocks unauthorized personas prior to retrieval.',
      metrics: 'Deterministic Role Matrix • 0ms Boundary Leak'
    },
    2: {
      title: 'Layer 2: Scoped Vector Sandbox',
      badge: 'VECTOR PARTITION ISOLATION',
      desc: 'Constrains cosine distance calculations exclusively to authorized document partitions. Prevents cross-department leakage.',
      metrics: 'Cosine Distance Scoped • Department Isolation Active'
    },
    3: {
      title: 'Layer 3: Zero-Leak AI Knowledge Core',
      badge: 'PROMPT FIREWALL & CITATIONS',
      desc: 'Quarantines retrieved chunks against injection jailbreaks and synthesizes grounded answers with page-level citations.',
      metrics: 'Gemini 2.5 Flash Grounded • Injection Interception 100%'
    }
  }[activeLayer];

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        className="w-full relative cursor-grab active:cursor-grabbing flex items-center justify-center"
        style={{ height }}
      >
        {/* Ambient Radial Gradient behind WebGL */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(9,187,200,0.15)_0%,rgba(7,36,15,0)_70%)] pointer-events-none" />

        {/* HUD Overlay Reticle */}
        <div className="absolute top-3 left-4 text-[10px] font-mono text-[#09BBC8] bg-[#3B3664]/60 border border-[#09BBC8]/30 px-2.5 py-1 rounded-lg backdrop-blur-md pointer-events-none flex items-center gap-1.5 shadow-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-[#09BBC8] animate-ping" />
          <span className="text-[#D9FCED] font-semibold">APEX DEFENSE ENGINE 3D • ACTIVE</span>
        </div>

        <div className="absolute top-3 right-4 text-[10px] font-mono text-[#D9FCED]/70 bg-[#3B3664]/60 border border-[#09BBC8]/20 px-2.5 py-1 rounded-lg backdrop-blur-md pointer-events-none">
          ORBITAL ENGINE: 60 FPS
        </div>
      </div>

      {/* Interactive Layer Inspection Dock */}
      {interactive && (
        <div className="w-full mt-2 space-y-2">
          {/* Layer Selector Chips */}
          <div className="flex items-center justify-center gap-2 px-2">
            {[
              { id: 1, label: 'L1: RBAC Shield', icon: Shield },
              { id: 2, label: 'L2: Vector Sandbox', icon: Lock },
              { id: 3, label: 'L3: AI Quantum Core', icon: Cpu }
            ].map((layer) => {
              const Icon = layer.icon;
              const isSelected = activeLayer === layer.id;
              return (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayer(layer.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#405FFA] text-[#D9FCED] border-[#09BBC8] shadow-[0_0_16px_rgba(9,187,200,0.45)]'
                      : 'bg-[#3B3664]/40 text-[#D9FCED]/70 border-[#09BBC8]/20 hover:text-[#D9FCED] hover:border-[#09BBC8]/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{layer.label}</span>
                </button>
              );
            })}
          </div>

          {/* Telemetry Deep-Dive Drawer */}
          {layerTelemetry && (
            <div className="mx-2 p-3 rounded-xl bg-[#3B3664]/40 border border-[#09BBC8]/25 text-left backdrop-blur-md transition-all shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#D9FCED] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#09BBC8]" />
                  {layerTelemetry.title}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#405FFA]/30 border border-[#09BBC8]/30 text-[#D9FCED]">
                  {layerTelemetry.badge}
                </span>
              </div>
              <p className="text-[11px] text-[#D9FCED]/80 mt-1 leading-relaxed">
                {layerTelemetry.desc}
              </p>
              <div className="mt-2 pt-2 border-t border-[#09BBC8]/20 flex items-center justify-between text-[10px] font-mono text-[#D9FCED]/70">
                <span>Telemetry: <span className="text-[#09BBC8] font-bold">{layerTelemetry.metrics}</span></span>
                <span className="text-[#09BBC8] flex items-center gap-1">
                  <Eye className="w-3 h-3" /> Real-time Verified
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
