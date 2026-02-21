# Refine Shared Module — AGENTS.md (Tier-3)

> **Module:** `src/shared/`
> **Tag:** `[DEV:shared]`
> **Owner:** Extension Dev agent

---

## Scope

The Shared module contains **types, constants, and utilities** used by all other Refine modules. It is the only module that can be imported by every other module.

## Owns

- `src/shared/index.ts` — Barrel export (re-exports all shared types, constants, messages, utils)
- `src/shared/types.ts` — Session, Bug, Feature, Action, Report, RecordingEvent types
- `src/shared/messages.ts` — Chrome message type definitions + helpers
- `src/shared/constants.ts` — Session ID format, limits, defaults, selector priorities
- `src/shared/utils.ts` — Timestamp formatting, ID generation, common helpers

## Dependencies

- **Imports from:** Nothing (leaf module)
- **Imported by:** All other modules (background, content, popup, core)
- **No Chrome APIs, no external dependencies** — pure TypeScript

## Constraints

- Zero external dependencies — keep it lean
- Backward compatible — changes here affect all modules
- All types must be exported explicitly via barrel (`index.ts`)
- No business logic — types, constants, and pure utility functions only

## Testing

- Unit tests for utility functions
- Type tests (compile-time verification of type definitions)

**Coverage target:** ≥90%
