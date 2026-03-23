---
name: qa-gate
description: Validate a completed task or PR, verify dev-written tests, add QA validation where needed, and issue an explicit PASS/FAIL report.
argument-hint: [todo-file-or-pr-scope]
context: fork
allowed-tools: Read, Grep, Glob, Edit, MultiEdit, Write, Bash(git *), Bash(npm *), Bash(npx *), Bash(npx vitest *), Bash(npx tsc *), Bash(npx playwright *), Bash(curl *), Bash(find *), Bash(ls *)
---

Run QA gate for: $ARGUMENTS

Required flow:
1. Read `CLAUDE.md`, `docs/03_MODULES.md`, the assigned TODO/acceptance criteria, and any prior reports.
2. Verify dev wrote the required tests.
3. Run the right validation stack for the deliverable:
   - Extension: `npm run build` + Chrome load + `npx vitest run`
   - Server: `npm run build:server` + `GET /health` + `npx vitest run`
   - Dashboard: `npm run build` + Playwright + `npx vitest run`
   - Cross-cutting: `npm run test:all`
4. Check for regressions, missing coverage, and boundary violations.
5. Emit a report with PASS or FAIL at the top, then evidence by layer.
6. Save the report in the current sprint `docs/sprints/sprint_XX/` folder.

Use `checklist.md` and `report-template.md`.
Never sign off vaguely.
