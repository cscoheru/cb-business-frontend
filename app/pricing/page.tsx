'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

interface Plan {
  tier: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  duration_days: number | null;
  features: {
    api_calls_per_day: number;
    cards_per_day: number;
    ai_analysis: boolean;
    cost_calculator: boolean;
    data_export: boolean;
    supplier_database: boolean;
    market_insights: boolean;
    support: string;
    api_access?: boolean;
  };
  limits: {
    daily_card_views: number;
    historical_data_days: number;
  };
}

interface PlansResponse {
  success: boolean;
  plans: Plan[];
}

export default function PricingPage() {
  const { isAuthenticated, user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('https://api.zenconsult.top/api/v1/payments/plans');
      const data: PlansResponse = await response.json();
      if (data.success) {
        setPlans(data.plans);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPrice = (plan: Plan) => {
    if (plan.tier === 'free' || plan.tier === 'trial') return '¥0';
    return billingCycle === 'yearly' ? `¥${plan.price_yearly}` : `¥${plan.price_monthly}`;
  };

  const getPeriod = (plan: Plan) => {
    if (plan.tier === 'trial') return '/14天';
    if (plan.tier === 'free') return '/永久';
    return billingCycle === 'yearly' ? '/年' : '/月';
  };

  const getCTA = (plan: Plan) => {
    if (plan.tier === 'free') return '免费注册';
    if (plan.tier === 'trial') return '开始试用';
    return '立即订阅';
  };

  const getBadge = (plan: Plan) => {
    if (plan.tier === 'trial') return '新用户专享';
    if (plan.tier === 'pro') return '最受欢迎';
    return null;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">选择适合您的计划</h1>
        <p className="text-xl text-muted-foreground mb-2">
          新用户自动获得14天试用，体验完整功能
        </p>
        <p className="text-sm text-muted-foreground">
          随时升级，随时取消，无隐藏费用
        </p>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <button
          onClick={() => setBillingCycle('monthly')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            billingCycle === 'monthly'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          按月付费
        </button>
        <button
          onClick={() => setBillingCycle('yearly')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            billingCycle === 'yearly'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          按年付费 <span className="text-green-500 ml-1">省2个月</span>
        </button>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
        {plans.map((plan) => (
          <PricingCard
            key={plan.tier}
            plan={plan}
            price={getPrice(plan)}
            period={getPeriod(plan)}
            cta={getCTA(plan)}
            badge={getBadge(plan)}
          />
        ))}
      </div>

      {/* Feature Comparison */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">功能对比</h2>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4 font-semibold">功能</th>
                  <th className="text-center p-4 font-semibold">免费版</th>
                  <th className="text-center p-4 font-semibold">试用版</th>
                  <th className="text-center p-4 font-semibold">专业版</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="p-4">价格</td>
                  <td className="p-4 text-center text-muted-foreground">¥0</td>
                  <td className="p-4 text-center text-green-500 font-medium">¥0 (14天)</td>
                  <td className="p-4 text-center text-primary font-medium">
                    {billingCycle === 'yearly' ? '¥990/年' : '¥99/月'}
                  </td>
                </tr>
                <tr>
                  <td className="p-4">市场数据</td>
                  <td className="p-4 text-center text-muted-foreground">7天历史</td>
                  <td className="p-4 text-center text-green-500 font-medium">30天历史</td>
                  <td className="p-4 text-center text-primary font-medium">全部历史</td>
                </tr>
                <tr>
                  <td className="p-4">卡片浏览</td>
                  <td className="p-4 text-center text-muted-foreground">10次/天</td>
                  <td className="p-4 text-center text-green-500 font-medium">50次/天</td>
                  <td className="p-4 text-center text-primary font-medium">无限次</td>
                </tr>
                <tr>
                  <td className="p-4">API调用</td>
                  <td className="p-4 text-center text-muted-foreground">10次/天</td>
                  <td className="p-4 text-center text-green-500 font-medium">50次/天</td>
                  <td className="p-4 text-center text-primary font-medium">无限次</td>
                </tr>
                <tr>
                  <td className="p-4">AI分析</td>
                  <td className="p-4 text-center text-muted-foreground">—</td>
                  <td className="p-4 text-center text-green-500 font-medium">✓</td>
                  <td className="p-4 text-center text-primary font-medium">✓</td>
                </tr>
                <tr>
                  <td className="p-4">数据导出</td>
                  <td className="p-4 text-center text-muted-foreground">—</td>
                  <td className="p-4 text-center text-green-500 font-medium">✓</td>
                  <td className="p-4 text-center text-primary font-medium">✓</td>
                </tr>
                <tr>
                  <td className="p-4">供应商数据库</td>
                  <td className="p-4 text-center text-muted-foreground">—</td>
                  <td className="p-4 text-center text-green-500 font-medium">✓</td>
                  <td className="p-4 text-center text-primary font-medium">✓</td>
                </tr>
                <tr>
                  <td className="p-4">市场洞察</td>
                  <td className="p-4 text-center text-muted-foreground">—</td>
                  <td className="p-4 text-center text-green-500 font-medium">✓</td>
                  <td className="p-4 text-center text-primary font-medium">✓</td>
                </tr>
                <tr>
                  <td className="p-4">API访问</td>
                  <td className="p-4 text-center text-muted-foreground">—</td>
                  <td className="p-4 text-center text-muted-foreground">—</td>
                  <td className="p-4 text-center text-primary font-medium">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">常见问题</h2>
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-2">新用户如何开始？</h3>
            <p className="text-sm text-muted-foreground">
              注册后自动获得14天试用版，包含完整的专业版功能，无需支付任何费用。
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold mb-2">试用结束后会发生什么？</h3>
            <p className="text-sm text-muted-foreground">
              试用结束后自动降级为免费版，您可以随时升级到专业版继续使用。
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold mb-2">我可以随时取消吗？</h3>
            <p className="text-sm text-muted-foreground">是的，您可以随时取消订阅，无需任何理由。</p>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold mb-2">专业版支持多少个市场？</h3>
            <p className="text-sm text-muted-foreground">
              支持所有市场数据，包括东南亚、欧美、拉美、中东等主要市场。
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PricingCard({
  plan,
  price,
  period,
  cta,
  badge,
}: {
  plan: Plan;
  price: string;
  period: string;
  cta: string;
  badge: string | null;
}) {
  const { isAuthenticated, user } = useAuth();
  const isCurrentPlan = user?.plan_tier === plan.tier;

  return (
    <Card
      className={`p-8 flex flex-col ${
        plan.tier === 'pro' ? 'border-primary border-2 shadow-lg' : ''
      }`}
    >
      {badge && (
        <div className="text-center mb-4">
          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            {badge}
          </span>
        </div>
      )}
      <h3 className="text-2xl font-bold text-center mb-2">{plan.name}</h3>
      <p className="text-sm text-center text-muted-foreground mb-4">
        {plan.description}
      </p>
      <div className="text-center mb-6">
        <span className="text-4xl font-bold">{price}</span>
        <span className="text-muted-foreground">{period}</span>
      </div>

      <ul className="space-y-3 mb-8 flex-grow">
        {plan.tier === 'free' && (
          <>
            <Feature name="10次/天 API调用" included={true} />
            <Feature name="3张卡片/天" included={true} />
            <Feature name="7天历史数据" included={true} />
            <Feature name="基础成本计算器" included={true} />
            <Feature name="社区支持" included={true} />
            <Feature name="AI分析" included={false} />
            <Feature name="数据导出" included={false} />
          </>
        )}
        {plan.tier === 'trial' && (
          <>
            <Feature name="50次/天 API调用" included highlight />
            <Feature name="12张卡片/天" included highlight />
            <Feature name="30天历史数据" included highlight />
            <Feature name="AI机会分析" included highlight />
            <Feature name="数据导出" included highlight />
            <Feature name="供应商数据库" included highlight />
            <Feature name="市场洞察" included highlight />
            <Feature name="邮件支持" included highlight />
            <div className="text-center text-xs text-green-500 font-semibold mt-4">
              14天完整体验
            </div>
          </>
        )}
        {plan.tier === 'pro' && (
          <>
            <Feature name="无限API调用" included />
            <Feature name="无限卡片浏览" included />
            <Feature name="全部历史数据" included />
            <Feature name="AI机会分析" included />
            <Feature name="数据导出" included />
            <Feature name="供应商数据库" included />
            <Feature name="市场洞察" included />
            <Feature name="API访问" included />
            <Feature name="优先支持" included />
          </>
        )}
      </ul>

      <PricingCTA plan={plan} cta={cta} isCurrentPlan={isCurrentPlan} />
    </Card>
  );
}

function Feature({ name, included, highlight }: { name: string; included: boolean; highlight?: boolean }) {
  return (
    <li className="flex items-center gap-2">
      {included ? (
        <Check className={`h-5 w-5 flex-shrink-0 ${highlight ? 'text-green-500' : 'text-primary'}`} />
      ) : (
        <span className="h-5 w-4 flex-shrink-0 opacity-20" />
      )}
      <span className={!included ? 'text-muted-foreground' : ''}>{name}</span>
    </li>
  );
}

function PricingCTA({
  plan,
  cta,
  isCurrentPlan,
}: {
  plan: Plan;
  cta: string;
  isCurrentPlan: boolean;
}) {
  const { isAuthenticated } = useAuth();

  // Free plan - always show register
  if (plan.tier === 'free') {
    return (
      <Link href="/register" className="block">
        <Button className="w-full" variant="outline">
          {cta}
        </Button>
      </Link>
    );
  }

  // Trial plan - show register for new users
  if (plan.tier === 'trial') {
    if (isAuthenticated && isCurrentPlan) {
      return (
        <Button className="w-full" disabled>
          当前计划
        </Button>
      );
    }
    if (isAuthenticated) {
      return (
        <Link href="/dashboard/settings/subscription" className="block">
          <Button className="w-full" variant="outline">
            查看订阅
          </Button>
        </Link>
      );
    }
    return (
      <Link href="/register" className="block">
        <Button className="w-full bg-green-500 hover:bg-green-600">
          {cta}
        </Button>
      </Link>
    );
  }

  // Pro plan - show upgrade flow
  if (isAuthenticated) {
    if (isCurrentPlan) {
      return (
        <Button className="w-full" disabled>
          当前计划
        </Button>
      );
    }
    return (
      <Link href="/checkout?plan=pro" className="block">
        <Button className="w-full">
          {cta}
        </Button>
      </Link>
    );
  }

  // Not authenticated
  return (
    <Link href="/register?plan=pro" className="block">
      <Button className="w-full">
        {cta}
      </Button>
    </Link>
  );
}
