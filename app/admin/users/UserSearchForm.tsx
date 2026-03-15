'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface UserSearchFormProps {
  initialStatus?: string;
  initialPlan?: string;
  initialSearch?: string;
}

export function UserSearchForm({
  initialStatus,
  initialPlan,
  initialSearch,
}: UserSearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = useCallback((formData: FormData) => {
    const search = formData.get('search') as string;
    const status = formData.get('status') as string;
    const plan = formData.get('plan') as string;

    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    if (plan) params.set('plan', plan);

    router.push(`/admin/users?${params.toString()}`);
  }, [router]);

  const handleClear = useCallback(() => {
    router.push('/admin/users');
  }, [router]);

  return (
    <Card className="p-4">
      <form action={handleSearch} className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            name="search"
            placeholder="搜索用户邮箱或姓名..."
            className="pl-8"
            defaultValue={initialSearch}
          />
        </div>
        <select
          name="plan"
          className="border rounded-lg px-3 py-2"
          defaultValue={initialPlan}
        >
          <option value="">所有计划</option>
          <option value="free">免费版</option>
          <option value="trial">试用</option>
          <option value="pro">专业版</option>
          <option value="enterprise">企业版</option>
        </select>
        <select
          name="status"
          className="border rounded-lg px-3 py-2"
          defaultValue={initialStatus}
        >
          <option value="">所有状态</option>
          <option value="active">活跃</option>
          <option value="canceled">已取消</option>
          <option value="expired">已过期</option>
        </select>
        <Button type="submit" variant="default">
          搜索
        </Button>
        {(initialSearch || initialStatus || initialPlan) && (
          <Button type="button" variant="outline" onClick={handleClear}>
            <X className="h-4 w-4 mr-1" />
            清除
          </Button>
        )}
      </form>
    </Card>
  );
}
