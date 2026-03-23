---
name: implement-server
description: Execute an assigned vigil-server TODO with MCP tool discipline, filesystem writer reuse, and clean handoff.
argument-hint: [todo-file-or-task]
context: fork
allowed-tools: Read, Grep, Glob, Edit, MultiEdit, Write, Bash(git *), Bash(npm *), Bash(npx *), Bash(npx vitest *), Bash(npx tsc *), Bash(node *), Bash(curl *), Bash(find *), Bash(ls *), Bash(cat *)
---

Implement vigil-server work for: $ARGUMENTS

Always follow this sequence:
1. Read `CLAUDE.md`, `docs/03_MODULES.md`, the assigned TODO, and `packages/server/` READMEs.
2. Produce a short impact plan before editing if the task changes API routes, MCP tools, or filesystem writer contracts.
3. Reuse existing filesystem reader/writer/counter modules before creating new ones.
4. Make the smallest viable change set.
5. vigil-server owns REST API + MCP + filesystem — never LLM logic (that belongs to AGENTS platform).
6. All config from `vigil.config.json` via `packages/server/src/config.ts` — no hardcoded paths.
7. Add/update Vitest tests for route handlers, MCP tools, and filesystem operations.
8. Run `npx tsc --noEmit` and `npm run build:server` — must be clean.
9. Verify health check: `GET /health → 200`.
10. Summarize files changed, tests run, results, and open risks.

Use the companion checklist in `checklist.md`.
Never put LLM logic in vigil-server — proxy to AGENTS platform.
Never hardcode filesystem paths — use config.
