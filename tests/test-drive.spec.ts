
import { test, expect } from '@playwright/test';

test.describe('Focus Group Test Drive', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5000/');
    // Wait for the loading screen to disappear or main content to appear
    // The loading screen has text "Loading your life together..."
    // We'll wait for something unique to the dashboard, e.g., the "Habits" card or similar
    await page.waitForSelector('text="Loading your life together"', { state: 'detached', timeout: 15000 });
  });

  test('Test Drive: Dashboard & Navigation', async ({ page }) => {
    console.log('Starting Dashboard & Navigation Test');

    await expect(page).toHaveTitle(/Command Center/);

    // Take screenshot of Dashboard
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tests/screenshots/01-dashboard.png', fullPage: true });

    await expect(page.locator('body')).toContainText('Habits');
  });

  test('Test Drive: Add a Habit', async ({ page }) => {
    console.log('Starting Habit Test');
    // We are already on dashboard from beforeEach, but let's explicitly go to habits if it's a separate route or section
    // The PRD says "Habit tracking tool... User navigates to Shopping module..."
    // It seems habits might be on the main dashboard or a module.
    // Let's click the Habits link/card to be sure

    const habitsLink = page.getByRole('link', { name: /Habit/i }).first();
    if (await habitsLink.isVisible()) {
        await habitsLink.click();
    } else {
        // Try navigating directly
        await page.goto('http://localhost:5000/habits');
        await page.waitForSelector('text="Loading your life together"', { state: 'detached', timeout: 15000 });
    }

    // Take screenshot of Habits page
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tests/screenshots/02-habits-page.png' });

    // Try to find an "Add" button. It might be an icon button (+).
    // Let's look for a button with aria-label "Add Habit" or similar, or just a generic add button
    // Inspecting the code (mental model): generic add buttons often have a '+' icon.

    // Let's dump the page content if we can't find it to debug
    const addButton = page.getByRole('button', { name: /Add/i }).or(page.getByRole('button').filter({ hasText: 'Add' }));

    if (await addButton.count() > 0) {
        await addButton.first().click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'tests/screenshots/03-add-habit-modal.png' });

        await page.getByPlaceholder(/Habit Name/i).fill('Drink Water');
        // Just close it or submit
        await page.keyboard.press('Escape');
    } else {
        console.log('Could not find Add Habit button');
        await page.screenshot({ path: 'tests/screenshots/debug-habits.png' });
    }
  });

  test('Test Drive: Finance Module', async ({ page }) => {
     console.log('Starting Finance Test');
     await page.goto('http://localhost:5000/finance');
     await page.waitForSelector('text="Loading your life together"', { state: 'detached', timeout: 15000 });

     await page.waitForTimeout(1000);
     await page.screenshot({ path: 'tests/screenshots/04-finance-page.png' });
  });

  test('Test Drive: Shopping Module', async ({ page }) => {
     console.log('Starting Shopping Test');
     await page.goto('http://localhost:5000/shopping');
     await page.waitForSelector('text="Loading your life together"', { state: 'detached', timeout: 15000 });

     await page.waitForTimeout(1000);
     await page.screenshot({ path: 'tests/screenshots/05-shopping-page.png' });

     // Try to add an item
     const input = page.getByPlaceholder(/Add item/i);
     if (await input.isVisible()) {
         await input.fill('Milk');
         await page.keyboard.press('Enter');
         await page.waitForTimeout(500);
         await page.screenshot({ path: 'tests/screenshots/06-shopping-added.png' });
     }
  });
});
