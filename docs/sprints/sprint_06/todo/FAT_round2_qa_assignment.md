# FAT Round 2 — QA Full Acceptance Test Assignment

**Issued by:** [CPTO]
**Date:** 2026-02-27
**For:** [QA]
**Blocking:** Sprint 06 closure — Founder sign-off

---

## Mission

Run the **complete 20-point Founder Acceptance Testing walkthrough** from end to end. Every single step. No shortcuts, no assumptions. Document PASS/FAIL for every item.

**Walkthrough doc:** `docs/sprints/sprint_06/FOUNDER_ACCEPTANCE_WALKTHROUGH.md`

---

## Pre-Conditions (MUST verify before starting)

| # | Check | How to verify |
|---|---|---|
| 1 | vigil-server running on port 7474 | `curl http://localhost:7474/health` → `{"status":"ok"}` |
| 2 | TaskPilot demo running on port 39000 | Open `http://localhost:39000` → login page loads |
| 3 | Extension rebuilt with ALL fixes | DEV:ext confirms FAT-007/008/009 fixed + `npm run build` |
| 4 | Extension reloaded in Chrome | `chrome://extensions` → reload button on Vigil |
| 5 | All unit tests passing | `npx vitest run` → 169/169 (or more) |
| 6 | TypeScript clean | `npx tsc --noEmit` → no errors |
| 7 | `.vigil/` directory exists | Check `C:\Synaptix-Labs\projects\vigil\.vigil\sessions\` exists |

**DO NOT START TESTING until ALL 7 pre-conditions are met.**

---

## Test Execution — Full 20-Point Walkthrough

Test every item in order. Record result as ✅ PASS or ❌ FAIL (with repro notes).

### Server (Steps 1-2)

| # | Test | Expected | Result | Notes |
|---|---|---|---|---|
| 1 | `GET /health` returns 200 | `{ "status": "ok", "version": "2.0.0", "llmMode": "mock" }` | | |
| 2 | Extension loads without errors | No red badge on `chrome://extensions` | | |

### Session Creation (Steps 3-4)

| # | Test | Expected | Result | Notes |
|---|---|---|---|---|
| 3 | New Session creates successfully | Popup → "New Session" header → form → "▶ Start Session" button | | |
| 4 | Control bar appears on target page | Floating bar with recording indicator, timer, buttons | | |

### Recording — SPACE Toggle (Step 4B)

| # | Test | Expected | Result | Notes |
|---|---|---|---|---|
| 5 | SPACE toggles recording (on body) | Press SPACE → recording starts; SPACE again → pauses | | |
| 5a | SPACE toggle **3+ times** | Toggle at least 3 times; ControlBar indicator must sync every time | | |
| 6 | SPACE types normally in input field | Focus a TaskPilot input → SPACE → types space character | | |
| 6a | **SPACE types normally in bug editor fields** | Open bug editor (🐛) → type in Title → SPACE → types space, does NOT toggle recording | | **FAT-007 regression check** |
| 7 | Ctrl+Shift+R toggles recording | Alternative shortcut — same behavior as SPACE | | |

### Screenshots + Bug Capture (Step 4C)

| # | Test | Expected | Result | Notes |
|---|---|---|---|---|
| 8 | Ctrl+Shift+S captures screenshot | Toast shows "✓ Screenshot captured" in ControlBar | | **FAT-003 + FAT-004** |
| 9 | Ctrl+Shift+B captures + opens editor | Toast shows "✓ Screenshot captured" THEN bug editor opens | | **FAT-003 + FAT-004** |
| 10 | Bug editor shows screenshot + URL | Screenshot preview attached, URL pre-filled | | |
| 11 | Bug submission works | Fill title, P2, description → "Submit" button → closes editor | | **FAT-006 label check** |

### End Session (Step 4D)

| # | Test | Expected | Result | Notes |
|---|---|---|---|---|
| 12 | End Session POSTs to vigil-server | Click "End Session" button → vigil-server terminal shows POST | | **FAT-001 + FAT-008 label check** |
| 13 | Session JSON written to `.vigil/sessions/` | `ls .vigil\sessions\` → JSON file present | | |
| 14 | Bug file written to `BUGS/open/` | `ls docs\sprints\sprint_06\BUGS\open\` → BUG-XXX.md with correct format | | |

### Dashboard (Step 5)

| # | Test | Expected | Result | Notes |
|---|---|---|---|---|
| 15 | Dashboard loads at `localhost:7474/dashboard` | No blank page, no console errors | | |
| 16 | Health indicator shows green + version | Green dot, `v2.0.0`, `mock` | | |
| 17 | Sprint selector shows sprint_06 | Dropdown or display says "sprint_06" | | |
| 18 | Bug table shows acceptance test bug | Row with bug title from step 11 | | |
| 19 | Severity dropdown updates bug | Change P2 → P1 → verify PATCH request | | |
| 20 | "Mark Fixed" moves bug file | Click → file moves from `BUGS/open/` to `BUGS/fixed/` | | |

---

## Additional Regression Checks (beyond the 20-point walkthrough)

| # | Test | Expected |
|---|---|---|
| R1 | Standalone new-session tab labels | If standalone tab is accessible, should say "New Session" and "▶ Start Session" |
| R2 | Popup new-session labels | Should say "New Session" and "▶ Start Session" (FAT-005 verify) |
| R3 | Bug editor "Submit" button | Should say "Submit" / "Submitting…" — NOT "Save" / "Saving…" |
| R4 | Stop button tooltip | Should say "End Session" — NOT "Stop recording" |

---

## Failure Protocol

If ANY test fails:

1. **STOP** — do NOT continue to next step
2. Document the failure:
   - Step number
   - Expected vs actual behavior
   - Console errors (if any): check `chrome://extensions` → Vigil → "Inspect views: service worker"
   - vigil-server terminal output (if relevant)
3. Report back to [CPTO] with the full failure details
4. **DO NOT** attempt to fix the code — report only

---

## Sign-Off Gate

**Sprint 06 FAT Round 2 is PASS only when:**

- [ ] All 20 walkthrough items: ✅ PASS
- [ ] All 4 regression checks: ✅ PASS
- [ ] Zero console errors in extension service worker
- [ ] Zero console errors in browser DevTools on target page
- [ ] vigil-server terminal shows clean POST processing (no errors)
- [ ] QA signs off with full result table

**If any item fails:** Sprint 06 does NOT close. Bugs go back to DEV:ext for immediate fix.

---

*Assignment issued: 2026-02-27 | [CPTO]*
