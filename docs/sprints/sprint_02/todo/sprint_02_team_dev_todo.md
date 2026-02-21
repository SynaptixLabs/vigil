# sprint_02 — Team DEV Todo: Reports + Export + Ship

**Owner:** `[DEV:export]`
**Sprint scope:** R006 (Reports), R007 (Session Mgmt), R010 (Replay), R011 (Playwright Export), R012 (ZIP), R013 (Shortcuts)

## Sprint Goals (DEV)

- Build report generation (JSON + Markdown) from session data
- Build rrweb-player replay as self-contained HTML
- Build Playwright codegen: action log → .spec.ts with smart selectors
- Build ZIP bundle export (replay + report + screenshots + spec)
- Complete session management UI (detail view, delete, export buttons)
- Implement keyboard shortcuts via chrome.commands
- Ship Refine v1.0

## Reading Order (MANDATORY)

1. `AGENTS.md` (root Tier-1)
2. `src/core/AGENTS.md` — core module owns report gen, codegen, replay bundler
3. `src/popup/AGENTS.md` — popup owns session detail + export buttons
4. `docs/01_ARCHITECTURE.md` — data model, export pipeline diagram
5. `docs/03_MODULES.md` — capability registry
6. `docs/04_TESTING.md` — test patterns

## Tasks

### Phase 1: Report Generation — R006 (~8V)

| ID | Task | Acceptance Criteria | Files | Status |
|---|---|---|---|---|
| D201 | **JSON report generator** | Input: Session + recordings + bugs + features + screenshots from Dexie. Output: structured JSON with: `metadata` (id, name, dates, duration), `pages[]` (url, timeSpent, actionCount), `timeline[]` (chronological: actions + bugs + features + screenshots), `summary` (totals, coverage). | `src/core/report-generator.ts` | ☐ |
| D202 | **Markdown report generator** | Same input → Markdown output with: `# Session Report: {name}`, metadata table, `## Pages Visited`, `## Timeline` (chronological list), `## Bugs` (table: priority, title, URL, selector), `## Features` (table), `## Screenshots` (linked references). Human-readable, paste-into-sprint-docs quality. | `src/core/report-generator.ts` (same file, separate function) | ☐ |
| D203 | **Auto-generate on session stop** | When session stops: auto-trigger report generation. Store report JSON in Dexie `sessions.report`. User can re-generate manually from session detail. | `src/background/session-manager.ts` (update) | ☐ |

### Phase 2: Session Management — R007 (~5V)

| ID | Task | Acceptance Criteria | Files | Status |
|---|---|---|---|---|
| D204 | **Enhanced session list** | Show: name, date, duration, status badge (color-coded), counts (bugs/features/screenshots). Sort: most recent first. Empty state: "No sessions yet — start recording!" | `src/popup/pages/SessionList.tsx` (update) | ☐ |
| D205 | **Session detail view** | Full session info: all metadata, action timeline (scrollable), bugs list, features list, screenshot thumbnails. Export buttons: "Report (MD)", "Report (JSON)", "Watch Replay", "Export Playwright", "Export ZIP". Delete button with confirmation. | `src/popup/pages/SessionDetail.tsx` | ☐ |
| D206 | **Delete session** | Confirmation dialog: "Delete session {name}? This removes all recordings, bugs, features, and screenshots. Cannot be undone." On confirm: remove all related data from Dexie. Return to session list. | `src/popup/pages/SessionDetail.tsx` (inline) | ☐ |
| D207 | **Storage usage indicator** | Popup footer: "Storage: X.X MB used". Calculate from Dexie table sizes. Warn (amber) at 100MB, alert (red) at 500MB. | `src/popup/components/StorageIndicator.tsx` | ☐ |

### Phase 3: Visual Replay — R010 (~10V)

| ID | Task | Acceptance Criteria | Files | Status |
|---|---|---|---|---|
| D208 | **Replay bundler** | Input: recording chunks (rrweb events) from Dexie. Output: self-contained HTML string with embedded rrweb-player library + events JSON. HTML includes: play/pause button, speed control (0.5x/1x/2x/4x), timeline scrubber, fullscreen toggle. No external dependencies — works offline. | `src/core/replay-bundler.ts` | ☐ |
| D209 | **Replay HTML template** | Clean, branded page: "SynaptixLabs Refine — Session Replay: {name}". Dark player UI. Session metadata shown above player. Bug/feature markers on timeline (red dots for bugs, blue for features). | `src/core/replay-bundler.ts` (template string) | ☐ |
| D210 | **"Watch Replay" download** | Button in session detail → triggers browser download of `replay-{session-id}.html`. File opens in any browser — fully self-contained. | `src/popup/pages/SessionDetail.tsx` (button handler) | ☐ |

