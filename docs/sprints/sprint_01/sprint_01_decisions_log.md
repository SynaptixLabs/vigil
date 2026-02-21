# Sprint 01 — Decisions Log

| ID | Decision | Rationale | Date | Decider |
|---|---|---|---|---|
| S01-001 | rrweb `checkoutEveryNms: 30000` | 30s full-snapshot checkpoints — balance fidelity vs IndexedDB storage | 2026-02-21 | CTO |
| S01-002 | Shadow DOM for overlay (ADR-006 enforcement) | CSS isolation from target app is non-negotiable | 2026-02-21 | CTO |
| S01-003 | Dexie 5-table schema (sessions, events, screenshots, bugs, features) | Normalized tables — rrweb events are large, separate for query perf | 2026-02-21 | CTO |
| S01-004 | Session FSM: RECORDING ↔ PAUSED → STOPPED → COMPLETED | Linear state machine, PAUSED↔RECORDING is the only toggle | 2026-02-21 | CTO |
| S01-005 | Overlay React in Shadow DOM via separate `createRoot` | Isolated React tree — no shared state with popup instance | 2026-02-21 | CTO |

---

## Notes

- S01-003: The `Session` interface in `shared/types.ts` has inline `actions[]`, `bugs[]`, `features[]`. For Dexie storage, these are stored in separate tables with `sessionId` foreign key. The interface represents the **hydrated view** — db.ts handles join/flatten.
- S01-004: `PROCESSING` status from the enum is reserved for Sprint 02 (report generation). Sprint 01 goes directly STOPPED → COMPLETED.
- S01-005: Content script bundles React + Tailwind inside the Shadow DOM. This means the overlay CSS is **not** shared with the popup's Tailwind — it's a separate bundle. CRXJS handles this via separate entry points.

---

*Last updated: 2026-02-21*
