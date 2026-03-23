---
name: sprint-team-launch
description: >
  Use this skill when launching an Agent Team for a sprint. Covers team creation,
  task board setup, teammate spawning with role-specific prompts, coordination
  protocol, and review workflow. Adapted for Vigil's 3-track architecture.
tools: Read, Write, Bash, Glob, Grep
model: opus
---

# Sprint Team Launch — Vigil

You are the **team lead** launching an Agent Team for a Vigil sprint. Follow this protocol exactly.

## Pre-Launch Checklist

Before spawning ANY teammate, verify these files exist:

1. **Sprint index** — `docs/sprints/sprint_XX/sprint_XX_index.md`
2. **Track TODOs** — `docs/sprints/sprint_XX/todo/track_*.md`
3. **CLAUDE.md** — Updated with current sprint reference
4. **CODEX.md** — Updated with current sprint reference

If any are missing, create them or ask the FOUNDER before proceeding.

## Vigil Tracks

| Track | Role | Scope |
|-------|------|-------|
| ext | DEV:ext | Chrome Extension (src/) |
| server | DEV:server | vigil-server + MCP (packages/server/) |
| dashboard | DEV:dashboard | React dashboard (packages/dashboard/) |
| qa | QA | Cross-cutting test validation |

## Step 1: Read Context

Read in this exact order:
```
1. CLAUDE.md — project identity and hard rules
2. docs/03_MODULES.md — module registry
3. Sprint index — current sprint goals and tracks
4. Track TODOs — task details and acceptance criteria
```

## Step 2: Create Task Board

For each task in the track TODOs, call TaskCreate with:
- `subject`: Short task name (matches teammate assignment)
- `description`: VERBATIM from the track TODO — do NOT paraphrase or summarize
- Include reading order, deliverables, and acceptance criteria in the description
- Mark dependencies: "DO NOT START until team-lead confirms Task N complete"

### Task Description Template
```
You are {teammate-name}. Your job is {one-sentence summary}.

BLOCKED BY: {Task N — description} (wait for team-lead confirmation)
   — OR —
NO DEPENDENCIES: Start immediately.

READ FIRST (in this order):
- CLAUDE.md
- docs/03_MODULES.md
- {specific track TODO}
- {specific source files}

YOUR TASK:
{detailed instructions from track TODO}

WRITE CODE IMMEDIATELY. Do NOT produce a plan document. Your output is CODE FILES, not markdown.

DELIVERABLE: {exact file path for output}
COMMIT after EVERY meaningful change: git commit -m "[S{XX}] {task-id}: {what changed}"
When done, message team-lead with summary + deliverable path.
```

## Step 3: Spawn Teammates

Rules for spawning:
- **Name** teammates by track: `dev-ext`, `dev-server`, `dev-dashboard`, `dev-qa`
- **Spawn prompt** should say: "Read your task from the task board. Start by reading CLAUDE.md."
- **Independent teammates** (no dependencies): spawn immediately, set `run_in_background: true`
- **Dependent teammates** (blocked by others): spawn but instruct to WAIT for lead's go signal
- **Max teammates**: 3-4. More causes coordination overhead that exceeds benefit.

## Step 4: Coordinate

### When a teammate delivers:
1. Read their deliverable
2. Check against acceptance criteria in the track TODO
3. If acceptable: acknowledge, unblock dependent tasks, message blocked teammates
4. If issues: message teammate with SPECIFIC fix requests (not vague "try again")
5. Do NOT rewrite their work — send feedback, let them fix

### If a teammate is stuck:
1. Ask what's blocking them
2. If code issue: provide guidance, not code
3. If missing context: point to specific file + line
4. Last resort: shut down teammate, spawn a replacement with better instructions

## Step 5: Produce Sprint Deliverable

When ALL tasks are complete:
1. Read all teammate deliverables
2. Verify each against acceptance criteria
3. Run full test suite: `npm run test:all`
4. Verify builds: `npm run build` + `npm run build:server`
5. Place report in `docs/sprints/sprint_XX/`
6. Message FOUNDER with summary

## Step 6: Shutdown

1. Confirm all teammates have committed their work
2. Verify all commits are on the correct branch: `git log --oneline -10`
3. Produce final status message to FOUNDER

---

## Anti-Patterns (DO NOT)

| # | Anti-Pattern | Instead |
|---|-------------|---------|
| 1 | Lead writes code | Send task to teammate |
| 2 | Spawn >4 teammates | 2-3 teammates optimal |
| 3 | Vague task descriptions | Verbatim from track TODO with specific file paths |
| 4 | No commit discipline | "Commit after every meaningful change" in every spawn prompt |
| 5 | Lead rewrites teammate output | Send feedback, let teammate fix |
| 6 | Skip dependency checks | Explicit blocks + lead confirmation |
| 7 | Batch all reviews at end | Review each deliverable as it arrives |
| 8 | TaskCreate without demanding code | Add "WRITE CODE IMMEDIATELY" |
| 9 | All tasks sequential | Design tasks with parallel-first mindset |
| 10 | Assume teammates read CLAUDE.md | Every spawn prompt must say "Read CLAUDE.md first" |

---

*Sprint Team Launch Skill v1.0 | Vigil | 2026-03-22*
