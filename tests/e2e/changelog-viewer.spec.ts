/**
 * Q502 — E2E: Changelog Viewer Modal
 *
 * Verifies: "What's New" button in SessionList footer opens the changelog modal,
 * modal contains version entries, and the close button dismisses it.
 *
 * DEV CONTRACT:
 *   btn-whats-new   — button in SessionList footer that opens the changelog modal
 */

import { test, expect } from './fixtures/extension.fixture';

test('What\'s New button opens changelog modal and close button dismisses it', async ({ context, extensionId }) => {
  const popupPage = await context.newPage();
  await popupPage.goto(`chrome-extension://${extensionId}/src/popup/popup.html`);
  await popupPage.waitForLoadState('networkidle');

  // The "What's New" button is in the footer of SessionList
  const whatsNewBtn = popupPage.getByTestId('btn-whats-new');
  await expect(whatsNewBtn).toBeVisible({ timeout: 5000 });

  // Click it — modal should appear
  await whatsNewBtn.click();

  // Modal heading — use role selector to avoid matching button and body text
  const modalHeading = popupPage.getByRole('heading', { name: 'What\'s New' });
  await expect(modalHeading).toBeVisible({ timeout: 3000 });

  // Must contain at least one version entry (e.g. "v1." prefix)
  const versionEntry = popupPage.locator('text=/v1\\.\\d+\\.\\d+/').first();
  await expect(versionEntry).toBeVisible({ timeout: 2000 });

  // Close button (×) dismisses the modal
  const closeBtn = popupPage.locator('button[aria-label="Close changelog"]');
  await expect(closeBtn).toBeVisible();
  await closeBtn.click();

  // Modal is gone
  await expect(modalHeading).not.toBeVisible({ timeout: 3000 });
});

test('What\'s New badge disappears after opening changelog', async ({ context, extensionId }) => {
  const popupPage = await context.newPage();
  await popupPage.goto(`chrome-extension://${extensionId}/src/popup/popup.html`);
  await popupPage.waitForLoadState('networkidle');

  // Open and close the modal — badge should clear
  const whatsNewBtn = popupPage.getByTestId('btn-whats-new');
  await whatsNewBtn.click();

  const closeBtn = popupPage.locator('button[aria-label="Close changelog"]');
  await closeBtn.click();

  // Reload popup — badge should not reappear (version stored in chrome.storage.local)
  await popupPage.reload();
  await popupPage.waitForLoadState('networkidle');

  // The indigo dot badge should not be visible
  const badge = popupPage.locator('[data-testid="btn-whats-new"] .rounded-full.bg-indigo-400');
  await expect(badge).not.toBeVisible({ timeout: 2000 });
});
