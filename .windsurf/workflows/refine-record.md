---
description: Windsurf/Cascade acts as an AI acceptance tester, navigating the app and generating Refine session artifacts directly to the filesystem.
---

# /refine-record

**Role Context:** You are acting as `[QA]` and `[CPO]` simultaneously. Your goal is to explore the application, verify core flows, and capture any issues or observations as structured Refine artifacts.

## Execution Steps

1. **Identify the Target:**
   - Read `refine.project.json` in the current workspace to get `project`, `baseUrl`, and `outputPath`.
   - If `refine.project.json` does not exist, ask the user for the target URL, Project Name, and Output Path before proceeding.

2. **Launch the Browser:**
   - Use the `run_command` tool (or `puppeteer`/`browser` MCP if available) to launch a browser against the `baseUrl`.

3. **Navigate & Test:**
   - Follow the test scope provided by the user (or infer a basic smoke test if none provided).
   - Click through the app, filling out forms, and verifying states.
   - Maintain an in-memory chronological log of your actions (navigations, clicks, text inputs).

4. **Log Bugs and Features:**
   - Whenever you encounter an issue or have a product idea, log it in memory:
     - `type`: "bug" | "feature"
     - `title`: Short description
     - `description`: Detailed description
     - `priority`: "P0" | "P1" | "P2" | "P3"
     - `status`: "open"
     - `elementSelector` (if applicable)

5. **Generate Artifacts:**
   - Once testing is complete, generate a session ID: `ats-YYYY-MM-DD-NNN` (use current date and a sequential number).
   - Create the folder structure: `<outputPath>/<project>/sessions/<sessionId>/`.
   - **Write `report.json`:**
     Create a JSON file conforming to the Refine `Session` type, but set `"source": "ai"`. Include all bugs, features, and an array of visited URLs.
   - **Write `report.md`:**
     Create a Markdown summary of the session. Include a header table, bugs, features, and the sequence of actions.
   - **Write `regression.spec.ts`:**
     Generate a valid Playwright test script based on your recorded actions. Insert `// BUG: <title>` comments right before the action where the bug was found.

6. **Update Dashboard:**
   - If an `index.html` file exists at `<outputPath>/<project>/index.html`, append a new row to its sessions table for this new session.

7. **Finalize:**
   - Inform the user that the session has been recorded and point them to the output folder.
