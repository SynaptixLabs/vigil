# Refine â€” Acceptance Test Recorder: Background & Decision Summary

> **Context document for the incoming PM/CTO lead**
> Prepared by: CPTO Agent (on behalf of Avi, SynaptixLabs CPTO)
> Date: 2026-02-20
> Status: APPROVED â€” ready for Sprint-0 execution

---

## 1. Origin: Why This Exists

During Sprint 09 close of the Papyrus project (academic publishing platform), the CPTO identified that **manual acceptance testing** is a recurring bottleneck across SynaptixLabs projects. The team currently has:

- 2 QA teams writing Playwright E2E specs
- No tooling for the product owner (Avi) to systematically walk through the app, record what he sees, and produce actionable output for DEV and QA

The immediate trigger was a bug triage session where 6 production bugs were found via manual visual inspection of screenshots. Each bug required manual writeup with: URL, description, priority, affected component, reproduction steps. This process is slow, error-prone, and produces no reusable test artifacts.

**Avi's stated need:**
> "I would like to have a recording system that records each step of the process â€” the process will be logged to be repeated in regression testing. I will be able to record, pause, stop and delete. Each session will have an auto ID, name and description. I will have an editor to store bugs and feature requests â€” quick type + priority. Following a record session: there will be a report, the dev team can repair bugs, the QA team can use the recording for regression testing."

**Scale:** Avi confirmed he needs this for **3+ SynaptixLabs projects**, not just Papyrus. This elevated the tool from a project feature to a standalone product.

---

## 2. Options Evaluated

### Option A: In-App Module (Papyrus `/admin/atr`)

Build as a React module inside Papyrus, later copy to other projects.

| Pros | Cons |
|------|------|
| Normal Next.js DX (hot reload, same debugger) | Must be manually copied + integrated per project |
| ~6 days to build | rrweb injection is same-origin only (trivial but limiting) |
| Easy to test with Playwright | Navigation persistence requires `sessionStorage` wiring |
| No new build pipeline | Screenshots via `html2canvas` (slower, misses iframes) |

**Extraction cost to new projects:** ~0.5 days each (copy module, wire provider into layout).
**Total cost for 3 projects:** ~7 days.

### Option B: Chrome Extension (Manifest V3)

Build as a standalone Chrome Extension that works on any URL.

| Pros | Cons |
|------|------|
| Works on ANY web app at ANY URL â€” zero target app changes | New build pipeline (Vite + Manifest V3) |
| Navigation persistence is native (background service worker) | Chrome extension DX is worse (manual reload, separate debugger) |
| Screenshots via `chrome.tabs.captureVisibleTab()` â€” fast, reliable | Extension testing requires Puppeteer (not Playwright) |
| Install once â†’ works on all 3+ projects | Slightly more complex architecture (popup + content script + background worker) |

**Total cost for all projects:** ~9 days, then zero per-project cost.

### Option C: Electron/Tauri Desktop App

Rejected â€” overkill for this use case, adds distribution/update burden.

---

## 3. Decision: Chrome Extension

**Avi's decision:** Chrome Extension (Option B).

**Key reasoning:**
- Needs it for 3+ projects immediately, all at different URLs
- No Chrome Web Store needed â€” runs as unpacked extension in developer mode (just `chrome://extensions` â†’ Load Unpacked)
- The 3-day cost delta (9 vs 6 days) is recouped instantly by eliminating per-project integration work
- Extension architecture cleanly separates the tool from the target apps

**Distribution model:** Unpacked extension, developer mode. No Web Store submission. Shared to team members via the repo's `dist/` folder.

---

## 4. Industry Standards Referenced

### Session-Based Test Management (SBTM)
Pioneered by James Bach. The Refine maps directly:
- **Charter** â†’ Session name + description
- **Session** â†’ Time-boxed recording with bug logging
- **Debrief** â†’ Auto-generated report with bugs, screenshots, timeline

