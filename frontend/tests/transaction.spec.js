import { test, expect } from '@playwright/test';

test.describe('Cashbook Transaction Flow', () => {
  test('should successfully add a cash-in transaction and update the ledger grid', async ({ page }) => {
    // 1. Navigate to the application
    await page.goto('http://localhost:5173/');

    // 2. Perform Login if the login screen is active
    if (await page.locator('input[type="password"]').isVisible()) {
      await page.fill('input[placeholder*="username" i]', 'admin');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
    }

    // 3. Click the "New Cash Book Entry" or "Add Entry" button to open the workspace
    const addEntryButton = page.locator('button:has-text("New Cash Book Entry")');
    if (await addEntryButton.isVisible()) {
      await addEntryButton.click();
    }

    // 4. Fill the transaction form fields
    await page.fill('input[placeholder*="description" i], input[placeholder*="detail" i]', 'E2E Test Deposit');
    await page.fill('input[placeholder="0.00"][step="0.01"] >> nth=0', '500.00'); // AFN Amount
    await page.fill('input[placeholder*="Account" i], input[placeholder*="Name" i]', 'E2E Account');

    // 5. Submit the transaction
    await page.click('button[type="submit"]:has-text("Save Cash In")');

    // 6. Verify that the grid updates with the new state
    const firstRow = page.locator('table.accounting-table tbody tr').first();
    await expect(firstRow).toContainText('E2E Account');
    await expect(firstRow).toContainText('E2E Test Deposit');
    await expect(firstRow).toContainText('500.00');
  });
});
