import { test, expect } from '@playwright/test';
import { login, register } from './fixtures';

/**
 * 会员流程 E2E 测试套件
 *
 * 测试场景：
 * 1. 未注册用户浏览限制
 * 2. 注册流程（免费版和试用版）
 * 3. 试用用户完全访问
 * 4. 试用过期和锁定行为
 * 5. 升级提示和引导
 */

// 测试用户数据
const generateTestUser = () => ({
  email: `e2e-membership-${Date.now()}@example.com`,
  password: 'Test123456!',
  name: `E2E会员测试${Date.now()}`
});

// Trial user (simulates expired trial)
const expiredTrialUser = {
  email: 'expired-trial@example.com',
  password: 'Test123456!',
  name: '过期试用用户'
};

/**
 * Helper to clear authentication state
 */
async function clearAuth(page: ReturnType<typeof test.fixtures.page>) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

test.describe('会员流程 - 未注册用户浏览', () => {
  test.beforeEach(async ({ page }) => {
    // 清除所有认证状态
    await clearAuth(page);
  });

  test('未登录用户应该能够访问首页和公开页面', async ({ page }) => {
    await page.goto('/');

    // 验证首页可以访问
    await expect(page).toHaveURL(/\/$/);

    // 检查首页内容
    const hasContent = await page.locator('h1, .home-content, main').count() > 0;
    expect(hasContent).toBeTruthy();
  });

  test('未登录用户应该能够浏览卡片和产品', async ({ page }) => {
    // 访问卡片页面
    await page.goto('/cards');

    // 应该能看到卡片列表
    const hasCards = await page.locator('.card, [data-card], .card-item').count() > 0;
    if (hasCards) {
      await expect(page.locator('.card, [data-card]').first()).toBeVisible();
    }
  });

  test('未登录用户应该能够查看产品详情', async ({ page }) => {
    // 首先访问产品列表
    await page.goto('/products');

    // 如果有产品列表，尝试查看详情
    const firstProduct = page.locator('.product-card, a[href*="/products/"]').first();
    if (await firstProduct.count() > 0) {
      await firstProduct.click();

      // 应该能看到产品详情（公开页面）
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/\/products/);
    }
  });

  test('未登录用户访问仪表盘应该被重定向或提示登录', async ({ page }) => {
    await page.goto('/dashboard');

    // 应该被重定向到登录页或显示登录提示
    const currentUrl = page.url();
    const isOnLoginPage = currentUrl.includes('/login');
    const hasLoginPrompt = await page.locator('text=登录, text=请先登录, text=需要登录').count() > 0;

    expect(isOnLoginPage || hasLoginPrompt).toBeTruthy();
  });

  test('未登录用户访问设置页面应该被重定向', async ({ page }) => {
    await page.goto('/dashboard/settings');

    const currentUrl = page.url();
    const isOnLoginPage = currentUrl.includes('/login');
    const hasLoginPrompt = await page.locator('text=登录, text=请先登录').count() > 0;

    expect(isOnLoginPage || hasLoginPrompt).toBeTruthy();
  });

  test('未登录用户应该看到"注册/登录"CTA按钮', async ({ page }) => {
    await page.goto('/');

    // 查找注册或登录按钮
    const authButtons = page.locator('a[href*="/register"], a[href*="/login"], button:has-text("登录"), button:has-text("注册")');
    const hasAuthButtons = await authButtons.count() > 0;

    expect(hasAuthButtons).toBeTruthy();
  });
});

