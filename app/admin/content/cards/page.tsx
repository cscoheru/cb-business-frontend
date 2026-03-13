import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Eye, Edit, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';

// TODO: 从API获取真实数据
const mockCards = [
  {
    id: '1',
    title: '无线蓝牙耳机',
    category: 'wireless_earbuds',
    score: 95,
    views: 1234,
    likes: 89,
    isPublished: true,
    createdAt: '2026-03-10',
  },
  {
    id: '2',
    title: '手机快速充电器',
    category: 'phone_chargers',
    score: 97,
    views: 2341,
    likes: 156,
    isPublished: true,
    createdAt: '2026-03-11',
  },
  {
    id: '3',
    title: 'LED智能台灯',
    category: 'desk_lamps',
    score: 88,
    views: 876,
    likes: 45,
    isPublished: true,
    createdAt: '2026-03-12',
  },
  {
    id: '4',
    title: '健身追踪器',
    category: 'fitness_trackers',
    score: 92,
    views: 1567,
    likes: 98,
    isPublished: false,
    createdAt: '2026-03-13',
  },
];

const categories: Record<string, string> = {
  wireless_earbuds: '无线耳机',
  phone_chargers: '手机充电器',
  desk_lamps: 'LED台灯',
  fitness_trackers: '健身追踪器',
};

export default async function AdminCardsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    redirect('/login?redirect=/admin/content/cards');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">卡片管理</h1>
          <p className="text-muted-foreground">管理商机卡片内容和发布</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          创建卡片
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">总卡片数</div>
          <div className="text-2xl font-bold">{mockCards.length}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">已发布</div>
          <div className="text-2xl font-bold">
            {mockCards.filter(c => c.isPublished).length}
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">草稿</div>
          <div className="text-2xl font-bold">
            {mockCards.filter(c => !c.isPublished).length}
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">平均评分</div>
          <div className="text-2xl font-bold">
            {(mockCards.reduce((s, c) => s + c.score, 0) / mockCards.length).toFixed(1)}
          </div>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="搜索卡片..." className="pl-8" />
          </div>
          <select className="border rounded-lg px-3 py-2">
            <option value="">所有分类</option>
            {Object.entries(categories).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <select className="border rounded-lg px-3 py-2">
            <option value="">所有状态</option>
            <option value="published">已发布</option>
            <option value="draft">草稿</option>
          </select>
          <select className="border rounded-lg px-3 py-2">
            <option value="created">创建时间</option>
            <option value="score">评分</option>
            <option value="views">浏览量</option>
          </select>
        </div>
      </Card>

      {/* Cards Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>标题</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>评分</TableHead>
              <TableHead>浏览</TableHead>
              <TableHead>收藏</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockCards.map((card) => (
              <TableRow key={card.id}>
                <TableCell className="font-medium">{card.title}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {categories[card.category] || card.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className={card.score >= 90 ? 'text-green-600' : card.score >= 80 ? 'text-yellow-600' : 'text-red-600'}>
                      {card.score}
                    </span>
                    <span className="text-muted-foreground">分</span>
                  </div>
                </TableCell>
                <TableCell>{card.views.toLocaleString()}</TableCell>
                <TableCell>{card.likes}</TableCell>
                <TableCell>
                  <Badge variant={card.isPublished ? 'default' : 'secondary'}>
                    {card.isPublished ? '已发布' : '草稿'}
                  </Badge>
                </TableCell>
                <TableCell>{card.createdAt}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          显示 1-{mockCards.length} 条，共 {mockCards.length} 条
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>上一页</Button>
          <Button variant="outline" size="sm" disabled>下一页</Button>
        </div>
      </div>
    </div>
  );
}
