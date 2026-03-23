---
name: sprint-report-skill
description: Build a sprint status report from sprint docs, TODOs, reports, and actual code state.
argument-hint: [sprint-folder-or-index]
context: fork
allowed-tools: Read, Grep, Glob, Edit, MultiEdit, Write, Bash(git *), Bash(find *), Bash(ls *), Bash(cat *)
---

Create a sprint report for: $ARGUMENTS

Required flow:
1. Read `CLAUDE.md`, the sprint index, TODO files, previous reports, and decisions log.
2. Compare planned deliverables against actual code/docs state.
3. Categorize work into Done / In Progress / Blocked / Deferred.
4. Include quality gate status and next recommended actions.
5. Save the report in `docs/sprints/sprint_XX/`.

Use `report-template.md` and keep the report evidence-based.
