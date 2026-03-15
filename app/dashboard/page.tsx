'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JourneyTracker } from '@/components/dashboard/JourneyTracker';
import { QuickActionCard } from '@/components/dashboard/QuickActionCard';
import { OpportunityCard, mockOpportunityCard } from '@/components/dashboard/OpportunityCard';
import { TrialReminderBanner } from '@/components/trial/trial-reminder-banner';
import { UpgradePrompt } from '@/components/subscription/upgrade-prompt';
import { UsageTrendChart, CategoryDistributionChart } from '@/components/charts';
import { useAuth } from '@/lib/auth-context';
import { useSubscription } from '@/hooks/useSubscription';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const { status, isLoading, getPlanLabel, getStatusBadge } = useSubscription();

  return (
    <>
      {/* Trial Reminder Banner - Full mode */}
      <TrialReminderBanner />

      <div className="container mx-auto px-4 py-8">
      {/* Dashboard Page Title */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">仪表盘</h1>
        {!isLoading && status && (
          <Badge className={getStatusBadge(status).color}>
            {getPlanLabel(status.plan)}
          </Badge>
        )}
      </div>

      {/* Upgrade Prompt for Free Tier */}
      {!isLoading && status && status.plan === 'free' && (
        <UpgradePrompt variant="banner" className="mb-6" />
      )}

      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">
          早上好，{user?.name || user?.email || '创业者'}！
        </h2>
        <p className="text-muted-foreground">
          今天有 <span className="text-primary font-bold">3个</span> 新机会等待您
        </p>
      </div>

      {/* User Journey Tracker */}
      <JourneyTracker />

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6 my-8">
        <QuickActionCard
          icon="🔍"
          title="发现机会"
          description="查看AI推荐的新机会"
          href="/dashboard/opportunities"
        />
        <QuickActionCard
          icon="⚠️"
          title="风险预警"
          description="查看最新风险提示"
          href="/dashboard/risks"
        />
        <QuickActionCard
          icon="💰"
          title="成本计算"
          description="计算产品成本和利润"
          href="/dashboard/tools/cost-calculator"
        />
      </div>

      {/* Recommended Opportunities */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">为您推荐</h2>
          <Link href="/dashboard/opportunities" className="text-primary text-sm hover:underline">
            查看全部 →
          </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <OpportunityCard {...mockOpportunityCard(0)} />
          <OpportunityCard {...mockOpportunityCard(1)} />
        </div>
      </section>

      {/* Recent Alerts */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">最新风险预警</h2>
          <Link href="/dashboard/risks" className="text-primary text-sm hover:underline">
            查看全部 →
          </Link>
        </div>
        <Card className="p-6 text-center text-muted-foreground">
          <p>暂无新风险预警</p>
          <p className="text-sm mt-2">我们会持续监控您关注市场的政策变化</p>
        </Card>
      </section>

      {/* Quick Stats */}
      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-4">数据概览</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="text-2xl font-bold mb-1">12</div>
            <div className="text-sm text-muted-foreground">已保存的机会</div>
          </Card>
          <Card className="p-6">
            <div className="text-2xl font-bold mb-1">3</div>
            <div className="text-sm text-muted-foreground">关注的市场</div>
          </Card>
          <Card className="p-6">
            <div className="text-2xl font-bold mb-1">5</div>
            <div className="text-sm text-muted-foreground">成本计算次数</div>
          </Card>
          <Card className="p-6">
            <div className="text-2xl font-bold mb-1">2</div>
            <div className="text-sm text-muted-foreground">活跃预警</div>
          </Card>
        </div>
      </section>

      {/* Charts Section */}
      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-4">使用趋势</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">近7天活动</h3>
            <UsageTrendChart
              data={[
                { date: '周一', views: 12, favorites: 3, searches: 5 },
                { date: '周二', views: 19, favorites: 5, searches: 8 },
                { date: '周三', views: 15, favorites: 4, searches: 6 },
                { date: '周四', views: 25, favorites: 8, searches: 10 },
                { date: '周五', views: 22, favorites: 7, searches: 9 },
                { date: '周六', views: 30, favorites: 10, searches: 12 },
                { date: '周日', views: 28, favorites: 9, searches: 11 },
              ]}
            />
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">关注类别分布</h3>
            <CategoryDistributionChart
              data={[
                { category: '电子产品', count: 8, color: '#3b82f6' },
                { category: '家居用品', count: 6, color: '#ec4899' },
                { category: '运动户外', count: 4, color: '#f59e0b' },
                { category: '美容个护', count: 3, color: '#10b981' },
              ]}
            />
          </Card>
        </div>
      </section>
      </div>
    </>
  );
}