### Prior Art (Commercial Tools)
- **Replay.io** â€” records browser sessions for debugging (Chrome Extension)
- **Bird Eats Bug** â€” visual bug reporting (Chrome Extension)
- **Marker.io** â€” visual feedback tool (Chrome Extension + SaaS)
- **BugHerd** â€” visual bug tracker (Chrome Extension)
- **Loom** â€” screen recording (Chrome Extension)

Refine differentiates by combining: **session recording + inline bug/feature logging + Playwright test export** â€” none of the above do all three.

---

## 5. Core Technology Choices (Pre-Approved)

| Component | Technology | Rationale |
|---|---|---|
| Extension standard | Chrome Manifest V3 | Current standard, required for modern extensions |
| Build tool | Vite + CRXJS plugin | Best DX for Manifest V3 extensions with React |
| UI framework | React 18 + Tailwind CSS | Same stack as all SynaptixLabs projects |
| DOM recording | **rrweb** (MIT, ~15KB gzip) | Industry standard session replay. Records DOM mutations, mouse, scroll, input |
| Action extraction | Custom layer on rrweb events | Extract user intent (click, type, navigate) for Playwright codegen |
| Screenshots | `chrome.tabs.captureVisibleTab()` | Native Chrome API, fast, reliable, captures full viewport |
| Client storage | **IndexedDB** via Dexie.js | Can handle 50MB+ recordings. `chrome.storage` limited to 10MB |
| Playwright export | Custom codegen transformer | Action log â†’ Playwright `.spec.ts` test scripts |
| Visual replay | **rrweb-player** (bundled in export HTML) | Self-contained HTML replay file |

---

## 6. Data Consumers (3 Audiences)

| Consumer | What they get from Refine |
|---|---|
| **Product Owner (Avi)** | Session report with timeline, bugs, feature requests, screenshots |
| **DEV teams** | Bug reports with: exact URL, reproduction steps, screenshots, DOM selector of affected element, priority |
| **QA teams** | (a) rrweb recording for visual replay, (b) Playwright `.spec.ts` for automated regression |

---

## 7. What Refine Does NOT Replace

- **QA-written Playwright suites** â€” Refine generates starting points; QA teams refine into production test specs
- **Unit tests** â€” completely different layer
- **CI/CD test runners** â€” Refine is for manual exploratory testing, not automated pipelines
- **Screen recording tools (Loom, etc.)** â€” Refine records DOM structure + actions, not video. Output is structured data, not MP4

---

## 8. Open Questions for the New PM/CTO

1. **Session data lifecycle** â€” How long to keep recordings? Auto-purge after N days? Manual cleanup only?

2. **Multi-tab support** â€” Should Refine track activity across multiple tabs in the same session? (Adds complexity; recommend single-tab for MVP.)

3. **Team collaboration** â€” Should sessions be shareable beyond file export? (e.g., shared IndexedDB via extension sync, or a lightweight server component.) Recommend: file export only for MVP.

4. **Selector strategy for Playwright export** â€” Prefer `data-testid` attributes? Fall back to CSS selectors? Use rrweb's recorded selectors? This affects Playwright test quality significantly. Recommend: prefer `data-testid` > `aria-label` > CSS selector chain.

5. **Branding** â€” "SynaptixLabs Refine" or a product name? (e.g., "Witness", "Session", "Patrol", etc.)

---

## 9. Reference Files

| Document | Location | Description |
|---|---|---|
| This summary | `docs/knowledge/00_DISCUSSION_SUMMARY.md` | Context for new PM/CTO |
| PRD | `docs/0k_PRD.md` | Filled product requirements |
| Architecture | `docs/01_ARCHITECTURE.md` | Filled technical architecture |
| Sprint-0 plan | `docs/sprints/sprint_00/` | Kickstart checklist |
| Windsurf template | `C:\Synaptix-Labs\projects\Windsurf-Projects-Template` | Base repo template |

---

*Prepared: 2026-02-20 | Approved by: Avi (CPTO, SynaptixLabs)*