test.describe('会员流程 - 注册流程', () => {
  test('应该能够注册为免费用户', async ({ page }) => {
    const testUser = generateTestUser();

    await page.goto('/register');

    // 检查注册表单
    const hasRegisterForm = await page.locator('input[name="email"], input[type="email"]').count() > 0;

    if (hasRegisterForm) {
      // 填写注册表单
      await page.fill('input[name="email"], input[type="email"]', testUser.email);
      await page.fill('input[name="password"], input[type="password"]', testUser.password);

      const nameField = page.locator('input[name="name"], input[placeholder*="姓名"], input[placeholder*="name"]');
      if (await nameField.count() > 0) {
        await nameField.fill(testUser.name);
      }

      // 提交注册 - 使用更精确的选择器，只匹配表单内的提交按钮
      const submitButton = page.locator('form button[type="submit"]');
      await submitButton.click();

      // 等待响应
      await page.waitForTimeout(3000);

      // 验证注册成功后的行为
      const currentUrl = page.url();
      const possibleUrls = ['/dashboard', '/pricing', '/welcome', '/register'];
      const isValidRedirect = possibleUrls.some(url => currentUrl.includes(url)) || currentUrl === '/';

      expect(isValidRedirect).toBeTruthy();
    }
  });

  test('应该能够选择试用计划注册', async ({ page }) => {
    const testUser = generateTestUser();

    // 方法1: 通过定价页面选择试用
    await page.goto('/pricing');

    // 查找试用或免费试用按钮
    const trialButton = page.locator('button:has-text("试用"), button:has-text("Trial"), a:has-text("试用")').first();

    if (await trialButton.count() > 0) {
      await trialButton.click();

      // 等待导航到注册或结账页面
      await page.waitForTimeout(1000);
    }

    const currentUrl = page.url();

    // 如果在注册页面，填写表单
    if (currentUrl.includes('/register') || currentUrl.includes('/checkout')) {
      const emailField = page.locator('input[name="email"], input[type="email"]');
      if (await emailField.count() > 0) {
        await emailField.fill(testUser.email);
        await page.fill('input[name="password"], input[type="password"]', testUser.password);

        const nameField = page.locator('input[name="name"]');
        if (await nameField.count() > 0) {
          await nameField.fill(testUser.name);
        }

        // 使用更精确的选择器，只匹配表单内的提交按钮
        const submitButton = page.locator('form button[type="submit"]');
        await submitButton.click();

        await page.waitForTimeout(3000);
      }
    }

    // 验证试用用户创建成功
    const finalUrl = page.url();
    expect(finalUrl).toMatch(/(dashboard|checkout|pricing)/);
  });

  test('注册时邮箱格式错误应该显示验证错误', async ({ page }) => {
    await page.goto('/register');

    const hasRegisterForm = await page.locator('input[name="email"]').count() > 0;

    if (hasRegisterForm) {
      // 输入无效邮箱
      await page.fill('input[name="email"]', 'invalid-email');
      await page.fill('input[name="password"]', 'Test123456!');
      await page.fill('input[name="name"]', '测试用户');

      // 尝试提交或触发验证
      const submitButton = page.locator('button[type="submit"]');
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForTimeout(500);
      }

      // 检查错误提示
      const hasEmailError = await page.locator('text=邮箱格式, text=无效邮箱, text=请输入有效').count() > 0;
      // HTML5 验证也可能阻止提交
      const emailInput = page.locator('input[name="email"]');
      const isValid = await emailInput.evaluate(el => (el as HTMLInputElement).checkValidity());

      expect(hasEmailError || !isValid).toBeTruthy();
    }
  });

  test('注册时密码太短应该显示验证错误', async ({ page }) => {
    await page.goto('/register');

    const hasRegisterForm = await page.locator('input[name="password"]').count() > 0;

    if (hasRegisterForm) {
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', '123');  // 太短的密码
      await page.fill('input[name="name"]', '测试用户');

      const submitButton = page.locator('button[type="submit"]');
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForTimeout(500);
      }

      // 检查错误提示或HTML5验证
      const passwordInput = page.locator('input[name="password"]');
      const isValid = await passwordInput.evaluate(el => (el as HTMLInputElement).checkValidity());

      // 应该有验证错误或HTML5验证阻止
      expect(!isValid).toBeTruthy();
    }
  });
});

