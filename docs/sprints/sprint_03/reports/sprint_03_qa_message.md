# Message to QA Team: Sprint 03 Release

Hi QA Team,

Refine **v1.1.0** is now ready for testing. This release focuses heavily on export pipelines, artifact management, and resolving structural UX issues you flagged in earlier sprints.

### 🧪 What to Test

**1. Replay Extension Page (CSP compliance)**
- We've moved away from the downloadable `replay.html` (which was getting blocked by Chrome MV3 blob execution policies).
- Go to any completed session and click **Watch Replay**. It should open a new tab (`chrome-extension://.../src/replay-viewer/replay-viewer.html`) and play the session directly from IndexedDB.
- *Test:* Playback speeds, timeline scrubbing, resizing the window.

**2. Project Auto-Publishing (R025)**
- Open the extension **Options** page (right-click extension icon → Options, or via `chrome://extensions`).
- Set a **Global Output Path** (e.g., `C:/QA/Exports`).
- Create a new session and give it a **Project Name** (e.g., `dashboard-v2`).
- *Test:* Notice how the project input now auto-completes based on past projects!
- Record some actions, log a bug, and stop the session.
- Click the new **🚀 Publish to [Project]** button.
- *Verify:* Does it automatically dump all files (JSON, MD, Spec, Replay HTML, Screenshots) into `<OutputPath>/dashboard-v2/sessions/<SessionId>/`?

**3. Bug & Feature Workflows (R026 / R027)**
- **Bugs:** You can now change a bug's status directly from the Session Detail page using the new dropdown (`Open` / `In Progress` / `Resolved` / `Wontfix`).
- **Features:** You can now assign a Sprint (e.g., `Sprint 04`) to a feature directly from the Session Detail page.
- *Test:* Refresh the page to ensure your changes are saved instantly to the database.

**4. Opt-Out of Mouse Tracking**
- If your IndexedDB is bloating, you can now uncheck **"Record mouse movements"** when creating a new session.
- *Test:* Record a session with it OFF, and watch the replay. The mouse cursor shouldn't move smoothly, but clicks and scrolls should still register.

**5. In-App Changelog**
- At the bottom of the Session List, there is a new **"What's New"** button. It will have a blue dot if you haven't seen the v1.1.0 notes yet.
- *Test:* Click it to view the modal. Close it and verify the blue dot disappears (and stays gone on reload).

**6. Playwright Spec Generation**
- We fixed an issue where `page.goto` was missing its URL, and converted clicks/fills to use the `.locator()` API pattern (`page.locator('[data-testid="X"]').click()`).
- *Verify:* Export a Playwright spec and ensure the syntax looks correct and the `// BUG:` comments appear in the right sequence.

### Known Limitations
- The auto-publish feature relies on the `chrome.downloads` API, so Chrome might prompt you to "Allow multiple downloads" the first time you use it. Please click Allow.

Happy testing!
— Engineering
