import { test, expect } from '@playwright/test';

test('verify ethereal ui implementation', async ({ page }) => {
  // Go to the local development server
  await page.goto('http://localhost:5173');

  // 1. Verify Shell (LifeCore, Background)
  const lifeCore = page.locator('text=LifeSync Active');
  await expect(lifeCore).toBeVisible({ timeout: 10000 });

  // 2. Verify Dashboard Widgets (GlassCard)
  // Check for the new "Habits" tile with the specific styling classes or content
  // We use a more generic text selector that matches the uppercase title in the new DashboardTile
  const habitsTile = page.locator('h3', { hasText: 'HABITS' });
  await expect(habitsTile).toBeVisible();

  // Capture Dashboard Screenshot
  await page.screenshot({ path: 'verification/final_dashboard.png' });

  // 3. Navigate to Habits Module via Dock
  // The dock icons might not have text, so we target by the index or icon logic we added.
  // We added `onClick={() => onNavigate('habits')}` to the second icon (Activity).
  const habitsIcon = page.locator('button').nth(1); // 0=Home, 1=Activity
  await habitsIcon.click();

  // 4. Verify Habits Page
  const habitsHeader = page.locator('h1:has-text("Habits")');
  await expect(habitsHeader).toBeVisible();

  // Capture Habits Screenshot
  await page.screenshot({ path: 'verification/final_habits.png' });
});