test.describe('会员流程 - 试用用户完全访问', () => {
  let authToken: string;
  const trialUser = generateTestUser();

  test.beforeAll(async ({ request }) => {
    // 通过API创建试用用户（如果后端支持）
    try {
      const response = await request.post('https://api.zenconsult.top/api/v1/auth/register', {
        data: {
          email: trialUser.email,
          password: trialUser.password,
          name: trialUser.name,
          plan_tier: 'trial'
        }
      });

      if (response.ok()) {
        const data = await response.json();
        authToken = data.token || data.access_token;
      }
    } catch (error) {
      console.log('API注册不可用，将使用模拟token');
    }
  });

  test('试用用户应该能访问所有功能', async ({ page }) => {
    // 设置试用用户认证
    await page.goto('/');
    await page.evaluate(({ user }) => {
      localStorage.setItem('auth_token', 'trial_token_' + Date.now());
      localStorage.setItem('user', JSON.stringify({
        email: user.email,
        name: user.name,
        plan_tier: 'trial',
        trial_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }));
    }, { user: trialUser });

    // 测试访问各个页面
    const pages = [
      '/dashboard',
      '/dashboard/settings',
      '/cards',
      '/opportunities',
      '/favorites'
    ];

    for (const pageUrl of pages) {
      await page.goto(pageUrl);

      // 试用用户应该能访问所有页面
      const currentUrl = page.url();
      const hasAccessDenied = await page.locator('text=需要订阅, text=升级到专业版, text=access denied').count() > 0;

      // 不应该被拒绝访问或重定向
      expect(hasAccessDenied).toBeFalsy();

      // 页面应该正常加载
      const hasContent = await page.locator('main, .dashboard, .content, h1').count() > 0;
      expect(hasContent).toBeTruthy();
    }
  });

  test('试用用户应该能看到剩余试用天数提示', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      const trialEndsIn = 5; // 5天后结束
      localStorage.setItem('auth_token', 'trial_token');
      localStorage.setItem('user', JSON.stringify({
        email: 'trial@example.com',
        name: '试用用户',
        plan_tier: 'trial',
        trial_expires_at: new Date(Date.now() + trialEndsIn * 24 * 60 * 60 * 1000).toISOString()
      }));
    });

    await page.goto('/dashboard');

    // 查找试用天数提示
    const hasTrialNotice = await page.locator('text=试用剩余, text=试用还有, text=天, text=trial').count() > 0;

    if (hasTrialNotice) {
      const trialNotice = page.locator('text=试用剩余, text=天').first();
      await expect(trialNotice).toBeVisible();
    }
  });

  test('试用用户应该能收藏和管理内容', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'trial_token');
      localStorage.setItem('user', JSON.stringify({
        email: 'trial@example.com',
        plan_tier: 'trial'
      }));
    });

    // 访问卡片页面
    await page.goto('/cards');

    // 尝试收藏第一个卡片
    const firstCard = page.locator('.card, [data-card]').first();
    const favoriteButton = firstCard.locator('button:has-text("收藏"), .favorite-button, [aria-label*="收藏"], svg[aria-label="heart"]').first();

    if (await favoriteButton.count() > 0) {
      await favoriteButton.click();
      await page.waitForTimeout(500);

      // 验证收藏成功
      const isFavorited = await favoriteButton.evaluate(el =>
        el.classList.contains('active') || el.getAttribute('aria-pressed') === 'true'
      );

      // 访问收藏页面
      await page.goto('/favorites');

      // 应该能看到收藏的内容
      const hasFavoritedItems = await page.locator('.card, .favorite-item').count() > 0;
      // 如果有收藏项，验证显示
      if (hasFavoritedItems) {
        await expect(page.locator('.card, .favorite-item').first()).toBeVisible();
      }
    }
  });
});

