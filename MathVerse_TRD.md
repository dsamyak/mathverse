# MathVerse™ — Technical Requirements Document (TRD)

**Companion to MathVerse_PRD.md**

| | |
|---|---|
| **Document owner** | Engineering / IntelliaSG |
| **Version** | 1.0 (Draft) |
| **Date** | July 2026 |
| **Status** | For review |

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
│  ┌───────────────┐  ┌──────────────────────────────────────────┐ │
│  │ React App Shell│  │        3D World Layer (R3F Canvas)       │ │
│  │ (routing, auth,│  │  Three.js scene graph, camera rig,       │ │
│  │  UI overlays,  │◄─┤  Grade Realms, Districts, Skill Nodes,   │ │
│  │  Tailwind UI)  │  │  avatar controller, GSAP timelines        │ │
│  └───────┬───────┘  └───────────────┬──────────────────────────┘ │
│          │ Zustand (shared client state: user, progress, world) │
│          │ React Query (server cache)                            │
└──────────┼────────────────────────────────────────────────────────┘
           │  REST / GraphQL over HTTPS
┌──────────▼────────────────────────────────────────────────────────┐
│                        BACKEND SERVICES                            │
│  Auth Service │ Progress/Mastery Service │ Content/CMS Service     │
│  Adaptive Engine (recommendation) │ Assessment Engine │ Analytics  │
└──────────┬──────────────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────────────┐
│  Data Layer: PostgreSQL (users, progress, mastery) │               │
│  Object Storage/CDN: GLTF/GLB models, textures, HDRI (3D assets)   │
│  Redis (session cache, leaderboards) │ Analytics warehouse          │
└──────────────────────────────────────────────────────────────────────┘
```

Design principle: **all 3D rendering happens client-side**. The server never renders or streams video — it only serves (a) compact scene/content descriptors (JSON) and (b) static 3D asset files via CDN, plus (c) progress/mastery state. This keeps hosting cost and latency low and lets the experience scale like a normal web app.

---

## 2. Tech Stack

### 2.1 Frontend (as specified + required additions)

| Layer | Technology | Purpose |
|---|---|---|
| UI framework | **React.js** (v18+, Vite build) | App shell, routing, forms, overlays |
| 3D engine | **Three.js** | Underlying WebGL 3D rendering |
| 3D-React bridge | **React Three Fiber (R3F)** | Declarative Three.js scene graph as React components |
| 3D helpers | **@react-three/drei** | Camera controls, `<Html>` overlays, `useGLTF`, environment/HDRI, LOD, `Stats`, `PositionalAudio`, `Sparkles`, portals |
| Physics/interaction (add) | **@react-three/rapier** or **cannon-es** | Simple collision (avatar vs. barriers, ground) |
| Styling | **Tailwind CSS** | All 2D UI overlays (menus, quiz cards, dashboard) |
| Animation | **GSAP** (+ `ScrollTrigger`/custom timelines) | Cinematic camera moves, UI transitions, unlock ceremonies, particle-adjacent tweens |
| 3D content authoring | **Spline** (design tool) → exported as `.glb`/`.gltf`, or via `@splinetool/react-spline` for select standalone scenes (e.g., title screen) | Rapid, designer-friendly 3D asset & scene creation without hand-coding geometry |
| Global state | **Zustand** | Avatar position, current realm/district/node, UI mode (world/quiz/cutscene) |
| Server cache | **TanStack Query (React Query)** | Fetching/caching progress, content, leaderboard data |
| Routing | **React Router** | `/hub`, `/realm/:id`, `/district/:id/node/:id`, `/dashboard` |

### 2.2 Backend

| Layer | Technology | Purpose |
|---|---|---|
| API layer | **Node.js + Express (or NestJS)** | REST/GraphQL API for progress, content, auth |
| Auth | **JWT + refresh tokens**, OAuth for parent/teacher SSO if needed | Session management, role-based access (student/parent/teacher/admin) |
| Database | **PostgreSQL** | Relational data: users, grades, realms, districts, nodes, questions, progress, mastery events |
| Cache/session | **Redis** | Session state, leaderboard sorted sets, rate limiting |
| Object storage | **AWS S3 / Cloudflare R2** | 3D asset files (glb, textures, hdri), served through CDN |
| CDN | **Cloudflare / CloudFront** | Global low-latency delivery of 3D assets |
| CMS | **Headless CMS (Strapi or custom admin panel)** | Non-engineer authoring of Skill Nodes, questions, explainer content |
| Adaptive engine | **Python microservice (FastAPI)** or Node service | Mastery scoring, difficulty adaptation, remedial-node recommendation |
| Analytics | **PostHog / Mixpanel** + data warehouse (BigQuery) | Engagement, funnel, mastery analytics feeding PRD KPIs |
| Hosting | **Vercel (frontend)** + **AWS/GCP (backend, DB)** | CI/CD-friendly split deployment |

---

## 3. 3D World Architecture

### 3.1 Scene Hierarchy (R3F component tree)

```
<Canvas>
  <WorldProvider>                     // Zustand-backed context: current realm/district/node
    <CameraRig />                     // Switches between FreeOrbit / FollowAvatar / CinematicPath
    <Lighting />                      // Environment + directional light per biome
    <Suspense fallback={<Loader3D/>}>
      <ActiveRealm>                   // Lazy-loaded per grade (code-split GLBs)
        <RealmTerrain />              // Ground, water, skybox (per-biome theme)
        <DistrictGroup>               // One per concept module
          <DistrictLandmark />        // The temple/tower/bridge mesh (from Spline/Blender)
          <LockBarrier locked={bool}/>// Shimmer/fog shader plane, removed on unlock
          <SkillNodePortal onEnter={openNodeUI} />
        </DistrictGroup>
        <CapstoneBoss />              // Realm-completion structure/NPC
      </ActiveRealm>
      <Avatar controller="keyboard|touch|pathfollow" />
      <CompanionNPC />                // Intellia AI guide, follows/leads avatar
      <ParticleFX />                  // Unlock bursts, ambient sparkles (drei <Sparkles/>)
    </Suspense>
  </WorldProvider>
  <Preload all />
