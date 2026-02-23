/**
 * Q504 — E2E: Bug Status Lifecycle
 *
 * Verifies: Bug status dropdown in SessionDetail allows changing status
 * (open → in_progress → resolved → wontfix) and the change persists
 * after a popup reload.
 *
 * DEV CONTRACT:
 *   session-bug-count  — element showing number of bugs in session detail
 *   (bug status select is rendered inline per bug row — no fixed testid,
 *    selected by role=combobox within the bug list)
 */

import { test, expect } from './fixtures/extension.fixture';
import { createSession, openTargetApp, stopAndOpenDetail } from './helpers/session';

test('Bug status can be changed from open to in_progress and persists on reload', async ({ context, extensionId }) => {
  const { popupPage } = await createSession(context, extensionId, 'Q504 Bug Status Session');

  const page = await openTargetApp(context, '/form.html');
  await expect(page.getByTestId('refine-control-bar')).toBeVisible({ timeout: 5000 });

  // Log a bug
  await page.getByTestId('btn-bug').click();
  await expect(page.getByTestId('refine-bug-editor')).toBeVisible({ timeout: 3000 });
  await page.getByTestId('bug-editor-title').fill('Q504 Status Test Bug');
  await page.getByTestId('btn-save-bug').click();
  await expect(page.getByTestId('refine-bug-editor')).not.toBeVisible({ timeout: 3000 });

  const detail = await stopAndOpenDetail(page, popupPage, context, extensionId);

  // Bug count must be at least 1
  const bugCount = detail.getByTestId('session-bug-count');
  await expect(bugCount).toBeVisible({ timeout: 3000 });
  const countText = await bugCount.innerText();
  expect(parseInt(countText, 10)).toBeGreaterThanOrEqual(1);

  // Find the status select for the first bug (rendered as a <select> in the bug row)
  const statusSelect = detail.locator('select').first();
  await expect(statusSelect).toBeVisible({ timeout: 3000 });

  // Default should be 'open'
  await expect(statusSelect).toHaveValue('open');

  // Change to in_progress
  await statusSelect.selectOption('in_progress');
  await expect(statusSelect).toHaveValue('in_progress');

  // Reload popup — change must persist
  await detail.reload();
  await detail.waitForLoadState('networkidle');
  await detail.getByTestId('session-list-item').first().click();
  await expect(detail.getByTestId('session-detail-container')).toBeVisible({ timeout: 3000 });

  const statusSelectAfterReload = detail.locator('select').first();
  await expect(statusSelectAfterReload).toHaveValue('in_progress');
});

test('Bug status can be set to resolved and wontfix', async ({ context, extensionId }) => {
  const { popupPage } = await createSession(context, extensionId, 'Q504 Resolved Wontfix Session');

  const page = await openTargetApp(context);
  await expect(page.getByTestId('refine-control-bar')).toBeVisible({ timeout: 5000 });

  await page.getByTestId('btn-bug').click();
  await expect(page.getByTestId('refine-bug-editor')).toBeVisible({ timeout: 3000 });
  await page.getByTestId('bug-editor-title').fill('Q504 Resolved Bug');
  await page.getByTestId('btn-save-bug').click();
  await expect(page.getByTestId('refine-bug-editor')).not.toBeVisible({ timeout: 3000 });

  const detail = await stopAndOpenDetail(page, popupPage, context, extensionId);

  const statusSelect = detail.locator('select').first();
  await expect(statusSelect).toBeVisible({ timeout: 3000 });

  // Set to resolved
  await statusSelect.selectOption('resolved');
  await expect(statusSelect).toHaveValue('resolved');

  // Set to wontfix
  await statusSelect.selectOption('wontfix');
  await expect(statusSelect).toHaveValue('wontfix');
});
