# /project:test — Run Full Test Suite

You are running the full test suite for the current project.

## Steps

1. **Identify the project** from the current working directory.
2. **Check if a dev server is required** (check CLAUDE.md for `server startup` instructions).
3. **Start the server if needed** — confirm it's running before proceeding.
4. **Run tests in order:**
   - Unit tests first (fast feedback)
   - Integration tests (requires services)
   - E2E tests last (full system)
5. **Report results** with:
   - ✅/❌ per test layer
   - Total pass/fail counts
   - Any failures with file path + line number
   - Server status at time of test run

## Output format

```
## Test Run — [PROJECT] — [DATE]

Server status: ✅ Running on port XXXX | ❌ Not running

### Unit Tests
Result: ✅ XX passed / ❌ XX failed
[failures if any]

### Integration Tests  
Result: ✅ XX passed / ❌ XX failed

### E2E Tests
Result: ✅ XX passed / ❌ XX failed

### Overall Gate
[ ] PASS — safe to mark feature done
[ ] FAIL — do not mark done
```

## Rules
- NEVER skip a layer without explicit Avi approval
- If server fails to start → report as test failure, do not proceed to E2E
- Save screenshots to `tests/screenshots/` for all GUI flows
