import { test, expect } from '@playwright/test';

test.describe('Episode List Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ai-short-drama-creator/episodes');
  });

  test('Single episode generation success', async ({ page }) => {
    // Click Generate button on first card
    const generateBtn = page.locator('.card .actions .el-button').first();
    await generateBtn.click();
    
    // Check loading overlay
    await expect(page.locator('.generatingOverlay')).toBeVisible();
    
    // Wait for success and drawer to open
    await expect(page.locator('.el-drawer')).toBeVisible();
    await expect(page.locator('.el-drawer').getByText('已生成分镜')).toBeVisible();
  });

  test('Batch generation workflow', async ({ page }) => {
    // Click Multi-select
    await page.getByText('多选').click();
    
    // Select first and second card
    await page.locator('.el-checkbox').nth(0).click();
    await page.locator('.el-checkbox').nth(1).click();
    
    // Click Batch Generate
    await page.getByText('批量生成').click();
    
    // Check Progress Modal
    await expect(page.locator('.el-dialog').getByText('正在批量生成分镜脚本')).toBeVisible();
    
    // Wait for completion
    await expect(page.locator('.el-dialog')).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByText('批量生成成功')).toBeVisible();
    
    // Check cards are updated to "Generated"
    await expect(page.locator('.card .success').first()).toBeVisible();
  });

  test('Navigate to details from drawer', async ({ page }) => {
    // Open drawer first (e.g. by clicking on a success card)
    // Assuming card 1 is already success from previous test or manual setup
    // Since we use mock data, we might need to generate it first.
    const generateBtn = page.locator('.card .actions .el-button').first();
    await generateBtn.click();
    await expect(page.locator('.el-drawer')).toBeVisible();
    
    // Click Enter Details
    await page.getByText('进入详情').click();
    
    // Check URL
    await expect(page).toHaveURL(/\/storyboard\/1/);
  });
});
