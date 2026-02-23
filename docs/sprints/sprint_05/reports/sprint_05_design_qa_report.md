# Refine v1.3.0 — Final Design Review & QA Report

**Product:** SynaptixLabs Refine (Acceptance Test Recorder)
**Target Version:** 1.3.0 (Sprint 04 & 05 delivery)
**Date:** 2026-02-23

This document summarizes the core functional surface area of the Refine platform as of version `1.3.0` for final sign-off by Product, Design, and QA.

---

## 1. Product Capabilities Overview

Refine has successfully transitioned from a standalone Chrome Extension for manual testing into a comprehensive AI-native Acceptance Testing platform.

| Capability | Manual QA (Founder) | AI Discovery (Windsurf) | CI Regression (Playwright) |
|---|---|---|---|
| **Actor** | Human | `Cascade` | `npx playwright test` |
| **Execution** | Chrome Extension | `/refine-record` Workflow | `refine-reporter` |
| **Action Logging** | Click, Input, Scroll, Nav | Playwright API commands | `page.goto`, `locator.click` |
| **Bug Capture** | Inline `<form>` injected via Shadow DOM | JSON arrays built in-memory | Test failures mapped to P1 Bugs |
| **Artifact Output** | Publish button → `<outputPath>/<project>` | `fs.writeFileSync` → `<outputPath>/<project>` | `onEnd` hook → `<outputPath>/<project>` |
| **Replay** | `rrweb` DOM snapshots | Screen recordings (via Playwright trace) | Playwright HTML Report & Traces |

All three pipelines converge onto the **Project Dashboard** (`index.html`), which serves as a unified read-only pane for all session artifacts across the project.

---

## 2. Design Review Items

Please verify the following UI/UX affordances in the extension popup and injected content scripts:

### Extension Popup (`src/popup/pages/`)
1. **Session List (`SessionList.tsx`):**
   - Active (Recording/Paused) sessions pin to the top of the list.
   - Status indicators pulse red when `RECORDING`.
   - Project filter dropdown and tag text filter correctly hide non-matching sessions.
   - The "Project Settings" gear icon `⚙️` appears when a specific project is selected in the dropdown.
2. **Session Detail (`SessionDetail.tsx`):**
   - Bug statuses are now native `<select>` dropdowns (Open, In Progress, Resolved, Wontfix) with color coding.
   - Feature assignments ("Sprint Ref") save `onBlur` to prevent IndexedDB spam.
   - The **"Publish to [Project]"** button is prominent and uses an Indigo styling to indicate it is the primary call to action.
3. **Project Settings (`ProjectSettings.tsx`):**
   - Clean UI showing the configured Global Output Path.
   - Buttons to **Export `refine.project.json`** and **Refresh Dashboard HTML**.
4. **Options Page (`src/options/options.tsx`):**
   - Accessible via right-clicking the extension icon.
   - Simple form to set the `refineOutputPath` string.

### Injected Overlay (`src/content/components/`)
1. **Control Bar:**
   - Appears at bottom-center. 
   - Supports light/dark mode via `data-theme` attribute (persisted in `chrome.storage.local`).
2. **Bug Editor:**
   - Injected into a Shadow DOM boundary (immune to target page CSS).
   - Prevents pointer events from bleeding through the background overlay (`pointer-events: none` on the host, `pointer-events: auto` on the form).
   - "Inspector" mode crosshair highlights elements on hover and captures precise DOM paths on click without triggering the target app's click handler.

---

## 3. QA Testing Scenarios

Please execute the following E2E paths to certify the release.

### Scenario A: The Manual Testing Loop
1. Open the extension **Options** and set Output Path to `C:/QA/RefineOutput`.
2. Start a New Session named "Checkout Smoke Test". Assign Project "ecommerce-v2". Uncheck "Record mouse movements".
3. Navigate to a test app (e.g., the demo app).
4. Record 3 clicks and 1 input.
5. Open Bug Editor. Use the Inspector crosshair to select a broken button. Save bug.
6. Stop session.
7. Open Session Detail and click **Publish**.
8. **Verify:** Check `C:/QA/RefineOutput/ecommerce-v2/index.html`. It should list the session, show 1 bug, and the Playwright Spec link should point to a valid `.spec.ts` file containing a `// BUG:` comment.

### Scenario B: Storage & Compression (R015)
1. The background service worker compresses old sessions every hour.
2. Open `chrome://extensions` and inspect the Refine background worker.
3. In the console, force the alarm: `chrome.alarms.get('refine-prune-chunks', alarm => console.log(alarm))` (or manually invoke the compression function for a mock session).
4. **Verify:** Open the `replay.html` for a compressed session. It should play back seamlessly using the `DecompressionStream` API on the fly.

### Scenario C: CI Integration (S05-01)
1. Setup a dummy Playwright test suite that deliberately fails an assertion.
2. In `playwright.config.ts`, set `reporter: [['./src/reporter/refine-reporter.ts']]`.
3. Set `process.env.REFINE_OUTPUT_PATH = 'C:/QA/RefineOutput'` and `process.env.REFINE_PROJECT_NAME = 'ecommerce-v2'`.
4. Run `npx playwright test`.
5. **Verify:** Check `C:/QA/RefineOutput/ecommerce-v2/index.html`. A new session tagged `[AI]` or `[Manual]` (depending on badge styling for source `playwright-reporter`) should appear, logging 1 bug containing the Playwright failure stack trace.

---

## 4. Pending Technical Debt
- **Manifest V3 Service Worker Idle:** If a recording session is paused for > 5 minutes without interaction, the Chrome service worker *may* suspend. The `keep-alive.ts` alarm mitigates this, but long pauses should be tested extensively on lower-end devices.
- **Selector Fragility:** The Playwright codegen uses a strict fallback (`data-testid` > `aria-label` > `CSS path`). If the target app heavily obfuscates classes (e.g., raw Tailwind or styled-components without test IDs), the generated regressions will be brittle. Target DEV teams must adopt `data-testid` conventions.

*Approved for V1.3.0 Release Candidate.*
