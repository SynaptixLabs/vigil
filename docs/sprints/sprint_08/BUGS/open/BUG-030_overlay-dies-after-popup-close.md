# BUG-030 — Vigil overlay and shortcuts die after window.open() popup closes

## Status: OPEN
## Severity: P1
## Sprint: 08
## Discovered: 2026-03-21 via manual testing on SaaS app with popup flows

## Steps to Reproduce

1. Open a SaaS application (e.g., any app with modal/popup workflows)
2. Start a Vigil session (click extension popup → Start Session)
3. Begin recording (SPACE key)
4. Trigger a `window.open()` popup from the SaaS app (e.g., OAuth flow, payment dialog, settings popup)
5. Close the popup window
6. Return to the original page

## Expected

- Vigil control bar overlay is still visible
- Keyboard shortcuts (SPACE, Ctrl+Shift+S, Alt+Shift+G) still work
- Recording continues or can be resumed
- Session is still active

## Actual

- Vigil control bar overlay **disappears**
- Keyboard shortcuts **stop working**
- Cannot continue the debug session
- Must refresh page and lose session state

## Root Cause Analysis

The content script (`src/content/content-script.ts`) checks session status **once** at `document_idle` load time (line 24-45). There is no mechanism to re-validate session state after the tab regains focus.

When a `window.open()` popup opens:
1. Chrome shifts focus to the popup window
2. The popup gets its own content script instance
3. When the popup closes, focus returns to the parent tab
4. **The parent tab's content script has no `visibilitychange` or `focus` listener** to re-check session state and re-mount the overlay

The overlay mount (`src/content/overlay/mount.ts`) has a guard `if (hostElement) return;` at line 25 — but the `hostElement` may have been GC'd or detached during the focus shift, while the variable still holds a stale reference.

Additionally, `chrome.runtime.onMessage` listener in the content script may get disconnected during the tab's background/foreground cycle.

## Proposed Fix

Add a `visibilitychange` listener to the content script that re-checks session status and re-mounts the overlay when the page becomes visible again:

```typescript
// In content-script.ts
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    safeSendMessage(
      { type: 'GET_SESSION_STATUS', source: 'content' },
      (response) => {
        if (response?.ok && response.data?.isRecording && response.data?.sessionId) {
          const sid = response.data.sessionId as string;
          // Re-mount overlay if it was lost
          if (!document.getElementById('refine-root')) {
            hostElement = null; // Clear stale reference
            mountOverlay(sid);
          }
          // Re-verify recording is active
          resumeRecording();
        }
      },
    );
  }
});
```

Also need to handle the `hostElement` stale reference in `mount.ts` — check DOM presence, not just variable truthiness.

## Regression Test
File: tests/e2e/regression/BUG-030.spec.ts
Status: ⬜

## Fix
_Pending_

## Resolution
_Pending_
