'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { favoritesApi, opportunitiesApi } from '@/lib/api';
import { Heart, TrendingUp, Target, Brain, BarChart3, RefreshCw, ExternalLink, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useFavorites } from '@/lib/contexts/favorites-context';
import { useToast } from '@/components/ui/toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CPIScore {
  score: number;
  weight: number;
  details: Record<string, any>;
}

// Use BusinessOpportunity from API, with local extensions
type Opportunity = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  opportunity_type: string;
  grade: string | null;
  confidence_score: number;
  cpi_total_score: number | null;
  cpi_competition_score: number | null;
  cpi_potential_score: number | null;
  cpi_intelligence_gap_score: number | null;
  elements: Record<string, any>;
  ai_insights: {
    initial_cpi_score?: {
      competition?: CPIScore;
      potential?: CPIScore;
      intelligence_gap?: CPIScore;
      total_score?: number;
      opportunity_type?: string;
      calculated_at?: string;
    };
    data_requirements?: string[];
    verification_needs?: string[];
    why_opportunity?: string;
    key_assumptions?: string[];
  } | null;
  created_at: string;
  last_cpi_recalc_at?: string | null;
  user_interactions?: Record<string, any>;
}

const STATUS_LABELS: Record<string, string> = {
  potential: '发现期',
  verifying: '验证期',
  assessing: '评估期',
  executing: '执行期',
  archived: '已归档',
};

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

function getScoreColor(score: number): string {
  if (score >= 70) return 'text-green-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-red-600';
}

