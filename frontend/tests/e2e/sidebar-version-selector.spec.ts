import { test, expect } from '@playwright/test';

test.describe('侧边栏版本选择器测试', () => {
  test.beforeEach(async ({ page }) => {
    // 访问文档页面
    await page.goto('/docs/intro');
    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
  });

  test('应该在左侧边栏显示版本选择器', async ({ page }) => {
    // 检查左侧边栏是否存在
    const sidebar = page.locator('[class*="sidebar"]').first();
    await expect(sidebar).toBeVisible();

    // 检查版本选择器容器是否存在
    const versionContainer = page.locator('[class*="versionSelectorContainer"]');
    await expect(versionContainer).toBeVisible();

    // 检查版本选择器按钮是否存在
    const versionButton = page.locator('[class*="versionButton"]');
    await expect(versionButton).toBeVisible();

    // 验证版本选择器在侧边栏顶部
    const sidebarWrapper = page.locator('[class*="sidebarWrapper"]');
    await expect(sidebarWrapper).toBeVisible();
  });

  test('版本选择器应该显示当前版本信息', async ({ page }) => {
    // 检查版本名称是否显示
    const versionName = page.locator('[class*="versionName"]');
    await expect(versionName).toBeVisible();
    
    // 检查版本名称不为空
    const versionText = await versionName.textContent();
    expect(versionText).toBeTruthy();
    expect(versionText?.trim().length).toBeGreaterThan(0);
  });

  test('点击版本选择器应该显示下拉菜单', async ({ page }) => {
    // 点击版本选择器按钮
    const versionButton = page.locator('[class*="versionButton"]');
    await versionButton.click();

    // 检查下拉菜单是否显示
    const dropdown = page.locator('[class*="versionDropdown"]');
    await expect(dropdown).toBeVisible();

    // 检查下拉菜单头部
    const dropdownHeader = page.locator('[class*="dropdownHeader"]');
    await expect(dropdownHeader).toBeVisible();

    // 检查版本列表
    const versionList = page.locator('[class*="versionList"]');
    await expect(versionList).toBeVisible();
  });

  test('版本选择器应该有正确的样式', async ({ page }) => {
    const versionContainer = page.locator('[class*="versionSelectorContainer"]');
    
    // 检查容器样式
    const containerStyles = await versionContainer.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        padding: styles.padding,
        borderBottom: styles.borderBottom,
        background: styles.background
      };
    });

    // 验证有边框和内边距
    expect(containerStyles.padding).not.toBe('0px');
    expect(containerStyles.borderBottom).toContain('1px');
  });

  test('版本选择器在移动端应该正常显示', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 可能需要点击菜单按钮来显示侧边栏
    const menuButton = page.locator('[aria-label*="menu"], [class*="navbar__toggle"]');
    if (await menuButton.isVisible()) {
      await menuButton.click();
    }

    // 检查版本选择器是否在移动端正常显示
    const versionContainer = page.locator('[class*="versionSelectorContainer"]');
    await expect(versionContainer).toBeVisible();
  });

  test('版本选择器应该在原始侧边栏内容之前显示', async ({ page }) => {
    const sidebarWrapper = page.locator('[class*="sidebarWrapper"]');
    const versionContainer = page.locator('[class*="versionSelectorContainer"]');
    const originalSidebar = page.locator('[class*="originalSidebar"]');

    // 检查所有元素都存在
    await expect(sidebarWrapper).toBeVisible();
    await expect(versionContainer).toBeVisible();
    await expect(originalSidebar).toBeVisible();

    // 验证版本选择器在原始侧边栏之前
    const wrapperBox = await sidebarWrapper.boundingBox();
    const versionBox = await versionContainer.boundingBox();
    const sidebarBox = await originalSidebar.boundingBox();

    if (wrapperBox && versionBox && sidebarBox) {
      // 版本选择器应该在原始侧边栏上方
      expect(versionBox.y).toBeLessThan(sidebarBox.y);
    }
  });
});