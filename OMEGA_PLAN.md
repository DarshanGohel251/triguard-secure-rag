# 🛡️ TRIGUARD APEX — OMEGA POLISH MASTER PLAN
**Target**: National-Level Hackathon Live Demo (One-take, Projector, High-Stakes)  
**Execution Strategy**: Surgical, Non-Destructive, Demo-Proofing  
**Active Worktree Branches**: `frontend` -> `omega-polish` | `backend` -> `backend-omega-polish`

---

## 1. Architecture Summary
- **Frontend Core**: React 18 + TypeScript + Vite 8.3 + TailwindCSS + Lucide Icons + React Router DOM
- **3D & Motion Engine**: Three.js WebGL (`SpatialKnowledgeVault3D`, `SecurityConstellation3D`, `DefenseEngine3D`)
- **Backend Core**: Java 21, Spring Boot 3.3.4, Spring Security, JWT, Spring Data JPA, H2 In-Memory DB
- **Intelligence & RAG Layer**: Google Gemini Flash API (`gemini-flash-latest`, fallback chain), 768/1536-dim vector embeddings, Cosine similarity search, deterministic RBAC clearance pre-retrieval enforcement, 6-stage verifiable Decision Trace.
- **Auditing & Defense**: SHA-256 Ledger sync, Prompt Injection firewall, Security Event telemetry.

---

## 2. Identified Risks & Demo Hazards

| Risk ID | Hazard Description | Severity | Mitigation Strategy |
|---|---|---|---|
| **R1** | **Wi-Fi drop or Gemini API 429 Rate Limit on Stage** | 🔴 CRITICAL | Wrap LLM calls with hard 8s timeout, fallback to pre-cached demo queries (`demo-cache.json`) or deterministic context extraction; never throw HTTP 500/503. |
| **R2** | **Projector Contrast Washout** | 🟡 HIGH | High-contrast Deep Obsidian (`#080D16`), Electric Sapphire (`#405FFA`), Frozen Water (`#D9FCED`), Strong Cyan (`#09BBC8`). Ensure text passes WCAG AA 4.5:1. |
| **R3** | **Jarring Blank/Spinner Async States** | 🟡 HIGH | Replace basic spinners with shimmering glassmorphic `<Skeleton>` primitives matching surface colors. |
| **R4** | **Uncontrolled 3D FPS Drops or GPU Lag** | 🟡 MEDIUM | Cap `devicePixelRatio` to 1.5, pause render loop on hidden tabs (`visibilitychange`), clean up Three.js geometries/materials on unmount. |
| **R5** | **Unhandled Promise Rejections / Console Red Spills** | 🟡 MEDIUM | Implement global Error Boundary, quiet error logger, and graceful API client retry wrapper. |

---

## 3. Targeted File Modification Rationale

### Phase 1 — Backend Resilience & Demo-Proofing
1. `backend/src/main/resources/demo-cache.json` — Pre-cached grounded responses for standard scripted demo queries.
2. `backend/src/main/java/com/triguard/backend/service/LlmService.java` — Timeout enforcement, fallback cache lookup, deterministic synthesis fallback, forced fallback env flag support (`DEMO_FORCE_FALLBACK`).
3. `backend/src/main/java/com/triguard/backend/dto/QueryResponse.java` — Add `mode` ("live" \| "fallback"), `fallbackReason`, and `cached` fields.
4. `backend/src/main/java/com/triguard/backend/controller/ApiController.java` — Add `GET /api/v1/health` endpoint, clean exception interceptor.
5. `backend/src/main/java/com/triguard/backend/security/GlobalExceptionHandler.java` — Global REST controller advice preventing raw stack traces.

### Phase 2 — Design System Primitives
1. `frontend/src/components/ui/MagneticButton.tsx` — Cursor pull & glow effect, keyboard focusable, reduced-motion compliant.
2. `frontend/src/components/ui/Skeleton.tsx` — Shimmering glassmorphic skeleton loader with variants (`text`, `card`, `table`, `stat`).
3. `frontend/src/components/ui/GlassCard.tsx` — Luminous cyan/sapphire border card with elevation.
4. `frontend/src/components/ui/Toast.tsx` + `frontend/src/context/ToastContext.tsx` — Non-blocking notification toasts for uploads, persona switches, security events.
5. `frontend/src/components/ui/CommandPalette.tsx` — Quick navigation (`Cmd+K` / `Ctrl+K`), instant demo queries, 1-click persona switching.

### Phase 3 & 4 — Cinematic Workspace & 6-Stage Trace
1. `frontend/src/pages/Ask.tsx` — Sequential animated Decision Trace reveal (min 200ms per stage), smooth typing answer reveal, cached response badge indicator (`[ RESILIENT CACHED MODE ]`).
2. `frontend/src/hooks/useSequentialReveal.ts` — Deterministic stage-by-stage pipeline reveal hook.
3. `frontend/src/components/layout/Layout.tsx` — Integrate `<ToastContainer>` and `<CommandPalette>`.

### Phase 5 & 6 — Stability, Console Silence & Performance
1. `frontend/src/components/common/ErrorBoundary.tsx` — Sleek "System Recalibrating" UI with retry.
2. Three.js components (`SpatialKnowledgeVault3D.tsx`, `DefenseEngine3D.tsx`) — Dispose geometries & pause animation loop when document hidden.

### Phase 7 — Demo Rehearsal Kit
1. `scripts/pre-demo-check.js` — Automated pre-flight health diagnostic script.
2. `DEMO_RUNBOOK.md` — 5-minute judge script, demo queries, persona switch flow, and offline fallback talking points.
3. `FLIGHT_CHECK.md` — Final evidence-based report.
