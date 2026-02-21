# sprint_01 — Team QA Todo: Recording E2E + Target App Updates

**Owner:** `[QA]`
**Sprint scope:** E2E tests for R001-R005, target app updates, regression

## Sprint Goals (QA)

- Write E2E tests for the full recording loop (create → record → navigate → screenshot → bug → stop)
- Update QA target app with recording-specific test scenarios
- Maintain Sprint 00 E2E regression (extension loads, content script injects, navigation)
- Validate cross-page recording persistence
- Validate control bar UX in headed Chromium

## Reading Order (MANDATORY before writing tests)

1. `AGENTS.md` (root Tier-1) — project-wide rules
2. `docs/04_TESTING.md` — test strategy, E2E patterns, fixture usage
3. `docs/01_ARCHITECTURE.md` — module diagram, data flows
4. `docs/03_MODULES.md` — capability registry
5. `tests/e2e/fixtures/extension.fixture.ts` — your base fixture (extend, don't replace)

## Tasks

### Phase 1: Start Immediately — Target App Updates (no DEV dependency)

| ID | Task | Acceptance Criteria | Files | Status |
|---|---|---|---|---|
| Q101 | **Update target app for recording scenarios** | Add: (1) multi-step form wizard (3 steps, next/back) (2) dynamic content section (button adds/removes items) (3) `data-testid` on all new elements (4) timer/auto-update element (tests recording of dynamic DOM) | `tests/fixtures/target-app/` (update) | ☐ |
| Q102 | **Add `data-testid` coverage report** | Script or checklist that verifies every interactive element in target app has `data-testid`. Run as part of QA verification. | `tests/fixtures/target-app/verify-testids.js` or checklist in todo | ☐ |

### Phase 2: After DEV delivers recording — E2E Specs

> **Blocked on:** DEV D126 (build succeeds with recording engine)

| ID | Task | Acceptance Criteria | Files | Status |
|---|---|---|---|---|
| Q103 | **E2E: Session creation** | Open popup → click "New Session" → fill name → click "Start Recording" → verify control bar appears on target app. Verify session appears in popup list with "recording" status. | `tests/e2e/session-create.spec.ts` | ☐ |
| Q104 | **E2E: Recording flow** | Start session → interact with target app (click 3 buttons, fill 2 inputs, navigate 2 pages) → pause → verify control bar shows "PAUSED" → resume → stop → verify session status "stopped" in popup. | `tests/e2e/recording-flow.spec.ts` | ☐ |
| Q105 | **E2E: Screenshot capture** | During active session → click screenshot button on control bar → verify "✓ Captured" feedback → open popup → verify screenshot count incremented. | `tests/e2e/screenshot-capture.spec.ts` | ☐ |
| Q106 | **E2E: Bug editor** | During active session → click bug button → verify editor opens with pre-filled URL → fill title + description → select priority → save → verify bug count in popup. Verify editor closes and recording resumes. | `tests/e2e/bug-editor.spec.ts` | ☐ |
| Q107 | **E2E: Cross-page recording** | Start session on page 1 → navigate to page 2 → navigate to page 3 → verify control bar re-appears on each page → stop → verify session has 3 page URLs recorded. | `tests/e2e/cross-page-recording.spec.ts` | ☐ |

### Phase 3: Regression + Verification

| ID | Task | Acceptance Criteria | Files | Status |
|---|---|---|---|---|
| Q108 | **Regression: Sprint 00 E2E still pass** | `extension-loads.spec.ts`, `content-script-injects.spec.ts`, `target-app-navigation.spec.ts` — all still green after Sprint 01 changes. | existing specs | ☐ |
| Q109 | **Full suite green** | `npx playwright test` — all Sprint 00 + Sprint 01 E2E specs pass | — | ☐ |
| Q110 | **Update `docs/04_TESTING.md`** | Add Sprint 01 E2E patterns: recording flow testing, control bar assertions, cross-page test strategy, screenshot verification approach. | `docs/04_TESTING.md` (append) | ☐ |
| Q111 | **QA sprint report** | Document: tests written, issues found, coverage gaps, recommendations for Sprint 02. | `reports/sprint_01_team_qa_report.md` | ☐ |

---

## E2E Test Patterns (Sprint 01 specific)

### Testing the control bar (Shadow DOM)
```typescript
// The control bar lives inside Shadow DOM — use Playwright's shadowRoot access
const refineRoot = page.locator('#refine-root');
const shadowHost = refineRoot.locator('>>> .refine-control-bar');
await expect(shadowHost.locator('button[data-action="pause"]')).toBeVisible();
```

### Testing cross-page persistence
```typescript
// Navigate and verify control bar re-appears
await page.goto('http://localhost:3847/about.html');
await page.waitForSelector('#refine-root'); // Content script re-injected
const controlBar = page.locator('#refine-root >>> .refine-control-bar');
await expect(controlBar).toBeVisible();
```

### Testing screenshot capture
```typescript
// Count screenshots via popup
const popup = await context.newPage();
await popup.goto(`chrome-extension://${extensionId}/src/popup/popup.html`);
const screenshotCount = popup.locator('[data-testid="screenshot-count"]');
await expect(screenshotCount).toHaveText('1'); // After one capture
```

---

## Critical Rules

1. **Use the fixture.** Always import from `./fixtures/extension.fixture.ts` — never raw `@playwright/test`.
2. **Build before test.** `npm run build` must run before any E2E. Add check or document clearly.
3. **Headed mode only.** Extensions require `headless: false`. Do not override this.
4. **Shadow DOM assertions.** Control bar is in Shadow DOM. Use Playwright's `>>>` piercing selector or `locator.shadowRoot`.
5. **No source code changes.** QA owns `tests/`, `demos/`, `docs/04_TESTING.md`. Source code is DEV domain.
6. **Port map:** 3847 (target app), 3900 (demo app), 5173 (Vite HMR — don't touch).

## Definition of Done (QA)

```
✅ Target app updated with recording-specific scenarios
✅ All 5 new E2E specs written with meaningful assertions
✅ Sprint 00 regression — all 3 old specs still pass
✅ npx playwright test — full suite green
✅ docs/04_TESTING.md updated with Sprint 01 patterns
✅ QA sprint report written
```

## Risks / Blockers

- **Shadow DOM selector stability:** Playwright's `>>>` piercing may behave differently across Playwright versions. Pin Playwright version if needed.
- **Timing:** rrweb recording start is async. E2E tests need `waitForSelector` or `waitForFunction` to verify recording has begun before interacting.
- **Screenshot verification:** Can't easily assert screenshot _content_ in E2E. Verify by checking count and metadata existence instead.
- **DEV dependency:** E2E specs (Q103-Q107) blocked on DEV delivering working recording engine. Start with Q101-Q102 immediately.
