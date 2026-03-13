import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Filter, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// TODO: 从API获取
const mockUsers = [
  { id: '1', email: 'user1@example.com', name: 'User 1', plan: 'pro', status: 'active', createdAt: '2026-03-10' },
  { id: '2', email: 'user2@example.com', name: 'User 2', plan: 'free', status: 'active', createdAt: '2026-03-11' },
  { id: '3', email: 'user3@example.com', name: 'User 3', plan: 'enterprise', status: 'active', createdAt: '2026-03-12' },
  { id: '4', email: 'user4@example.com', name: 'User 4', plan: 'free', status: 'canceled', createdAt: '2026-03-08' },
  { id: '5', email: 'user5@example.com', name: 'User 5', plan: 'pro', status: 'expired', createdAt: '2026-03-05' },
];

export default async function AdminUsersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    redirect('/login?redirect=/admin/users');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">用户管理</h1>
          <p className="text-muted-foreground">管理系统用户和权限</p>
        </div>
        <Button>导出数据</Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="搜索用户..." className="pl-8" />
          </div>
          <select className="border rounded-lg px-3 py-2">
            <option value="">所有计划</option>
            <option value="free">免费版</option>
            <option value="pro">专业版</option>
            <option value="enterprise">企业版</option>
          </select>
          <select className="border rounded-lg px-3 py-2">
            <option value="">所有状态</option>
            <option value="active">活跃</option>
            <option value="canceled">已取消</option>
            <option value="expired">已过期</option>
          </select>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户</TableHead>
              <TableHead>邮箱</TableHead>
              <TableHead>计划</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>注册时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.plan === 'free' ? 'outline' : 'default'}>
                    {user.plan === 'free' ? '免费版' : user.plan === 'pro' ? '专业版' : '企业版'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      user.status === 'active' ? 'default' :
                      user.status === 'canceled' ? 'secondary' :
                      'outline'
                    }
                  >
                    {user.status === 'active' ? '活跃' :
                     user.status === 'canceled' ? '已取消' : '已过期'}
                  </Badge>
                </TableCell>
                <TableCell>{user.createdAt}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>查看详情</DropdownMenuItem>
                      <DropdownMenuItem>编辑用户</DropdownMenuItem>
                      <DropdownMenuItem>重置密码</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        删除用户
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          显示 1-5 条，共 {mockUsers.length} 条
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>上一页</Button>
          <Button variant="outline" size="sm" disabled>下一页</Button>
        </div>
      </div>
    </div>
  );
}
