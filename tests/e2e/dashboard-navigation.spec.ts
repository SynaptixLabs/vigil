/**
 * Q714a -- E2E: Dashboard Navigation, Filters, and Screenshot Rendering
 *
 * Tests the vigil-server management dashboard (packages/dashboard):
 *   - Project sidebar navigation
 *   - Sprint filter (per-session sprint dropdown)
 *   - Session list -> session detail drill-down
 *   - Screenshot / snapshot rendering in session detail
 *   - Tab switching between Sessions, Bugs, Features
 *
 * BLOCKED: Requires [DEV:app] to deliver S07-17a (dashboard REST wiring + navigation).
 * Activate these tests once the dashboard is deployed to vigil-server /dashboard.
 *
 * Prerequisites:
 *   - vigil-server running on port 7474
 *   - At least one session POSTed to the server (fixtures or manual seed)
 *   - Dashboard accessible at http://localhost:7474/dashboard
 *
 * DEV CONTRACT (data-testid attributes expected):
 *   dashboard-root            -- root element of the dashboard app
 *   tab-sessions              -- Sessions tab button
 *   tab-bugs                  -- Bugs tab button
 *   tab-features              -- Features tab button
 *   session-list-row          -- repeated element for each session row
 *   session-detail            -- root of session detail view
 *   back-to-sessions          -- back button from detail to list
 *   bug-screenshot-inline     -- inline screenshot in bug card
 *   project-sidebar-item      -- clickable project name in sidebar
 *   sprint-filter-select      -- sprint filter <select>
 */

import { test } from '@playwright/test';

// Dashboard URL: http://localhost:7474/dashboard
// Used when stubs are activated after S07-17a delivery.

test.describe('Q714a: Dashboard navigation', () => {

  test.fixme('dashboard loads and shows root layout with sidebar + tabs', async ({ page: _page }) => {
    // Navigate to _DASHBOARD_URL
    // Expect dashboard-root to be visible
    // Expect tab-sessions, tab-bugs, tab-features to be present
    // Expect Sessions tab to be active by default
  });

  test.fixme('project sidebar lists available projects and clicking filters sessions', async ({ page: _page }) => {
    // Navigate to _DASHBOARD_URL
    // Expect project-sidebar-item elements to be visible (requires seeded data)
    // Click on a project name
    // Session list should filter to show only sessions for that project
    // Verify session count text updates
  });

  test.fixme('sprint filter dropdown filters sessions by sprint', async ({ page: _page }) => {
    // Navigate to _DASHBOARD_URL (Sessions tab)
    // Locate sprint-filter-select
    // Select a specific sprint value
    // Verify session list updates to show only matching sessions
    // Select "All" to reset filter
    // Verify all sessions reappear
  });

  test.fixme('clicking a session row navigates to session detail view', async ({ page: _page }) => {
    // Navigate to _DASHBOARD_URL
    // Click on the first session-list-row
    // Expect session-detail to be visible
    // Expect session name, duration, snapshot/bug/feature counts to be present
    // Expect back-to-sessions button to be visible
  });

  test.fixme('back button from session detail returns to session list', async ({ page: _page }) => {
    // Navigate to _DASHBOARD_URL
    // Click first session row -> detail
    // Click back-to-sessions
    // Expect session-list-row elements to reappear
    // Expect session-detail to NOT be visible
  });

  test.fixme('session detail renders screenshots in snapshots gallery', async ({ page: _page }) => {
    // Navigate to _DASHBOARD_URL
    // Click on a session that has snapshots (seeded data)
    // Expect snapshot images (img elements) to render without broken image icons
    // Verify each snapshot has a timestamp label
  });

  test.fixme('bug card with linked screenshot shows "Show screenshot" toggle', async ({ page: _page }) => {
    // Navigate to _DASHBOARD_URL
    // Open a session that has a bug with a screenshotId
    // Expect bug-screenshot-inline to be visible
    // Click "Show screenshot" button
    // Expect img element inside bug-screenshot-inline to appear
    // Click "Hide screenshot" to collapse
  });

  test.fixme('switching tabs between Sessions, Bugs, and Features shows correct content', async ({ page: _page }) => {
    // Navigate to _DASHBOARD_URL
    // Click tab-bugs -> expect BugList content
    // Click tab-features -> expect FeatureList content
    // Click tab-sessions -> expect SessionList content
    // Verify tab active state styling changes correctly
  });

  test.fixme('health indicator shows server status', async ({ page: _page }) => {
    // Navigate to _DASHBOARD_URL
    // Expect HealthIndicator component to be visible
    // Verify it shows "OK" or appropriate status text when server is running
  });

});
