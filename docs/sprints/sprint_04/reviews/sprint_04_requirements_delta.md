# Sprint 04 — Requirements Delta

> **Owner:** CPO
> **Date:** 2026-02-22

This document captures the requirements delta for Sprint 04 against the original PRD (v1.0.0).

## 1. Project Schema (S04-03)
**Requirement:** The extension must support exporting and validating a `refine.project.json` file.
**Acceptance Criteria:**
- `src/shared/types.ts` defines `RefineProjectConfig`.
- Options page or Settings view allows the user to download this JSON file to their project root.
- The publish pipeline checks for this file's existence in the `outputPath` and warns if missing or malformed.

## 2. Project Dashboard (S04-04)
**Requirement:** A static `index.html` dashboard generated in the `<project>` root on every publish.
**Acceptance Criteria:**
- Displays a sortable/filterable table of all sessions in `<project>/sessions/`.
- Shows key metrics: session count, total bugs, total features.
- Generated purely via client-side TS (no external build step).

## 3. Silence Compression (S04-05 / R015)
**Requirement:** Reduce IndexedDB storage footprint for older sessions by compressing idle time.
**Acceptance Criteria:**
- Background service worker runs an alarm every 60 minutes.
- Finds completed sessions > 7 days old.
- Compresses `rrweb` events array using `CompressionStream` API.
- Replay works seamlessly by decompressing on the fly.

## 4. Playwright Reporter Stub (S04-06)
**Requirement:** A foundation for CI integration.
**Acceptance Criteria:**
- Create `src/reporter/refine-reporter.ts`.
- Implements standard Playwright reporter interface.
- Output format aligns with `report.json` schema.
