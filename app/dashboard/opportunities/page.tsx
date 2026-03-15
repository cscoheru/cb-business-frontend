'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, SlidersHorizontal, Target, TrendingUp, DollarSign, Package, Globe, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { opportunitiesApi, BusinessOpportunity } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

// 商机等级颜色映射
const GRADE_COLORS: Record<string, string> = {
  lead: 'bg-gray-100 text-gray-800',
  normal: 'bg-blue-100 text-blue-800',
  priority: 'bg-orange-100 text-orange-800',
  landable: 'bg-green-100 text-green-800',
};

const GRADE_LABELS: Record<string, string> = {
  lead: '线索 (<60分)',
  normal: '普通 (60-69分)',
  priority: '重点 (70-84分)',
  landable: '落地 (≥85分)',
};

const STATUS_LABELS: Record<string, string> = {
  potential: '发现期',
  verifying: '验证期',
  assessing: '评估期',
  executing: '执行期',
  archived: '已归档',
};

export default function OpportunitiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [opportunities, setOpportunities] = useState<BusinessOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    byGrade: {} as Record<string, number>,
    byStatus: {} as Record<string, number>,
  });
  const { isAuthenticated } = useAuth();

  // 获取用户关注的商机
  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setLoading(true);
        setError(null);

        // 获取商机列表
        const response = await opportunitiesApi.listOpportunities({ limit: 50 });
        setOpportunities(response.opportunities || []);

        // 获取统计数据
        const funnelResponse = await fetch('/api/v1/opportunities/funnel').then(r => r.json());
        if (funnelResponse.success) {
          const byStatus: Record<string, number> = {};
          Object.entries(funnelResponse.funnel).forEach(([key, value]: [string, any]) => {
            byStatus[key] = value.count;
          });
          setStats(prev => ({
            ...prev,
            total: funnelResponse.total,
            byStatus,
          }));
        }

        const gradesResponse = await fetch('/api/v1/opportunities/grades').then(r => r.json());
        if (gradesResponse.success) {
          const byGrade: Record<string, number> = {};
          Object.entries(gradesResponse.grades).forEach(([key, value]: [string, any]) => {
            byGrade[key] = value.count;
          });
          setStats(prev => ({ ...prev, byGrade }));
        }
      } catch (err: any) {
        console.error('Failed to fetch opportunities:', err);
        setError(err.message || '获取商机失败');
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  // 筛选商机
  const filteredOpportunities = opportunities.filter(opp => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      opp.title?.toLowerCase().includes(query) ||
      opp.description?.toLowerCase().includes(query) ||
      opp.category?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Target className="h-8 w-8 text-orange-500" />
          <h1 className="text-3xl font-bold">我的商机</h1>
        </div>
        <p className="text-muted-foreground">
          {isAuthenticated
            ? '您关注的商机，AI将持续监控市场变化'
            : '登录后可同步您的商机数据'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <Target className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">关注商机</div>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.byStatus?.executing || 0}</div>
              <div className="text-sm text-muted-foreground">执行中</div>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.byGrade?.landable || 0}</div>
              <div className="text-sm text-muted-foreground">可落地</div>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Package className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.byGrade?.priority || 0}</div>
              <div className="text-sm text-muted-foreground">重点关注</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索商机..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="p-8 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>重试</Button>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && filteredOpportunities.length === 0 && (
        <Card className="p-8 text-center">
          <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">暂无关注的商机</h3>
          <p className="text-muted-foreground mb-4">
            在发现页面点击"关注商机"按钮，开始追踪您感兴趣的市场机会
          </p>
          <Link href="/cards">
            <Button>发现商机</Button>
          </Link>
        </Card>
      )}

      {/* Opportunities List */}
      {!loading && !error && filteredOpportunities.length > 0 && (
        <div className="space-y-4">
          {filteredOpportunities.map((opportunity) => (
            <Link
              key={opportunity.id}
              href={`/opportunities/${opportunity.id}`}
              className="block"
            >
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        {opportunity.grade && (
                          <Badge className={GRADE_COLORS[opportunity.grade] || 'bg-gray-100'}>
                            {GRADE_LABELS[opportunity.grade] || opportunity.grade}
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {STATUS_LABELS[opportunity.status] || opportunity.status}
                        </Badge>
                      </div>
                    <h3 className="text-lg font-semibold mb-1">{opportunity.title}</h3>
                    {opportunity.description && (
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {opportunity.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {opportunity.cpi_total_score?.toFixed(1) || '-'}
                    </div>
                    <div className="text-xs text-muted-foreground">CPI分数</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-muted-foreground">
                  <span>创建于 {new Date(opportunity.created_at).toLocaleDateString('zh-CN')}</span>
                  <span className="text-primary">查看详情 →</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