</Canvas>

<!-- Sibling DOM layer, NOT inside Canvas -->
<UIOverlayRoot>                       // Tailwind React components
  <WorldMapModal />
  <SkillNodeQuizPanel />
  <HUD xp={..} mastery={..} />
  <DashboardRoutes />
</UIOverlayRoot>
```

- Each **Grade Realm** is its own dynamically `import()`-ed React module + its own `.glb` bundle, so students only download the realm they're currently in (route-based + asset code-splitting). This keeps initial load light (PRD NFR: <5s to interactive).
- **In-canvas UI** (e.g., a floating "!" above a Skill Node) uses `drei`'s `<Html>` for cheap DOM-in-3D labels; **heavy UI** (quiz panels, dashboards) is rendered as normal sibling DOM over a blurred/dimmed canvas — better performance and accessibility (screen readers can't reach WebGL canvas content).

### 3.2 Camera System — Powering "The Journey"

Three camera modes, all built on `drei`'s `CameraControls` + custom GSAP tweens:

1. **CinematicPath** — used for scripted moments (arrival, world-map reveal, realm-unlock ceremony). Implemented as a `THREE.CatmullRomCurve3` path; GSAP tweens a `progress` value from 0→1 each frame via `onUpdate`, sampling `curve.getPointAt(t)` for camera position and `curve.getTangentAt(t)` (or a lookAt target curve) for orientation. This gives smooth, designer-authored fly-throughs (Spline can also export a camera path directly, reducing hand-coding).
2. **FollowAvatar** — third-person spring-follow camera (lerped position/rotation behind avatar) for free-roam exploration within a District.
3. **FreeOrbit** — `drei`'s `<OrbitControls>`/`<CameraControls>` for the World Map bird's-eye view, letting students/parents rotate and inspect the map of realms.

Transitions between modes (e.g., FollowAvatar → CinematicPath on entering a Skill Node) are cross-faded with a GSAP timeline that also drives a UI blur/dim overlay, so the mode switch feels intentional, not jarring.

### 3.3 Asset Pipeline (Spline / Blender → Runtime)

1. Artists build biome landmarks, avatar rigs, and companion creature in **Spline** (fast iteration, exports directly to React via `@splinetool/react-spline` for simple standalone scenes, e.g. login screen) or **Blender** (for anything needing custom rigging/animation/vertex-level control).
2. Export to **glTF/GLB**, run through **`gltfpipeline`/`gltf-transform`** for:
   - Draco geometry compression
   - KTX2/Basis texture compression
   - LOD generation (2–3 levels per model)
3. Store optimized `.glb` in S3/R2, versioned by content-hash filename for cache-busting.
4. Runtime loads via `useGLTF` (drei) with `useGLTF.preload()` on route-adjacent realms (preload the *next* likely realm while student finishes the current one).
5. Texture/asset budget per Realm: target ≤ 15MB compressed, to hit the <5s interactive NFR on typical school broadband.

### 3.4 Performance Techniques

- **Instancing** (`InstancedMesh` via drei's `<Instances>`) for repeated small props (trees, numeral rocks, coins/XP orbs).
- **Frustum culling** (default in Three.js) + manual `visible` toggling for off-screen Districts.
- **LOD** (`drei`'s `<Detailed>`) for landmarks viewed from World Map distance vs. up-close.
- **Adaptive quality**: detect device tier (via `navigator.hardwareConcurrency`, WebGL renderer string, or a quick FPS probe on load) → auto-select "High/Medium/Low" asset+shadow settings; expose manual override in Settings.
- **2D/Text Fallback Mode** (PRD FR-21): a fully-functional non-3D version of the same content tree (same data model, different renderer) for low-end devices/screen-reader users — reuses all backend/content APIs, swaps only the presentation layer.

---

## 4. Data Model

```
Grade (id, number, name, theme_biome, unlock_order)
  └── Realm (id, grade_id, display_name, description, asset_bundle_url, capstone_id)
        └── District (id, realm_id, concept_name, landmark_asset_id, unlock_rule)
              └── SkillNode (id, district_id, title, explainer_content_id,
                             thinktales_story_id, question_set_id,
                             mastery_threshold, difficulty_tier)
