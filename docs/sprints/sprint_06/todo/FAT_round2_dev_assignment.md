# FAT Round 2 — DEV:ext Assignment

**Issued by:** [CPTO]
**Date:** 2026-02-27
**For:** [DEV:ext]
**Priority:** Block FAT Round 2 retest

---

## Background

Founder Acceptance Testing (FAT) Round 1 found 6 bugs. DEV:ext coded fixes for all 6 (BUG-FAT-001 through FAT-006). However, **3 additional issues were missed** during the fix pass. This assignment covers the remaining open bugs.

**Reference:** `docs/sprints/sprint_06/FOUNDER_ACCEPTANCE_WALKTHROUGH.md` — inline "Avidor Notes"

---

## Bug Status Summary

| Bug ID | Severity | Description | Status |
|---|---|---|---|
| BUG-FAT-001 | P1 | End Session → POST to vigil-server | ✅ FIXED |
| BUG-FAT-002 | P2 | SPACE toggle state sync (ControlBar stale) | ✅ FIXED |
| BUG-FAT-003 | P2 | Ctrl+Shift+S doesn't capture (vigil session fallback) | ✅ FIXED |
| BUG-FAT-004 | P3 | No visual feedback on keyboard shortcut captures | ✅ FIXED |
| BUG-FAT-005 | P3 | "Start Recording" → "Start Session" (popup only) | ✅ FIXED |
| BUG-FAT-006 | P3 | "Save" → "Submit" (bug editor) | ✅ FIXED |
| **BUG-FAT-007** | **P2** | **SPACE fires inside Shadow DOM bug editor fields** | **❌ OPEN** |
| **BUG-FAT-008** | **P3** | **Stop button says "Stop recording" → should be "End Session"** | **❌ OPEN** |
| **BUG-FAT-009** | **P3** | **Standalone `new-session.tsx` still says "Start Recording"** | **❌ OPEN** |

---

## OPEN Bugs — Fix Instructions

### BUG-FAT-007 (P2) — SPACE fires inside Shadow DOM bug editor fields

**FOUNDER note:** *"In bug reports POPUP - 'SPACE' starts and stops recording when in the edit boxes - i.e. in Title / Description"*

**Root cause:** `content-script.ts` SPACE handler (line ~121) checks `document.activeElement.tagName` to guard against input fields. But the bug editor's `<input>` and `<textarea>` elements live inside Shadow DOM (`#refine-root` → shadow root). When focus is inside Shadow DOM, `document.activeElement` returns the shadow **host** element (`#refine-root`, a `<div>`), NOT the actual focused input. The `tagName` check sees `DIV`, not `INPUT`, so the guard fails.

**File:** `src/content/content-script.ts` — SPACE keydown handler

**Fix:** Add a Shadow DOM check before the existing tag guard:
```typescript
// If focus is inside our Shadow DOM overlay, don't intercept SPACE
if (active?.id === 'refine-root' || active?.closest?.('#refine-root')) return;
```

**Verify:** Open bug editor (Ctrl+Shift+B) → type in Title field → press SPACE → should type a space, NOT toggle recording.

---

### BUG-FAT-008 (P3) — Stop button label: "Stop recording" → "End Session"

**FOUNDER note:** *"I don't have End Session button - just STOP RECORD"*

**Root cause:** ControlBar stop button has `title="Stop recording"` and `aria-label="Stop recording"`. These were never updated when the session model changed.

**File:** `src/content/overlay/ControlBar.tsx` — stop button (around line 316-325)

**Fix:** Change:
- `title="Stop recording"` → `title="End Session"`
- `aria-label="Stop recording"` → `aria-label="End Session"`

---

### BUG-FAT-009 (P3) — Standalone new-session.tsx labels

**Root cause:** FAT-005 only fixed `src/popup/pages/NewSession.tsx` (side panel version). The standalone tab version at `src/new-session/new-session.tsx` still has the old labels.

**File:** `src/new-session/new-session.tsx`

**Fix:**
- Line 6: `<title>Refine — New Recording Session</title>` → `<title>Vigil — New Session</title>`
- Line 159: `'New Recording Session'` → `'New Session'`
- Line 298: `'▶ Start Recording'` → `'▶ Start Session'`

---

## After Fixing

1. `npx tsc --noEmit` — must be clean
2. `npx vitest run` — 169/169 (or more)
3. `npm run build` — rebuild extension to `dist/`
4. `npm run build:dashboard` — rebuild dashboard
5. **Notify QA:** Extension ready for FAT Round 2 retest

---

## DoD for This Assignment

- [ ] BUG-FAT-007 fixed — SPACE does NOT toggle recording when inside Shadow DOM overlay
- [ ] BUG-FAT-008 fixed — Stop button says "End Session"
- [ ] BUG-FAT-009 fixed — Standalone new-session.tsx says "New Session" / "Start Session"
- [ ] TypeScript clean
- [ ] All unit tests pass
- [ ] Extension builds clean
- [ ] Dashboard builds clean

---

*Assignment issued: 2026-02-27 | [CPTO]*
