# SynaptixLabs Refine — Decision Log

> Owner: CTO / CPO
> Log all significant technical and product decisions here.

---

## Decision Index

| ID | Title | Status | Date | Decider |
|----|-------|--------|------|---------|
| ADR-001 | Chrome Extension over In-App Module | Accepted | 2026-02-20 | FOUNDER |
| ADR-002 | Unpacked distribution (no Web Store) | Accepted | 2026-02-20 | FOUNDER |
| ADR-003 | rrweb for DOM recording | Accepted | 2026-02-20 | CTO |
| ADR-004 | Dexie.js for client storage | Accepted | 2026-02-20 | CTO |
| ADR-005 | Vite + CRXJS build pipeline | Accepted | 2026-02-20 | CTO |
| ADR-006 | Shadow DOM for UI isolation | Accepted | 2026-02-20 | CTO |
| ADR-007 | Selector strategy: data-testid > aria-label > CSS | Accepted | 2026-02-20 | CTO |
| ADR-008 | Playwright (not Puppeteer) for E2E extension testing | Accepted | 2026-02-20 | CPTO |

---

## Decisions

### ADR-001: Chrome Extension over In-App Module

**Status:** Accepted | **Date:** 2026-02-20 | **Decider:** FOUNDER

**Context:** Refine needs to work on 3+ SynaptixLabs web apps. Building as an in-app module (Option A) would require per-project integration (~0.5 days each). Building as a Chrome Extension (Option B) works on any URL with zero target app changes.

**Decision:** Chrome Extension (Manifest V3). The 3-day cost delta is recouped instantly by eliminating per-project integration.

**Consequences:** New build pipeline (Vite + CRXJS). Extension DX is worse than standard React (manual reload). Testing uses Playwright with persistent context for E2E (see ADR-008).

See: `docs/knowledge/00_DISCUSSION_SUMMARY.md` §3

---

### ADR-002: Unpacked distribution (no Web Store)

**Status:** Accepted | **Date:** 2026-02-20 | **Decider:** FOUNDER

**Context:** Internal tool for SynaptixLabs team only. Web Store adds review delays and compliance requirements.

**Decision:** Distribute as unpacked extension via repo `dist/` folder. Team loads via `chrome://extensions` → Developer mode.

**Consequences:** "Developer mode extensions" nag banner in Chrome (1-second dismiss). No auto-updates — team pulls from repo.

---

### ADR-003: rrweb for DOM recording

**Status:** Accepted | **Date:** 2026-02-20 | **Decider:** CTO

**Context:** Need to record DOM mutations, mouse events, scroll, and inputs for session replay.

**Decision:** Use rrweb (MIT, ~15KB gzip) — industry standard for session replay.

**Consequences:** Lightweight, well-maintained. Records DOM structure, not video. Replay via rrweb-player.

---

### ADR-004: Dexie.js for client storage

**Status:** Accepted | **Date:** 2026-02-20 | **Decider:** CTO

**Context:** Sessions can produce 50MB+ of recording data. `chrome.storage` is limited to 10MB.

**Decision:** IndexedDB via Dexie.js (Apache 2.0, v4.x).

**Consequences:** Handles large recordings. Requires content script or background to access (not popup directly in all cases).

---

### ADR-005: Vite + CRXJS build pipeline

**Status:** Accepted | **Date:** 2026-02-20 | **Decider:** CTO

**Context:** Need a build tool that supports Manifest V3 + React + HMR.

**Decision:** Vite + CRXJS plugin. Best DX for modern Chrome Extensions.

**Consequences:** Active development (CRXJS). Avoid Webpack and Plasmo.

---

### ADR-006: Shadow DOM for UI isolation

**Status:** Accepted | **Date:** 2026-02-20 | **Decider:** CTO

**Context:** Refine overlay (control bar, bug editor) must not interfere with target app CSS/JS.

**Decision:** Inject all Refine UI inside Shadow DOM. Namespace all CSS classes.

**Consequences:** Complete CSS isolation. Slightly more complex component mounting.

---

### ADR-007: Selector strategy for Playwright export

**Status:** Accepted | **Date:** 2026-02-20 | **Decider:** CTO

**Context:** Playwright test quality depends heavily on selector stability.

**Decision:** Priority: `data-testid` > `aria-label` > `role` > CSS selector chain. Flag selectors using `nth-child` or deep nesting as brittle.

**Consequences:** Requires SynaptixLabs apps to adopt `data-testid` attributes. Fallback selectors are less stable.

---

### ADR-008: Playwright (not Puppeteer) for E2E Extension Testing

**Status:** Accepted | **Date:** 2026-02-20 | **Decider:** CPTO (approved by FOUNDER 2026-02-20)

**Context:** Original architecture specified Puppeteer for extension E2E testing based on the assumption that "Playwright cannot load unpacked Chrome extensions." This was true historically but is no longer accurate. Since Playwright 1.37+, `chromium.launchPersistentContext()` supports `--load-extension` args, enabling full extension testing.

**Decision:** Use Playwright instead of Puppeteer for all E2E testing, including extension testing.

**Rationale:**
1. Playwright is already Refine's export target — dogfooding the same framework
2. One test framework for the entire project (Vitest unit + Playwright E2E) instead of mixing Playwright + Puppeteer
3. Playwright's auto-wait, network interception, and trace viewer are superior for extension debugging
4. Team already has Playwright expertise from Papyrus QA

**Consequences:**
- E2E tests require `headless: false` (extensions need headed Chromium)
- CI pipeline needs `xvfb-run` on Linux for headed mode
- Extension fixture pattern needed (`launchPersistentContext` + extension path)

**Migration:** Update `docs/04_TESTING.md` and `docs/01_ARCHITECTURE.md` to replace Puppeteer references with Playwright.

---

*Last updated: 2026-02-20*
