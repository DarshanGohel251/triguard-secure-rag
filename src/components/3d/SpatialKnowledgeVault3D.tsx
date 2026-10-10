import { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Lock, CheckCircle2, Radar, Crosshair, ShieldCheck, Activity } from 'lucide-react';

export interface DocumentAsset {
  id?: number | string;
  name?: string;
  filename?: string;
  classification?: string;
  department?: string;
  chunkCount?: number;
  uploadedAt?: string;
  uploadDate?: string;
  isAuxiliary?: boolean;
}

interface SpatialKnowledgeVault3DProps {
  documents?: DocumentAsset[];
  userRole?: string;
  userDept?: string;
  height?: number | string;
  onSelectDocument?: (doc: DocumentAsset) => void;
}

export default function SpatialKnowledgeVault3D({
  documents = [],
  userRole = 'EMPLOYEE',
  userDept = 'Finance',
  height = 440,
  onSelectDocument
}: SpatialKnowledgeVault3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const azimuthTextRef = useRef<HTMLSpanElement>(null);
  const [selectedDoc, setSelectedDoc] = useState<DocumentAsset | null>(documents[0] || null);
  const [hoveredDoc, setHoveredDoc] = useState<DocumentAsset | null>(null);

  // Clearance authorization helper
  const isAuthorized = (classification?: string) => {
    const c = (classification || '').toUpperCase();
    if (userRole === 'ADMIN') return true;
    if (c === 'PUBLIC' || c === 'INTERNAL') return true;
    if (c === 'CONFIDENTIAL' && (userRole === 'DEPARTMENT_MANAGER' || userRole === 'HR_MANAGER')) return true;
    if (c === 'RESTRICTED' && (userRole === 'HR_MANAGER' || userRole === 'ADMIN')) return true;
    return false;
  };

  // Build the list of documents to display in 3D radar space
  // If user only has 1 or 2 documents, provide auxiliary system partitions so radar is rich and populated
  const displayItems = useMemo<DocumentAsset[]>(() => {
    const list: DocumentAsset[] = [...documents];

    if (list.length === 0) {
      list.push(
        {
          id: 'sys-pub-1',
          name: 'Corporate Code of Conduct & Ethics',
          classification: 'PUBLIC',
          department: 'Legal',
          chunkCount: 8,
          isAuxiliary: true
        },
        {
          id: 'sys-int-1',
          name: 'Engineering API Architecture Standards',
          classification: 'INTERNAL',
          department: 'Engineering',
          chunkCount: 14,
          isAuxiliary: true
        },
        {
          id: 'sys-conf-1',
          name: 'FY2026 Strategic Expansion Blueprint',
          classification: 'CONFIDENTIAL',
          department: 'Executive',
          chunkCount: 22,
          isAuxiliary: true
        },
        {
          id: 'sys-rest-1',
          name: 'Zero-Trust HSM Master Key Provisioning',
          classification: 'RESTRICTED',
          department: 'Security',
          chunkCount: 6,
          isAuxiliary: true
        }
      );
    } else if (list.length === 1) {
      list.push(
        {
          id: 'aux-pub-1',
          name: 'Enterprise Public Directory 2026',
          classification: 'PUBLIC',
          department: 'Operations',
          chunkCount: 4,
          isAuxiliary: true
        },
        {
          id: 'aux-conf-1',
          name: 'Q3 Financial Audited Ledger Reports',
          classification: 'CONFIDENTIAL',
          department: 'Finance',
          chunkCount: 16,
          isAuxiliary: true
        },
        {
          id: 'aux-rest-1',
          name: 'Core Biometric & HSM Vault Index',
          classification: 'RESTRICTED',
          department: 'Security',
          chunkCount: 5,
          isAuxiliary: true
        }
      );
    }

    return list;
  }, [documents]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let isTabVisible = !document.hidden;

    // 1. Scene & Camera (Evergreen #07240F Fog Depth)
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07240f, 0.032);

    const width = container.clientWidth || 600;
    const h = typeof height === 'number' ? height : container.clientHeight || 440;

    const camera = new THREE.PerspectiveCamera(42, width / h, 0.1, 100);
    camera.position.set(0, 3.4, 9.2);
    camera.lookAt(0, 0.3, 0);

    // 2. High-Fidelity Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // 3. Dynamic Scene Lighting
    const ambientLight = new THREE.AmbientLight(0x3b3664, 1.8);
    scene.add(ambientLight);

    const corePointLight = new THREE.PointLight(0x09bbc8, 4.5, 16);
    corePointLight.position.set(0, 0.5, 0);
    scene.add(corePointLight);

    const cyanRimLight = new THREE.DirectionalLight(0x09bbc8, 1.6);
    cyanRimLight.position.set(6, 8, 5);
    scene.add(cyanRimLight);

    const sapphireBackLight = new THREE.DirectionalLight(0x405ffa, 1.4);
    sapphireBackLight.position.set(-6, 4, -6);
    scene.add(sapphireBackLight);

    // 4. Master Groups
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // ------------------------------------------------------------------
    // RADAR BASE: Holographic Polar Grid & Range Rings
    // ------------------------------------------------------------------
    const radarGrid = new THREE.PolarGridHelper(5.2, 16, 5, 64, 0x09bbc8, 0x405ffa);
    radarGrid.position.y = -0.05;
    if (Array.isArray(radarGrid.material)) {
      radarGrid.material.forEach((m) => {
        m.transparent = true;
        m.opacity = 0.38;
      });
    } else {
      radarGrid.material.transparent = true;
      radarGrid.material.opacity = 0.38;
    }
    masterGroup.add(radarGrid);

    // Concentric Glowing Range Rings with Classification Colors
    const tiers = [
      { r: 2.0, color: 0x10b981, label: 'PUBLIC' },
      { r: 3.2, color: 0x09bbc8, label: 'INTERNAL' },
      { r: 4.2, color: 0xffb020, label: 'CONFIDENTIAL' },
      { r: 5.0, color: 0xff3b5c, label: 'RESTRICTED' }
    ];

    const ringMeshes: THREE.Mesh[] = [];
    tiers.forEach((t) => {
      const ringGeo = new THREE.TorusGeometry(t.r, 0.024, 16, 96);
      const ringMat = new THREE.MeshBasicMaterial({ color: t.color, transparent: true, opacity: 0.55 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      masterGroup.add(ring);
      ringMeshes.push(ring);

      // Add 8 tactical tick markers along each ring
      const markerGeo = new THREE.BoxGeometry(0.04, 0.04, 0.08);
      const markerMat = new THREE.MeshBasicMaterial({ color: t.color, transparent: true, opacity: 0.8 });
      for (let m = 0; m < 8; m++) {
        const theta = (m / 8) * Math.PI * 2;
        const tick = new THREE.Mesh(markerGeo, markerMat);
        tick.position.set(Math.cos(theta) * t.r, 0, Math.sin(theta) * t.r);
        tick.rotation.y = -theta;
        masterGroup.add(tick);
      }
    });

    // ------------------------------------------------------------------
    // 360° ROTATING TACTICAL RADAR SWEEP BEAM
    // ------------------------------------------------------------------
    const radarSweepGroup = new THREE.Group();
    masterGroup.add(radarSweepGroup);

    // Sharp leading sweep line (Radius 5.2)
    const sweepLineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.02, 0),
      new THREE.Vector3(5.2, 0.02, 0)
    ]);
    const sweepLineMat = new THREE.LineBasicMaterial({
      color: 0x09bbc8,
      transparent: true,
      opacity: 0.95
    });
    const sweepLine = new THREE.Line(sweepLineGeo, sweepLineMat);
    radarSweepGroup.add(sweepLine);

    // Trailing illuminated fan sector (45-degree luminous wedge)
    const fanGeo = new THREE.RingGeometry(0.1, 5.2, 32, 1, 0, Math.PI / 4);
    const fanMat = new THREE.MeshBasicMaterial({
      color: 0x09bbc8,
      transparent: true,
      opacity: 0.20,
      side: THREE.DoubleSide
    });
    const sweepFan = new THREE.Mesh(fanGeo, fanMat);
    sweepFan.rotation.x = Math.PI / 2;
    sweepFan.rotation.z = -Math.PI / 4;
    sweepFan.position.y = 0.01;
    radarSweepGroup.add(sweepFan);

    // ------------------------------------------------------------------
    // LUMINOUS QUANTUM CORE: High-Tech Central Cryptographic Pillar
    // ------------------------------------------------------------------
    const coreGroup = new THREE.Group();
    masterGroup.add(coreGroup);

    // Central Floating Octahedron Quantum Crystal (Electric Sapphire & Strong Cyan)
    const crystalGeo = new THREE.OctahedronGeometry(0.65, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x405ffa,
      emissive: 0x09bbc8,
      emissiveIntensity: 0.85,
      metalness: 0.85,
      roughness: 0.15
    });
    const coreCrystal = new THREE.Mesh(crystalGeo, crystalMat);
    coreCrystal.position.y = 0.65;
    coreGroup.add(coreCrystal);

    // Glowing Crystal Edge Facets (Frozen Water)
    const crystalEdgesGeo = new THREE.EdgesGeometry(crystalGeo);
    const crystalEdgesMat = new THREE.LineBasicMaterial({ color: 0xd9fced, transparent: true, opacity: 0.85 });
    const crystalEdges = new THREE.LineSegments(crystalEdgesGeo, crystalEdgesMat);
    coreCrystal.add(crystalEdges);

    // Translucent Laser Energy Containment Cylinder
    const cylGeo = new THREE.CylinderGeometry(0.75, 0.75, 2.8, 16, 1, true);
    const cylMat = new THREE.MeshBasicMaterial({
      color: 0x09bbc8,
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });
    const beamCylinder = new THREE.Mesh(cylGeo, cylMat);
    beamCylinder.position.y = 0.65;
    coreGroup.add(beamCylinder);

    // Dual Counter-Rotating Quantum Core Rings
    const coreRingAGeo = new THREE.TorusGeometry(1.05, 0.03, 16, 64);
    const coreRingAMat = new THREE.MeshBasicMaterial({ color: 0x09bbc8, transparent: true, opacity: 0.85 });
    const coreRingA = new THREE.Mesh(coreRingAGeo, coreRingAMat);
    coreRingA.rotation.x = Math.PI / 2;
    coreRingA.position.y = 0.65;
    coreGroup.add(coreRingA);

    const coreRingBGeo = new THREE.TorusGeometry(1.25, 0.02, 16, 64);
    const coreRingBMat = new THREE.MeshBasicMaterial({ color: 0x405ffa, transparent: true, opacity: 0.6 });
    const coreRingB = new THREE.Mesh(coreRingBGeo, coreRingBMat);
    coreRingB.rotation.x = Math.PI / 2.3;
    coreRingB.position.y = 0.65;
    coreGroup.add(coreRingB);

    // ------------------------------------------------------------------
    // AMBIENT RADAR PARTICLES: Upward drifting luminous data dust (Frozen Water)
    // ------------------------------------------------------------------
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const radius = Math.random() * 5.0;
      const angle = Math.random() * Math.PI * 2;
      particlePos[i * 3] = Math.cos(angle) * radius;
      particlePos[i * 3 + 1] = Math.random() * 3.5 - 0.2;
      particlePos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xd9fced,
      size: 0.045,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    masterGroup.add(particlePoints);

    // ------------------------------------------------------------------
    // 3D FLOATING DOCUMENT & TELEMETRY MODULES
    // ------------------------------------------------------------------
    const docMeshes: {
      mesh: THREE.Mesh;
      doc: DocumentAsset;
      basePos: THREE.Vector3;
      radius: number;
      baseAngle: number;
      orbitSpeed: number;
    }[] = [];

    const docBoxGeo = new THREE.BoxGeometry(0.8, 1.15, 0.08);

    displayItems.forEach((doc, idx) => {
      const c = (doc.classification || 'INTERNAL').toUpperCase();
      let tierColor = 0x00f0ff;
      let radius = 3.2;

      if (c === 'RESTRICTED') {
        tierColor = 0xef4444;
        radius = 5.0;
      } else if (c === 'CONFIDENTIAL') {
        tierColor = 0xf59e0b;
        radius = 4.2;
      } else if (c === 'PUBLIC') {
        tierColor = 0x10b981;
        radius = 2.0;
      }

      // Distribute evenly around the orbit
      const baseAngle = (idx / Math.max(displayItems.length, 1)) * Math.PI * 2 + 0.35;
      const x = Math.cos(baseAngle) * radius;
      const z = Math.sin(baseAngle) * radius;
      const y = 0.5 + Math.sin(idx * 1.8) * 0.25;

      const docMat = new THREE.MeshPhysicalMaterial({
        color: tierColor,
        emissive: tierColor,
        emissiveIntensity: 0.35,
        roughness: 0.15,
        metalness: 0.6,
        transmission: 0.6,
        thickness: 0.6,
        transparent: true,
        opacity: 0.9
      });

      const docMesh = new THREE.Mesh(docBoxGeo, docMat);
      docMesh.position.set(x, y, z);
      docMesh.lookAt(0, y, 0);

      // Glowing Perimeter Wireframe Edges
      const edgeGeo = new THREE.EdgesGeometry(docBoxGeo);
      const edgeMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.75
      });
      const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
      docMesh.add(edgeLines);

      // Floating Tactical Beacon on top of slab
      const beaconGeo = new THREE.OctahedronGeometry(0.1, 0);
      const beaconMat = new THREE.MeshBasicMaterial({ color: tierColor });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.y = 0.75;
      docMesh.add(beacon);

      masterGroup.add(docMesh);

      docMeshes.push({
        mesh: docMesh,
        doc,
        basePos: new THREE.Vector3(x, y, z),
        radius,
        baseAngle,
        orbitSpeed: 0.0008 + (idx % 3) * 0.0004
      });
    });

    // ------------------------------------------------------------------
    // RAYCASTER FOR INTERACTIVE HOVER & SELECTION
    // ------------------------------------------------------------------
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-1000, -1000);

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(docMeshes.map((d) => d.mesh));
      if (intersects.length > 0) {
        const hit = docMeshes.find((d) => d.mesh === intersects[0].object);
        if (hit) {
          setSelectedDoc(hit.doc);
          onSelectDocument?.(hit.doc);
        }
      }
    };

    container.addEventListener('mousemove', onPointerMove);
    container.addEventListener('click', onClick);

    // ------------------------------------------------------------------
    // ANIMATION LOOP (60FPS WebGL) with Visibility Optimization
    // ------------------------------------------------------------------
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const onVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isTabVisible) return; // Pause frame execution when tab is backgrounded!

      const time = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Continuous 360-degree radar sweep beam
        radarSweepGroup.rotation.y -= 0.022;

        // Update live Azimuth HUD readout in real-time
        let deg = Math.floor((-radarSweepGroup.rotation.y * (180 / Math.PI)) % 360);
        if (deg < 0) deg += 360;
        if (azimuthTextRef.current) {
          azimuthTextRef.current.textContent = `${deg.toString().padStart(3, '0')}°`;
        }

        // Slow core crystal rotation & pulsation
        coreCrystal.rotation.y += 0.015;
        coreCrystal.rotation.x = Math.sin(time * 0.8) * 0.15;
        coreRingA.rotation.z += 0.012;
        coreRingB.rotation.z -= 0.016;

        // Subtle core light breathing pulse
        corePointLight.intensity = 4.0 + Math.sin(time * 3) * 0.8;

        // Document orbital floating & gentle bobbing
        docMeshes.forEach((item, idx) => {
          const currentAngle = item.baseAngle + time * item.orbitSpeed;
          item.mesh.position.x = Math.cos(currentAngle) * item.radius;
          item.mesh.position.z = Math.sin(currentAngle) * item.radius;
          item.mesh.position.y = item.basePos.y + Math.sin(time * 1.6 + idx) * 0.12;
          item.mesh.lookAt(0, item.mesh.position.y, 0);
        });

        // Ascending particle drift
        const positions = particleGeo.attributes.position.array as Float32Array;
        for (let i = 1; i < particleCount * 3; i += 3) {
          positions[i] += 0.006;
          if (positions[i] > 3.6) {
            positions[i] = -0.2;
          }
        }
        particleGeo.attributes.position.needsUpdate = true;
      }

      // Raycast hover detection
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(docMeshes.map((d) => d.mesh));
      if (intersects.length > 0) {
        const hit = docMeshes.find((d) => d.mesh === intersects[0].object);
        if (hit) {
          setHoveredDoc(hit.doc);
          container.style.cursor = 'pointer';
        }
      } else {
        setHoveredDoc(null);
        container.style.cursor = 'default';
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

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', onPointerMove);
      container.removeEventListener('click', onClick);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      radarGrid.dispose();
      sweepLineGeo.dispose();
      sweepLineMat.dispose();
      fanGeo.dispose();
      fanMat.dispose();
      crystalGeo.dispose();
      crystalMat.dispose();
      cylGeo.dispose();
      cylMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      docBoxGeo.dispose();
    };
  }, [displayItems, height]);

  return (
    <div className="w-full bg-[#3B3664]/35 border border-[#09BBC8]/25 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(9,187,200,0.14)] relative overflow-hidden backdrop-blur-2xl text-[#D9FCED]">
      {/* Dynamic Cybernetic Radial Background Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(9,187,200,0.12),transparent_70%)] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(9,187,200,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(9,187,200,0.15) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#09BBC8]/20 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#405FFA]/20 border border-[#09BBC8]/40 text-[#D9FCED] text-xs font-mono uppercase tracking-wider mb-2 shadow-[0_0_15px_rgba(9,187,200,0.25)]">
            <Radar className="w-3.5 h-3.5 text-[#09BBC8] animate-spin" style={{ animationDuration: '6s' }} />
            3D Holographic Radar • Spatial Knowledge Vault
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#D9FCED] tracking-tight flex items-center gap-2.5">
            Spatial Knowledge Vault
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-[#09BBC8]/15 text-[#09BBC8] border border-[#09BBC8]/30">
              RADAR ACTIVE
            </span>
          </h2>
          <p className="text-base text-[#D9FCED]/75 mt-1 max-w-2xl leading-relaxed">
            Dimensional 360° radar telemetry mapping classified document partitions orbiting the cryptographic knowledge core.
          </p>
        </div>

        {/* Clearance Scope Badge */}
        <div className="flex items-center gap-3 bg-[#3B3664]/60 border border-[#09BBC8]/30 px-4 py-2.5 rounded-2xl shrink-0 shadow-lg">
          <div className="w-2.5 h-2.5 rounded-full bg-[#09BBC8] animate-pulse" />
          <div className="flex flex-col text-xs font-mono">
            <span className="font-bold text-[#D9FCED] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#09BBC8]" />
              Clearance: {userRole}
            </span>
            <span className="text-[#D9FCED]/70 text-[11px]">Scope: {userDept} Department</span>
          </div>
        </div>
      </div>

      {/* 3D Scene Viewport & Real-Time Document Inspector */}
      <div className="relative z-10 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* 3D WebGL Canvas (lg:col-span-8) */}
        <div className="lg:col-span-8 relative rounded-2xl bg-[#07240F]/80 border border-[#09BBC8]/25 overflow-hidden shadow-2xl">
          <div ref={mountRef} className="w-full" style={{ height }} />

          {/* Tactical Radar HUD: Top Overlay */}
          <div className="absolute top-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono pointer-events-none">
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#3B3664]/80 border border-[#09BBC8]/30 text-[#D9FCED] backdrop-blur-md">
              <Activity className="w-3.5 h-3.5 text-[#09BBC8] animate-pulse" />
              <span>AZIMUTH: </span>
              <span ref={azimuthTextRef} className="text-[#D9FCED] font-bold w-10">000°</span>
              <span className="text-[#D9FCED]/60 hidden sm:inline">| 360° CONT SCAN</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#3B3664]/80 border border-[#09BBC8]/30 text-[#D9FCED]/80 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#09BBC8] animate-ping" />
              <span className="text-[#09BBC8] font-bold">X-BAND 9.4 GHz</span>
              <span className="text-[#D9FCED]/60 hidden sm:inline">• RANGE 5.2m</span>
            </div>
          </div>

          {/* Interactive Legend in Viewport Bottom */}
          <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center justify-between text-[11px] font-mono text-[#D9FCED]/70 bg-[#3B3664]/85 border border-[#09BBC8]/30 px-3.5 py-1.5 rounded-xl backdrop-blur-md shadow-lg">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Public (2.0m)
              </span>
              <span className="flex items-center gap-1.5 text-[#09BBC8]">
                <span className="w-2 h-2 rounded-full bg-[#09BBC8]" /> Internal (3.2m)
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Confidential (4.2m)
              </span>
              <span className="flex items-center gap-1.5 text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-400" /> Restricted (5.0m)
              </span>
            </div>
            <span className="text-[#09BBC8] hidden sm:inline font-semibold">Click 3D slab to inspect</span>
          </div>

          {/* Hover Banner */}
          {hoveredDoc && (
            <div className="absolute top-12 left-4 px-3 py-1.5 rounded-lg bg-[#3B3664]/95 border border-[#09BBC8] text-[#D9FCED] text-xs font-mono backdrop-blur-md shadow-[0_0_15px_rgba(9,187,200,0.4)]">
              Target Track: {hoveredDoc.name || hoveredDoc.filename} ({hoveredDoc.classification})
            </div>
          )}
        </div>

        {/* Selected Document Metadata Inspector (lg:col-span-4) */}
        <div className="lg:col-span-4 p-5 sm:p-6 rounded-2xl bg-[#3B3664]/45 border border-[#09BBC8]/30 shadow-2xl flex flex-col justify-between h-full min-h-[380px] backdrop-blur-xl">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#09BBC8]/20 mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-[#D9FCED]/70 font-bold flex items-center gap-1.5">
                <Crosshair className="w-4 h-4 text-[#09BBC8]" />
                Radar Target Inspector
              </span>
              {selectedDoc && (
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    selectedDoc.classification === 'RESTRICTED'
                      ? 'bg-red-500/10 text-red-300 border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                      : selectedDoc.classification === 'CONFIDENTIAL'
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                      : selectedDoc.classification === 'INTERNAL'
                      ? 'bg-blue-500/10 text-blue-300 border-blue-500/40 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                      : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  }`}
                >
                  {selectedDoc.classification || 'INTERNAL'}
                </span>
              )}
            </div>

            {selectedDoc ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-[#D9FCED] leading-snug break-words">
                    {selectedDoc.name || selectedDoc.filename || 'Untitled Document'}
                  </h3>
                  <div className="text-xs text-[#D9FCED]/70 mt-1 font-mono flex items-center gap-1">
                    Owning Department: <span className="text-[#09BBC8] font-bold">{selectedDoc.department || 'General'}</span>
                    {selectedDoc.isAuxiliary && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#3B3664]/80 text-[#D9FCED]/60 border border-[#09BBC8]/20">
                        Auxiliary Shard
                      </span>
                    )}
                  </div>
                </div>

                {/* Authorization Status */}
                <div className="p-3.5 rounded-xl bg-[#3B3664]/60 border border-[#09BBC8]/25 text-xs flex items-center justify-between shadow-inner">
                  <span className="text-[#D9FCED]/70 font-mono">Clearance Status:</span>
                  {isAuthorized(selectedDoc.classification) ? (
                    <span className="flex items-center gap-1.5 text-emerald-400 font-bold font-mono">
                      <CheckCircle2 className="w-4 h-4" /> AUTHORIZED
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-red-400 font-bold font-mono">
                      <Lock className="w-4 h-4" /> ACCESS DENIED
                    </span>
                  )}
                </div>

                {/* Vector Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-[#3B3664]/60 border border-[#09BBC8]/20">
                    <div className="text-[#D9FCED]/60 text-[10px] uppercase">Vector Chunks</div>
                    <div className="text-base font-black text-[#D9FCED] mt-0.5">{selectedDoc.chunkCount || 3}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#3B3664]/60 border border-[#09BBC8]/20">
                    <div className="text-[#D9FCED]/60 text-[10px] uppercase">Radar Track</div>
                    <div className="text-xs font-bold text-[#09BBC8] mt-1">L2 Scoped</div>
                  </div>
                </div>

                <div className="text-xs text-[#D9FCED]/75 leading-relaxed font-sans bg-[#07240F]/80 p-3 rounded-xl border border-[#09BBC8]/20">
                  {isAuthorized(selectedDoc.classification)
                    ? 'This asset is indexed into your active retrieval scope. Queries from your role evaluate chunks from this partition.'
                    : 'This document is quarantined outside your role boundary. Retrieval queries targeting this asset will be deterministically blocked.'}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-[#D9FCED]/60 text-xs">
                Select a 3D document in the radar vault to inspect classification metadata and vector scope.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#09BBC8]/20 flex items-center justify-between text-[11px] font-mono text-[#D9FCED]/70">
            <span className="flex items-center gap-1 text-[#09BBC8] font-bold">
              <Radar className="w-3 h-3 animate-spin" /> 3D RADAR TELEMETRY
            </span>
            <span>{displayItems.length} ACTIVE PARTITIONS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
