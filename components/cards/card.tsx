'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card as CardType } from '@/lib/api';
import { cardsApi } from '@/lib/api';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Heart, TrendingUp, DollarSign, Star } from 'lucide-react';
import { useFavorites } from '@/lib/contexts/favorites-context';
import { useAuth } from '@/lib/auth-context';

interface InfoCardProps {
  card: CardType;
}

const CATEGORY_NAMES: Record<string, string> = {
  wireless_earbuds: '无线耳机',
  smart_plugs: '智能插座',
  fitness_trackers: '健身追踪器',
  phone_chargers: '手机充电器',
  desk_lamps: 'LED台灯',
  phone_cases: '手机壳',
  yoga_mats: '瑜伽垫',
  coffee_makers: '咖啡机',
  bluetooth_speakers: '蓝牙音箱',
  webcams: '网络摄像头',
  keyboards: '机械键盘',
  mouse: '无线鼠标',
};

const CATEGORY_COLORS: Record<string, string> = {
  wireless_earbuds: 'bg-blue-100 text-blue-800',
  smart_plugs: 'bg-green-100 text-green-800',
  fitness_trackers: 'bg-purple-100 text-purple-800',
  phone_chargers: 'bg-orange-100 text-orange-800',
  desk_lamps: 'bg-yellow-100 text-yellow-800',
  phone_cases: 'bg-pink-100 text-pink-800',
  yoga_mats: 'bg-teal-100 text-teal-800',
  coffee_makers: 'bg-amber-100 text-amber-800',
  bluetooth_speakers: 'bg-indigo-100 text-indigo-800',
  webcams: 'bg-cyan-100 text-cyan-800',
  keyboards: 'bg-red-100 text-red-800',
  mouse: 'bg-lime-100 text-lime-800',
};

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 bg-green-50';
  if (score >= 60) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
}

function getSaturationColor(saturation: string): string {
  if (saturation === 'low') return 'text-green-600';
  if (saturation === 'medium') return 'text-yellow-600';
  return 'text-red-600';
}

export function InfoCard({ card }: InfoCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [liking, setLiking] = useState(false);
  const [localLikes, setLocalLikes] = useState(card.likes);
  const favorite = isFavorite(card.id);

  const categoryName = CATEGORY_NAMES[card.category] || card.category;
  const categoryColor = CATEGORY_COLORS[card.category] || 'bg-gray-100 text-gray-800';
  const scoreColor = getScoreColor(card.content.summary.opportunity_score);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (liking) return;

    // Check if user is authenticated before allowing favorites
    if (!isAuthenticated) {
      // Redirect to login with return URL
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setLiking(true);

    try {
      // First, like the card (public API, no auth required)
      await cardsApi.likeCard(card.id);
      setLocalLikes((prev) => prev + 1);

      // Then, add to favorites (requires auth)
      await toggleFavorite(card.id);
    } catch (error: any) {
      console.error('Failed to like card:', error);

      // If it's an auth error, redirect to login
      if (error?.message === '请先登录后再收藏') {
        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      }
    } finally {
      setLiking(false);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={categoryColor}>
                {categoryName}
              </Badge>
              {card.is_published && (
                <Badge variant="outline" className="text-xs">
                  已发布
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-semibold line-clamp-2">{card.title}</h3>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-bold ${scoreColor}`}>
            {card.content.summary.opportunity_score}分
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 价格区间 */}
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="text-muted-foreground">价格甜蜜点:</span>
          <span className="font-semibold">
            ${card.content.summary.sweet_spot.min} - ${card.content.summary.sweet_spot.max}
          </span>
          <span className="text-xs text-muted-foreground">
            (最佳: ${card.content.summary.sweet_spot.best})
          </span>
        </div>

        {/* 市场规模 */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="text-muted-foreground">市场产品数:</span>
            <span className="font-semibold">{card.content.summary.market_size}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-600" />
            <span className="text-muted-foreground">平均评分:</span>
            <span className="font-semibold">
              {card.content.market_data.rating.avg?.toFixed(1) || 'N/A'}
            </span>
          </div>
        </div>

        {/* 数据可靠性 */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">数据可靠性:</span>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${card.content.summary.reliability * 100}%` }}
            />
          </div>
          <span className="font-semibold text-xs">
            {Math.round(card.content.summary.reliability * 100)}%
          </span>
        </div>

        {/* 竞争饱和度 */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">市场饱和度:</span>
          <span className={`font-semibold ${getSaturationColor(card.content.insights.market_saturation)}`}>
            {card.content.insights.market_saturation === 'low' ? '低' :
             card.content.insights.market_saturation === 'medium' ? '中' : '高'}
          </span>
        </div>

        {/* 推荐建议预览 */}
        {card.content.recommendations && card.content.recommendations.length > 0 && (
          <div className="border-t pt-3">
            <p className="text-xs text-muted-foreground mb-2">推荐建议:</p>
            <ul className="text-sm space-y-1">
              {card.content.recommendations.slice(0, 2).map((rec, idx) => (
                <li key={idx} className="text-gray-700 line-clamp-1">• {rec}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 数据来源 */}
        <div className="flex flex-wrap gap-1">
          {card.content.data_sources.map((source, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {source}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {card.views}
          </span>
          <button
            onClick={handleLike}
            disabled={liking}
            className={`flex items-center gap-1 transition-colors ${
              favorite ? 'text-red-500 hover:text-red-600' : 'hover:text-red-500'
            }`}
          >
            <Heart className={`h-3 w-3 ${favorite ? 'fill-current' : ''}`} />
            {localLikes}
          </button>
          <span>
            {new Date(card.created_at).toLocaleDateString('zh-CN')}
          </span>
        </div>
        <Link href={`/cards/${card.id}`}>
          <Button size="sm" variant="ghost">
            查看详情 →
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
