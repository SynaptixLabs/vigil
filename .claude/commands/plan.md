# /project:plan — Force Plan Mode for Complex Tasks

## When to use
Invoke this BEFORE starting any task that:
- Touches more than 2 files
- Involves a user-facing flow change
- Crosses module boundaries
- Requires infrastructure changes

## What to produce

Before writing ANY code, produce this plan:

```
## Task: [description]

### Impact assessment
Files to touch: [list with paths]
Modules affected: [list]
Cross-boundary changes: YES/NO — [explain if yes]
One-way doors: YES/NO — [list if yes]

### Approach
Step 1: [action] → [file]
Step 2: [action] → [file]
Step 3: [action] → [file]

### Test plan
- Unit: [what to test]
- Integration: [what to test]  
- E2E: [user flows to verify]

### Risks / assumptions
- [risk 1]
- [assumption 1]

### Scope
In scope: [explicit list]
Out of scope: [explicit list]

### Time estimate
~X Vibes (1 Vibe = 1K tokens)
```

## After producing the plan
**STOP. Wait for Avi approval before executing.**

Only proceed if Avi says "go", "approved", "proceed", or equivalent.
