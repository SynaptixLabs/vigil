# Sprint 05 — DR: Q505 `btn-publish` Visibility & outputPath Source

**ID:** sprint_05_DR_Q505
**Date:** 2026-02-23
**Author:** CTO
**Status:** ✅ Resolved — Implemented

---

## Question (from QA)

> Does `btn-publish` appear when `session.outputPath` comes from `chrome.storage.local` at session creation time, or must the E2E helper explicitly pass `outputPath` in the `CREATE_SESSION` payload?
> Depending on the answer, Q505's publish assertion may be scoped differently.

---

## Answer

**`btn-publish` is driven by `session.outputPath` stored on the `Session` record in IndexedDB — not by reading `chrome.storage.local` at render time.**

### Exact data flow (verified in source)

**Step 1 — Background reads storage at `CREATE_SESSION` time**

`@c:\Synaptix-Labs\projects\project-refiner\src\background\message-handler.ts:52-58`

```typescript
chrome.storage.local.get(['refineOutputPath'], (res) => {
  const outputPath = res.refineOutputPath as string | undefined;
  sessionManager
    .createSession(name, description ?? '', url, targetTabId, recordMouseMove ?? false, tags ?? [], project, outputPath)
    .then((session) => sendResponse({ ok: true, data: session }))
    .catch((err: Error) => sendResponse({ ok: false, error: err.message }));
});
```

`outputPath` is read from `chrome.storage.local.refineOutputPath` **once**, at the moment `CREATE_SESSION` is handled. It is then passed directly into `sessionManager.createSession()` and persisted onto the `Session` record in Dexie.

**Step 2 — `SessionDetail` renders `btn-publish` based on `session.outputPath`**

`@c:\Synaptix-Labs\projects\project-refiner\src\popup\pages\SessionDetail.tsx`

```typescript
{session.outputPath && (
  <button data-testid="btn-publish" ...>
    Publish to {session.project}
  </button>
)}
```

The popup reads `session.outputPath` directly from the IndexedDB `Session` record. It does **not** re-read `chrome.storage.local` at render time.

---

## Implication for Q505

The `CREATE_SESSION` payload does **not** need to include `outputPath` — the background injects it automatically from storage.

**The correct E2E pattern is:**

```typescript
// Set refineOutputPath in chrome.storage.local BEFORE creating the session.
// The background reads this at CREATE_SESSION time and stores it on the Session record.
await popupPage.evaluate((outputPath) => {
  return new Promise<void>((resolve) => {
    chrome.storage.local.set({ refineOutputPath: outputPath }, () => resolve());
  });
}, '/tmp/refine-q505-output');

// Now create the session normally — outputPath is attached automatically.
await popupPage.getByTestId('btn-new-session').first().click();
await popupPage.getByTestId('input-session-name').fill('Q505 Publish Button Session');
await popupPage.getByTestId('btn-start-recording').click();
```

After stopping the session and opening SessionDetail, `btn-publish` will be visible.

**Do NOT** try to pass `outputPath` in the `CREATE_SESSION` message payload — the `handleMessage` handler does not read `outputPath` from the payload; it reads it exclusively from `chrome.storage.local`.

---

## Implementation Status

Q505 has been **fully implemented** in `@c:\Synaptix-Labs\projects\project-refiner\tests\e2e\project-association.spec.ts`.

| Test | Description | Pattern |
|------|-------------|---------|
| Test 1 | Session with project name appears in project filter | `select-project-filter` option assertion |
| Test 2 | Selecting project reveals gear button → opens ProjectSettings | `btn-project-settings` → `project-settings-container` |
| Test 3 | `btn-publish` visible when `outputPath` set via storage | `page.evaluate` sets `refineOutputPath` before `createSession` |

The `createSession` helper in `@c:\Synaptix-Labs\projects\project-refiner\tests\e2e\helpers\session.ts` was **not modified** — the storage setup is done inline in Q505 Test 3 only, keeping the helper clean for all other specs that don't need `outputPath`.

---

## Decision

| Option | Verdict |
|--------|---------|
| Pass `outputPath` in `CREATE_SESSION` payload | ❌ Not supported — handler ignores payload field |
| Set `chrome.storage.local.refineOutputPath` before `createSession` | ✅ Correct — matches production user flow |
| Mock `session.outputPath` directly in IndexedDB | ❌ Fragile — bypasses the real flow, not representative |

**Chosen:** Set `chrome.storage.local.refineOutputPath` via `page.evaluate()` before session creation. This mirrors exactly what a real user does (sets output path in Options page, then starts a session).

---

## Related Files

| File | Role |
|------|------|
| `src/background/message-handler.ts:52-58` | Reads `refineOutputPath` from storage at `CREATE_SESSION` |
| `src/popup/pages/SessionDetail.tsx` | Renders `btn-publish` when `session.outputPath` is truthy |
| `tests/e2e/project-association.spec.ts` | Q505 implementation — all 3 tests |
| `tests/e2e/helpers/session.ts` | `createSession` helper — unchanged |
| `docs/04_TESTING.md` | Q505 pattern documented in Sprint 03–05 section |
