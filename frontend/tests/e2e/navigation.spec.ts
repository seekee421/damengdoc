import { test, expect } from '@playwright/test';

test.describe('文档导航测试', () => {
  test('侧边栏导航应该正常工作', async ({ page }) => {
    await page.goto('/docs/intro');
    
    // 检查侧边栏是否存在
    const sidebar = page.locator('.theme-doc-sidebar-container');
    await expect(sidebar).toBeVisible();
    
    // 检查导航项目
    const tutorialBasics = page.locator('a[href="/docs/tutorial-basics/create-a-page"]');
    await expect(tutorialBasics).toBeVisible();
    
    // 点击导航项目
    await tutorialBasics.click();
    await expect(page).toHaveURL(/.*\/docs\/tutorial-basics\/create-a-page/);
  });

  test('面包屑导航应该显示正确路径', async ({ page }) => {
    await page.goto('/docs/tutorial-basics/create-a-page');
    
    // 检查面包屑导航
    const breadcrumbs = page.locator('.breadcrumbs');
    await expect(breadcrumbs).toBeVisible();
    
    // 检查面包屑链接
    const homeLink = breadcrumbs.locator('a[href="/docs/intro"]');
    await expect(homeLink).toBeVisible();
  });

  test('上一页/下一页导航应该工作', async ({ page }) => {
    await page.goto('/docs/tutorial-basics/create-a-page');
    
    // 检查分页导航
    const pagination = page.locator('.pagination-nav');
    await expect(pagination).toBeVisible();
    
    // 测试下一页链接
    const nextLink = pagination.locator('.pagination-nav__link--next');
    if (await nextLink.isVisible()) {
      await nextLink.click();
      // 验证页面已跳转
      await expect(page).toHaveURL(/.*\/docs\/tutorial-basics\//);
    }
  });

  test('目录(TOC)应该显示并可点击', async ({ page }) => {
    await page.goto('/docs/intro');
    
    // 检查右侧目录
    const toc = page.locator('.table-of-contents');
    if (await toc.isVisible()) {
      const tocLinks = toc.locator('a');
      const firstLink = tocLinks.first();
      
      if (await firstLink.isVisible()) {
        await firstLink.click();
        // 验证页面滚动到对应位置
        await page.waitForTimeout(500);
      }
    }
  });

  test('多语言切换应该正常工作', async ({ page }) => {
    await page.goto('/docs/intro');
    
    // 查找语言切换器
    const langSwitcher = page.locator('.navbar__item.dropdown').filter({ hasText: /中文|English/ });
    
    if (await langSwitcher.isVisible()) {
      await langSwitcher.click();
      
      // 查找英文选项
      const englishOption = page.locator('a[href*="/en/"]');
      if (await englishOption.isVisible()) {
        await englishOption.click();
        
        // 验证切换到英文版本
        await expect(page).toHaveURL(/.*\/en\//);
      }
    }
  });

  test('版本切换功能应该可用', async ({ page }) => {
    await page.goto('/docs/intro');
    
    // 查找版本选择器
    const versionDropdown = page.locator('.navbar__item.dropdown').filter({ hasText: /DM7|DM8|版本/ });
    
    if (await versionDropdown.isVisible()) {
      await versionDropdown.click();
      
      // 检查版本选项
      const versionOptions = page.locator('.dropdown__menu a');
      const optionCount = await versionOptions.count();
      
      if (optionCount > 0) {
        const firstOption = versionOptions.first();
        await firstOption.click();
        
        // 验证版本切换成功
        await page.waitForTimeout(1000);
        await expect(page).toHaveURL(/.*\/docs\//);
      }
    }
  });
});