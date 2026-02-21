# sprint_02 — Sprint Index

**Sprint window:** 2026-02-25 → 2026-02-28
**Owners:** `[FOUNDER]` / `[CTO]` / `[CPO]`

## Status

- Sprint status: 🟡 PLANNING
- Current focus: Reports + Replay + Export — **ship the full product**
- Key risks: Playwright codegen quality, rrweb-player integration, ZIP bundling in browser

---

## Sprint Goal

Ship **Refine v1.0** — the complete product. After this sprint:

1. Session report: JSON + Markdown with timeline, pages, actions, bugs, screenshots
2. Visual replay: self-contained HTML file with rrweb-player (play/pause/speed/scrub)
3. Playwright test export: action log → `.spec.ts` with smart selectors
4. ZIP bundle: replay.html + report.json + report.md + screenshots/ + regression.spec.ts
5. Full session management: list, view details, delete, export
6. Keyboard shortcuts for power users

**After Sprint 02: Refine is DONE. Ship it.**

**Estimated effort:** ~46 Vibes

---

## Team Structure

| Role | Tag | Scope |
|---|---|---|
| DEV | `[DEV:export]` | Report gen, replay bundler, Playwright codegen, ZIP export, session management, keyboard shortcuts, unit tests |
| QA | `[QA]` | E2E tests for export flows, full regression, acceptance target validation |
| CTO | `[CTO]` | Architecture compliance, final review, release prep |
| FOUNDER | `[FOUNDER]` | Final acceptance: record session on Papyrus → export → hand to QA |

---

## PRD Requirements Covered

| Req | Description | Priority | Vibes | Owner |
|---|---|---|---|---|
| R006 | Session report generation (JSON + MD) | P0 | 8 | DEV |
| R007 | Session list with delete capability | P0 | 5 | DEV |
| R010 | Visual replay via rrweb-player | P1 | 10 | DEV |
| R011 | Playwright test script export | P1 | 15 | DEV |
| R012 | Export as ZIP bundle | P1 | 5 | DEV |
| R013 | Keyboard shortcuts | P1 | 3 | DEV |

---

## Deliverables Checklist

### Phase 1: Report Generation — R006 (DEV)
| # | Artifact | Owner | Status |
|---|----------|-------|--------|
| 1 | `src/core/report-generator.ts` — JSON report from session data | DEV | ☐ |
| 2 | Markdown report template — timeline, pages, actions, bugs, screenshots | DEV | ☐ |
| 3 | Report triggered on session stop (auto-generate) + manual re-generate button | DEV | ☐ |

### Phase 2: Session Management — R007 (DEV)
| # | Artifact | Owner | Status |
|---|----------|-------|--------|
| 4 | Enhanced session list in popup: name, date, duration, status, bug/feature/screenshot counts | DEV | ☐ |
| 5 | Session detail view: `src/popup/pages/SessionDetail.tsx` — full session info + action timeline | DEV | ☐ |
| 6 | Delete session: confirmation dialog → remove session + all recordings + bugs + screenshots from Dexie | DEV | ☐ |
| 7 | Storage usage indicator in popup footer | DEV | ☐ |

### Phase 3: Visual Replay — R010 (DEV)
| # | Artifact | Owner | Status |
|---|----------|-------|--------|
| 8 | `src/core/replay-bundler.ts` — rrweb events → self-contained HTML with rrweb-player | DEV | ☐ |
| 9 | Replay HTML template: embedded rrweb-player, play/pause, speed control (0.5x/1x/2x/4x), timeline scrubber | DEV | ☐ |
| 10 | "Watch Replay" button in session detail view → opens/downloads replay.html | DEV | ☐ |

### Phase 4: Playwright Export — R011 (DEV)
| # | Artifact | Owner | Status |
|---|----------|-------|--------|
| 11 | `src/core/playwright-codegen.ts` — Action[] → Playwright .spec.ts | DEV | ☐ |
| 12 | Generated spec includes: `page.goto()`, `page.click()`, `page.fill()`, `expect()` assertions | DEV | ☐ |
| 13 | Selector strategy in export: data-testid > aria-label > id > CSS (matches engine) | DEV | ☐ |
| 14 | Bug locations marked as comments in generated spec: `// BUG: [P1] Title — URL` | DEV | ☐ |
| 15 | "Export Playwright" button in session detail → downloads .spec.ts | DEV | ☐ |