### Phase 4: Playwright Export — R011 (~15V)

| ID | Task | Acceptance Criteria | Files | Status |
|---|---|---|---|---|
| D211 | **Playwright codegen** | Input: Action[] from session. Output: valid Playwright .spec.ts string. Generates: `import { test, expect } from '@playwright/test'`, `test('Refine session: {name}', async ({ page }) => { ... })`. Each action → corresponding Playwright call. | `src/core/playwright-codegen.ts` | ☐ |
| D212 | **Action → Playwright mapping** | `navigate(url)` → `await page.goto('url')`. `click(selector)` → `await page.click('selector')`. `type(selector, value)` → `await page.fill('selector', 'value')`. `scroll` → comment only. `screenshot` → `await page.screenshot({ path: 'step-N.png' })`. | `src/core/playwright-codegen.ts` | ☐ |
| D213 | **Smart selector in export** | Use selector from action (already ranked by engine). If `confidence: 'high'` → use as-is. If `confidence: 'low'` → add `// TODO: fragile selector — add data-testid` comment. | `src/core/playwright-codegen.ts` | ☐ |
| D214 | **Bug markers in spec** | Where bugs were logged during recording: insert comment block `// 🐛 BUG [P1]: "Title" — url — consider adding assertion here`. Helps QA know where to add expect() calls. | `src/core/playwright-codegen.ts` | ☐ |
| D215 | **"Export Playwright" download** | Button → downloads `regression-{session-id}.spec.ts`. Syntactically valid — `npx tsc --noEmit` should pass on the generated file (with Playwright types available). | `src/popup/pages/SessionDetail.tsx` (button handler) | ☐ |

### Phase 5: ZIP Bundle — R012 (~5V)

