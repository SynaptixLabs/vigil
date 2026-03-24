# Sprint report checklist

## Gather inputs
- Read CLAUDE.md for project identity and current sprint
- Read sprint index for goals and tracks
- Read track TODOs for planned deliverables
- Read previous reports and decisions log
- Check git log for actual commits in sprint period

## Assess status
- Map each planned deliverable to Done / In Progress / Blocked / Deferred
- Evidence for each: commit SHA, test result, file path
- Flag items with no evidence as unverified

## Quality gates
- Unit tests (npx vitest run) — pass/fail count
- E2E (npx playwright test) — pass/fail count
- TypeScript (npx tsc --noEmit) — error count
- Build (npm run build + npm run build:server) — success/fail
- Extension loads in Chrome — verified/not tested
- Server health (GET /health) — 200/fail/not tested

## Report
- Executive summary (1-3 sentences)
- Status table by track (ext, server, dashboard)
- Quality gate table with evidence
- Done / In Progress / Blocked / Deferred lists
- Next actions with owners
- Save to docs/sprints/sprint_XX/