### Phase 5: ZIP Bundle — R012 (DEV)
| # | Artifact | Owner | Status |
|---|----------|-------|--------|
| 16 | ZIP assembly: replay.html + report.json + report.md + regression.spec.ts + screenshots/*.png | DEV | ☐ |
| 17 | ZIP created client-side using JSZip (or similar) — no server needed | DEV | ☐ |
| 18 | "Export ZIP" button in session detail → downloads `refine-{session-id}.zip` | DEV | ☐ |

### Phase 6: Keyboard Shortcuts — R013 (DEV)
| # | Artifact | Owner | Status |
|---|----------|-------|--------|
| 19 | `Ctrl+Shift+R` — toggle recording (start/pause) | DEV | ☐ |
| 20 | `Ctrl+Shift+S` — take screenshot | DEV | ☐ |
| 21 | `Ctrl+Shift+B` — open bug editor | DEV | ☐ |
| 22 | Register via `chrome.commands` in manifest.json | DEV | ☐ |

### Phase 7: Unit + Integration Tests (DEV)
| # | Artifact | Owner | Status |
|---|----------|-------|--------|
| 23 | Unit: `tests/unit/core/report-generator.test.ts` — verify JSON + MD output from mock session | DEV | ☐ |
| 24 | Unit: `tests/unit/core/playwright-codegen.test.ts` — verify .spec.ts output from mock actions | DEV | ☐ |
| 25 | Unit: `tests/unit/core/replay-bundler.test.ts` — verify HTML output contains rrweb-player + events | DEV | ☐ |
| 26 | Integration: `tests/integration/export-pipeline.test.ts` — session → report + replay + spec + ZIP | DEV | ☐ |
| 27 | All tests green: `npx vitest run` | DEV | ☐ |

### Phase 8: E2E Tests (QA)
| # | Artifact | Owner | Status |
|---|----------|-------|--------|
| 28 | E2E: `tests/e2e/session-report.spec.ts` — stop session → verify report generated | QA | ☐ |
| 29 | E2E: `tests/e2e/session-management.spec.ts` — list, view detail, delete session | QA | ☐ |
| 30 | E2E: `tests/e2e/export-playwright.spec.ts` — export → verify download triggered | QA | ☐ |
| 31 | E2E: `tests/e2e/export-zip.spec.ts` — export ZIP → verify download triggered | QA | ☐ |
| 32 | E2E: `tests/e2e/keyboard-shortcuts.spec.ts` — Ctrl+Shift+R/S/B → correct actions | QA | ☐ |
| 33 | Regression: all Sprint 00 + Sprint 01 E2E still green | QA | ☐ |
| 34 | Full suite: `npx playwright test` — all pass | QA | ☐ |

### Phase 9: Release Prep (CTO)
| # | Artifact | Owner | Status |
|---|----------|-------|--------|
| 35 | Version bump: `manifest.json` + `package.json` → v1.0.0 | CTO | ☐ |
| 36 | `CHANGELOG.md` — Sprint 00 + 01 + 02 summary | CTO | ☐ |
| 37 | README.md — update with full feature list + usage instructions | CTO | ☐ |
| 38 | Final CTO review + sign-off | CTO | ☐ |

### Phase 10: Acceptance (FOUNDER)
| # | Artifact | Owner | Status |
|---|----------|-------|--------|
| 39 | Full acceptance test on Papyrus: record session → stop → view report → watch replay → export Playwright → export ZIP | FOUNDER | ☐ |
| 40 | Hand exported .spec.ts to QA team → QA confirms it runs | FOUNDER + QA | ☐ |
| 41 | FOUNDER sign-off: Refine v1.0 is SHIPPED | FOUNDER | ☐ |

---

## Required Artifacts

- Requirements delta: `reviews/sprint_02_requirements_delta.md`
- Decisions (sprint-local): `sprint_02_decisions_log.md`
- DEV todo: `todo/sprint_02_team_dev_todo.md`
- QA todo: `todo/sprint_02_team_qa_todo.md`
- DEV report: `reports/sprint_02_team_dev_report.md` (on completion)
- QA report: `reports/sprint_02_team_qa_report.md` (on completion)

---

## Quick Links

### Todos
- [DEV Todo](todo/sprint_02_team_dev_todo.md)
- [QA Todo](todo/sprint_02_team_qa_todo.md)

### Reports
- `reports/sprint_02_team_dev_report.md` (pending)
- `reports/sprint_02_team_qa_report.md` (pending)

### Decisions
- [Sprint decisions](sprint_02_decisions_log.md)
- [Global decisions](../../0l_DECISIONS.md)

---

## Key Technical Decisions (Pending)

| ID | Question | Options | Status |
|---|---|---|---|
| S02-001 | ZIP library | (A) JSZip (most popular, 100KB) (B) fflate (smaller, faster) (C) browser Compression Streams API | Pending |
| S02-002 | rrweb-player bundling | (A) Inline in replay HTML (B) CDN link (C) Separate file in ZIP | Pending |
| S02-003 | Playwright codegen assertion style | (A) `expect(locator).toBeVisible()` only (B) Include text assertions (C) Full snapshot assertions | Pending |

---

## Definition of Done (Sprint 02 = SHIP)

```
✅ Session report generates JSON + Markdown with full timeline
✅ Visual replay opens as self-contained HTML with rrweb-player
✅ Playwright export produces valid .spec.ts with smart selectors
✅ ZIP bundle contains: replay + report + screenshots + spec
✅ Session list: view, detail, delete — all functional
✅ Keyboard shortcuts: Ctrl+Shift+R/S/B working
✅ All unit + integration tests pass (npx vitest run)
✅ All E2E tests pass (npx playwright test)
✅ TypeScript clean, ESLint clean, build clean
✅ Version v1.0.0 tagged
✅ CHANGELOG.md + README.md updated
✅ FOUNDER records session on Papyrus → exports → hands to QA → QA runs spec
✅ FOUNDER sign-off: SHIPPED 🚢
```

---

## Open Questions (For FOUNDER)

1. **Replay player:** Embed rrweb-player in replay HTML (~200KB) or link to CDN? Recommend: **Embed** (works offline, no external dependencies).
2. **Playwright assertion depth:** Just navigation + visibility checks? Or include text content assertions? Recommend: **Visibility + text for key elements** (balance between brittle and useful).
3. **ZIP filename:** `refine-{session-id}.zip` or `refine-{session-name}-{date}.zip`? Recommend: **`refine-{session-name}-{date}.zip`** (human-readable).

---

*Last updated: 2026-02-21*
