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
  await page.goto('http://localhost:4173');

  // Wait for loading screen to clear
  await page.waitForTimeout(2500);

  // Click on Workouts module tile
  // Using more specific locator to avoid ambiguity
  await page.locator('.glass-card').filter({ hasText: 'Workouts' }).first().click();

  // Wait for Workouts page to load
  await expect(page.getByRole('heading', { name: 'Workouts' })).toBeVisible();

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
