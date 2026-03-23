---
name: sync-state
description: Refresh the shared Claude cockpit state file for multi-window work. Use after planning, before compaction, after deploys, and during handoffs.
argument-hint: [window-name] [focus]
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(git status *), Bash(git branch *), Bash(git rev-parse *), Bash(git diff --stat *), Bash(curl *), Bash(ls *), Bash(dir *)
---

Refresh `.claude/state/session-state.md` for **$ARGUMENTS**.

## Purpose

This skill maintains one compact shared state file that survives across multiple Claude windows and becomes the source used by the compaction reinjection hook.

## Rules

- Keep the file concise.
- Never store secrets, tokens, or full connection strings.
- Prefer exact file paths, exact commands, exact blockers, and exact next actions.
- Preserve useful existing state unless it is clearly stale.

## Read order

1. `.claude/state/session-state.md` if it exists
2. `CLAUDE.md`
3. The relevant current sprint file only if needed
4. Any directly relevant task or spec file if the user explicitly referenced it

## Required output structure

Update or create `.claude/state/session-state.md` with these sections:

1. **Snapshot**
   - last updated timestamp
   - window name
   - focus / objective
2. **Current delivery context**
   - sprint
   - branch
   - commit SHA
   - extension load status / server health / dashboard status
3. **Active files / surfaces**
   - files being changed or watched
4. **Blockers / risks**
5. **Next 3 actions**
6. **Exact commands to reuse**
7. **Handoff notes**

## Strong guidance

- If a server deploy just happened, include health check result.
- If the extension was rebuilt, include Chrome load status.
- If a plan just changed, include the new boundary and acceptance criteria.
- If the window is about to compact, make sure modified files and next actions are preserved.

After updating the file, return a brief summary of what changed.
