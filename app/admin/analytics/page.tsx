import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { Card } from '@/components/ui/card';
import { StatCard } from '@/components/admin/StatCard';
import { Users, TrendingUp, DollarSign, Activity } from 'lucide-react';

export default async function AdminAnalyticsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    redirect('/login?redirect=/admin/analytics');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">数据分析</h1>
        <p className="text-muted-foreground">用户行为和收入分析</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="今日访问"
          value="2,345"
          change="+15%"
          changeType="increase"
          icon={Activity}
        />
        <StatCard
          title="新增用户"
          value="89"
          change="+23%"
          changeType="increase"
          icon={Users}
        />
        <StatCard
          title="活跃用户"
          value="456"
          change="+8%"
          changeType="increase"
          icon={TrendingUp}
        />
        <StatCard
          title="今日收入"
          value="¥12,345"
          change="+32%"
          changeType="increase"
          icon={DollarSign}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* User Growth Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">用户增长趋势</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-muted-foreground">图表组件 - 需要安装 Recharts</p>
          </div>
        </Card>

        {/* Revenue Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">收入趋势</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-muted-foreground">图表组件 - 需要安装 Recharts</p>
          </div>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">用户分布</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>免费版</span>
                <span>65%</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gray-400 rounded-full" style={{width: '65%'}} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>专业版</span>
                <span>28%</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{width: '28%'}} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>企业版</span>
                <span>7%</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{width: '7%'}} />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">热门分类</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>电子产品</span>
              <span className="text-muted-foreground">1,234 次浏览</span>
            </div>
            <div className="flex items-center justify-between">
              <span>家居用品</span>
              <span className="text-muted-foreground">987 次浏览</span>
            </div>
            <div className="flex items-center justify-between">
              <span>运动户外</span>
              <span className="text-muted-foreground">756 次浏览</span>
            </div>
            <div className="flex items-center justify-between">
              <span>美妆个护</span>
              <span className="text-muted-foreground">543 次浏览</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">转化漏斗</h3>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold">2,345</div>
              <div className="text-sm text-muted-foreground">访问用户</div>
            </div>
            <div className="border-b" />
            <div className="text-center">
              <div className="text-2xl font-bold">892</div>
              <div className="text-sm text-muted-foreground">注册用户 (38%)</div>
            </div>
            <div className="border-b" />
            <div className="text-center">
              <div className="text-2xl font-bold">234</div>
              <div className="text-sm text-muted-foreground">付费用户 (26%)</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
