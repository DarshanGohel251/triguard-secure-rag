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
    scene.fog = new THREE.FogExp2(0x10120F, 0.045);

    const width = container.clientWidth || 400;
    const h = typeof height === 'number' ? height : container.clientHeight || 380;

    const camera = new THREE.PerspectiveCamera(45, width / h, 0.1, 100);
    camera.position.set(0, 0, 8.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // Obsidian Apex Color Definitions
    // Obsidian: #10120F (0x10120F)
    // Carbon: #20231E (0x20231E)
    // Graphite: #363A31 (0x363A31)
    // Warm Ivory: #F1EEE5 (0xF1EEE5)
    // Signal Lime: #C9F36A (0xC9F36A)
    // Champagne Metallic: #C4A878 (0xC4A878)
    const primaryColor = status === 'secure' ? 0xC9F36A : status === 'warning' ? 0xF59E0B : 0xEF4444;
    const champagneColor = 0xC4A878;
    const graphiteColor = 0x363A31;
    const ivoryColor = 0xF1EEE5;
    const limeColor = 0xC9F36A;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x20231E, 1.4);
    scene.add(ambientLight);

    const coreLight = new THREE.PointLight(primaryColor, 3.2, 11);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    const keyLight = new THREE.DirectionalLight(ivoryColor, 0.95);
    keyLight.position.set(5, 6, 8);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(champagneColor, 1.4);
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

    // Outer Geodesic Wireframe Sphere (Graphite structural lattice)
    const l1Geo = new THREE.IcosahedronGeometry(3.2, 1);
    const l1WireGeo = new THREE.WireframeGeometry(l1Geo);
    const l1WireMat = new THREE.LineBasicMaterial({
      color: graphiteColor,
      transparent: true,
      opacity: 0.55
    });
    const l1Mesh = new THREE.LineSegments(l1WireGeo, l1WireMat);
    layer1Group.add(l1Mesh);

    // Outer Equatorial Tactical Rail Ring (Champagne Metallic edge highlight)
    const outerRingGeo = new THREE.TorusGeometry(3.3, 0.02, 16, 80);
    const outerRingMat = new THREE.MeshBasicMaterial({ color: champagneColor, transparent: true, opacity: 0.65 });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRing.rotation.x = Math.PI / 2;
    layer1Group.add(outerRing);

    // Orbital Nodes on Outer Ring (Restrained Champagne)
    const nodeGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: champagneColor,
      emissive: champagneColor,
      emissiveIntensity: 0.6,
      roughness: 0.3
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

    // Gimbal Ring A (Inclined 55 deg) - Dark Graphite Carbon
    const gimbalAGeo = new THREE.TorusGeometry(2.2, 0.04, 16, 72);
    const gimbalAMat = new THREE.MeshStandardMaterial({
      color: graphiteColor,
      emissive: 0x181A15,
      emissiveIntensity: 0.3,
      metalness: 0.9,
      roughness: 0.25
    });
    const gimbalA = new THREE.Mesh(gimbalAGeo, gimbalAMat);
    gimbalA.rotation.x = Math.PI / 3;
    layer2Group.add(gimbalA);

    // Gimbal Ring B (Inclined -55 deg counter-angle) - Champagne Metallic
    const gimbalBGeo = new THREE.TorusGeometry(2.0, 0.035, 16, 72);
    const gimbalBMat = new THREE.MeshStandardMaterial({
      color: champagneColor,
      emissive: champagneColor,
      emissiveIntensity: 0.45,
      metalness: 0.88,
      roughness: 0.2
    });
    const gimbalB = new THREE.Mesh(gimbalBGeo, gimbalBMat);
    gimbalB.rotation.y = Math.PI / 3;
    layer2Group.add(gimbalB);

    // Vector Sandbox Data Crystals orbiting gimbal B (Muted Champagne)
    const crystalGeo = new THREE.OctahedronGeometry(0.12, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: champagneColor,
      emissive: champagneColor,
      emissiveIntensity: 0.7,
      roughness: 0.2
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

    // Quantum Core Dodecahedron (Signal Lime pulsating core)
    const coreGeo = new THREE.DodecahedronGeometry(1.0, 0);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: primaryColor,
      emissive: primaryColor,
      emissiveIntensity: 0.7,
      roughness: 0.2,
      metalness: 0.15,
      transmission: 0.6,
      thickness: 1.1,
      wireframe: false,
      transparent: true,
      opacity: 0.92
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    layer3Group.add(coreMesh);

    // Core Wireframe Cage (Champagne Metallic edge highlight)
    const coreWireGeo = new THREE.WireframeGeometry(new THREE.DodecahedronGeometry(1.15, 0));
    const coreWireMat = new THREE.LineBasicMaterial({
      color: champagneColor,
      transparent: true,
      opacity: 0.75
    });
    const coreWire = new THREE.LineSegments(coreWireGeo, coreWireMat);
    layer3Group.add(coreWire);

    // Floating Cyber Dust Particle Field (Signal Lime restrained points)
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
      color: limeColor,
      size: 0.04,
      transparent: true,
      opacity: 0.65,
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,243,106,0.08)_0%,rgba(16,18,15,0)_70%)] pointer-events-none" />

        {/* HUD Overlay Reticle */}
        <div className="absolute top-3 left-4 text-[10px] font-mono text-[#C9F36A] bg-[#20231E]/85 border border-[#363A31] px-2.5 py-1 rounded-lg backdrop-blur-md pointer-events-none flex items-center gap-1.5 shadow-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C9F36A] animate-ping" />
          <span className="text-[#F1EEE5] font-semibold tracking-wider">OBSIDIAN DEFENSE ENGINE 3D • ACTIVE</span>
        </div>

        <div className="absolute top-3 right-4 text-[10px] font-mono text-[#B8B5AB] bg-[#20231E]/85 border border-[#363A31] px-2.5 py-1 rounded-lg backdrop-blur-md pointer-events-none">
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
                      ? 'bg-[#C9F36A] text-[#10120F] border-[#C9F36A] shadow-[0_0_16px_rgba(201,243,106,0.35)]'
                      : 'bg-[#20231E]/80 text-[#B8B5AB] border-[#363A31] hover:text-[#F1EEE5] hover:border-[#C4A878]/50'
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
            <div className="mx-2 p-3 rounded-xl bg-[#20231E]/90 border border-[#363A31] text-left backdrop-blur-md transition-all shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#F1EEE5] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C9F36A]" />
                  {layerTelemetry.title}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C4A878]/15 border border-[#C4A878]/30 text-[#C4A878] font-semibold">
                  {layerTelemetry.badge}
                </span>
              </div>
              <p className="text-[11px] text-[#B8B5AB] mt-1 leading-relaxed">
                {layerTelemetry.desc}
              </p>
              <div className="mt-2 pt-2 border-t border-[#363A31] flex items-center justify-between text-[10px] font-mono text-[#B8B5AB]">
                <span>Telemetry: <span className="text-[#C9F36A] font-bold">{layerTelemetry.metrics}</span></span>
                <span className="text-[#C4A878] flex items-center gap-1 font-semibold">
                  <Eye className="w-3 h-3 text-[#C9F36A]" /> Real-time Verified
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
