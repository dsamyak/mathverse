# MathVerse™ — Product Requirements Document (PRD)

**A 3D Virtual World for Grade-wise Mathematics Mastery**
Powered by the Intellia 360 Learning Framework ("Play. Learn. Evolve.")

| | |
|---|---|
| **Document owner** | Product / IntelliaSG |
| **Version** | 1.0 (Draft) |
| **Date** | July 2026 |
| **Status** | For review |

---

## 1. Note on Source Material

This PRD is built from two inputs:

1. **intelliasg.com** — Intellia 360's public site, brand promise ("Play. Learn. Evolve"), and pedagogy pillars: *Concept-Driven Learning, Learning Through Real Life, Truly Personalised Learning, Collaborative Excellence, Curiosity & Growth Mindset* — plus existing products **Math Program** (course catalog), **ThinkTales** (story-based learning), **IntelliaPlay** (educational games), **Student Dashboard**, and **Intellia AI** (mobile companion app).
2. **github.com/dsamyak repositories** — GitHub blocks automated crawling of profile/repo listings for bots (`robots.txt` disallow), so I could not directly enumerate the repos from this environment. To translate specific existing modules (quiz engines, question banks, curriculum JSON, game logic, etc.) 1:1 into MathVerse, please either paste the repo names/READMEs or grant a zip/export — I will map each one to a 3D "Region" below. In the meantime, this PRD uses a **standard Grade 1–10 math curriculum taxonomy** (Number Systems, Arithmetic, Fractions & Decimals, Geometry, Algebra, Mensuration, Data Handling, Trigonometry) as the placeholder module map, structured so it's a drop-in fit once your real module/skill list is provided.

---

## 2. Vision

> **MathVerse is Intellia 360's "Play. Learn. Evolve." promise made spatial.**
> Instead of scrolling through lessons, a student **walks, flies, and unlocks their way through mathematics** — one grade, one region, one concept-temple at a time.

