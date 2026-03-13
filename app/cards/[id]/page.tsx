'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { cardsApi, Card as CardType } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Heart, TrendingUp, DollarSign, Star, Award, BarChart3, CheckCircle, Share2, Check } from 'lucide-react';
import { useFavorites } from '@/lib/contexts/favorites-context';

const CATEGORY_NAMES: Record<string, string> = {
  wireless_earbuds: '无线耳机',
  smart_plugs: '智能插座',
  fitness_trackers: '健身追踪器',
};

const CATEGORY_COLORS: Record<string, string> = {
  wireless_earbuds: 'bg-blue-100 text-blue-800',
  smart_plugs: 'bg-green-100 text-green-800',
  fitness_trackers: 'bg-purple-100 text-purple-800',
};

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 bg-green-50';
  if (score >= 60) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
}

function getSaturationColor(saturation: string): string {
  if (saturation === 'low') return 'text-green-600 bg-green-50';
  if (saturation === 'medium') return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
}

export default function CardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cardId = params.id as string;
  const { isFavorite, toggleFavorite } = useFavorites();

  const [card, setCard] = useState<CardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [localLikes, setLocalLikes] = useState(0);

  useEffect(() => {
    loadCard();
  }, [cardId]);

  const loadCard = async () => {
    try {
      setLoading(true);
      const response = await cardsApi.getCard(cardId);
      setCard(response.card);
      setLocalLikes(response.card.likes);
    } catch (error) {
      console.error('Failed to load card:', error);
      router.push('/cards');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!card || liking) return;

    try {
      setLiking(true);
      const response = await cardsApi.likeCard(card.id);
      setLocalLikes(response.likes);
      toggleFavorite(card.id);
    } catch (error) {
      console.error('Failed to like card:', error);
    } finally {
      setLiking(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Fallback copy failed:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-muted-foreground">卡片不存在</p>
          <Button onClick={() => router.push('/cards')} className="mt-4">
            返回列表
          </Button>
        </div>
      </div>
    );
  }

  const categoryName = CATEGORY_NAMES[card.category] || card.category;
  const categoryColor = CATEGORY_COLORS[card.category] || 'bg-gray-100 text-gray-800';
  const scoreColor = getScoreColor(card.content.summary.opportunity_score);
  const saturationColor = getSaturationColor(card.content.insights.market_saturation);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 返回按钮 */}
        <Button variant="ghost" onClick={() => router.push('/cards')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回列表
        </Button>

        {/* 卡片头部 */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge className={categoryColor}>
                    {categoryName}
                  </Badge>
                  {card.is_published && (
                    <Badge variant="outline" className="text-xs">
                      已发布
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {new Date(card.created_at).toLocaleDateString('zh-CN')}
                  </Badge>
                </div>
                <CardTitle className="text-2xl">{card.title}</CardTitle>
              </div>
              <div className={`px-4 py-2 rounded-full ${scoreColor}`}>
                <div className="text-center">
                  <div className="text-2xl font-bold">{card.content.summary.opportunity_score}</div>
                  <div className="text-xs">机会评分</div>
                </div>
              </div>
            </div>

            {/* 互动统计 */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  浏览 {card.views} 次
                </span>
                <button
                  onClick={handleLike}
                  disabled={liking}
                  className={`flex items-center gap-1 transition-colors ${
                    isFavorite(card.id) ? 'text-red-500 hover:text-red-600' : 'hover:text-red-500'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isFavorite(card.id) ? 'fill-current' : ''}`} />
                  {localLikes}
                </button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    已复制
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4" />
                    分享
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* 详细内容标签页 */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="market">市场数据</TabsTrigger>
            <TabsTrigger value="insights">洞察分析</TabsTrigger>
            <TabsTrigger value="products">热门产品</TabsTrigger>
          </TabsList>

          {/* 概览 */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">核心指标</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 价格甜蜜点 */}
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="font-medium">价格甜蜜点</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      ${card.content.summary.sweet_spot.min} - ${card.content.summary.sweet_spot.max}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      最佳价格: ${card.content.summary.sweet_spot.best}
                    </div>
                  </div>
                </div>

                {/* 市场规模 */}
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">市场规模</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {card.content.summary.market_size} 个产品
                  </div>
                </div>

                {/* 数据可靠性 */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">数据可靠性</span>
                    </div>
                    <span className="text-lg font-bold">
                      {Math.round(card.content.summary.reliability * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${card.content.summary.reliability * 100}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {card.content.data_sources.map((source, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {source}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* 市场饱和度 */}
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    <span className="font-medium">市场饱和度</span>
                  </div>
                  <div className={`px-3 py-1 rounded-full font-semibold ${saturationColor}`}>
                    {card.content.insights.market_saturation === 'low' ? '低' :
                     card.content.insights.market_saturation === 'medium' ? '中' : '高'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 市场数据 */}
          <TabsContent value="market" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* 价格分析 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    价格分析
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">最低价格</span>
                    <span className="font-semibold">${card.content.market_data.price.min}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">最高价格</span>
                    <span className="font-semibold">${card.content.market_data.price.max}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">平均价格</span>
                    <span className="font-semibold">${card.content.market_data.price.avg?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">样本数量</span>
                    <span className="font-semibold">{card.content.market_data.price.count} 个</span>
                  </div>
                </CardContent>
              </Card>

              {/* 评分分析 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-600" />
                    评分分析
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">最低评分</span>
                    <span className="font-semibold">{card.content.market_data.rating.min?.toFixed(1) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">最高评分</span>
                    <span className="font-semibold">{card.content.market_data.rating.max?.toFixed(1) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">平均评分</span>
                    <span className="font-semibold">{card.content.market_data.rating.avg?.toFixed(1) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">样本数量</span>
                    <span className="font-semibold">{card.content.market_data.rating.count} 个</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 洞察分析 */}
          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  推荐建议
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {card.content.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* 机会评分说明 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">机会评分说明</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>机会评分综合考虑以下因素：</p>
                <ul className="mt-2 space-y-1 ml-4">
                  <li>• 价格竞争度 (价格越低机会越大)</li>
                  <li>• 产品评分质量 (高评分产品多说明需求稳定)</li>
                  <li>• 品类特定调整 (不同品类有不同的市场特征)</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 热门产品 */}
          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">热门产品 Top {card.content.insights.top_products.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {card.content.insights.top_products.map((product, idx) => (
                    <div key={product.asin || idx} className="p-4 border rounded-lg hover:bg-muted transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                              idx === 0 ? 'bg-yellow-100 text-yellow-800' :
                              idx === 1 ? 'bg-gray-100 text-gray-800' :
                              idx === 2 ? 'bg-orange-100 text-orange-800' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              #{idx + 1}
                            </span>
                            <span className="font-semibold truncate">{product.title}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              ${product.price?.toFixed(2) || 'N/A'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {product.rating?.toFixed(1) || 'N/A'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Award className="h-3 w-3" />
                              {product.reviews_count?.toLocaleString() || 'N/A'} 评论
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
