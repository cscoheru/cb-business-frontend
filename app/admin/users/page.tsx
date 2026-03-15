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
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserSearchForm } from './UserSearchForm';
import { UsersList } from './UsersList';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.zenconsult.top';

interface User {
  id: string;
  email: string;
  name: string;
  subscription: string;
  status: string;
  createdAt: string;
  lastActiveAt: string;
  apiUsage?: {
    limit: number;
    used: number;
  };
}

interface UsersResponse {
  users: User[];
  total: number;
}

async function getUsers(
  token: string,
  filters?: {
    status?: string;
    plan_tier?: string;
    search?: string;
  }
): Promise<UsersResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filters || {}),
      cache: 'no-store',
    });

    if (!res.ok) {
      if (res.status === 403) {
        return { users: [], total: 0 };
      }
      throw new Error(`API error: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return { users: [], total: 0 };
  }
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: {
    status?: string;
    plan?: string;
    search?: string;
  };
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    redirect('/login?redirect=/admin/users');
  }

  // Fetch users with filters
  const { users, total } = await getUsers(token, {
    status: searchParams?.status,
    plan_tier: searchParams?.plan,
    search: searchParams?.search,
  });

  const planLabels: Record<string, string> = {
    free: '免费版',
    trial: '试用',
    pro: '专业版',
    enterprise: '企业版',
  };

  const statusLabels: Record<string, string> = {
    active: '活跃',
    canceled: '已取消',
    expired: '已过期',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">用户管理</h1>
          <p className="text-muted-foreground">管理系统用户和权限</p>
        </div>
        <Button>导出数据</Button>
      </div>

      {/* Search and Filters */}
      <UserSearchForm
        initialStatus={searchParams?.status}
        initialPlan={searchParams?.plan}
        initialSearch={searchParams?.search}
      />

      {/* Users Table */}
      <Card>
        {users.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户</TableHead>
                <TableHead>邮箱</TableHead>
                <TableHead>订阅</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>API用量</TableHead>
                <TableHead>注册时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name || '-'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.subscription === 'free' ? 'outline' : 'default'}>
                      {planLabels[user.subscription] || user.subscription}
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
                      {statusLabels[user.status] || user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.apiUsage ? (
                      <span className="text-sm">
                        {user.apiUsage.used}/{user.apiUsage.limit === -1 ? '∞' : user.apiUsage.limit}
                      </span>
                    ) : '-'}
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
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            暂无用户数据
          </div>
        )}
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          显示 {users.length} 条，共 {total} 条
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>上一页</Button>
          <Button variant="outline" size="sm" disabled>下一页</Button>
        </div>
      </div>
    </div>
  );
}