Question (id, skill_node_id, type[mcq|numeric|drag-drop], payload_json, difficulty)
StudentProgress (student_id, skill_node_id, status[locked|available|in_progress|mastered],
                  attempts, best_score, mastery_achieved_at)
MasteryEvent (id, student_id, skill_node_id, score, timestamp, adaptive_flags)
AvatarProfile (student_id, cosmetics_json, xp_total, badges[])
RealmUnlock (student_id, realm_id, unlocked_at)
User (id, role[student|parent|teacher|admin], grade_level, linked_ids)
ClassAssignment (teacher_id, class_id, assigned_nodes[], due_dates)
```

Unlock rule (`District.unlock_rule` / `Realm.capstone_id`) is evaluated server-side by the **Progress Service** whenever a `MasteryEvent` is written — the client never unlocks content client-side-only (prevents cheating by tampering with local state); the client polls/subscribes for updated `StudentProgress` and re-renders the world accordingly.

---

## 5. Backend / API Design (representative endpoints)

```
POST /auth/login
GET  /world/map?studentId=              → realms + districts + lock status
GET  /realm/:id                         → district list, asset bundle manifest
GET  /skillnode/:id                     → explainer content, question set, thinktales beat
POST /skillnode/:id/attempt             → { answers } → { score, mastered, newUnlocks[] }
GET  /student/:id/progress
GET  /student/:id/dashboard             → mastery heatmap, xp, badges, time-on-task
GET  /class/:id/heatmap                 (teacher)
POST /cms/skillnode                     (admin) create/edit node + question bank
POST /cms/asset                         (admin) upload/replace glb/texture, versioned
GET  /leaderboard/:scope                → class/realm/global rank (opt-in, moderated)
```

- **Adaptive Engine** is called internally by the `attempt` endpoint: given the mastery history, it returns whether to (a) mark mastered, (b) serve a remedial bridge node next, or (c) offer a "challenge out" skip-ahead option.
- All endpoints require role-scoped JWT; student-mutating endpoints (attempt submission) are rate-limited and validated server-side (never trust client-submitted "mastered" flags).

---

## 6. Animation & Interaction System

- **GSAP** drives all *choreographed* motion: camera cinematics (§3.2), UI panel enter/exit, unlock-ceremony particle/light sequences, HUD counters (XP tick-up), avatar cosmetic reveal.
- **R3F `useFrame`** drives all *continuous/physics-like* motion: avatar movement/physics step, companion NPC idle/float animation, ambient particle drift, shader time-uniforms (e.g., shimmering lock barrier).
- **Rule of thumb:** if it's triggered by an event and has a defined start/end (unlock ceremony, panel open), it's GSAP; if it's per-frame simulation (movement, physics, continuous idle motion), it's `useFrame`/Rapier.
- Avatar controller: keyboard (WASD/arrows) + on-screen virtual joystick (touch) + optional "click-to-move" (NavMesh-based pathfinding via `three-pathfinding` for younger grades/accessibility) — all three map to the same underlying velocity/target-position state so behavior is consistent across input methods.

---

## 7. Assessment & Mastery Engine

- Reuses/extends Intellia's existing question-bank & scoring logic (pending integration once repo access/API contract is confirmed).
- `mastery_threshold` per node (e.g., 80% correct across a minimum question count, with spaced-repetition-style follow-up checks over subsequent sessions to confirm retention, not just single-session correctness).
- Adaptive difficulty: question `difficulty_tier` served dynamically based on rolling performance (simple Elo-like adjustment or a rules-based ladder — start simple, evolve to ML-based personalization in Phase 3, consistent with Intellia AI's personalization ambitions).
- All assessment logic runs **server-side**; the 3D client only ever displays questions and submits answers — no scoring/answer-key logic ships to the browser (prevents inspection/cheating).

---

## 8. State Management Detail (Zustand store shape)

```ts
interface WorldState {
  currentRealmId: string;
  currentDistrictId: string | null;
  cameraMode: 'cinematic' | 'follow' | 'orbit';
  avatarPosition: [number, number, number];
  uiMode: 'world' | 'quiz' | 'dashboard' | 'cutscene';
  progress: Record<string /*skillNodeId*/, ProgressStatus>;
  setCameraMode: (mode) => void;
  enterSkillNode: (nodeId: string) => void;
  applyUnlocks: (newUnlocks: Unlock[]) => void; // called after server response
}
```

Progress/content data itself lives in **React Query** cache (server-driven, cache-invalidated on mutation); Zustand only holds *client-only, ephemeral* world/UI state — avoids the common R3F pitfall of duplicating server state in two places.

---

## 9. Content Pipeline for Non-Engineers (CMS)

To satisfy PRD FR-20 (curriculum team can add content without code changes):

1. Admin panel (Strapi or custom Next.js admin) exposes forms for: Skill Node metadata, question authoring (MCQ/numeric/drag-drop builder), explainer text/video upload, ThinkTales story-beat linking.
2. 3D asset swap: admin uploads a `.glb` for a District landmark; system validates poly-count/file-size budget (§3.3) before publishing; a staging preview (embedded R3F canvas in the admin panel itself) lets the curriculum/art team see the asset in-context before going live.
3. Content changes publish via a simple "Publish" action that invalidates the relevant CDN/cache keys — no app redeploy needed for routine content updates (only engine/feature changes require redeploy).

---

## 10. Accessibility Implementation Notes

- 2D/Text Fallback Mode shares the same `SkillNode`/`Question` data via API — implemented as an alternate top-level route tree, not a compromised 3D mode.
- Reduced-motion: a global toggle disables camera shake/parallax/auto-cinematics and swaps unlock "ceremony" cinematics for a static celebratory screen with the same information.
- Captions/subtitles: all narrated/ThinkTales audio ships with a WebVTT track, rendered via a Tailwind-styled caption bar over the canvas.
- Keyboard-only play fully supported: Tab/Enter can navigate the World Map's district list (an accessible DOM list mirrors the 3D map for keyboard/screen-reader users) as an alternative to clicking in 3D space.

---

## 11. Security & Compliance

- COPPA/GDPR-K: minimal PII collection for student accounts (first name/nickname + grade + guardian email only); guardian consent flow at signup for under-13 users.
- No open-text chat between students; social features limited to preset emotes/reactions and asynchronous leaderboards.
- All traffic over HTTPS/TLS; JWT short-lived access tokens + httpOnly refresh cookies.
- Server-authoritative mastery/unlock logic (see §5, §7) to prevent client-side tampering.
- Regular dependency and content-moderation audits for any user-generated content (e.g., avatar name fields — profanity filtering).
- Data retention/delete-on-request workflows for guardian-initiated account deletion.

---

## 12. DevOps

| Concern | Approach |
|---|---|
| CI/CD | GitHub Actions → build/test → deploy frontend to Vercel, backend to AWS/GCP (containerized, e.g., ECS/Cloud Run) |
| Environments | dev / staging / production, with staging used for CMS content preview before publish |
| Asset CDN | Cloudflare/CloudFront in front of S3/R2 bucket holding versioned `.glb`/texture files |
| Monitoring | Sentry (client + server error tracking), Grafana/Prometheus or CloudWatch (infra), PostHog (product analytics feeding PRD KPIs) |
| Load testing | k6 or Artillery against progress/assessment endpoints ahead of classroom-scale rollout (30+ concurrent students per class) |

---

## 13. Testing Strategy

- **Unit**: scoring/mastery logic, data model validators (Jest).
- **Component**: React UI overlays (Testing Library), R3F scene components smoke-tested with `@react-three/test-renderer` where practical.
- **Visual/perf regression**: Percy or Chromatic for key screens; Lighthouse/WebPageTest budget checks in CI for load-time NFR.
- **E2E**: Playwright — cover full journey (login → placement → enter realm → complete node → unlock event → dashboard reflects change).
- **Device matrix**: manual QA pass across a defined device tier list (low/mid/high-end laptop, Chromebook, tablet, mid-range Android/iOS) each release, checking FPS against NFR targets.

---

## 14. Open Items Requiring Your Input

1. **GitHub module mapping**: please share the specific `dsamyak` repo names/READMEs (or export access) so each existing module/engine (question bank format, scoring logic, any existing 3D/game code) can be mapped precisely into §4–§7 above instead of the placeholder generic curriculum taxonomy used here.
2. Confirm whether Intellia's existing backend (Student Dashboard, Math Program, Intellia AI) exposes an API we can integrate against, or whether MathVerse's backend should be net-new with a one-time data migration.
3. Confirm art-production plan: in-house 3D artist using Spline/Blender vs. licensed asset-store style kits for initial biome art.
4. Confirm Phase 1 grade scope (which specific grades launch first) to prioritize asset production.

---

*See companion **MathVerse_PRD.md** for product vision, feature requirements, and the full narrative walkthrough of the 3D journey experience.*