| ID | Task | Acceptance Criteria | Files | Status |
|---|---|---|---|---|
| D216 | **ZIP assembly** | Collect: replay.html, report.json, report.md, regression.spec.ts, screenshots/*.png. Use JSZip (or fflate) to create ZIP in-browser. No server round-trip. | `src/core/zip-exporter.ts` (new) | ☐ |
| D217 | **"Export ZIP" download** | Button → generates ZIP → triggers browser download: `refine-{session-name}-{date}.zip`. Progress indicator for large sessions (>10MB). | `src/popup/pages/SessionDetail.tsx` (button handler) | ☐ |
| D218 | **Screenshot filename mapping** | Screenshots in ZIP named: `screenshots/ss-001-{timestamp}.png`. Report references match filenames. | `src/core/zip-exporter.ts` | ☐ |

### Phase 6: Keyboard Shortcuts — R013 (~3V)

| ID | Task | Acceptance Criteria | Files | Status |
|---|---|---|---|---|
| D219 | **Register chrome.commands** | Add to `manifest.json`: `commands` section with `toggle-recording` (Ctrl+Shift+R), `take-screenshot` (Ctrl+Shift+S), `open-bug-editor` (Ctrl+Shift+B). | `manifest.json` (update — CTO approval needed) | ☐ |
| D220 | **Command handler** | `chrome.commands.onCommand` listener in background. Routes to session manager (toggle recording), screenshot (capture), or sends message to content (open bug editor). Only active when session is recording or paused. | `src/background/service-worker.ts` (update) | ☐ |
| D221 | **Shortcut hints on control bar** | Tooltip on each button showing keyboard shortcut. E.g., "Screenshot (Ctrl+Shift+S)". | `src/content/overlay/ControlBar.tsx` (update) | ☐ |

### Phase 7: Unit + Integration Tests (~5V)

| ID | Task | Acceptance Criteria | Files | Status |
|---|---|---|---|---|
| D222 | **Unit: report-generator** | Given mock session data → verify JSON report structure (all required fields present). Verify Markdown report renders correctly (headings, tables, lists). Test edge cases: session with 0 bugs, session with 50 screenshots. | `tests/unit/core/report-generator.test.ts` | ☐ |
| D223 | **Unit: playwright-codegen** | Given mock Action[] → verify generated .spec.ts: correct imports, page.goto, page.click, page.fill, bug comments. Verify selector strategy preserved. Verify output is parseable TypeScript. | `tests/unit/core/playwright-codegen.test.ts` | ☐ |
| D224 | **Unit: replay-bundler** | Given mock rrweb events → verify HTML output contains rrweb-player script, events JSON, play/pause controls. Verify HTML is valid (basic structure check). | `tests/unit/core/replay-bundler.test.ts` | ☐ |
| D225 | **Integration: export pipeline** | Create session → add recordings + bugs + screenshots → generate report → generate replay → generate spec → bundle ZIP. Verify ZIP contains all expected files with correct content. | `tests/integration/export-pipeline.test.ts` | ☐ |
| D226 | **All tests green** | `npx vitest run` — all unit + integration pass. Sprint 00 + 01 tests still green (regression). | — | ☐ |

### Phase 8: Verification

| ID | Task | Acceptance Criteria | Files | Status |
|---|---|---|---|---|
| D227 | `npm run build` — clean | No errors, `dist/` produced | — | ☐ |
| D228 | `npx tsc --noEmit` — clean | Zero type errors | — | ☐ |
| D229 | `npx eslint src/` — clean | Zero lint errors | — | ☐ |
| D230 | **Full manual test on TaskPilot** | Record 5-min session on TaskPilot → navigate 4+ pages → take 3 screenshots → log 2 bugs + 1 feature → stop → view report → watch replay → export Playwright spec → export ZIP → verify ZIP contents → verify .spec.ts is valid TypeScript | — | ☐ |

---

## New Dependencies (require CTO approval)

| Package | Purpose | Size | Alternative |
|---|---|---|---|
| `jszip` | ZIP creation in browser | ~100KB | `fflate` (~29KB, faster) |
| `rrweb-player` | Visual replay component | ~200KB | None (official rrweb package) |

> **Note:** Both are MIT licensed. `rrweb-player` is used only in the generated replay HTML (not bundled in extension). `jszip` / `fflate` is imported in `src/core/`.

## Critical Rules

1. **Core module is Chrome-API-free.** Report gen, codegen, replay bundler, ZIP exporter — all pure TypeScript. No `chrome.*` calls.
2. **Downloads via chrome.downloads API** in background. Popup sends message → background triggers download.
3. **Generated Playwright spec must be syntactically valid.** Test by running `npx tsc --noEmit` on the output.
4. **Replay HTML must work offline.** No CDN links, no external resources. Everything embedded.
5. **ZIP must be self-contained.** Anyone with the ZIP can: open replay, read report, run spec (with Playwright installed).
6. **Manifest changes need CTO approval.** Adding `chrome.commands` requires manifest.json update.

## Definition of Done (DEV)

```
✅ Report generates JSON + Markdown from session data
✅ Replay HTML opens in browser with working rrweb-player
✅ Playwright .spec.ts is syntactically valid TypeScript
✅ ZIP bundle contains all 5 file types
✅ Session detail view: all export buttons functional
✅ Delete session removes all associated data
✅ Keyboard shortcuts trigger correct actions
✅ npx vitest run — all pass (Sprint 00 + 01 + 02)
✅ npx tsc --noEmit — clean
✅ npx eslint src/ — clean
✅ npm run build — clean
✅ Full manual test on TaskPilot — complete export pipeline works
```

## Risks / Blockers

- **rrweb-player bundle size:** Embedding ~200KB of JS in replay HTML. Acceptable for internal tool.
- **Large session ZIP size:** 30-min session could produce 50-100MB ZIP (mostly screenshots). Mitigation: compress screenshots to JPEG 80% before ZIP.
- **Playwright codegen quality:** Generated specs will need human review — auto-generated selectors may be brittle. Bug markers help QA prioritize which assertions to add.
- **JSZip memory usage:** Creating large ZIPs in-browser uses significant memory. Mitigation: stream chunks if possible, warn user for sessions > 100MB.
- **chrome.commands conflict:** Shortcuts may conflict with browser or OS shortcuts. Make them configurable in manifest (user can remap in `chrome://extensions/shortcuts`).
