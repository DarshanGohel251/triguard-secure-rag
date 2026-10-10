import { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { FileText, Lock, CheckCircle2, Layers } from 'lucide-react';

export interface DocumentAsset {
  id?: number | string;
  name?: string;
  filename?: string;
  classification?: string;
  department?: string;
  chunkCount?: number;
  uploadedAt?: string;
  uploadDate?: string;
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
  height = 420,
  onSelectDocument
}: SpatialKnowledgeVault3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
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

  const docsToRender = useMemo(() => {
    return documents.length > 0 ? documents : [];
  }, [documents]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020713, 0.035);

    const width = container.clientWidth || 500;
    const h = typeof height === 'number' ? height : container.clientHeight || 420;

    const camera = new THREE.PerspectiveCamera(45, width / h, 0.1, 100);
    camera.position.set(0, 2.5, 9);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x0a162e, 1.4);
    scene.add(ambientLight);

    const vaultCoreLight = new THREE.PointLight(0x00f0ff, 3.0, 14);
    vaultCoreLight.position.set(0, 0, 0);
    scene.add(vaultCoreLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(6, 8, 8);
    scene.add(dirLight);

    // Master Group
    const vaultGroup = new THREE.Group();
    scene.add(vaultGroup);

    // Central Multi-Tiered Vault Core Structure
    const corePillarGeo = new THREE.CylinderGeometry(0.5, 0.7, 3.2, 16);
    const corePillarMat = new THREE.MeshStandardMaterial({
      color: 0x051329,
      metalness: 0.8,
      roughness: 0.2,
      wireframe: true
    });
    const corePillar = new THREE.Mesh(corePillarGeo, corePillarMat);
    vaultGroup.add(corePillar);

    // Core Quantum Luminous Ring
    const coreRingGeo = new THREE.TorusGeometry(0.9, 0.04, 16, 64);
    const coreRingMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.8 });
    const coreRing = new THREE.Mesh(coreRingGeo, coreRingMat);
    coreRing.rotation.x = Math.PI / 2;
    vaultGroup.add(coreRing);

    // Floating Concentric Spatial Rings (Representing Security Classification Tiers)
    const tiers = [
      { r: 2.2, color: 0x10b981, label: 'PUBLIC' },
      { r: 3.1, color: 0x00f0ff, label: 'INTERNAL' },
      { r: 4.0, color: 0xf59e0b, label: 'CONFIDENTIAL' },
      { r: 4.8, color: 0xef4444, label: 'RESTRICTED' }
    ];

    tiers.forEach((t) => {
      const ringGeo = new THREE.TorusGeometry(t.r, 0.015, 12, 80);
      const ringMat = new THREE.MeshBasicMaterial({ color: t.color, transparent: true, opacity: 0.25 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      vaultGroup.add(ring);
    });

    // 3D Document Modules Placement
    const docMeshes: { mesh: THREE.Mesh; doc: DocumentAsset; basePos: THREE.Vector3 }[] = [];
    const docBoxGeo = new THREE.BoxGeometry(0.75, 1.05, 0.08);

    if (docsToRender.length > 0) {
      docsToRender.forEach((doc, idx) => {
        const c = (doc.classification || 'INTERNAL').toUpperCase();
        let tierColor = 0x00f0ff;
        let radius = 3.1;

        if (c === 'RESTRICTED') {
          tierColor = 0xef4444;
          radius = 4.8;
        } else if (c === 'CONFIDENTIAL') {
          tierColor = 0xf59e0b;
          radius = 4.0;
        } else if (c === 'PUBLIC') {
          tierColor = 0x10b981;
          radius = 2.2;
        }

        const angle = (idx / Math.max(docsToRender.length, 1)) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = Math.sin(idx * 1.5) * 0.4;

        const docMat = new THREE.MeshPhysicalMaterial({
          color: tierColor,
          emissive: tierColor,
          emissiveIntensity: 0.25,
          roughness: 0.2,
          metalness: 0.5,
          transmission: 0.5,
          thickness: 0.5,
          transparent: true,
          opacity: 0.85
        });

        const docMesh = new THREE.Mesh(docBoxGeo, docMat);
        docMesh.position.set(x, y, z);
        docMesh.lookAt(0, y, 0); // Face outward from vault core

        // Wireframe perimeter outline for crisp edge definition
        const edgeGeo = new THREE.EdgesGeometry(docBoxGeo);
        const edgeMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
        const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
        docMesh.add(edgeLines);

        vaultGroup.add(docMesh);
        docMeshes.push({ mesh: docMesh, doc, basePos: new THREE.Vector3(x, y, z) });
      });
    } else {
      // Empty Vault Placeholder geometry
      const standbyGeo = new THREE.OctahedronGeometry(0.6, 0);
      const standbyMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true });
      const standbyMesh = new THREE.Mesh(standbyGeo, standbyMat);
      vaultGroup.add(standbyMesh);
    }

    // Raycaster for Pointer Selection
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

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Slow majestic rotation of entire vault
        vaultGroup.rotation.y += 0.002;
        coreRing.rotation.z += 0.01;

        // Animate floating document modules (gentle bobbing)
        docMeshes.forEach((item, idx) => {
          item.mesh.position.y = item.basePos.y + Math.sin(time * 1.5 + idx) * 0.12;
        });
      }

      // Raycast Hover Detection
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

    // Resize
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
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      docBoxGeo.dispose();
      corePillarGeo.dispose();
      corePillarMat.dispose();
      coreRingGeo.dispose();
      coreRingMat.dispose();
    };
  }, [docsToRender, height]);

  return (
    <div className="w-full bg-[#050C1B]/95 border border-cyan-500/25 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,240,255,0.08),transparent_70%)] pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-white/10 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono uppercase tracking-wider mb-2">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            3D Spatial Knowledge Vault • Hardware Accelerated WebGL
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Spatial Knowledge Vault
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Dimensional spatial visualization of classified document partitions orbiting the cryptographic knowledge core.
          </p>
        </div>

        {/* Clearance Scope Badge */}
        <div className="flex items-center gap-3 bg-slate-900/80 border border-white/10 px-4 py-2.5 rounded-2xl shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div className="flex flex-col text-xs font-mono">
            <span className="font-bold text-white">Clearance: {userRole}</span>
            <span className="text-slate-400 text-[11px]">Scope: {userDept} Dept</span>
          </div>
        </div>
      </div>

      {/* 3D Scene Viewport & Real-Time Document Inspector */}
      <div className="relative z-10 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* 3D WebGL Canvas (lg:col-span-8) */}
        <div className="lg:col-span-8 relative rounded-2xl bg-[#030814]/80 border border-white/10 overflow-hidden shadow-inner">
          <div ref={mountRef} className="w-full" style={{ height }} />

          {/* Interactive Legend in Viewport Bottom */}
          <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-950/80 border border-white/10 px-3.5 py-1.5 rounded-xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Public
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> Internal
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Confidential
              </span>
              <span className="flex items-center gap-1.5 text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-400" /> Restricted
              </span>
            </div>
            <span className="text-slate-500 hidden sm:inline">Click 3D slab to inspect</span>
          </div>

          {/* Hover Banner */}
          {hoveredDoc && (
            <div className="absolute top-3 left-4 px-3 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono backdrop-blur-md">
              Hovering: {hoveredDoc.name || hoveredDoc.filename} ({hoveredDoc.classification})
            </div>
          )}
        </div>

        {/* Selected Document Metadata Inspector (lg:col-span-4) */}
        <div className="lg:col-span-4 p-5 sm:p-6 rounded-2xl bg-[#060D1E]/95 border border-cyan-500/30 shadow-2xl flex flex-col justify-between h-full min-h-[360px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-cyan-400" />
                Vault Inspector
              </span>
              {selectedDoc && (
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    selectedDoc.classification === 'RESTRICTED'
                      ? 'bg-red-500/10 text-red-300 border-red-500/30'
                      : selectedDoc.classification === 'CONFIDENTIAL'
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      : selectedDoc.classification === 'INTERNAL'
                      ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                      : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {selectedDoc.classification || 'INTERNAL'}
                </span>
              )}
            </div>

            {selectedDoc ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white leading-snug break-words">
                    {selectedDoc.name || selectedDoc.filename || 'Untitled Document'}
                  </h3>
                  <div className="text-xs text-slate-400 mt-1 font-mono">
                    Owning Department: <span className="text-cyan-300">{selectedDoc.department || 'General'}</span>
                  </div>
                </div>

                {/* Authorization Status */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 text-xs flex items-center justify-between">
                  <span className="text-slate-400 font-mono">Clearance Status:</span>
                  {isAuthorized(selectedDoc.classification) ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-bold font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" /> AUTHORIZED
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-400 font-bold font-mono">
                      <Lock className="w-3.5 h-3.5" /> ACCESS DENIED
                    </span>
                  )}
                </div>

                {/* Vector Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                    <div className="text-slate-500 text-[10px] uppercase">Vector Chunks</div>
                    <div className="text-base font-black text-white mt-0.5">{selectedDoc.chunkCount || 3}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                    <div className="text-slate-500 text-[10px] uppercase">Partition</div>
                    <div className="text-xs font-bold text-cyan-300 mt-1">Scoped L2</div>
                  </div>
                </div>

                <div className="text-xs text-slate-400 leading-relaxed font-sans">
                  {isAuthorized(selectedDoc.classification)
                    ? 'This asset is indexed into your active retrieval scope. Queries from your role will evaluate chunks from this partition.'
                    : 'This document is quarantined outside your role boundary. Retrieval queries targeting this asset will be deterministically blocked.'}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                Select a 3D document in the vault to inspect classification metadata and vector scope.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>VAULT ENGINE: SPATIAL 3D</span>
            <span>{documents.length} ENROLLED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
