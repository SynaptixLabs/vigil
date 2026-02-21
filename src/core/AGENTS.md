# Refine Core Module — AGENTS.md (Tier-3)

> **Module:** `src/core/`
> **Tag:** `[DEV:core]`
> **Owner:** Extension Dev agent

---

## Scope

The Core module contains all **business logic** that is not tied to Chrome Extension APIs. It is a pure TypeScript library consumed by Background (and potentially Popup). It provides:
- Storage layer (Dexie.js wrapper for all IndexedDB operations)
- Report generator (session data → JSON + Markdown reports)
- Playwright codegen (action log → .spec.ts test scripts)
- ZIP bundler (package replay + report + screenshots + spec)

> **Note:** Selector strategy (priority ranking) is defined in `src/shared/constants.ts`. The selector engine implementation lives in `src/content/selector-engine.ts`.

## Owns

- `src/core/db.ts` — Dexie database schema + CRUD operations
- `src/core/report-generator.ts` — JSON + Markdown report creation
- `src/core/playwright-codegen.ts` — Action log → Playwright .spec.ts
- `src/core/replay-bundler.ts` — rrweb events → self-contained HTML replay

## Dependencies

- **Imports from:** `src/shared/` (types, constants)
- **Imported by:** `src/background/` (primary consumer)
- **External:** `dexie` (IndexedDB), potentially `jszip` (ZIP export)
- **No Chrome APIs** — this module is framework-agnostic

## Constraints

- Must be testable without Chrome Extension context (pure TypeScript)
- Dexie schema migrations must be forward-compatible
- Report generation must complete in < 3s for a 30-minute session
- Playwright codegen must produce syntactically valid .spec.ts files
- Selector strategy priority: `data-testid` > `aria-label` > `role` > CSS

## Testing

- Unit tests for storage CRUD (Dexie + fake-indexeddb)
- Unit tests for report generation (input session → expected output)
- Unit tests for Playwright codegen (input actions → expected .spec.ts)
- Unit tests for selector strategy
- Integration tests for full session lifecycle (storage → report → export)

**Coverage target:** ≥90% — this is the most testable module.