function getScoreBg(score: number): string {
  if (score >= 70) return 'bg-green-100';
  if (score >= 40) return 'bg-yellow-100';
  return 'bg-red-100';
}

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { toggleFavorite } = useFavorites();
  const { showSuccess, showError } = useToast();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (params.id) {
      fetchOpportunity(params.id as string);
    }
  }, [params.id]);

  const fetchOpportunity = async (id: string) => {
    try {
      // Use API client for proper auth header handling
      const response = await opportunitiesApi.getOpportunity(id);
      setOpportunity(response.opportunity);

      // Check favorite status
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const favoriteData = await favoritesApi.checkOpportunityFavorite(id);
          setIsFavorite(favoriteData.is_favorite);
        } catch (err) {
          console.error('Failed to check favorite status:', err);
        }
      }
    } catch (error) {
      console.error('Failed to fetch opportunity:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!opportunity) return;
    if (saving) return;

    setSaving(true);

    try {
      if (!isAuthenticated) {
        showError('需要注册', '收藏商机需要注册账户，注册后AI将为您持续监控此机会');
        setTimeout(() => {
          router.push(`/register?redirect=${encodeURIComponent(window.location.pathname)}`);
        }, 1500);
        return;
      }

      if (isFavorite) {
        await favoritesApi.removeFavoriteByOpportunity(opportunity.id);
        setIsFavorite(false);
        showSuccess('已取消收藏');
      } else {
        await favoritesApi.addOpportunityFavorite(opportunity.id);
        setIsFavorite(true);
        showSuccess('收藏成功', 'AI将为您持续监控此机会的进展');
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      showError('操作失败', '请稍后再试');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
          <div className="text-gray-400">加载中...</div>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-gray-400">商机不存在</div>
          <Link href="/dashboard/opportunities" className="text-blue-600 hover:underline">
            返回列表
          </Link>
        </div>
      </div>
    );
  }

  const cpiData = opportunity.ai_insights?.initial_cpi_score;
  const competitionScore = cpiData?.competition?.score ?? opportunity.cpi_competition_score ?? 0;
  const potentialScore = cpiData?.potential?.score ?? opportunity.cpi_potential_score ?? 0;
  const intelligenceScore = cpiData?.intelligence_gap?.score ?? opportunity.cpi_intelligence_gap_score ?? 0;
  const totalScore = cpiData?.total_score ?? opportunity.cpi_total_score ?? 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Link */}
      <Link href="/dashboard/opportunities" className="text-blue-600 hover:underline mb-6 inline-flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        返回商机列表
      </Link>

      {/* Header Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge className={STATUS_LABELS[opportunity.status] ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}>
                  {STATUS_LABELS[opportunity.status] || opportunity.status}
                </Badge>
                {opportunity.grade && (
                  <Badge className={GRADE_COLORS[opportunity.grade] || 'bg-gray-100'}>
                    {GRADE_LABELS[opportunity.grade] || opportunity.grade}
                  </Badge>
                )}
                <Badge variant="outline">
                  {opportunity.opportunity_type || '产品'}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {opportunity.title}
              </h1>
              <p className="text-gray-600">
                {opportunity.description || '暂无描述'}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${getScoreColor(totalScore)}`}>
                {totalScore.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">CPI 总分</div>
            </div>
          </div>

          {/* CPI Score Breakdown */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className={`p-4 rounded-lg ${getScoreBg(competitionScore)}`}>
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">竞争度 (C)</span>
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(competitionScore)}`}>
                {competitionScore.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500 mt-1">权重 40%</div>
            </div>
            <div className={`p-4 rounded-lg ${getScoreBg(potentialScore)}`}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">潜力 (P)</span>
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(potentialScore)}`}>
                {potentialScore.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500 mt-1">权重 40%</div>
            </div>
            <div className={`p-4 rounded-lg ${getScoreBg(intelligenceScore)}`}>
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">信息差 (I)</span>
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(intelligenceScore)}`}>
                {intelligenceScore.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500 mt-1">权重 20%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for detailed information */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="competition">竞争分析</TabsTrigger>
          <TabsTrigger value="potential">市场潜力</TabsTrigger>
          <TabsTrigger value="intelligence">信息洞察</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid gap-6">
            {/* Product Info */}
            {opportunity.elements?.product && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>📦</span> 商机要素
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">产品类别</div>
                      <div className="font-medium">{opportunity.elements.product.category}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Amazon 产品数</div>
                      <div className="font-medium">{opportunity.elements.product.amazon_products_count || 0}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">机会评分</div>
                      <div className="font-medium">{opportunity.elements.product.opportunity_score?.toFixed(1) || '-'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">机会类型</div>
                      <div className="font-medium">{cpiData?.opportunity_type || '-'}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Insights Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🤖</span> AI 综合洞察
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cpiData?.opportunity_type && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-1">机会类型</div>
                    <Badge variant="outline" className="text-base">{cpiData.opportunity_type}</Badge>
                  </div>
                )}
                {opportunity.ai_insights?.verification_needs && opportunity.ai_insights.verification_needs.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-2">需要验证</div>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      {opportunity.ai_insights.verification_needs.map((need, i) => (
                        <li key={i}>{need}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {opportunity.ai_insights?.data_requirements && opportunity.ai_insights.data_requirements.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-500 mb-2">数据需求</div>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      {opportunity.ai_insights.data_requirements.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {cpiData?.calculated_at && (
                  <div className="mt-4 pt-4 border-t text-sm text-gray-500">
                    最后计算时间: {new Date(cpiData.calculated_at).toLocaleString('zh-CN')}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Competition Tab */}
        <TabsContent value="competition">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                竞争度分析 (C维度 - 40%权重)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">竞争度得分</span>
                  <span className={`text-3xl font-bold ${getScoreColor(competitionScore)}`}>
                    {competitionScore.toFixed(1)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all ${
                      competitionScore >= 70 ? 'bg-green-500' :
                      competitionScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(competitionScore, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  得分越高表示竞争越不激烈，机会越大
                </p>
              </div>

              {cpiData?.competition?.details && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">样本数量</div>
                      <div className="text-xl font-semibold">{cpiData.competition.details.sample_size || 0}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">品牌集中度</div>
                      <div className="text-xl font-semibold">
                        {(cpiData.competition.details.brand_concentration || 0).toFixed(1)}%
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">预估CPC</div>
                      <div className="text-xl font-semibold">
                        ${cpiData.competition.details.estimated_cpc?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">顶级品牌</div>
                      <div className="text-sm font-medium">
                        {cpiData.competition.details.top_brands
                          ? Object.entries(cpiData.competition.details.top_brands).map(([brand, count]) => (
                              <span key={brand} className="inline-block mr-2">{brand}({count as number})</span>
                            ))
                          : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Potential Tab */}
        <TabsContent value="potential">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                市场潜力分析 (P维度 - 40%权重)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">潜力得分</span>
                  <span className={`text-3xl font-bold ${getScoreColor(potentialScore)}`}>
                    {potentialScore.toFixed(1)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all ${
                      potentialScore >= 70 ? 'bg-green-500' :
                      potentialScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(potentialScore, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  得分越高表示市场潜力越大，增长空间越广
                </p>
              </div>

              {cpiData?.potential?.details && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">样本数量</div>
                      <div className="text-xl font-semibold">{cpiData.potential.details.sample_size || 0}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">平均评论数</div>
                      <div className="text-xl font-semibold">
                        {((cpiData.potential.details.avg_reviews || 0) / 1000).toFixed(1)}K
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">增长率</div>
                      <div className="text-xl font-semibold">
                        {((cpiData.potential.details.growth_rate || 0) * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">文章趋势</div>
                      <div className="text-sm font-medium text-green-600">
                        {cpiData.potential.details.article_trend || '数据收集中'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Intelligence Tab */}
        <TabsContent value="intelligence">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                信息差分析 (I维度 - 20%权重)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">信息差得分</span>
                  <span className={`text-3xl font-bold ${getScoreColor(intelligenceScore)}`}>
                    {intelligenceScore.toFixed(1)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all ${
                      intelligenceScore >= 70 ? 'bg-green-500' :
                      intelligenceScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(intelligenceScore, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  得分越高表示信息差越大，先发优势越明显
                </p>
              </div>

              {cpiData?.intelligence_gap?.details && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">数据来源</div>
                      <div className="text-xl font-semibold capitalize">
                        {cpiData.intelligence_gap.details.data_source || 'N/A'}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">文章数量</div>
                      <div className="text-xl font-semibold">
                        {cpiData.intelligence_gap.details.article_count || 0}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">主要主题</div>
                      <div className="text-xl font-semibold capitalize">
                        {cpiData.intelligence_gap.details.dominant_theme || 'N/A'}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">集中度</div>
                      <div className="text-xl font-semibold">
                        {((cpiData.intelligence_gap.details.concentration_ratio || 0) * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  {/* Theme Distribution */}
                  {cpiData.intelligence_gap.details.theme_distribution && (
                    <div className="mt-4">
                      <div className="text-sm text-gray-500 mb-2">主题分布</div>
                      <div className="flex gap-2">
                        {Object.entries(cpiData.intelligence_gap.details.theme_distribution).map(([theme, count]) => (
                          <Badge key={theme} variant="outline">
                            {theme}: {count as number}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            isFavorite
              ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } disabled:opacity-50`}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          {saving ? '保存中...' : isFavorite ? '已收藏' : '收藏'}
        </button>
        <Link href="/dashboard/opportunities">
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            返回列表
          </button>
        </Link>
      </div>
    </div>
  );
}
