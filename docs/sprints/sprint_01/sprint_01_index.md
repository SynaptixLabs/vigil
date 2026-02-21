# Sprint 01 — Recording Engine

**Sprint window:** 2026-02-22 → 2026-02-24
**Goal:** Ship the core recording loop — after this sprint, FOUNDER can use Refine on Papyrus for real acceptance testing.
**Budget:** ~47 Vibes
**PRD scope:** R001, R002, R003, R004, R005 + infra (messaging, keep-alive, icons)

---

## What "Done" Looks Like

FOUNDER opens Chrome → clicks Refine icon → creates a session → navigates Papyrus (or TaskPilot demo) → sees floating control bar → records DOM activity → takes screenshots → logs bugs with auto-context (URL, screenshot, selector) → stops session → session is persisted in IndexedDB.

No export, no reports, no replay. Just **capture everything, lose nothing**.

---

## Infra Already Done (Sprint 00 — DO NOT REBUILD)

| Asset | Status | Notes |
|---|---|---|
| `src/shared/*` (types, messages, constants, utils, index) | ✅ | All types + enums + utils defined |
| `src/background/service-worker.ts` | ✅ | Hello-world (to be replaced with imports) |
| `src/content/content-script.ts` | ✅ | Console log only (to be replaced) |
| `src/popup/*` (popup.html, index.tsx, App.tsx) | ✅ | Shell with "New Session" button (to be wired) |
| All config files | ✅ | package.json, tsconfig, vite, manifest, tailwind, eslint, CI |
| Dependencies | ✅ | rrweb, Dexie, React, Playwright — all installed |
| Tests | ✅ | Vitest 11 unit + Playwright 3 E2E — extend, don't replace |
| QA target app (port 3847) + Demo TaskPilot (port 3900) | ✅ | Both functional |

---

## Phase Plan

### Phase 1 — Storage + Messaging Foundation (DEV) ~10V

| # | Task | File(s) | V |
|---|---|---|---|
| D101 | Dexie database schema + CRUD | `src/core/db.ts` | 3 |
| D102 | Background message handler (router) | `src/background/message-handler.ts` | 2 |
| D103 | Session manager (state machine) | `src/background/session-manager.ts` | 3 |
| D104 | Keep-alive (chrome.alarms) | `src/background/keep-alive.ts` | 1 |
| D105 | Update service-worker.ts (import + wire all) | `src/background/service-worker.ts` | 1 |

### Phase 2 — Recording Engine (DEV) ~10V

| # | Task | File(s) | V |
|---|---|---|---|
| D107 | rrweb recorder wrapper | `src/content/recorder.ts` | 5 |
| D108 | Action extractor (rrweb events → Action[]) | `src/content/action-extractor.ts` | 3 |
| D109 | Selector engine (smart CSS selectors) | `src/content/selector-engine.ts` | 2 |
| D110 | Update content-script.ts (import recorder, listen for messages) | `src/content/content-script.ts` | 1 |

### Phase 3 — Overlay UI (DEV) ~9V

| # | Task | File(s) | V |
|---|---|---|---|
| D112 | Shadow DOM mount | `src/content/overlay/mount.ts` | 2 |
| D113 | ControlBar (Record/Pause/Stop/Screenshot/Bug) | `src/content/overlay/ControlBar.tsx` | 3 |
| D114 | BugEditor (inline form with auto-context) | `src/content/overlay/BugEditor.tsx` | 3 |
| D115 | Overlay CSS (isolated) | `src/content/styles/overlay.css` | 1 |

### Phase 4 — Popup + Screenshot (DEV) ~8V

| # | Task | File(s) | V |
|---|---|---|---|
| D116 | Screenshot capture | `src/background/screenshot.ts` | 2 |
| D117 | Popup: NewSession form (wired to background) | `src/popup/pages/NewSession.tsx` | 2 |
| D118 | Popup: SessionList (read from Dexie, show status) | `src/popup/pages/SessionList.tsx` | 2 |
| D119 | Update App.tsx (routing between list ↔ new session) | `src/popup/App.tsx` | 1 |
| D120 | Branded extension icons | `public/icons/icon-*.png` | 1 |

### Phase 5 — Tests (DEV + QA) ~10V

| # | Task | File(s) | Owner | V |
|---|---|---|---|---|
| D106 | Unit: db, session-manager, message-handler | `tests/unit/core/`, `tests/unit/background/` | DEV | 2 |
| D111 | Unit: action-extractor, selector-engine | `tests/unit/content/` | DEV | 2 |
| D121 | Integration: full pipeline (create→record→bug→stop→verify) | `tests/integration/session-pipeline.test.ts` | DEV | 2 |
| Q101 | E2E: Create session → recording starts | `tests/e2e/session-create.spec.ts` | QA | 2 |
| Q102 | E2E: Control bar visible + functional | `tests/e2e/control-bar.spec.ts` | QA | 1 |
| Q103 | E2E: Screenshot saves to IndexedDB | `tests/e2e/screenshot-capture.spec.ts` | QA | 1 |
| Q104 | E2E: Bug editor opens, pre-fills, saves | `tests/e2e/bug-editor.spec.ts` | QA | 1 |
| Q105 | E2E: Stop → session COMPLETED | `tests/e2e/session-lifecycle.spec.ts` | QA | 1 |

---

## Decisions

| ID | Decision | Rationale |
|---|---|---|
| S01-001 | rrweb config: `checkoutEveryNms: 30000` | 30s full-snapshot checkpoints balance fidelity vs storage |
| S01-002 | Shadow DOM for overlay (ADR-006) | Prevents CSS conflicts with target app |
| S01-003 | Dexie: 5 tables (`sessions`, `events`, `screenshots`, `bugs`, `features`) | Normalized — events separate for query performance |
| S01-004 | Session FSM: RECORDING ↔ PAUSED → STOPPED → COMPLETED | Linear, no backward jumps except pause toggle |
| S01-005 | Overlay React in Shadow DOM via separate `createRoot` | Isolated from popup React + target app |

---

## Dependency Map

```
Phase 1 (storage + messaging)
   ├──► Phase 2 (recorder) ──► Phase 3 (overlay UI)
   │                                     │
   └──► Phase 4 (popup + screenshot) ────┘
                                          │
                                     Phase 5 (tests)
```

DEV runs Phase 1 → Phase 2 + Phase 4 in parallel → Phase 3 → Phase 5 (unit/integration).
QA starts Phase 5 E2E once Phase 3 + 4 are done.

---

## Acceptance Gates

| # | Gate | How | Owner |
|---|---|---|---|
| 1 | `npm run build` succeeds | CLI | DEV |
| 2 | All unit + integration tests pass | `npx vitest run` | DEV |
| 3 | Extension loads without console errors | Manual | DEV |
| 4 | Create session from popup → control bar appears on target app | Manual | QA |
| 5 | Record 2+ min on TaskPilot (multi-page navigation) | Manual | FOUNDER |
| 6 | Screenshot captured → visible in IndexedDB | DevTools check | QA |
| 7 | Bug logged with auto-context → visible in IndexedDB | DevTools check | QA |
| 8 | Stop session → popup shows COMPLETED status | Manual | QA |
| 9 | All E2E specs pass | `npx playwright test` | QA |
| 10 | FOUNDER acceptance walkthrough on TaskPilot | Demo | FOUNDER |

---

*Last updated: 2026-02-21*
