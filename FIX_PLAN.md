# CB-Business 修复计划

**创建日期**: 2026-03-15
**基于**: E2E测试报告 (97个测试，31个失败)
**目标**: 提升测试通过率到80%以上

---

## 执行摘要

| 阶段 | 问题数 | 预计工时 | 优先级 |
|------|--------|----------|--------|
| P0 - 严重问题 | 3 | 4-6小时 | 🔴 立即 |
| P1 - 重要问题 | 3 | 3-5小时 | 🟡 本周 |
| P2 - 次要问题 | 3 | 2-4小时 | 🟢 下周 |
| **总计** | **9** | **9-15小时** | - |

---

## P0 严重问题修复 (立即执行)

### 1. 仪表盘页面 h1 元素缺失

**问题**: 仪表盘首页缺少 h1 标题元素
**影响**: 所有仪表盘导航测试失败
**测试失败**: `dashboard-navigation.spec.ts:22`

#### 诊断
```typescript
// 当前: 仪表盘首页没有 h1 元素
// 期望: <h1>仪表盘</h1> 或类似标题
```

#### 修复方案

**文件**: `frontend/app/dashboard/page.tsx`

```typescript
// 添加页面标题
export default function DashboardPage() {
  return (
    <div className="dashboard-container">
      <h1 className="text-2xl font-bold">仪表盘</h1>
      {/* 现有内容 */}
    </div>
  );
}
```

#### 验证
```bash
npx playwright test --grep "应该能够导航到仪表盘首页"
```

---

### 2. 登录后导航逻辑错误

**问题**: 用户登录成功后停留在 `/login` 页面，未导航到 `/dashboard` 或 `/`
**影响**: 用户无法进入系统
**测试失败**: `auth-flow.spec.ts:68`

#### 诊断
```typescript
// 当前行为:
// 登录成功 → 停留在 /login
// 期望行为:
// 登录成功 → 导航到 /dashboard 或 /
```

#### 修复方案

**文件**: `frontend/app/login/page.tsx` 或 `lib/auth-context.tsx`

```typescript
// 登录成功后添加导航逻辑
const handleLogin = async (data: LoginForm) => {
  try {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      const result = await response.json();

      // 存储token
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));

      // ✅ 添加: 导航到仪表盘或首页
      router.push('/dashboard');
      // 或者: router.push('/');

    } else {
      // 处理错误
    }
  } catch (error) {
    // 错误处理
  }
};
```

#### 验证
```bash
npx playwright test --grep "应该能够登录已有用户"
```

---

### 3. 注册表单功能不完整

**问题**: 注册表单提交后没有正确处理响应
**影响**: 新用户无法注册
**测试失败**: `membership.spec.ts`

#### 诊断
- 表单可能缺少必要的字段
- 提交逻辑未处理成功响应
- 没有正确的成功后导航

#### 修复方案

**文件**: `frontend/app/register/page.tsx`

```typescript
// 完整注册表单实现
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface RegisterFormData {
  email: string;
  password: string;
  name: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // 注册成功
        localStorage.setItem('auth_token', data.token || data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // ✅ 导航到仪表盘
        router.push('/dashboard');
      } else {
        setError(data.detail || data.message || '注册失败');
      }
    } catch (err) {
      setError('网络错误，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h1 className="text-2xl font-bold">注册</h1>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              姓名
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              邮箱
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              密码
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {loading ? '注册中...' : '注册'}
          </button>

          <p className="text-center text-sm">
            已有账号？ <Link href="/login" className="text-blue-600 hover:underline">登录</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
```

#### 验证
```bash
npx playwright test --grep "应该能够注册为免费用户"
```

---

## P1 重要问题修复 (本周内)

### 4. 实现升级提示和弹窗

**问题**: 免费用户访问高级功能时看不到升级引导
**影响**: 转化率降低
**测试失败**: `subscription-flow.spec.ts`, `membership.spec.ts`

#### 修复方案

**文件**: 创建 `frontend/components/upgrade-prompt.tsx`

```typescript
'use client';

import { useRouter } from 'next/navigation';

interface UpgradePromptProps {
  feature?: string;
  message?: string;
  showClose?: boolean;
}

export function UpgradePrompt({
  feature = '此功能',
  message = '升级到专业版解锁更多功能',
  showClose = true
}: UpgradePromptProps) {
  const router = useRouter();

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l4-4m0 0h4m-4 0l-4 4m4-4v7a2 2 0 002 2h4a2 2 0 002-2V9a2 2 0 00-2-2h-4" />
          </svg>
        </div>

        <div className="ml-4 flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {feature}需要专业版
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {message}
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => router.push('/pricing')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              立即升级
            </button>
            <button
              onClick={() => router.push('/pricing')}
              className="border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-50"
            >
              查看计划
            </button>
          </div>
        </div>

        {showClose && (
          <button
            onClick={() => {/* 关闭逻辑 */}}
            className="ml-4 text-gray-400 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
```

**使用位置**:
- `frontend/app/opportunities/page.tsx` - 顶部添加升级提示
- `frontend/app/dashboard/settings/page.tsx` - 订阅管理区域

---

### 5. 修复订阅状态显示

**问题**: 设置页面不显示当前订阅信息
**影响**: 用户无法查看订阅状态

#### 修复方案

**文件**: `frontend/app/dashboard/settings/page.tsx`

