import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { StatCard } from '@/components/admin/StatCard';
import { Users, CreditCard, FileText, TrendingUp } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.zenconsult.top';

interface AdminAnalytics {
  totalUsers: number;
  userGrowth: number;
  activeUsers: number;
  averageApiCalls: number;
  apiCallsGrowth: number;
  topMarkets: Array<{ market: string; users: number; growth: number }>;
  topCategories: Array<{ category: string; views: number; growth: number }>;
}

interface UserStats {
  total: number;
  active: number;
  paid: number;
  growthRate: number;
}

async function getAdminStats(token: string): Promise<{
  analytics: AdminAnalytics | null;
  userStats: UserStats | null;
  error?: string;
}> {
  try {
    const [analyticsRes, userStatsRes] = await Promise.all([
      fetch(`${API_BASE}/api/v1/admin/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }),
      fetch(`${API_BASE}/api/v1/admin/users/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }),
    ]);

    if (!analyticsRes.ok || !userStatsRes.ok) {
      // If 403, likely not admin
      if (analyticsRes.status === 403 || userStatsRes.status === 403) {
        return { analytics: null, userStats: null, error: 'not_admin' };
      }
      return { analytics: null, userStats: null, error: 'api_error' };
    }

    const analytics = await analyticsRes.json();
    const userStats = await userStatsRes.json();

    return { analytics, userStats };
  } catch (error) {
    console.error('Failed to fetch admin stats:', error);
    return { analytics: null, userStats: null, error: 'network_error' };
  }
}

async function getContentStats(token: string): Promise<{
  totalCards: number;
  totalArticles: number;
}> {
  try {
    // Use public endpoints for content stats
    const [cardsRes, articlesRes] = await Promise.all([
      fetch(`${API_BASE}/api/v1/cards/stats/overview`, {
        cache: 'no-store',
      }),
      fetch(`${API_BASE}/api/v1/crawler-sync/articles?per_page=1`, {
        cache: 'no-store',
      }),
    ]);

    let totalCards = 0;
    let totalArticles = 0;

    if (cardsRes.ok) {
      const cardsData = await cardsRes.json();
      totalCards = cardsData?.overview?.total_cards || 0;
    }

    if (articlesRes.ok) {
      const articlesData = await articlesRes.json();
      totalArticles = articlesData?.total || 0;
    }

    return { totalCards, totalArticles };
  } catch (error) {
    console.error('Failed to fetch content stats:', error);
    return { totalCards: 0, totalArticles: 0 };
  }
}

export default async function AdminPage() {
  // 验证管理员权限
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    redirect('/login?redirect=/admin');
  }

  // Fetch real data from API
  const [{ analytics, userStats, error }, contentStats] = await Promise.all([
    getAdminStats(token),
    getContentStats(token),
  ]);

  // If not admin, redirect to dashboard
  if (error === 'not_admin') {
    redirect('/dashboard?error=not_admin');
  }

  // Use real data or fallback to defaults
  const displayStats = {
    totalUsers: userStats?.total || analytics?.totalUsers || 0,
    activeUsers: userStats?.active || analytics?.activeUsers || 0,
    userGrowth: userStats?.growthRate || analytics?.userGrowth || 0,
    averageApiCalls: analytics?.averageApiCalls || 0,
    totalCards: contentStats.totalCards,
    totalArticles: contentStats.totalArticles,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">管理后台</h1>
        <p className="text-muted-foreground">欢迎回来，管理员</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="总用户数"
          value={displayStats.totalUsers.toLocaleString()}
          change={displayStats.userGrowth > 0 ? `+${displayStats.userGrowth}%` : `${displayStats.userGrowth}%`}
          changeType={displayStats.userGrowth >= 0 ? 'increase' : 'decrease'}
          icon={Users}
          description="注册用户总数"
        />
        <StatCard
          title="活跃用户"
          value={displayStats.activeUsers.toLocaleString()}
          change={`${((displayStats.activeUsers / (displayStats.totalUsers || 1)) * 100).toFixed(0)}%`}
          changeType="increase"
          icon={TrendingUp}
          description="30天内活跃用户"
        />
        <StatCard
          title="平均API调用"
          value={displayStats.averageApiCalls.toString()}
          change={analytics?.apiCallsGrowth ? `+${analytics.apiCallsGrowth}%` : undefined}
          changeType="increase"
          icon={CreditCard}
          description="日均API调用次数"
        />
        <StatCard
          title="内容数量"
          value={`${displayStats.totalCards}+${displayStats.totalArticles}`}
          icon={FileText}
          description="卡片和文章总数"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Top Markets */}
        <div className="col-span-2">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">热门市场</h3>
            <div className="space-y-4">
              {(analytics?.topMarkets?.length ?? 0) > 0 ? (
                analytics!.topMarkets.map((market, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">{i + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{market.market}</p>
                        <p className="text-xs text-muted-foreground">{market.users} 用户</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      market.growth >= 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {market.growth >= 0 ? '+' : ''}{market.growth}%
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">暂无市场数据</p>
              )}
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div>
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">热门品类</h3>
            <div className="space-y-4">
              {(analytics?.topCategories?.length ?? 0) > 0 ? (
                analytics!.topCategories!.slice(0, 4).map((cat, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      i === 0 ? 'bg-blue-500' :
                      i === 1 ? 'bg-green-500' :
                      i === 2 ? 'bg-yellow-500' :
                      'bg-purple-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm">{cat.category}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">{cat.views.toLocaleString()} 浏览</p>
                        <span className="text-xs text-green-600">+{cat.growth}%</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">暂无品类数据</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
