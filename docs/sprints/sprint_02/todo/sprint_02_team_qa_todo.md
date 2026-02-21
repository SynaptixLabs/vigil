# sprint_02 — Team QA Todo: Export E2E + Full Regression + Ship

**Owner:** `[QA]`
**Sprint scope:** E2E tests for R006-R007, R010-R013, full regression, ship acceptance

## Sprint Goals (QA)

- Write E2E tests for the entire export pipeline (report, replay, Playwright spec, ZIP)
- Write E2E tests for session management (list, detail, delete)
- Write E2E tests for keyboard shortcuts
- Full regression: Sprint 00 + 01 + 02 E2E suite must pass
- Validate exported Playwright spec actually runs against target app
- Support FOUNDER acceptance testing

## Reading Order (MANDATORY)

1. `AGENTS.md` (root Tier-1)
2. `docs/04_TESTING.md` — all E2E patterns
3. `docs/01_ARCHITECTURE.md` — export pipeline diagram
4. `tests/e2e/fixtures/extension.fixture.ts` — base fixture

## Tasks

### Phase 1: Start Immediately — No DEV Dependency

| ID | Task | Acceptance Criteria | Files | Status |
|---|---|---|---|---|
| Q201 | **Prepare export validation scripts** | Create helper utilities for E2E tests: (1) script to verify ZIP contents (expected files present) (2) script to verify .spec.ts is parseable TypeScript (3) script to verify replay HTML opens correctly | `tests/e2e/helpers/export-validators.ts` | ☐ |
| Q202 | **Plan generated spec validation** | Design test: exported .spec.ts runs against QA target app. May need fixture that: generates spec from recording → writes to temp file → runs Playwright on it. Document approach. | `tests/e2e/helpers/spec-runner.ts` or plan doc | ☐ |

### Phase 2: After DEV Delivers Export — E2E Specs

> **Blocked on:** DEV D227 (build succeeds with export pipeline)

| ID | Task | Acceptance Criteria | Files | Status |
|---|---|---|---|---|
| Q203 | **E2E: Session report** | Record session → stop → open popup → go to session detail → verify report metadata visible (duration, page count, bug count). Click "Report (MD)" → verify download triggered. | `tests/e2e/session-report.spec.ts` | ☐ |
| Q204 | **E2E: Session management** | Create 3 sessions → verify all appear in list sorted by date → click session → detail view loads → delete session → confirm dialog → verify removed from list → verify other sessions untouched. | `tests/e2e/session-management.spec.ts` | ☐ |
| Q205 | **E2E: Playwright export** | Record session with clicks + inputs on target app → stop → export Playwright → verify download triggered → verify file name matches pattern `regression-ats-*.spec.ts`. | `tests/e2e/export-playwright.spec.ts` | ☐ |
| Q206 | **E2E: ZIP export** | Record session → stop → export ZIP → verify download triggered → verify file name matches `refine-*.zip`. | `tests/e2e/export-zip.spec.ts` | ☐ |
| Q207 | **E2E: Keyboard shortcuts** | Active recording → press Ctrl+Shift+S → verify screenshot count increments. Press Ctrl+Shift+B → verify bug editor opens. Press Ctrl+Shift+R → verify recording pauses. | `tests/e2e/keyboard-shortcuts.spec.ts` | ☐ |
| Q208 | **E2E: Generated spec runs** (stretch) | Export Playwright spec from recording on QA target app → run the exported spec → verify it passes. This is the "full loop" test — Refine generates a test that actually works. | `tests/e2e/generated-spec-runs.spec.ts` | ☐ |

### Phase 3: Regression + Ship

| ID | Task | Acceptance Criteria | Files | Status |
|---|---|---|---|---|
| Q209 | **Full regression** | All Sprint 00 + 01 + 02 E2E specs pass: extension-loads, content-script-injects, target-app-navigation, session-create, recording-flow, screenshot-capture, bug-editor, cross-page-recording, session-report, session-management, export-playwright, export-zip, keyboard-shortcuts. | all specs | ☐ |
| Q210 | **Full suite green** | `npx playwright test` — all pass in headed Chrome | — | ☐ |
| Q211 | **Update `docs/04_TESTING.md`** | Add Sprint 02 patterns: export testing, download verification, generated spec validation. Final testing doc for v1.0. | `docs/04_TESTING.md` (append) | ☐ |
| Q212 | **QA sprint report** | Document: all tests, issues found, coverage assessment, v1.0 readiness statement. | `reports/sprint_02_team_qa_report.md` | ☐ |
| Q213 | **Support FOUNDER acceptance** | Assist Avi during final acceptance test on Papyrus. Verify exported spec. Document any issues found during acceptance. | — | ☐ |

---

## E2E Test Patterns (Sprint 02 specific)

### Testing downloads
```typescript
// Playwright can intercept downloads
const [download] = await Promise.all([
  page.waitForEvent('download'),
  page.click('[data-testid="export-zip"]'),
]);
expect(download.suggestedFilename()).toMatch(/^refine-.*\.zip$/);
```

### Testing keyboard shortcuts
```typescript
// Shortcuts registered via chrome.commands — use page.keyboard
await page.keyboard.press('Control+Shift+KeyS'); // Screenshot
// Verify via popup screenshot count or console message
```

### Testing generated spec validity (stretch goal)
```typescript
// Write exported spec to temp file → run npx playwright test on it
import { writeFile } from 'fs/promises';
const specContent = await getExportedSpec(/* ... */);
await writeFile('/tmp/test-generated.spec.ts', specContent);
// This is complex — may be manual verification for v1.0
```

---

## Critical Rules

1. **Use the fixture.** Always import from `./fixtures/extension.fixture.ts`.
2. **Download assertions.** Use Playwright's download event interception — don't check filesystem directly.
3. **No source code changes.** QA owns `tests/`, `demos/`, `docs/04_TESTING.md`.
4. **Regression is non-negotiable.** Every Sprint 00 and 01 test must still pass. If a test breaks, report as P0 bug.
5. **Q208 (generated spec runs) is a stretch goal.** Get Q203-Q207 + regression green first. If time permits, attempt the full-loop test.

## Definition of Done (QA)

```
✅ 5+ new E2E specs written (report, management, playwright, zip, shortcuts)
✅ Full regression: all Sprint 00 + 01 + 02 specs pass
✅ npx playwright test — full suite green
✅ docs/04_TESTING.md updated with Sprint 02 patterns
✅ QA sprint report written with v1.0 readiness statement
✅ FOUNDER acceptance supported
```

## Risks / Blockers

- **Download testing complexity:** Playwright download interception works differently in persistent context. May need workaround for extension-initiated downloads via chrome.downloads API.
- **Keyboard shortcut testing:** `chrome.commands` shortcuts may not fire via `page.keyboard` — they're browser-level, not page-level. May need alternative verification (check side effects instead of keypress).
- **Generated spec validation (Q208):** Running an exported spec inside a Playwright test is meta-testing. Complex to set up. Acceptable as stretch goal or manual verification.
- **DEV dependency:** E2E specs Q203-Q208 blocked on DEV's export pipeline. Start with Q201-Q202 and regression prep immediately.