```typescript
// 添加订阅状态显示
const SubscriptionStatus = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/v1/subscriptions/me');
      const data = await response.json();
      setSubscription(data.subscription);
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    }
  };

  if (!subscription) {
    return <div className="text-gray-500">加载中...</div>;
  }

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    trial: 'bg-blue-100 text-blue-800',
    expired: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold mb-3">订阅信息</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>状态:</span>
          <span className={`px-2 py-1 rounded text-sm ${statusColors[subscription.status]}`}>
            {subscription.status === 'active' ? '活跃' : subscription.status}
          </span>
        </div>
        <div className="flex justify-between">
          <span>计划:</span>
          <span>{subscription.plan_tier}</span>
        </div>
        {subscription.expires_at && (
          <div className="flex justify-between">
            <span>到期时间:</span>
            <span>{new Date(subscription.expires_at).toLocaleDateString('zh-CN')}</span>
          </div>
        )}
      </div>
    </div>
  );
};
```

---

### 6. 补充导航链接

**问题**: 桌面端导航栏显示的链接数量不足
**影响**: 功能可发现性差

#### 修复方案

**文件**: `frontend/components/dashboard/sidebar.tsx` 或 `frontend/components/layout/navbar.tsx`

```typescript
// 确保包含所有主要导航链接
const navigationLinks = [
  { href: '/dashboard', label: '仪表盘', icon: HomeIcon },
  { href: '/dashboard/market', label: '市场概览', icon: TrendingUpIcon },
  { href: '/dashboard/policy', label: '政策中心', icon: FileTextIcon },
  { href: '/dashboard/risks', label: '风险预警', icon: AlertTriangleIcon },
  { href: '/opportunities', label: '商机发现', icon: LightbulbIcon },
  { href: '/cards', label: '产品卡片', icon: CreditCardIcon },
  { href: '/favorites', label: '我的收藏', icon: HeartIcon },
  { href: '/dashboard/settings', label: '设置', icon: SettingsIcon }
];

// 在导航栏中渲染
<nav className="flex flex-col gap-1">
  {navigationLinks.map((link) => (
    <Link
      key={link.href}
      href={link.href}
      className="nav-link flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100"
    >
      <link.icon className="h-5 w-5" />
      <span>{link.label}</span>
    </Link>
  ))}
</nav>
```

#### 验证
```bash
npx playwright test --grep "桌面端应该显示完整导航栏"
```

---

## P2 次要问题修复 (下周)

### 7. 实现图表组件

**文件**: 创建 `frontend/components/dashboard/charts.tsx`

使用 Recharts 或 Chart.js 实现基础图表：
- 市场趋势折线图
- 产品分类饼图
- 订阅增长柱状图

---

### 8. 优化响应式布局

**重点**:
- 移动端 (<768px) 隐藏侧边栏，显示汉堡菜单
- 平板端 (768px-1024px) 折叠侧边栏
- 确保所有组件在移动端可访问

---

### 9. 完善支付流程测试

**添加测试**:
- Airwallex Drop-in UI 集成测试
- 支付成功后功能解锁验证
- 支付失败错误处理验证

---

## 执行时间表

| 阶段 | 任务 | 预计时间 | 负责人 |
|------|------|----------|--------|
| P0-1 | 修复仪表盘 h1 元素 | 30分钟 | 前端 |
| P0-2 | 修复登录后导航 | 1小时 | 前端 |
| P0-3 | 完善注册表单 | 2小时 | 前端 |
| P1-4 | 实现升级提示组件 | 1.5小时 | 前端 |
| P1-5 | 修复订阅状态显示 | 1.5小时 | 前端 |
| P1-6 | 补充导航链接 | 1小时 | 前端 |
| P2-7 | 实现图表组件 | 2小时 | 前端 |
| P2-8 | 优化响应式布局 | 2小时 | 前端 |
| P2-9 | 完善支付测试 | 2小时 | QA |

**总计**: 13.5小时

---

## 验收标准

### P0 问题修复验收

- [ ] `npx playwright test --grep "仪表盘导航"` 通过率 > 80%
- [ ] `npx playwright test --grep "登录流程"` 通过率 = 100%
- [ ] `npx playwright test --grep "注册流程"` 通过率 > 80%

### P1 问题修复验收

- [ ] `npx playwright test --grep "订阅流程"` 通过率 > 75%
- [ ] `npx playwright test --grep "会员流程"` 通过率 > 70%
- [ ] 总体通过率 > 80%

### 最终验收

```bash
# 运行完整测试套件
npx playwright test

# 预期结果:
# - 总通过率 > 80%
# - API测试通过率 > 95%
# - UI测试通过率 > 75%
```

---

## 风险评估

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 仪表盘重构影响其他功能 | 中 | 分步实施，充分测试 |
| 登录流程改动导致认证问题 | 高 | 保留回滚方案，仔细测试token管理 |
| 新增组件导致性能下降 | 低 | 代码审查，性能测试 |
| 修复时间超出预期 | 中 | 按优先级分阶段交付 |

---

## 成功指标

修复完成后的目标状态：

| 指标 | 当前 | 目标 | 改善 |
|------|------|------|------|
| 总体通过率 | 68% | 80% | +12% |
| P0问题数 | 3 | 0 | -3 |
| P1问题数 | 3 | 0 | -3 |
| P2问题数 | 3 | ≤2 | -1 |

---

## 后续优化

修复完成后，建议进行以下优化：

1. **性能优化**
   - 减少首次加载时间 < 2秒
   - 图片懒加载
   - 代码分割

2. **用户体验**
   - 添加骨架屏
   - 优化加载状态
   - 改进错误提示

3. **功能增强**
   - 添加更多数据可视化
   - 实现实时通知
   - 优化移动端体验

4. **测试覆盖**
   - 添加数据采集任务测试
   - 添加OpenClaw集成测试
   - 添加AI分析功能测试
   - 目标: 150+ 个E2E测试
