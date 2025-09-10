import { test, expect } from '@playwright/test';

test.describe('首页功能测试', () => {
  test('应该正确加载首页', async ({ page }) => {
    await page.goto('/');
    
    // 检查页面标题
    await expect(page).toHaveTitle(/达梦数据库文档中心/);
    
    // 检查主要元素是否存在
    await expect(page.locator('h1')).toContainText('达梦数据库文档中心');
    await expect(page.locator('.hero__subtitle')).toBeVisible();
  });

  test('导航链接应该正常工作', async ({ page }) => {
    await page.goto('/');
    
    // 测试快速入门链接
    const quickStartLink = page.locator('a[href="/docs/intro"]');
    await expect(quickStartLink).toBeVisible();
    await quickStartLink.click();
    
    // 验证跳转到正确页面
    await expect(page).toHaveURL(/.*\/docs\/intro/);
    await expect(page.locator('h1')).toContainText('教程介绍');
  });

  test('版本选择器应该可见', async ({ page }) => {
    await page.goto('/');
    
    // 检查版本选择器是否存在
    const versionSelector = page.locator('.navbar__item.dropdown');
    await expect(versionSelector).toBeVisible();
  });

  test('搜索功能应该可用', async ({ page }) => {
    await page.goto('/');
    
    // 检查搜索按钮是否存在
    const searchButton = page.locator('.DocSearch-Button');
    await expect(searchButton).toBeVisible();
    
    // 点击搜索按钮
    await searchButton.click();
    
    // 检查搜索框是否出现
    await expect(page.locator('.DocSearch-Input')).toBeVisible();
  });

  test('响应式设计在移动端应该正常', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // 检查移动端导航菜单
    const mobileMenuButton = page.locator('.navbar__toggle');
    await expect(mobileMenuButton).toBeVisible();
    
    // 点击菜单按钮
    await mobileMenuButton.click();
    
    // 检查菜单是否展开
    await expect(page.locator('.navbar-sidebar')).toBeVisible();
  });
});