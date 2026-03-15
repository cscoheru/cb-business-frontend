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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.zenconsult.top';

interface CardData {
  id: string;
  title: string;
  category: string;
  content?: {
    summary?: {
      opportunity_score?: number;
    };
  };
  views: number;
  likes: number;
  is_published: boolean;
  created_at: string;
}

interface CardsStats {
  overview: {
    total_cards: number;
    published_cards: number;
    today_cards: number;
    total_views: number;
    total_likes: number;
  };
}

async function getCardsStats(): Promise<CardsStats | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/cards/stats/overview`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch cards stats:', error);
    return null;
  }
}

async function getCards(): Promise<CardData[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/cards/history?limit=50`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.cards || [];
  } catch (error) {
    console.error('Failed to fetch cards:', error);
    return [];
  }
}

const categories: Record<string, string> = {
  wireless_earbuds: '无线耳机',
  phone_chargers: '手机充电器',
  desk_lamps: 'LED台灯',
  fitness_trackers: '健身追踪器',
  smart_plugs: '智能插座',
  phone_cases: '手机壳',
  yoga_mats: '瑜伽垫',
  coffee_makers: '咖啡机',
  bluetooth_speakers: '蓝牙音箱',
  webcams: '摄像头',
  keyboards: '键盘',
  mouse: '鼠标',
};

export default async function AdminCardsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    redirect('/login?redirect=/admin/content/cards');
  }

  const [stats, cards] = await Promise.all([
    getCardsStats(),
    getCards(),
  ]);

  const totalCards = stats?.overview?.total_cards || cards.length;
  const publishedCards = stats?.overview?.published_cards || cards.filter(c => c.is_published).length;
  const draftCards = totalCards - publishedCards;
  const totalViews = stats?.overview?.total_views || cards.reduce((s, c) => s + c.views, 0);
  const totalLikes = stats?.overview?.total_likes || cards.reduce((s, c) => s + c.likes, 0);

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
          <div className="text-2xl font-bold">{totalCards}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">已发布</div>
          <div className="text-2xl font-bold">{publishedCards}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">草稿</div>
          <div className="text-2xl font-bold">{draftCards}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">总浏览/收藏</div>
          <div className="text-2xl font-bold">{totalViews.toLocaleString()} / {totalLikes}</div>
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
        {cards.length > 0 ? (
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
              {cards.map((card) => {
                const score = card.content?.summary?.opportunity_score || 0;
                return (
                  <TableRow key={card.id}>
                    <TableCell className="font-medium max-w-xs truncate">
                      {card.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {categories[card.category] || card.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className={score >= 90 ? 'text-green-600' : score >= 70 ? 'text-yellow-600' : 'text-red-600'}>
                          {score}
                        </span>
                        <span className="text-muted-foreground">分</span>
                      </div>
                    </TableCell>
                    <TableCell>{card.views.toLocaleString()}</TableCell>
                    <TableCell>{card.likes}</TableCell>
                    <TableCell>
                      <Badge variant={card.is_published ? 'default' : 'secondary'}>
                        {card.is_published ? '已发布' : '草稿'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(card.created_at).toLocaleDateString('zh-CN')}</TableCell>
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
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            暂无卡片数据
          </div>
        )}
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          显示 {cards.length} 条，共 {totalCards} 条
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>上一页</Button>
          <Button variant="outline" size="sm" disabled>下一页</Button>
        </div>
      </div>
    </div>
  );
}