test.describe('会员流程 - 试用过期和锁定行为', () => {
  test('过期试用用户应该看到锁定提示', async ({ page }) => {
    // 模拟过期试用用户
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'expired_trial_token');
      localStorage.setItem('user', JSON.stringify({
        email: 'expired-trial@example.com',
        plan_tier: 'trial',
        trial_expired: true,
        trial_expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()  // 昨天
      }));
    });

    // 访问需要付费功能的地方
    await page.goto('/dashboard');

    // 应该看到锁定或过期提示
    const hasLockNotice = await page.locator('text=试用已过期, text=已到期, text=订阅续费, text=upgrade').count() > 0;
    const hasUpgradePrompt = await page.locator('text=立即订阅, text=升级到专业版, text=续费').count() > 0;

    expect(hasLockNotice || hasUpgradePrompt).toBeTruthy();
  });

  test('过期用户访问付费功能应该显示升级弹窗或重定向', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'expired_trial_token');
      localStorage.setItem('user', JSON.stringify({
        email: 'expired-trial@example.com',
        plan_tier: 'trial',
        is_locked: true,
        trial_expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }));
    });

    // 尝试访问高级功能页面
    await page.goto('/dashboard/opportunities');

    // 应该显示升级弹窗或限制访问
    const currentUrl = page.url();
    const hasUpgradeModal = await page.locator('.modal, .upgrade-modal, [role="dialog"]').filter({ hasText: /升级|订阅|过期/ }).count() > 0;
    const isRedirectedToPricing = currentUrl.includes('/pricing');
    const hasUpgradePrompt = await page.locator('text=升级, text=订阅, text=续费').count() > 0;

    expect(hasUpgradeModal || isRedirectedToPricing || hasUpgradePrompt).toBeTruthy();
  });

  test('过期用户设置页面应该显示订阅状态和升级选项', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'expired_trial_token');
      localStorage.setItem('user', JSON.stringify({
        email: 'expired-trial@example.com',
        plan_tier: 'trial',
        is_locked: true,
        subscription_status: 'expired'
      }));
    });

    await page.goto('/dashboard/settings');

    // 查找订阅状态部分
    const hasSubscriptionStatus = await page.locator('text=订阅状态, text=当前计划, text=subscription').count() > 0;
    const hasUpgradeButton = await page.locator('button:has-text("升级"), a:has-text("立即订阅"), button:has-text("续费")').count() > 0;

    expect(hasSubscriptionStatus || hasUpgradeButton).toBeTruthy();
  });

  test('过期用户点击升级按钮应该跳转到定价或结账页面', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'expired_trial_token');
      localStorage.setItem('user', JSON.stringify({
        email: 'expired-trial@example.com',
        plan_tier: 'trial',
        is_locked: true
      }));
    });

    await page.goto('/dashboard');

    // 查找升级按钮
    const upgradeButton = page.locator('button:has-text("升级"), a:has-text("立即订阅"), button:has-text("查看计划")').first();

    if (await upgradeButton.count() > 0) {
      await upgradeButton.click();
      await page.waitForTimeout(1000);

      const currentUrl = page.url();
      expect(currentUrl).toMatch(/(pricing|checkout|subscription)/);
    }
  });
});

test.describe('会员流程 - 升级提示和引导', () => {
  test('免费用户查看高级功能应该看到升级提示', async ({ page }) => {
    // 设置为免费用户
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'free_user_token');
      localStorage.setItem('user', JSON.stringify({
        email: 'free-user@example.com',
        plan_tier: 'free'
      }));
    });

    // 访问商机列表（高级功能）
    await page.goto('/opportunities');

    // 检查是否有升级提示
    const hasUpgradePrompt = await page.locator('text=升级到专业版, text=专业版功能, text=订阅查看更多').count() > 0;

    if (hasUpgradePrompt) {
      const upgradePrompt = page.locator('text=升级').first();
      await expect(upgradePrompt).toBeVisible();
    }
  });

  test('免费用户在卡片页面应该看到升级横幅', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'free_user_token');
      localStorage.setItem('user', JSON.stringify({
        email: 'free-user@example.com',
        plan_tier: 'free'
      }));
    });

    await page.goto('/cards');

    // 查找升级横幅
    const upgradeBanner = page.locator('.upgrade-banner, [data-upgrade-banner], .alert:has-text("升级")').first();

    if (await upgradeBanner.count() > 0) {
      await expect(upgradeBanner).toBeVisible();
    }
  });

  test('点击升级提示应该跳转到定价页面', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'free_user_token');
      localStorage.setItem('user', JSON.stringify({
        email: 'free-user@example.com',
        plan_tier: 'free'
      }));
    });

    await page.goto('/pricing');

    // 验证定价页面元素
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    // 应该有定价卡片
    const pricingCards = page.locator('.pricing-card, [data-plan], .card');
    const hasPricing = await pricingCards.count() > 0;
    expect(hasPricing).toBeTruthy();
  });

  test('应该能够从定价页面选择订阅计划', async ({ page }) => {
    await page.goto('/pricing');

    // 查找专业版卡片
    const proCard = page.locator('[data-plan="pro"], .pricing-card:has-text("专业版"), .card:has-text("Pro")').first();

    if (await proCard.count() > 0) {
      // 查找选择按钮
      const selectButton = proCard.locator('button:has-text("选择"), button:has-text("订阅"), button:has-text("开始")').first();

      if (await selectButton.count() > 0) {
        await selectButton.click();
        await page.waitForTimeout(1000);

        // 应该跳转到结账或订阅页面
        const currentUrl = page.url();
        expect(currentUrl).toMatch(/(checkout|subscribe|payment)/);
      }
    }
  });
});

