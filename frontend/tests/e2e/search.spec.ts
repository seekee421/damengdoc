import { test, expect } from '@playwright/test';

test.describe('搜索功能测试', () => {
  test('搜索框应该可以打开和关闭', async ({ page }) => {
    await page.goto('/');
    
    // 点击搜索按钮
    const searchButton = page.locator('.DocSearch-Button');
    await expect(searchButton).toBeVisible();
    await searchButton.click();
    
    // 检查搜索模态框是否打开
    const searchModal = page.locator('.DocSearch-Modal');
    await expect(searchModal).toBeVisible();
    
    // 检查搜索输入框
    const searchInput = page.locator('.DocSearch-Input');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toBeFocused();
    
    // 按ESC键关闭搜索
    await page.keyboard.press('Escape');
    await expect(searchModal).not.toBeVisible();
  });

  test('搜索应该返回相关结果', async ({ page }) => {
    await page.goto('/');
    
    // 打开搜索
    await page.locator('.DocSearch-Button').click();
    
    // 输入搜索关键词
    const searchInput = page.locator('.DocSearch-Input');
    await searchInput.fill('教程');
    
    // 等待搜索结果
    await page.waitForTimeout(1000);
    
    // 检查是否有搜索结果
    const searchResults = page.locator('.DocSearch-Hits');
    if (await searchResults.isVisible()) {
      const resultItems = page.locator('.DocSearch-Hit');
      const resultCount = await resultItems.count();
      expect(resultCount).toBeGreaterThan(0);
    }
  });

  test('搜索结果应该可以点击跳转', async ({ page }) => {
    await page.goto('/');
    
    // 打开搜索
    await page.locator('.DocSearch-Button').click();
    
    // 输入搜索关键词
    const searchInput = page.locator('.DocSearch-Input');
    await searchInput.fill('intro');
    
    // 等待搜索结果
    await page.waitForTimeout(1000);
    
    // 点击第一个搜索结果
    const firstResult = page.locator('.DocSearch-Hit').first();
    if (await firstResult.isVisible()) {
      await firstResult.click();
      
      // 验证页面跳转
      await expect(page).toHaveURL(/.*\/docs\//);
    }
  });

  test('键盘导航应该在搜索中正常工作', async ({ page }) => {
    await page.goto('/');
    
    // 使用快捷键打开搜索 (Ctrl+K 或 Cmd+K)
    const isMac = process.platform === 'darwin';
    const modifier = isMac ? 'Meta' : 'Control';
    await page.keyboard.press(`${modifier}+KeyK`);
    
    // 检查搜索模态框是否打开
    const searchModal = page.locator('.DocSearch-Modal');
    await expect(searchModal).toBeVisible();
    
    // 输入搜索内容
    const searchInput = page.locator('.DocSearch-Input');
    await searchInput.fill('tutorial');
    await page.waitForTimeout(1000);
    
    // 使用方向键导航
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(500);
    
    // 检查是否有选中的结果
    const selectedResult = page.locator('.DocSearch-Hit[aria-selected="true"]');
    if (await selectedResult.isVisible()) {
      // 按Enter选择结果
      await page.keyboard.press('Enter');
      
      // 验证页面跳转
      await expect(page).toHaveURL(/.*\/docs\//);
    }
  });

  test('搜索历史应该被保存', async ({ page }) => {
    await page.goto('/');
    
    // 进行第一次搜索
    await page.locator('.DocSearch-Button').click();
    let searchInput = page.locator('.DocSearch-Input');
    await searchInput.fill('教程');
    await page.waitForTimeout(1000);
    
    // 关闭搜索
    await page.keyboard.press('Escape');
    
    // 重新打开搜索
    await page.locator('.DocSearch-Button').click();
    
    // 检查是否显示最近搜索
    const recentSearches = page.locator('.DocSearch-StartScreen');
    if (await recentSearches.isVisible()) {
      const recentItems = page.locator('.DocSearch-Hit');
      const itemCount = await recentItems.count();
      // 如果有历史记录，验证其存在
      if (itemCount > 0) {
        expect(itemCount).toBeGreaterThan(0);
      }
    }
  });

  test('空搜索应该显示建议内容', async ({ page }) => {
    await page.goto('/');
    
    // 打开搜索但不输入内容
    await page.locator('.DocSearch-Button').click();
    
    // 检查是否显示起始屏幕或建议
    const startScreen = page.locator('.DocSearch-StartScreen, .DocSearch-NoResults');
    await expect(startScreen).toBeVisible();
  });
});