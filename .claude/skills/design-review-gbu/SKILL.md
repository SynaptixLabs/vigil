---
name: design-review-gbu
description: Run a full GBU review on completed work, check requirements compliance, assess code quality, and produce a structured review report.
argument-hint: [todo-file-or-diff-scope]
context: fork
allowed-tools: Read, Grep, Glob, Edit, MultiEdit, Write, Bash(git *), Bash(npm *), Bash(npx *), Bash(npx vitest *), Bash(npx tsc *), Bash(curl *), Bash(find *), Bash(ls *)
---

Run a GBU design review for: $ARGUMENTS

Required flow:
1. Read `CLAUDE.md`, the assigned spec/TODO, `docs/03_MODULES.md`, and the actual diff/files changed.
2. Run or inspect the relevant tests and outputs.
3. Perform requirements compliance, module reuse, production readiness, and anti-pattern checks.
4. Vigil-specific checks: Shadow DOM encapsulation, MV3 compliance, rrweb/Dexie reuse, server/extension boundary, MCP tool correctness.
5. Produce Good / Bad / Ugly findings with evidence.
6. Where safe and explicitly within scope, fix small Bad/Ugly items; otherwise document carry-forward work.
7. Save a structured report using `report-template.md`.

Use `checklist.md` and be evidence-based.