Every grade becomes an **island/realm** in a persistent 3D universe. Every mathematical concept becomes a **structure, portal, or NPC challenge** inside that realm. Mastery of a concept (via Intellia's concept-driven assessment) physically **unlocks** the next area of the map — turning curriculum progress into visible, explorable territory.

MathVerse is not a replacement for the Math Program — it is the **3D front door and motivational layer** that sits on top of Intellia's existing concept library, ThinkTales narratives, IntelliaPlay mini-games, and Student Dashboard analytics.

---

## 3. Problem Statement

- Traditional online math courses are **flat**: a list of videos/quizzes with no sense of place, journey, or accomplishment beyond a progress bar.
- Students disengage when progress feels abstract ("62% complete") rather than **spatial and visible** ("I've unlocked the Fractions Archipelago").
- Intellia already has strong concept-driven pedagogy (Math Program), narrative content (ThinkTales) and games (IntelliaPlay) — but they live in **separate silos** with no unifying experiential layer.
- Competing "gamified" math products (e.g., Prodigy-style) gamify with generic RPG skins, not a coherent **world tied to real curriculum architecture and mastery gating**.

## 4. Goals & Success Metrics

### 4.1 Product Goals
1. Increase weekly active learning time per student by making progression visually rewarding.
2. Increase concept mastery completion rate (fewer drop-offs mid-topic).
3. Unify Math Program + ThinkTales + IntelliaPlay + Student Dashboard into one explorable experience.
4. Provide teachers/parents a legible map of a child's real progress (region unlocked = grade-level mastery reached).

### 4.2 KPIs (first 2 quarters post-launch)
| Metric | Target |
|---|---|
| Weekly active session length | +30% vs. current Math Program |
| Concept mastery completion (per module) | +25% |
| 4-week retention | +20% |
| Parent/teacher dashboard weekly views | +40% |
| NPS from students (in-app pulse survey) | ≥ 60 |
| Average FPS on mid-tier laptop/Chromebook | ≥ 45 fps |
| Average FPS on mid-tier mobile (fallback mode) | ≥ 30 fps |

---

## 5. Target Users & Personas

| Persona | Description | Needs from MathVerse |
|---|---|---|
| **Student (Grade 1–5)** | Early learner, short attention span | Bright, playful, low-text world; big rewards; simple controls (click-to-move) |
| **Student (Grade 6–10)** | Exam-focused, more independent | Deeper concept trees, algebra/geometry realms, competitive leaderboards, boss-battle style assessments |
| **Parent** | Wants proof of progress, not just screen time | Clear region-unlock map, weekly summary, time-on-task vs. mastery correlation |
| **Teacher/Tutor (Intellia instructor)** | Manages multiple students, needs to assign work | Ability to assign specific regions/skill-nodes, view class heatmap of mastery gaps |
| **Intellia Admin** | Manages content, curriculum mapping | CMS to add/edit skill nodes, questions, 3D assets per grade without redeploying the app |

---

## 6. Core Concept — The World Model

```
MATHVERSE (persistent 3D universe)
 └── Grade Realm (e.g., "Grade 4 — The Fraction Isles")
      └── Concept District (e.g., "Equivalent Fractions Grove")
           └── Skill Node / Portal (e.g., "Simplifying Fractions")
                └── Learning Experience (explainer + practice + ThinkTales story beat)
                └── Mastery Gate (IntelliaPlay-style mini-game or quiz)
           └── ... more Skill Nodes
      └── Realm Boss / Capstone Challenge (unlocks next Grade Realm)
```

- **Grade Realms** are visually distinct biomes (e.g., Grade 1 = "Counting Cove," Grade 6 = "Algebra Ascent," Grade 9 = "Trigonometry Tundra") so students always know *where* they are in the curriculum, and can see *what's ahead* in the distance (locked, fogged, or silhouette-only) as motivation.
- **Concept Districts** are the existing Math Program modules (concept-driven units), skinned as landmarks (a "Fraction Bridge," a "Geometry Temple," an "Algebra Tower").
- **Skill Nodes** are the atomic lesson+practice+assessment unit already in Intellia's system — visualized as a small portal/kiosk/NPC the avatar walks up to.
- **Mastery Gates**: passing the assessment (aligned to Intellia's existing quiz/skill-check logic) is what visually breaks a barrier, lights a bridge, or opens a gate to the next district/realm — tying game feedback 1:1 to real mastery, not time spent.

---

## 7. Feature Requirements

### 7.1 Onboarding & Avatar
- FR-1: Student creates a profile & customizable 3D avatar (grade-appropriate outfits/skins earned as rewards, not paywalled).
- FR-2: Diagnostic placement (reuses Intellia's existing assessment logic) determines starting Realm and any "bridge" remedial nodes.
- FR-3: Guided first-journey tutorial (a ThinkTales-style narrator/companion — "Intellia AI" companion made visual as a 3D guide character) walks the student through movement, camera, and first Skill Node.

### 7.2 World Navigation ("The Journey")
- FR-4: Free-roam movement within an unlocked Realm (WASD/joystick/click-to-move for accessibility).
- FR-5: **World Map view** — zoomed-out isometric view of all Realms, showing locked/unlocked/in-progress/mastered status per region and per skill node (this is the 3D analog of the existing Student Dashboard progress view).
- FR-6: **Guided Camera Journey** mode — an optional cinematic fly-through (see §9) for students who prefer a directed path instead of free-roam; toggled per student/parent preference.
- FR-7: Fast travel between previously-unlocked Realms/Districts (a portal/teleport hub), so returning students aren't forced to re-walk old ground.

### 7.3 Learning & Assessment
- FR-8: Each Skill Node presents: (a) concept explainer (short animation/visual, tied to Intellia's "why before how" pedagogy), (b) guided practice, (c) mastery check (adaptive difficulty).
- FR-9: ThinkTales narrative beats appear as story cutscenes/dialogues at key nodes, contextualizing "real life" application (per Intellia's "Learning Through Real Life" pillar).
- FR-10: IntelliaPlay mini-games are embedded as the mastery-gate challenge for select nodes (e.g., a fraction-matching game as the gate to the next district).
- FR-11: Adaptive difficulty/personalization: struggling students get remedial "bridge" nodes spawned automatically; advanced students can skip via a challenge-out test.
- FR-12: Mistakes trigger supportive, non-punitive feedback (aligned to "Confidence" pillar) — no visual "failure" states, only "try again" reframes.

### 7.4 Progression, Rewards & Social
- FR-13: XP, badges, and cosmetic unlocks (avatar gear, pet/companion creatures, Realm decorations) tied strictly to mastery events, not time-in-app.
- FR-14: Realm-unlock ceremony: short celebratory cinematic (GSAP-driven camera + particle FX) when a student completes a Grade Realm's capstone.
- FR-15: Optional collaborative/competitive layer: class leaderboards, co-op challenge rooms, "study buddy" avatars visible in shared districts (per "Collaborative Excellence" pillar) — must be moderated/safe (no open chat with strangers; preset reactions/emotes only for younger grades).
- FR-16: Curiosity extensions: optional "explore" side-content (easter-egg puzzles, optional advanced topics) that don't block core progression — supports "Curiosity & Growth Mindset" pillar.

### 7.5 Dashboards & Admin
- FR-17: **Student Dashboard (3D-aware)**: extends existing Intellia dashboard with a mini 3D world-map widget, mastery-by-district heatmap, time-on-task vs. mastery correlation.
- FR-18: **Parent view**: weekly digest email/notification ("Your child unlocked the Geometry Temple this week"), plain-language mastery summary.
- FR-19: **Teacher/Admin console**: assign specific Realms/Districts/Nodes to a student or class; view class-wide mastery heatmap across the world map; author/edit skill nodes and question banks (CMS), attach/replace 3D assets per node without app redeploy.
- FR-20: Content authoring must allow non-engineers (curriculum team) to add a new Skill Node (question set + explainer + optional 3D asset swap) via CMS forms — no direct code changes required for routine curriculum updates.

### 7.6 Accessibility & Safety
- FR-21: Full keyboard navigation + screen-reader-friendly text mode (a "2D/Text mode" fallback that mirrors all learning content without requiring 3D navigation, for low-end devices or accessibility needs).
- FR-22: Colorblind-safe palettes, subtitle/caption option for all narrated content, adjustable text size and reduced-motion mode (disables camera shake/parallax for motion sensitivity).
- FR-23: COPPA/GDPR-K compliant data handling (see TRD §14); no open text chat for under-13 users; no location or unnecessary PII collection.
- FR-24: Session time nudges (gentle "great job, take a break!" prompts) — supports healthy usage rather than addictive engagement loops.

---

## 8. The 3D Journey Experience (Narrative Walkthrough)

> This section describes the *felt experience* a student goes through — the "proper 3D journey" requested.

**Scene 1 — Arrival.**
The student logs in to a soft-focus title screen: a distant, glowing archipelago floating in a starry-mathematical sky (numbers and shapes drifting like constellations). Camera slowly pushes in (GSAP timeline) toward a central floating "Home Hub" island. Their avatar materializes on a launch platform.

**Scene 2 — The Companion Greets You.**
A friendly 3D companion creature (the visual form of "Intellia AI") flies in, greets the student by name, and gives a one-line framing: *"Every grade is an island. Every idea you master builds a bridge to the next."* This is the guided-tutorial moment (FR-3).

**Scene 3 — The World Map Reveal.**
Camera rises to a bird's-eye view of MathVerse: the student's current Grade Realm is lit and detailed; realms below are marked "Mastered" (with a checkmark monument); realms ahead are visible but shrouded in fog/silhouette — visible enough to entice, not enough to spoil ("what's coming"). This is the persistent home base the student returns to after every session.

**Scene 4 — Entering a Realm.**
Selecting the current Realm triggers a swoop-in camera transition (GSAP + R3F camera rig) landing the avatar at the Realm's entrance gate. The biome reflects the grade's "theme" (e.g., Grade 3 = "Multiplication Marsh" with lily-pad stepping stones each representing a times-table; Grade 7 = "Algebra Archipelago" with rope-bridges you build by solving for x).

**Scene 5 — Walking to a Concept District.**
Free-roam or path-guided movement takes the student to the next unlocked District landmark (a temple, tower, tree-house, or machine). Locked districts appear as silhouettes behind a shimmering barrier with a small padlock/mist particle effect — visually communicating "not yet, but close."

**Scene 6 — The Skill Node.**
Approaching a Node NPC/kiosk triggers a UI overlay (React component docked over the 3D scene, not a separate page — the world stays visible/blurred behind) presenting the concept explainer, then practice questions, then the mastery check.

**Scene 7 — The Mastery Gate.**
Passing the check: a visible in-world event fires — a bridge extends, a gate glows and opens, a firework/particle burst plays, XP counter ticks up, and (if it's the Realm's final node) the capstone "Realm Boss" challenge unlocks.

**Scene 8 — The Capstone & Unlock Ceremony.**
Completing the Realm's capstone (a bigger IntelliaPlay-style challenge or ThinkTales narrative finale) triggers the big cinematic: camera pulls back to World Map view, fog lifts off the *next* Grade Realm in real time, a new landmass rises from the sea/cloud with light rays, and the companion delivers a congratulatory line. This is the core dopamine-and-motivation moment of the whole product.

**Scene 9 — Return & Persistence.**
On next login, the student re-spawns at their last unlocked location, sees exactly what they've built, and can revisit any mastered district (for review) or continue the frontier. The World Map always shows "you are here" plus "here's what's next," making the abstract curriculum concrete and spatial.

---

## 9. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | ≥45 fps desktop / ≥30 fps mobile fallback; initial load < 5s to interactive Home Hub (progressive asset streaming) |
| Device support | Modern desktop/laptop browsers (Chrome, Edge, Safari, Firefox); tablets; Chromebooks; graceful 2D/text fallback for low-end devices |
| Accessibility | WCAG 2.1 AA where applicable to the 2D fallback UI; full keyboard nav; reduced motion mode |
| Safety/Privacy | COPPA/GDPR-K compliant; no open chat for <13; encrypted data at rest/in transit |
| Localization | Text externalized for future multi-language support (Intellia serves international learners) |
| Offline resilience | Session state cached locally; auto-resume on reconnect (no lost progress on drop) |
| Scalability | Support concurrent classroom sessions (30+ students in shared district instance) without server-side 3D rendering (client-rendered, server = state/progress only) |

---

## 10. Assumptions & Dependencies

- Assumes reuse of Intellia's existing **question bank, mastery-scoring logic, and user auth/dashboard backend** rather than rebuilding from scratch — pending access to the actual `dsamyak` GitHub repos to confirm exact module boundaries and data schemas (currently blocked by GitHub's robots.txt for automated access from this session).
- Assumes ThinkTales and IntelliaPlay content can be embedded/re-skinned rather than rebuilt.
- Assumes Intellia AI's existing recommendation/personalization logic can be exposed via API for the adaptive-node logic in MathVerse.
- 3D asset production (Spline/Blender) is a new content pipeline for Intellia and will need either an in-house 3D artist or an asset-store-sourced style guide (see TRD §9).

## 11. Out of Scope (Phase 1)

- VR/headset support (design should not preclude it later, but Phase 1 is browser/desktop/tablet only).
- Full open-world multiplayer chat/voice.
- Native mobile app rebuild (Phase 1 is responsive web; native wrapper considered Phase 3).
- Subjects beyond Math (Science/English realms are a plausible Phase 3+ expansion of the same engine).

## 12. Roadmap (Proposed Phases)

| Phase | Scope |
|---|---|
| **Phase 0 — Foundations** | Data model, CMS for skill nodes, auth/dashboard integration, 1 pilot Grade Realm (e.g., Grade 4) fully built end-to-end |
| **Phase 1 — MVP Launch** | 3–4 Grade Realms, World Map, avatar system, mastery gating, parent/teacher dashboards |
| **Phase 2 — Full Curriculum** | All Grade Realms (1–10), full ThinkTales/IntelliaPlay integration, social/leaderboard layer |
| **Phase 3 — Expansion** | Mobile app wrapper, additional subjects, VR exploration, advanced AI companion (conversational tutoring) |

---

*Next: see the companion **MathVerse_TRD.md** for architecture, tech stack implementation, data models, and 3D engineering approach.*