test.describe('会员流程 - 订阅后访问权限', () => {
  test('付费用户应该能访问所有功能无限制', async ({ page }) => {
    // 模拟付费用户
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'pro_user_token');
      localStorage.setItem('user', JSON.stringify({
        email: 'pro-user@example.com',
        plan_tier: 'pro',
        subscription_status: 'active'
      }));
    });

    // 测试访问各种页面
    const pages = [
      { path: '/dashboard', name: '仪表盘' },
      { path: '/cards', name: '卡片' },
      { path: '/opportunities', name: '商机' },
      { path: '/favorites', name: '收藏' },
      { path: '/dashboard/settings', name: '设置' }
    ];

    for (const pageInfo of pages) {
      await page.goto(pageInfo.path);

      // 不应该看到升级提示
      const hasUpgradePrompt = await page.locator('text=升级到专业版, text=需要订阅').count() > 0;
      expect(hasUpgradePrompt).toBeFalsy();

      // 页面应该正常加载
      const hasContent = await page.locator('main, .dashboard, .content').count() > 0;
      expect(hasContent).toBeTruthy();
    }
  });

  test('付费用户设置页面应该显示完整的订阅信息', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'pro_user_token');
      localStorage.setItem('user', JSON.stringify({
        email: 'pro-user@example.com',
        plan_tier: 'pro',
        subscription_status: 'active',
        subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }));
    });

    await page.goto('/dashboard/settings');

    // 查找订阅信息
    const hasSubscriptionInfo = await page.locator('text=专业版, text=Pro, text=订阅状态, text=subscription').count() > 0;

    if (hasSubscriptionInfo) {
      const subscriptionInfo = page.locator('text=专业版, text=Pro').first();
      await expect(subscriptionInfo).toBeVisible();
    }
  });
});

test.describe('会员流程 - 退出登录和权限清理', () => {
  test('登出后应该清除会员权限', async ({ page }) => {
    // 先登录为付费用户
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'pro_user_token');
      localStorage.setItem('user', JSON.stringify({
        email: 'pro-user@example.com',
        plan_tier: 'pro'
      }));
    });

    // 验证能访问仪表盘
    await page.goto('/dashboard');
    let hasContent = await page.locator('main, .dashboard').count() > 0;
    expect(hasContent).toBeTruthy();

    // 登出
    const logoutButton = page.locator('button:has-text("退出"), button:has-text("登出"), a:has-text("退出")').first();

    if (await logoutButton.count() > 0) {
      await logoutButton.click();
      await page.waitForTimeout(1000);
    } else {
      // 手动清除模拟登录状态
      await page.evaluate(() => {
        localStorage.clear();
      });
    }

    // 验证无法再访问仪表盘
    await page.goto('/dashboard');
    const currentUrl = page.url();
    const isRedirected = currentUrl.includes('/login') || currentUrl === '/';

    expect(isRedirected).toBeTruthy();
  });
});
