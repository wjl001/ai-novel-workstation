import { test, expect } from '@playwright/test';

test.describe('Script Outline Flow', () => {
  test('should prefill data, generate script and navigate to next step', async ({ page }) => {
    // Navigate to the outline page
    await page.goto('http://localhost:5173/#/ai-short-drama-creator/outline');

    // 1. Wait for prefilling to finish (Check if input value matches expected mock data)
    await page.waitForTimeout(1000); // Wait for mock API
    const titleInput = page.locator('input[placeholder="请输入作品名称..."]');
    await expect(titleInput).toHaveValue('繁星之城');

    // 2. Test Character Profiles (Save animation)
    const addCharBtn = page.locator('button:has-text("添加角色")');
    await addCharBtn.click();
    const charNameInputs = page.locator('input[placeholder="请输入角色名称"]');
    await expect(charNameInputs).toHaveCount(3); // 2 prefilled + 1 new

    // 3. Test Streaming Generation
    const generateBtn = page.locator('button:has-text("确认大纲信息并生成正文")');
    await generateBtn.click();
    
    // Check loading indicator
    await expect(page.locator('.is-loading')).toBeVisible();

    // Wait for generation to finish (should take around ~3s based on mock)
    await page.waitForTimeout(4000);
    const scriptBody = page.locator('.whitespace-pre-wrap');
    await expect(scriptBody).toContainText('关于成长与救赎');

    // 4. Test Confirm and Save
    const confirmBtn = page.locator('button:has-text("确认并进入主体设定")');
    await confirmBtn.click();

    // Verify navigation
    await page.waitForURL(/.*\/assets/);
    await expect(page).toHaveURL(/.*\/assets/);
  });
});