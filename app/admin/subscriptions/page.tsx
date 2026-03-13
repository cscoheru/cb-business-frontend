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

// TODO: 从API获取
const mockSubscriptions = [
  {
    id: '1',
    user: { id: '1', email: 'user1@example.com', name: 'User 1' },
    plan: 'pro',
    cycle: 'monthly',
    status: 'active',
    amount: 99,
    createdAt: '2026-03-10',
    expiresAt: '2026-04-10',
  },
  {
    id: '2',
    user: { id: '2', email: 'user2@example.com', name: 'User 2' },
    plan: 'enterprise',
    cycle: 'yearly',
    status: 'active',
    amount: 2990,
    createdAt: '2026-03-01',
    expiresAt: '2027-03-01',
  },
  {
    id: '3',
    user: { id: '3', email: 'user3@example.com', name: 'User 3' },
    plan: 'pro',
    cycle: 'monthly',
    status: 'canceled',
    amount: 99,
    createdAt: '2026-02-15',
    expiresAt: '2026-03-15',
  },
];

export default async function AdminSubscriptionsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    redirect('/login?redirect=/admin/subscriptions');
  }

  const totalRevenue = mockSubscriptions.reduce((sum, s) => sum + s.amount, 0);
  const activeCount = mockSubscriptions.filter(s => s.status === 'active').length;

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
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">活跃订阅</div>
          <div className="text-2xl font-bold">{activeCount}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">月度收入</div>
          <div className="text-2xl font-bold">¥{totalRevenue.toLocaleString()}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">总订阅数</div>
          <div className="text-2xl font-bold">{mockSubscriptions.length}</div>
        </Card>
      </div>

      {/* Subscriptions Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户</TableHead>
              <TableHead>计划</TableHead>
              <TableHead>周期</TableHead>
              <TableHead>金额</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>开始时间</TableHead>
              <TableHead>到期时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockSubscriptions.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{sub.user.name}</div>
                    <div className="text-sm text-muted-foreground">{sub.user.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {sub.plan === 'pro' ? '专业版' : '企业版'}
                  </Badge>
                </TableCell>
                <TableCell>{sub.cycle === 'monthly' ? '月付' : '年付'}</TableCell>
                <TableCell>¥{sub.amount}</TableCell>
                <TableCell>
                  <Badge
                    variant={sub.status === 'active' ? 'default' : 'secondary'}
                    className="flex items-center gap-1 w-fit"
                  >
                    {sub.status === 'active' && <CheckCircle className="h-3 w-3" />}
                    {sub.status === 'canceled' && <XCircle className="h-3 w-3" />}
                    {sub.status === 'pending' && <Clock className="h-3 w-3" />}
                    {sub.status === 'active' ? '活跃' :
                     sub.status === 'canceled' ? '已取消' : '待处理'}
                  </Badge>
                </TableCell>
                <TableCell>{sub.createdAt}</TableCell>
                <TableCell>{sub.expiresAt}</TableCell>
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
      </Card>
    </div>
  );
}
