---
name: implement-dashboard
description: Execute an assigned dashboard TODO with React component reuse, API client discipline, and clean handoff.
argument-hint: [todo-file-or-task]
context: fork
allowed-tools: Read, Grep, Glob, Edit, MultiEdit, Write, Bash(git *), Bash(npm *), Bash(npx *), Bash(npx vitest *), Bash(npx tsc *), Bash(npx playwright *), Bash(find *), Bash(ls *), Bash(cat *)
---

Implement dashboard work for: $ARGUMENTS

Always follow this sequence:
1. Read `CLAUDE.md`, `docs/03_MODULES.md`, the assigned TODO, and `packages/dashboard/` source.
2. Produce a short impact plan before editing if the task changes routing, shared components, or API client contracts.
3. Reuse existing React components, hooks, and API client functions before creating new ones.
4. Make the smallest viable change set.
5. Dashboard consumes vigil-server REST API at port 7474 — no direct filesystem access.
6. Add/update Vitest tests for logic, Playwright for UI flows.
7. Run `npx tsc --noEmit` and `npm run build` — must be clean.
8. Verify no console errors on exercised flows.
9. Summarize files changed, flows validated, tests added, and open risks.

Use the companion checklist in `checklist.md`.
Never access filesystem directly — always through vigil-server API.
Never duplicate API client logic — extend existing clients.
