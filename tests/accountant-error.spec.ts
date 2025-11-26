import { test, expect } from '@playwright/test';
import { FinancialAudit, ACCOUNTANT_CATEGORIES } from '../src/types/accountant';

// Helper function to create a mock completed audit
const createCompletedAudit = (): FinancialAudit => {
  const expenses = {} as FinancialAudit['expenses'];
  for (const catKey in ACCOUNTANT_CATEGORIES) {
    const category = catKey as keyof typeof ACCOUNTANT_CATEGORIES;
    // @ts-ignore
    expenses[category] = {};
    for (const subcatKey in ACCOUNTANT_CATEGORIES[category].subcategories) {
      // @ts-ignore
      expenses[category][subcatKey] = Math.floor(Math.random() * 200) + 50; // Random value
    }
  }

  return {
    monthlyIncome: 5000,
    expenses,
    auditCompletedAt: new Date().toISOString(),
    version: '1.0',
  };
};

test.describe('Accountant Feature Error Handling', () => {
  test('should display a specific error message for an invalid API key', async ({ page }) => {
    // 1. Mock the API endpoint to return a 400 Bad Request
    await page.route('**/v1beta/models/gemini-2.5-pro:generateContent**', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: {
            code: 400,
            message: '[GoogleGenerativeAI Error]: API key not valid. Please pass a valid API key.',
            status: 'INVALID_ARGUMENT',
          },
        }),
      });
    });

    // 2. Navigate to the app FIRST
    await page.goto('/');

    // 3. Set a DUMMY API key and a completed audit in localStorage
    const completedAudit = createCompletedAudit();
    await page.evaluate((audit) => {
      // Provide a dummy key so the GeminiCore constructor doesn't throw a "missing key" error
      localStorage.setItem('gemini-api-key', JSON.stringify('DUMMY_KEY_FOR_TESTING'));
      // Provide the completed audit data to skip the multi-step form
      localStorage.setItem('financial-audit', JSON.stringify(audit));
    }, completedAudit);

    // 4. Navigate to the Finance/Accountant module (it will re-read from localStorage)
    await page.getByLabel('finance').click();

    // 5. The "Generate Report" button should now be visible, click it.
    await expect(page.getByRole('heading', { name: 'Audit Submitted' })).toBeVisible();
    await page.getByRole('button', { name: 'Generate Report' }).click();

    // 6. Assert that the specific error message is now visible
    const errorMessage = page.getByText('Your API Key is invalid. Please check it in the Settings module.');
    await expect(errorMessage).toBeVisible({ timeout: 10000 });

    // 7. Also assert that the generic "unavailable" message is NOT present
    const genericErrorMessage = page.getByText('The Accountant is currently unavailable.');
    await expect(genericErrorMessage).not.toBeVisible();
  });
});
