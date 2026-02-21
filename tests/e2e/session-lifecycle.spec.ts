/**
 * Q105 — E2E: Session Lifecycle (Full End-to-End)
 *
 * Verifies the complete session state machine:
 *   RECORDING → (PAUSED → RECORDING) → STOPPED → COMPLETED
 *
 * Also covers: multi-page navigation during recording, bug + screenshot
 * captured in same session, popup reflects final COMPLETED status.
 *
 * Requires DEV to complete: all of Phase 1–4 (D101–D120).
 *
 * DEV CONTRACT — popup session detail must expose:
 *   session-status         — element showing the session's current status text
 *   session-duration       — element showing session duration (non-zero after stop)
 *   session-bug-count      — number of bugs logged
 *   session-screenshot-count — number of screenshots captured
 */

import { test, expect } from './fixtures/extension.fixture';
import { createSession, openTargetApp, getPopupPage } from './helpers/session';

test('full session lifecycle: create → record → navigate → bug → screenshot → stop → COMPLETED', async ({ context, extensionId }) => {
  // 1. Create session
  const { popupPage } = await createSession(context, extensionId, 'Q105 Lifecycle Session');

  // 2. Open target app
  const page = await openTargetApp(context);
  await expect(page.getByTestId('refine-control-bar')).toBeVisible({ timeout: 5000 });
  await expect(page.getByTestId('recording-indicator')).toContainText('RECORDING');

  // 3. Navigate to About page
  await page.getByTestId('nav-about').click();
  await page.waitForLoadState('networkidle');
  await expect(page.getByTestId('refine-control-bar')).toBeVisible({ timeout: 5000 });

  // 4. Navigate to Form page and interact
  await page.getByTestId('nav-form').click();
  await page.waitForLoadState('networkidle');
  await expect(page.getByTestId('refine-control-bar')).toBeVisible({ timeout: 5000 });
  await page.getByTestId('input-name').fill('Lifecycle Test User');
  await page.getByTestId('input-description').fill('This is a test description for lifecycle recording.');

  // 5. Log a bug
  await page.getByTestId('btn-bug').click();
  await expect(page.getByTestId('refine-bug-editor')).toBeVisible({ timeout: 3000 });
  await page.getByTestId('bug-editor-title').fill('Lifecycle test bug');
  await page.getByTestId('btn-save-bug').click();
  await expect(page.getByTestId('refine-bug-editor')).not.toBeVisible({ timeout: 3000 });

  // 6. Take a screenshot
  await page.getByTestId('btn-screenshot').click();
  await page.waitForTimeout(1000);

  // 7. Navigate back home
  await page.getByTestId('nav-home').first().click();
  await page.waitForLoadState('networkidle');
  await expect(page.getByTestId('refine-control-bar')).toBeVisible({ timeout: 5000 });

  // 8. Pause then resume (tests the toggle mid-lifecycle)
  await page.getByTestId('btn-pause').click();
  await expect(page.getByTestId('recording-indicator')).toContainText('PAUSED');
  await page.getByTestId('btn-resume').click();
  await expect(page.getByTestId('recording-indicator')).toContainText('RECORDING');

  // 9. Stop session
  await page.getByTestId('btn-stop').click();
  await expect(page.getByTestId('refine-control-bar')).not.toBeVisible({ timeout: 3000 });

  // 10. Popup shows session as COMPLETED
  const verifyPopup = await getPopupPage(popupPage, context, extensionId);
  await verifyPopup.bringToFront();
  await verifyPopup.reload();
  await verifyPopup.waitForLoadState('networkidle');

  const sessionItem = verifyPopup.getByTestId('session-list-item').first();
  await expect(sessionItem).toBeVisible({ timeout: 3000 });
  await sessionItem.click();

  // Status must be COMPLETED
  await expect(verifyPopup.getByTestId('session-status')).toContainText('COMPLETED', { timeout: 3000 });

  // Duration must be non-zero
  const durationEl = verifyPopup.getByTestId('session-duration');
  await expect(durationEl).toBeVisible();
  const durationText = await durationEl.innerText();
  expect(durationText.trim()).not.toBe('0');
  expect(durationText.trim()).not.toBe('');

  // At least 1 bug and 1 screenshot
  const bugCountText = await verifyPopup.getByTestId('session-bug-count').innerText();
  expect(parseInt(bugCountText, 10)).toBeGreaterThanOrEqual(1);

  const screenshotCountText = await verifyPopup.getByTestId('session-screenshot-count').innerText();
  expect(parseInt(screenshotCountText, 10)).toBeGreaterThanOrEqual(1);
});

test('stopping a recording session with no interactions still completes cleanly', async ({ context, extensionId }) => {
  const { popupPage } = await createSession(context, extensionId, 'Q105 Empty Session');
  const page = await openTargetApp(context);

  await expect(page.getByTestId('refine-control-bar')).toBeVisible({ timeout: 5000 });

  // Stop immediately without any interactions
  await page.getByTestId('btn-stop').click();
  await expect(page.getByTestId('refine-control-bar')).not.toBeVisible({ timeout: 3000 });

  // Popup still shows session as COMPLETED (not ERROR or STOPPED)
  const verifyPopup2 = await getPopupPage(popupPage, context, extensionId);
  await verifyPopup2.bringToFront();
  await verifyPopup2.reload();
  await verifyPopup2.waitForLoadState('networkidle');
  await verifyPopup2.getByTestId('session-list-item').first().click();
  await expect(verifyPopup2.getByTestId('session-status')).toContainText('COMPLETED', { timeout: 3000 });
});
