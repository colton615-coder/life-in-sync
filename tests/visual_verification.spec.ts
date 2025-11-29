import { test, expect } from '@playwright/test';

test('verify ethereal ui implementation', async ({ page }) => {
  // Go to the local development server
  await page.goto('http://localhost:5173');

  // Wait for the main dashboard grid to be visible, ensuring the app is loaded
  await page.waitForSelector('div.grid', { timeout: 15000 });

  // 1. Verify Shell (LifeCore, Background)
  // Memory: "the 'LiFE-iN-SYNC' text has been visually removed."
  // We check for the brain icon or the main header container instead.
  const headerContainer = page.locator('nav[role="navigation"]'); // FloatingDock is the main nav
  await expect(headerContainer).toBeVisible({ timeout: 10000 });

  // 2. Verify Dashboard Widgets (GlassCard)
  // Check for the new "Habits" tile with the specific styling classes or content
  // We use a more generic text selector that matches the uppercase title in the new DashboardTile
  const habitsTile = page.locator('h3', { hasText: 'HABITS' });
  await expect(habitsTile).toBeVisible();

  // Capture Dashboard Screenshot
  await page.screenshot({ path: 'verification/final_dashboard.png' });

  // 3. Navigate to Habits Module via Dock
  // Use explicit aria-label selector as per memory guidelines
  const habitsIcon = page.locator('button[aria-label="habits"]');
  await habitsIcon.click();

  // 4. Verify Habits Page
  // Allow for potentially different casing or simple existence
  const habitsHeader = page.getByRole('heading', { name: 'Habits', level: 1 });
  await expect(habitsHeader).toBeVisible();

  // Capture Habits Screenshot
  await page.screenshot({ path: 'verification/final_habits.png' });
});
