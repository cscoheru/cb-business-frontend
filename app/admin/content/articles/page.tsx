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
import { Search, Eye, Edit, Trash2 } from 'lucide-react';

// TODO: 从API获取真实数据
const mockArticles = [
  {
    id: '1',
    title: '2025年跨境电商新趋势分析',
    source: '36kr',
    category: '行业分析',
    theme: '市场趋势',
    publishedAt: '2026-03-10',
    riskLevel: 'low',
  },
  {
    id: '2',
    title: '东南亚电商政策更新通知',
    source: 'custom',
    category: '政策法规',
    theme: '法规变化',
    publishedAt: '2026-03-11',
    riskLevel: 'medium',
  },
  {
    id: '3',
    title: '亚马逊欧洲站新规解读',
    source: 'selleramp',
    category: '平台动态',
    theme: '合规要求',
    publishedAt: '2026-03-12',
    riskLevel: 'high',
  },
];

export default async function AdminArticlesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    redirect('/login?redirect=/admin/content/articles');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">文章管理</h1>
          <p className="text-muted-foreground">管理爬虫文章和AI分析内容</p>
        </div>
        <Button>同步文章</Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">总文章数</div>
          <div className="text-2xl font-bold">286</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">今日新增</div>
          <div className="text-2xl font-bold">12</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">高风险文章</div>
          <div className="text-2xl font-bold text-red-600">3</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">AI分析完成</div>
          <div className="text-2xl font-bold text-green-600">280</div>
        </Card>
      </div>

      {/* Articles Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>标题</TableHead>
              <TableHead>来源</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>主题</TableHead>
              <TableHead>风险等级</TableHead>
              <TableHead>发布时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockArticles.map((article) => (
              <TableRow key={article.id}>
                <TableCell className="font-medium max-w-md truncate">
                  {article.title}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{article.source}</Badge>
                </TableCell>
                <TableCell>{article.category}</TableCell>
                <TableCell>{article.theme}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      article.riskLevel === 'high' ? 'destructive' :
                      article.riskLevel === 'medium' ? 'default' :
                      'secondary'
                    }
                  >
                    {article.riskLevel === 'high' ? '高风险' :
                     article.riskLevel === 'medium' ? '中风险' : '低风险'}
                  </Badge>
                </TableCell>
                <TableCell>{article.publishedAt}</TableCell>
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

      {/* Sync Status */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">同步状态</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>36kr 爬虫</span>
            </div>
            <span className="text-sm text-muted-foreground">最后同步: 2小时前</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>SellerAMP 爬虫</span>
            </div>
            <span className="text-sm text-muted-foreground">最后同步: 4小时前</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span>Custom 爬虫</span>
            </div>
            <span className="text-sm text-muted-foreground">最后同步: 1天前</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
