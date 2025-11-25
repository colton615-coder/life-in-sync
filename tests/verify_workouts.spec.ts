import { test, expect } from '@playwright/test';

test('verify workouts module kinetic ui', async ({ page }) => {
  // Inject mock window.spark object just in case, though we removed it
  await page.addInitScript(() => {
    // @ts-ignore
    window.spark = {
      llm: async () => JSON.stringify({}),
      llmPrompt: (strings: any, ...values: any[]) => strings.join(''),
      kv: {
        get: async () => null,
        set: async () => {},
        delete: async () => {}
      }
    };
  });

  // Navigate to Dashboard
  await page.goto('http://localhost:5173');

  // Wait for the main dashboard grid to be visible, ensuring the app is loaded
  await page.waitForSelector('div.grid', { timeout: 15000 });

  // Click on the 'Workouts' button in the main navigation dock
  await page.locator('nav[aria-label="Main Navigation"] button[aria-label="workouts"]').click();

  // Wait for Workouts page to load by checking for the main header
  await expect(page.locator('h1:has-text("Workouts")')).toBeVisible({ timeout: 10000 });

  // Verify Grid Layout (2 columns check via class or visual)
  const grid = page.locator('.grid.grid-cols-2');
  // It might be empty state if no workouts

  // Take screenshot of the Grid/List
  await page.screenshot({ path: 'verification/workouts_grid.png' });

  // Check Generate Dialog
  const generateBtn = page.getByRole('button', { name: 'Generate' });
  await generateBtn.click();
  await expect(page.getByRole('dialog')).toBeVisible();

  await page.screenshot({ path: 'verification/workouts_generate_dialog.png' });
});
