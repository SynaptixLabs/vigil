# BUG-FAT-007 — SPACE toggles recording inside Shadow DOM bug editor fields

## Status: FIXED
## Severity: P2
## Sprint: 06
## Discovered: 2026-02-26 via manual: Founder Acceptance Testing Round 1

## Steps to Reproduce

1. Start a Vigil session on any target page
2. Start recording (SPACE or Ctrl+Shift+R)
3. Open the bug editor (click 🐛 button or Ctrl+Shift+B)
4. Click into the **Title** input field in the bug editor
5. Press SPACE to type a space character

## Expected

SPACE types a space character in the Title input field (normal text input behavior).

## Actual

SPACE toggles recording pause/resume AND does NOT type a space in the field. The bug editor is unusable for any text containing spaces.

## Root Cause

`content-script.ts` SPACE handler checks `document.activeElement.tagName` to guard against input fields. But the bug editor lives inside Shadow DOM (`#refine-root` → shadow root → React tree). When focus is on a Shadow DOM `<input>`, `document.activeElement` returns the shadow **host** (`#refine-root`, which is a `<div>`), not the actual input. The guard sees `tagName === 'DIV'` and allows the SPACE toggle to fire.

## Fix

In `src/content/content-script.ts`, SPACE handler — add Shadow DOM check:
```typescript
if (active?.id === 'refine-root' || active?.closest?.('#refine-root')) return;
```

## Regression Test

File: tests/e2e/regression/BUG-FAT-007.spec.ts
Status: ⬜

## Assigned To

[DEV:ext]

## Resolution

Fixed in FAT Round 2. Added Shadow DOM guard (`active.id === 'refine-root'`) to SPACE handler in `content-script.ts`. QA verified 20/20 FAT pass.
