import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { StatCard } from '@/components/admin/StatCard';
import { Users, CreditCard, FileText, TrendingUp, DollarSign } from 'lucide-react';

async function getAdminStats() {
  // TODO: 从API获取真实统计数据
  return {
    totalUsers: 1234,
    activeSubscriptions: 456,
    totalRevenue: 78900,
    totalCards: 12,
    totalArticles: 286,
    userGrowth: '+12%',
    revenueGrowth: '+23%',
  };
}

export default async function AdminPage() {
  // 验证管理员权限
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    redirect('/login?redirect=/admin');
  }

  // TODO: 验证token中的is_admin字段
  // 目前先放行，后续添加验证

  const stats = await getAdminStats();

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
          value={stats.totalUsers.toLocaleString()}
          change={stats.userGrowth}
          changeType="increase"
          icon={Users}
          description="注册用户总数"
        />
        <StatCard
          title="活跃订阅"
          value={stats.activeSubscriptions.toLocaleString()}
          change="+8%"
          changeType="increase"
          icon={CreditCard}
          description="当前活跃订阅数"
        />
        <StatCard
          title="总收入"
          value={`¥${(stats.totalRevenue / 1000).toFixed(1)}k`}
          change={stats.revenueGrowth}
          changeType="increase"
          icon={DollarSign}
          description="本月累计收入"
        />
        <StatCard
          title="内容数量"
          value={`${stats.totalCards}+${stats.totalArticles}`}
          icon={FileText}
          description="卡片和文章总数"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Users */}
        <div className="col-span-2">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">最近注册用户</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium">U{i}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">user{i}@example.com</p>
                      <p className="text-xs text-muted-foreground">2小时前</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                    免费
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">系统活动</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                <div>
                  <p className="text-sm">新用户注册</p>
                  <p className="text-xs text-muted-foreground">5分钟前</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                <div>
                  <p className="text-sm">订阅激活</p>
                  <p className="text-xs text-muted-foreground">15分钟前</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2" />
                <div>
                  <p className="text-sm">卡片更新</p>
                  <p className="text-xs text-muted-foreground">1小时前</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
                <div>
                  <p className="text-sm">文章同步</p>
                  <p className="text-xs text-muted-foreground">3小时前</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
