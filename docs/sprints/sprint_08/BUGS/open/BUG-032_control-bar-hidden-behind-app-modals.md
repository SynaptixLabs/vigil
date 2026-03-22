# BUG-032 — Vigil control bar hidden behind app modals ("GOD MODE" failure)

## Status: OPEN
## Severity: P1
## Sprint: 08
## Discovered: 2026-03-22 via manual FAT on Papyrus app (PPTX: Bugs-22032026-1.pptx, Slide 2)
## Assigned: [DEV:ext]

## Steps to Reproduce

1. Open a web app that uses modals/overlays (e.g., Papyrus)
2. Start a Vigil session and begin recording
3. Trigger a modal dialog in the app (e.g., "Verify your email" modal, login overlay, any full-screen modal)
4. Observe the Vigil control bar

## Expected

- Vigil control bar remains visible **on top of everything** at all times
- Control bar is fully interactive regardless of what the app renders
- "GOD MODE" — Vigil monitoring UI must always work no matter what the app uses

## Actual

- Vigil control bar **disappears** behind the app's modal/overlay
- Cannot access recording controls, bug reporter, or session management
- Must close the modal or find another way to interact with Vigil

## Screenshot

See `test-results/Bugs-22032026-1.pptx` Slide 2 — Papyrus "Verify your email" modal covers entire viewport, Vigil control bar not visible. Annotation: "MENU MUST BE on top" / "This is GOD MODE monitoring"

## Root Cause Analysis

The host element (`#refine-root`) is created with `z-index: 2147483647` and `position: fixed` — the maximum CSS z-index. However, this is insufficient when:

1. **Top-layer API**: Apps using `<dialog>.showModal()` render in the browser's "top layer" which is above ALL z-indices by spec
2. **Stacking context isolation**: If the host element is inside a container with `transform`, `filter`, `will-change`, or `perspective`, it creates a new stacking context that caps the effective z-index
3. **Full-viewport overlays**: App modals with `position: fixed; inset: 0; z-index: 999999` + backdrop cover the entire viewport and block pointer events

Key code:
- `src/content/overlay/mount.ts` line 40-42 — host element creation with max z-index
- `src/content/styles/overlay.css` — all UI elements at z-index 2147483647
- Shadow DOM provides CSS isolation but not stacking-context supremacy

## Proposed Fix

### Primary: Re-append host element above new modals
Add a `MutationObserver` on `document.body` that detects when new high-z-index elements or `<dialog>` elements are added, and re-appends `#refine-root` as the last child of `<body>` to ensure DOM order puts it on top.

### Secondary: Popup fallback controls
Add basic session controls (pause, stop, report bug) to the extension popup panel so users can always access controls even if the in-page bar is obscured. Founder note: "I suggest having the menu herein also (Or at least the option to resurface the menu)"

### Tertiary: "Resurface" button
Add a "Show Control Bar" action in the popup that forcefully re-mounts the overlay and brings it to front.

## Regression Test
File: tests/e2e/regression/BUG-032.spec.ts
Status: ⬜

## Fix
Already implemented in commit `d5520b2` (BUG-030 fix):
1. `src/content/overlay/mount.ts` — MutationObserver watches body for new children, re-appends `#refine-root` as last child
2. `src/content/overlay/mount.ts` — `resurfaceOverlay()` exported for manual invocation
3. `src/popup/pages/SessionList.tsx` — "Resurface Bar" button sends `RESURFACE_OVERLAY` to content script
4. `src/background/message-handler.ts` — forwards `RESURFACE_OVERLAY` to active tab
5. `src/content/content-script.ts` — handles `RESURFACE_OVERLAY` message

## Resolution
Fixed (pre-existing) — code was committed before PPTX screenshots were taken. Awaiting FAT re-test with latest build.
