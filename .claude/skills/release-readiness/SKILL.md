---
name: release-readiness
description: Run a structured pre-release gate and produce a GO/NO-GO recommendation with explicit blockers.
argument-hint: [demo|staging|prod]
disable-model-invocation: true
context: fork
allowed-tools: Read, Grep, Glob, Edit, MultiEdit, Write, Bash(git *), Bash(npm *), Bash(npx *), Bash(npx vitest *), Bash(npx tsc *), Bash(npx playwright *), Bash(curl *), Bash(find *), Bash(ls *)
---

Run release gate for: $ARGUMENTS

Required flow:
1. Read `CLAUDE.md`, `docs/03_MODULES.md`, `checklist.md`, and `report-template.md`.
2. Read the current sprint index, latest sprint report, latest QA findings, and any deployment notes.
3. Verify quality, security, infrastructure, and extension-readiness items.
4. Mark every item PASS / FAIL / N/A with evidence.
5. Produce a final GO / NO-GO recommendation.
6. State all blockers clearly.

Never auto-approve production.
Avi approval remains mandatory.
