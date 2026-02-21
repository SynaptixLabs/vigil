import { test, expect } from './fixtures/extension.fixture';

test('extension loads and popup shows Refine branding', async ({ context, extensionId }) => {
  const popupPage = await context.newPage();
  await popupPage.goto(`chrome-extension://${extensionId}/src/popup/popup.html`);
  await popupPage.waitForLoadState('networkidle');

  await expect(popupPage.getByText('Refine', { exact: false })).toBeVisible({ timeout: 10000 });
  await expect(popupPage.getByText('0.1.0', { exact: false })).toBeVisible({ timeout: 10000 });
});
