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
import { Eye, Edit, Trash2, RefreshCw } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.zenconsult.top';

interface Article {
  id: string;
  title: string;
  summary: string | null;
  source: string;
  link: string;
  region: string | null;
  country: string | null;
  platform: string | null;
  content_theme: string | null;
  tags: string[];
  risk_level: string | null;
  opportunity_score: number | null;
  published_at: string | null;
  crawled_at: string | null;
  is_processed: boolean;
}

interface ArticlesResponse {
  articles: Article[];
  total: number;
  page: number;
  per_page: number;
}

async function getArticles(): Promise<ArticlesResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/crawler-sync/articles?per_page=50`, {
      cache: 'no-store',
    });
    if (!res.ok) return { articles: [], total: 0, page: 1, per_page: 50 };
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    return { articles: [], total: 0, page: 1, per_page: 50 };
  }
}

export default async function AdminArticlesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    redirect('/login?redirect=/admin/content/articles');
  }

  const { articles, total } = await getArticles();

  const processedCount = articles.filter(a => a.is_processed).length;
  const highRiskCount = articles.filter(a => a.risk_level === 'high').length;
  const mediumRiskCount = articles.filter(a => a.risk_level === 'medium').length;

  const sourceLabels: Record<string, string> = {
    '36kr': '36氪',
    'selleramp': 'SellerAMP',
    'custom': '自定义',
    'zhihu': '知乎',
    'toutiao': '头条',
  };

  const riskLabels: Record<string, { label: string; variant: 'destructive' | 'default' | 'secondary' }> = {
    high: { label: '高风险', variant: 'destructive' },
    medium: { label: '中风险', variant: 'default' },
    low: { label: '低风险', variant: 'secondary' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">文章管理</h1>
          <p className="text-muted-foreground">管理爬虫文章和AI分析内容</p>
        </div>
        <Button>
          <RefreshCw className="h-4 w-4 mr-2" />
          同步文章
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">总文章数</div>
          <div className="text-2xl font-bold">{total}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">已处理</div>
          <div className="text-2xl font-bold text-green-600">{processedCount}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">中/高风险</div>
          <div className="text-2xl font-bold text-red-600">{highRiskCount + mediumRiskCount}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">待处理</div>
          <div className="text-2xl font-bold">{total - processedCount}</div>
        </Card>
      </div>

      {/* Articles Table */}
      <Card>
        {articles.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>标题</TableHead>
                <TableHead>来源</TableHead>
                <TableHead>区域</TableHead>
                <TableHead>主题</TableHead>
                <TableHead>风险等级</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>采集时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => {
                const risk = riskLabels[article.risk_level || 'low'] || riskLabels.low;
                return (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium max-w-md truncate">
                      {article.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {sourceLabels[article.source] || article.source}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {article.region || article.country || '-'}
                    </TableCell>
                    <TableCell>{article.content_theme || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={risk.variant}>
                        {risk.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={article.is_processed ? 'default' : 'secondary'}>
                        {article.is_processed ? '已处理' : '待处理'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {article.crawled_at
                        ? new Date(article.crawled_at).toLocaleDateString('zh-CN')
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <a
                          href={article.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
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
            暂无文章数据
          </div>
        )}
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          显示 {articles.length} 条，共 {total} 条
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>上一页</Button>
          <Button variant="outline" size="sm" disabled>下一页</Button>
        </div>
      </div>
    </div>
  );
}
