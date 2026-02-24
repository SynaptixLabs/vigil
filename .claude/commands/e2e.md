# /project:e2e — E2E Browser Testing with Playwright MCP

You are running end-to-end browser tests using the Playwright MCP tool.

## Steps

1. **Verify dev server is running** — check for the port in CLAUDE.md or package.json
2. **If not running** → start it and wait for "ready" signal before proceeding
3. **Navigate to the app** using Playwright MCP
4. **Run the full user flow:**
   - Homepage loads correctly
   - Registration/signup flow (if applicable)
   - Login flow (if applicable)
   - Core feature flows (check CLAUDE.md for project-specific flows)
   - Error states (try invalid inputs)
5. **Screenshot every significant state** — save to `tests/screenshots/e2e_[timestamp]/`
6. **Report results**

## Playwright MCP Usage Pattern

```
- Use playwright_navigate to go to pages
- Use playwright_screenshot after every major action
- Use playwright_click, playwright_fill for interactions
- NEVER assume success — always take a screenshot to verify
```

## Critical Rules

- Real server required — no mocks for E2E
- Every assertion must have a screenshot
- If a step fails → screenshot the failure state + stop and report
- Test with data that looks realistic (not "test123")

## Output format

```
## E2E Run — [PROJECT] — [DATE]

Server: ✅ Running on http://localhost:XXXX

### Flow: [Flow Name]
Step 1: [action] → ✅ Screenshot: tests/screenshots/001_homepage.png
Step 2: [action] → ✅
Step 3: [action] → ❌ FAILED: [reason] Screenshot: tests/screenshots/003_error.png

### Summary
Flows passed: X/Y
Critical failures: [list]

### Gate
[ ] PASS | [ ] FAIL
```
