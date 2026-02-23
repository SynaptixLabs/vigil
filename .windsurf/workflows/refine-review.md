---
description: Windsurf/Cascade acts as a reviewer (CPO, QA, DEV, or CTO) to read the latest Refine session artifacts from the filesystem and suggest next actions.
---

# /refine-review

**Role Context:** You are an AI agent analyzing the results of a manual or AI-generated Refine acceptance testing session. Your goal is to load structured session data and translate it into actionable tickets, tests, or code changes.

## Execution Steps

1. **Locate the Project:**
   - Read `refine.project.json` in the current workspace to identify `outputPath` and `project`.
   - Alternatively, ask the user for the path to the project's session exports.

2. **Scan Sessions:**
   - Navigate to `<outputPath>/<project>/sessions/`.
   - List all session directories. Sort them by date descending (newest first).
   - If no session ID is provided by the user, select the **most recent** session.

3. **Read Artifacts:**
   - Read `<outputPath>/<project>/sessions/<sessionId>/report.md` for a high-level summary.
   - Read `<outputPath>/<project>/sessions/<sessionId>/report.json` for structured data (bugs, features, timeline).
   - Read `<outputPath>/<project>/sessions/<sessionId>/regression.spec.ts` to see the generated Playwright test.

4. **Analyze and Present:**
   - Present a concise summary of the session:
     - Name & Date
     - Duration & Pages visited
     - Number of Bugs & Features found
   - Provide a bulleted list of the identified issues/features.

5. **Determine Next Actions (by Role):**
   - Ask the user which role they want you to assume, or infer it from their prompt.
   - **`[CPO]`**: Prioritize the bugs by impact. Draft a PRD delta or ticket descriptions for the DEV team.
   - **`[QA]`**: Review `regression.spec.ts`. If there are `// BUG:` comments, offer to extend the test with assertions that verify the fix once implemented.
   - **`[DEV]`**: Offer to create fix branches and write code patches for the identified bugs based on the reproduction steps in the report.
   - **`[CTO]`**: Note any architectural observations, UI inconsistencies, or performance issues surfaced during the session.

6. **Execute:**
   - Wait for the user to select an action, then execute it (e.g., write the test, draft the tickets, or patch the code).
