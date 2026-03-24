---
name: implement-ext
description: Execute an assigned Chrome Extension TODO with Shadow DOM discipline, MV3 compliance, rrweb/Dexie reuse, and clean handoff.
argument-hint: [todo-file-or-task]
context: fork
allowed-tools: Read, Grep, Glob, Edit, MultiEdit, Write, Bash(git *), Bash(npm *), Bash(npx *), Bash(npx vitest *), Bash(npx tsc *), Bash(npx eslint *), Bash(find *), Bash(ls *), Bash(cat *)
---

Implement Chrome Extension work for: $ARGUMENTS

Always follow this sequence:
1. Read `CLAUDE.md`, `docs/03_MODULES.md`, the assigned TODO, and READMEs for touched areas.
2. Produce a short impact plan before editing if the task crosses content/background/popup boundaries or changes messaging protocol.
3. Reuse existing shared types, constants, and protocol definitions before creating new ones.
4. Make the smallest viable change set.
5. Shadow DOM for ALL injected UI — zero CSS leakage. No exceptions.
6. MV3 only — no V2 APIs (no persistent background pages, no blocking webRequest).
7. rrweb for recording, Dexie.js for IndexedDB — do NOT build custom alternatives.
8. Add/update Vitest tests for logic changes, Playwright for UI flows.
9. Run `npx tsc --noEmit` and `npm run build` — must be clean.
10. Verify extension loads in Chrome without console errors.
11. Summarize files changed, tests run, results, and open risks.

Use the companion checklist in `checklist.md`.
Never bypass Shadow DOM encapsulation.
Never use synchronous messaging where async is required by MV3.
