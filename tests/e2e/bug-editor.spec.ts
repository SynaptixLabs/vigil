/**
 * Q104 — E2E: Bug Editor
 *
 * Verifies: Bug button in control bar opens BugEditor → URL field is pre-filled
 * with the current page URL → user fills title → saves → editor closes → bug
 * is persisted (verified via popup session detail).
 *
 * Requires DEV to complete: D114 (BugEditor.tsx), D113 (ControlBar btn-bug),
 * D118 (SessionList/detail showing bug count).
 *
 * DEV CONTRACT — BugEditor must expose:
 *   refine-bug-editor      — root element of the bug editor form
 *   bug-editor-url         — read-only input/text showing the captured URL
 *   bug-editor-title       — text input for bug title
 *   bug-editor-description — textarea for bug description (optional but encouraged)
 *   bug-editor-priority    — select/radio for priority (optional)
 *   btn-save-bug           — submit/save button
 *   btn-cancel-bug         — cancel/close button
 *
 * DEV CONTRACT — popup session detail:
 *   session-bug-count      — element showing number of bugs logged in the session
 */

import { test, expect } from './fixtures/extension.fixture';
import { createSession, openTargetApp, getPopupPage } from './helpers/session';

test('bug editor opens with pre-filled URL, saves bug, and persists to session', async ({ context, extensionId }) => {
  const { popupPage } = await createSession(context, extensionId, 'Q104 Session');

  // 1. Navigate to the form page so the captured URL is specific
  const page = await openTargetApp(context, '/form.html');

  // 2. Control bar is visible
  await expect(page.getByTestId('refine-control-bar')).toBeVisible({ timeout: 5000 });

  // 3. Interact with a form field first (sets context for auto-capture)
  await page.getByTestId('input-name').click();
  await page.getByTestId('input-name').fill('Test User');

  // 4. Click Bug button → BugEditor opens
  await page.getByTestId('btn-bug').click();
  await expect(page.getByTestId('refine-bug-editor')).toBeVisible({ timeout: 3000 });

  // 5. URL field is pre-filled with the current page URL
  const urlField = page.getByTestId('bug-editor-url');
  await expect(urlField).toBeVisible();
  const capturedUrl = await urlField.inputValue().catch(() => urlField.innerText());
  expect(capturedUrl).toContain('localhost:38470');
  expect(capturedUrl).toContain('form');

  // 6. Fill in bug title
  await page.getByTestId('bug-editor-title').fill('Input field does not validate on blur');

  // 7. Save the bug
  await page.getByTestId('btn-save-bug').click();

  // 8. Bug editor closes, control bar is visible again
  await expect(page.getByTestId('refine-bug-editor')).not.toBeVisible({ timeout: 3000 });
  await expect(page.getByTestId('refine-control-bar')).toBeVisible();

  // 9. Stop session
  await page.getByTestId('btn-stop').click();
  await expect(page.getByTestId('refine-control-bar')).not.toBeVisible({ timeout: 3000 });

  // 10. Verify bug count in popup session detail
  const verifyPopup = await getPopupPage(popupPage, context, extensionId);
  await verifyPopup.bringToFront();
  await verifyPopup.reload();
  await verifyPopup.waitForLoadState('networkidle');
  await verifyPopup.getByTestId('session-list-item').first().click();
  const bugCount = verifyPopup.getByTestId('session-bug-count');
  await expect(bugCount).toBeVisible({ timeout: 3000 });
  const countText = await bugCount.innerText();
  expect(parseInt(countText, 10)).toBeGreaterThanOrEqual(1);
});

test('bug editor cancel closes without saving', async ({ context, extensionId }) => {
  await createSession(context, extensionId, 'Q104 Cancel Session');
  const page = await openTargetApp(context);

  await expect(page.getByTestId('refine-control-bar')).toBeVisible({ timeout: 5000 });

  // Open bug editor
  await page.getByTestId('btn-bug').click();
  await expect(page.getByTestId('refine-bug-editor')).toBeVisible({ timeout: 3000 });

  // Fill title then cancel
  await page.getByTestId('bug-editor-title').fill('This should not be saved');
  await page.getByTestId('btn-cancel-bug').click();

  // Editor closes, control bar stays
  await expect(page.getByTestId('refine-bug-editor')).not.toBeVisible({ timeout: 3000 });
  await expect(page.getByTestId('refine-control-bar')).toBeVisible();

  // Stop cleanly
  await page.getByTestId('btn-stop').click();
});
