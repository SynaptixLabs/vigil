# Sprint 02 — Export & Ship

**Sprint window:** 2026-02-25 → 2026-02-27
**Goal:** Ship the complete product. Reports, replay, Playwright export, ZIP bundles, keyboard shortcuts. After this sprint, Refine is **DONE**.
**Budget:** ~46 Vibes
**PRD scope:** R006, R007, R010, R011, R012, R013

---

## What "Done" Looks Like

FOUNDER records a session → stops → generates JSON + Markdown report → watches rrweb visual replay → exports Playwright `.spec.ts` → downloads ZIP bundle (replay + report + screenshots + spec). QA engineer opens the `.spec.ts`, runs it, it passes against the target app.

**This is the complete product. Sprint 02 = ship.**

---

## Infra from Sprint 00 + 01

| Asset | Status |
|---|---|
| Recording engine (rrweb + actions + screenshots + bugs) | ✅ Sprint 01 |
| Dexie DB (5 tables, CRUD, cascading delete) | ✅ Sprint 01 |
| Popup (session list + new session form) | ✅ Sprint 01 |
| Control bar + bug editor in Shadow DOM | ✅ Sprint 01 |
| Chrome messaging + session state machine | ✅ Sprint 01 |
| All test infra (Vitest + Playwright + fixture) | ✅ Sprint 00-01 |
| QA target app (3847) + TaskPilot demo (3900) | ✅ Sprint 00 |

---

## Phase Plan

### Phase 1 — Report Generation (DEV) ~13V

| # | Task | File(s) | V |
|---|---|---|---|
| D201 | Report generator (Session → JSON + Markdown) | `src/core/report-generator.ts` | 5 |
| D202 | Replay bundler (rrweb events → self-contained HTML with rrweb-player) | `src/core/replay-bundler.ts` | 5 |
| D203 | Session detail view in popup (report + actions timeline) | `src/popup/pages/SessionDetail.tsx` | 3 |

### Phase 2 — Playwright Codegen (DEV) ~15V

| # | Task | File(s) | V |
|---|---|---|---|
| D204 | Playwright codegen (Action[] → `.spec.ts` string) | `src/core/playwright-codegen.ts` | 10 |
| D205 | ZIP bundler (replay.html + report.json + report.md + screenshots/ + regression.spec.ts) | `src/core/zip-bundler.ts` | 5 |

### Phase 3 — Popup Export UI + Session Mgmt (DEV) ~8V

| # | Task | File(s) | V |
|---|---|---|---|
| D206 | Export buttons in SessionDetail (Report / Replay / Playwright / ZIP) | `src/popup/pages/SessionDetail.tsx` | 2 |
| D207 | Session delete with confirmation | `src/popup/pages/SessionList.tsx` | 2 |
| D208 | Keyboard shortcuts (Ctrl+Shift+R/S/B) | `src/background/shortcuts.ts` + `manifest.json` commands | 2 |
| D209 | Polish pass: loading states, error toasts, empty states | Various popup components | 2 |

### Phase 4 — Tests (DEV + QA) ~10V

| # | Task | File(s) | Owner | V |
|---|---|---|---|---|
| D210 | Unit: report-generator (JSON + MD output) | `tests/unit/core/report-generator.test.ts` | DEV | 2 |
| D211 | Unit: playwright-codegen (Action → spec.ts) | `tests/unit/core/playwright-codegen.test.ts` | DEV | 3 |
| D212 | Unit: replay-bundler (HTML output contains rrweb-player) | `tests/unit/core/replay-bundler.test.ts` | DEV | 1 |
| Q201 | E2E: Generate report after session → verify download | `tests/e2e/report-export.spec.ts` | QA | 1 |
| Q202 | E2E: Watch replay opens valid HTML | `tests/e2e/replay-viewer.spec.ts` | QA | 1 |
| Q203 | E2E: Export Playwright → file is syntactically valid TS | `tests/e2e/playwright-export.spec.ts` | QA | 2 |
| Q204 | E2E: Download ZIP → contains all expected files | `tests/e2e/zip-export.spec.ts` | QA | 1 |
| Q205 | E2E: Delete session → removed from list + DB | `tests/e2e/session-delete.spec.ts` | QA | 1 |
| Q206 | E2E: Keyboard shortcuts trigger correct actions | `tests/e2e/keyboard-shortcuts.spec.ts` | QA | 1 |
| Q207 | Regression: Full Sprint 00 + 01 + 02 suite green | All specs | QA | 0 |

---

## Decisions

| ID | Decision | Rationale |
|---|---|---|
| S02-001 | rrweb-player bundled as inline script in replay HTML | Self-contained HTML — no external CDN dependency |
| S02-002 | Playwright codegen: navigate + click + fill + assertion structure | Matches Playwright best practices. Assertions for `toBeVisible()` on key elements |
| S02-003 | ZIP uses JSZip library (add to dependencies) | Client-side ZIP creation, no server needed |
| S02-004 | Keyboard shortcuts via `chrome.commands` API in manifest.json | Native extension shortcut — works even when popup is closed |
| S02-005 | Generated `.spec.ts` includes `// BUG:` comments at locations where bugs were logged | Links test script to bug context for QA review |

---

## Dependency Map

```
Phase 1 (reports + replay) ──► Phase 3 (popup export UI)
Phase 2 (codegen + ZIP)    ──┘          │
                                    Phase 4 (tests)
```

DEV runs Phase 1 + Phase 2 in parallel → Phase 3 → Phase 4 (unit).
QA starts Phase 4 E2E once Phase 3 is done.

---

## Acceptance Gates

| # | Gate | How | Owner |
|---|---|---|---|
| 1 | `npm run build` succeeds | CLI | DEV |
| 2 | All unit + integration tests pass (Sprint 00-02) | `npx vitest run` | DEV |
| 3 | JSON report contains: timeline, pages, actions, bugs, screenshots | Unit test | DEV |
| 4 | Markdown report is human-readable | Manual review | FOUNDER |
| 5 | Replay HTML opens in browser and plays back session | Manual | FOUNDER |
| 6 | Playwright `.spec.ts` is syntactically valid TypeScript | `npx tsc --noEmit` on exported file | QA |
| 7 | Playwright `.spec.ts` runs against target app | `npx playwright test exported.spec.ts` | QA |
| 8 | ZIP contains: replay.html, report.json, report.md, screenshots/, regression.spec.ts | Manual inspect | QA |
| 9 | Session delete cascades correctly | E2E | QA |
| 10 | Keyboard shortcuts work | Manual | QA |
| 11 | All E2E specs pass (Sprint 00-02) | `npx playwright test` | QA |
| 12 | FOUNDER end-to-end walkthrough on TaskPilot | Demo | FOUNDER |

---

## Ship Checklist (Sprint 02 = Final)

- [ ] `CHANGELOG.md` written (v0.1.0 → v1.0.0)
- [ ] Version bumped: `manifest.json` + `package.json` → `1.0.0`
- [ ] Git tag: `v1.0.0`
- [ ] `README.md` updated with full usage instructions
- [ ] `dist/` built from clean checkout
- [ ] Team distribution: share `dist/` folder or repo tag
- [ ] FOUNDER final acceptance

---

*Last updated: 2026-02-21*
