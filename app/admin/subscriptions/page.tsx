import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle, XCircle, Clock, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.zenconsult.top';

interface Subscription {
  id: string;
  userId: string;
  userEmail: string;
  plan: string;
  status: string;
  amount: number;
  currency: string;
  period: string;
  startDate: string;
  nextBillingDate: string;
}

interface SubscriptionsResponse {
  subscriptions: Subscription[];
  stats: {
    total: number;
    active: number;
    pro: number;
    enterprise: number;
    revenue: number;
  };
}

async function getSubscriptions(token: string): Promise<SubscriptionsResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/admin/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
      cache: 'no-store',
    });

    if (!res.ok) {
      if (res.status === 403) {
        return {
          subscriptions: [],
          stats: { total: 0, active: 0, pro: 0, enterprise: 0, revenue: 0 },
        };
      }
      throw new Error(`API error: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Failed to fetch subscriptions:', error);
    return {
      subscriptions: [],
      stats: { total: 0, active: 0, pro: 0, enterprise: 0, revenue: 0 },
    };
  }
}

export default async function AdminSubscriptionsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    redirect('/login?redirect=/admin/subscriptions');
  }

  const { subscriptions, stats } = await getSubscriptions(token);

  const planLabels: Record<string, string> = {
    free: '免费版',
    trial: '试用',
    pro: '专业版',
    enterprise: '企业版',
  };

  const periodLabels: Record<string, string> = {
    monthly: '月付',
    yearly: '年付',
  };

  const statusLabels: Record<string, string> = {
    active: '活跃',
    canceled: '已取消',
    past_due: '逾期',
    expired: '已过期',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">订阅管理</h1>
          <p className="text-muted-foreground">管理用户订阅和账单</p>
        </div>
        <Button>导出报表</Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">活跃订阅</div>
          <div className="text-2xl font-bold">{stats.active}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">专业版</div>
          <div className="text-2xl font-bold">{stats.pro}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">企业版</div>
          <div className="text-2xl font-bold">{stats.enterprise}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">月度收入</div>
          <div className="text-2xl font-bold">¥{stats.revenue.toLocaleString()}</div>
        </Card>
      </div>

      {/* Subscriptions Table */}
      <Card>
        {subscriptions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户邮箱</TableHead>
                <TableHead>计划</TableHead>
                <TableHead>周期</TableHead>
                <TableHead>金额</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>开始时间</TableHead>
                <TableHead>下次账单</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">{sub.userEmail}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {planLabels[sub.plan] || sub.plan}
                    </Badge>
                  </TableCell>
                  <TableCell>{periodLabels[sub.period] || sub.period}</TableCell>
                  <TableCell>¥{sub.amount}</TableCell>
                  <TableCell>
                    <Badge
                      variant={sub.status === 'active' ? 'default' : 'secondary'}
                      className="flex items-center gap-1 w-fit"
                    >
                      {sub.status === 'active' && <CheckCircle className="h-3 w-3" />}
                      {sub.status === 'canceled' && <XCircle className="h-3 w-3" />}
                      {sub.status === 'past_due' && <Clock className="h-3 w-3" />}
                      {statusLabels[sub.status] || sub.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{sub.startDate}</TableCell>
                  <TableCell>{sub.nextBillingDate || '-'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>查看详情</DropdownMenuItem>
                        <DropdownMenuItem>查看账单历史</DropdownMenuItem>
                        <DropdownMenuItem>修改订阅</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          取消订阅
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            暂无订阅数据
          </div>
        )}
      </Card>
    </div>
  );
}
