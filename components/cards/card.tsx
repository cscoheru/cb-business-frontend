'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Card as CardType, opportunitiesApi } from '@/lib/api';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Heart, TrendingUp, DollarSign, Star, Target } from 'lucide-react';
import { useFavorites } from '@/lib/contexts/favorites-context';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/toast';

// LocalStorage key for tracking followed cards (anonymous users)
const LOCAL_FOLLOWED_KEY = 'zen_followed_cards';
const ANONYMOUS_FOLLOW_LIMIT = 3;

/**
 * Load followed cards from localStorage
 */
function loadFollowedCards(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const stored = localStorage.getItem(LOCAL_FOLLOWED_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

/**
 * Save followed cards to localStorage
 */
function saveFollowedCards(cards: Set<string>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_FOLLOWED_KEY, JSON.stringify([...cards]));
  } catch {
    // Ignore errors
  }
}

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
  const toast = useToast();
  const [liking, setLiking] = useState(false);
  const [following, setFollowing] = useState(false);
  const [localLikes, setLocalLikes] = useState(card.likes);
  const [followedCards, setFollowedCards] = useState<Set<string>>(loadFollowedCards);
  const favorite = isFavorite(card.id);
  const followed = followedCards.has(card.id);

  // Safety checks for nested properties
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const summary: any = card.content?.summary || card.content || {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const marketData: any = card.content?.market_data || {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insights: any = card.content?.insights || {};
  const opportunityScore = summary?.opportunity_score ?? 0;

  const categoryName = CATEGORY_NAMES[card.category] || card.category;
  const categoryColor = CATEGORY_COLORS[card.category] || 'bg-gray-100 text-gray-800';
  const scoreColor = getScoreColor(opportunityScore);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (liking) return;

    setLiking(true);

    try {
      // Toggle favorite (now supports anonymous users)
      await toggleFavorite(card.id);

      // Only like the card if authenticated (increments like count)
      if (isAuthenticated) {
        // Import cardsApi dynamically to avoid circular dependencies
        const { cardsApi } = await import('@/lib/api');
        await cardsApi.likeCard(card.id);
        setLocalLikes((prev) => prev + 1);
      }
    } catch (error: any) {
      console.error('Failed to like card:', error);
    } finally {
      setLiking(false);
    }
  };

  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (following) return;

    setFollowing(true);

    try {
      if (followed) {
        // Unfollow - just remove from local tracking
        const newSet = new Set(followedCards);
        newSet.delete(card.id);
        setFollowedCards(newSet);
        saveFollowedCards(newSet);
        toast.showSuccess('已取消关注');
      } else {
        // Check limit for anonymous users
        if (!isAuthenticated && followedCards.size >= ANONYMOUS_FOLLOW_LIMIT) {
          toast.showError(
            `匿名用户最多只能关注${ANONYMOUS_FOLLOW_LIMIT}个商机`,
            '请注册账户以获得更多关注额度'
          );
          setFollowing(false);
          return;
        }

        // Follow - call API to create opportunity
        const result = await opportunitiesApi.createFromCard(card.id);

        if (result.success && result.opportunity) {
          // Update local tracking
          const newSet = new Set(followedCards);
          newSet.add(card.id);
          setFollowedCards(newSet);
          saveFollowedCards(newSet);

          toast.showSuccess(
            '🎯 已关注为商机',
            'AI将持续监控市场变化'
          );
        } else if (result.limit_reached) {
          toast.showError(
            `匿名用户最多只能关注${ANONYMOUS_FOLLOW_LIMIT}个商机`,
            '请注册账户以获得更多关注额度'
          );
        }
      }
    } catch (error: any) {
      console.error('Failed to follow/unfollow:', error);
      toast.showError('操作失败', error.message || '请稍后再试');
    } finally {
      setFollowing(false);
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
            {opportunityScore}分
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 价格区间 */}
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="text-muted-foreground">价格甜蜜点:</span>
          <span className="font-semibold">
            ${summary?.sweet_spot?.min ?? 0} - ${summary?.sweet_spot?.max ?? 0}
          </span>
          <span className="text-xs text-muted-foreground">
            (最佳: ${summary?.sweet_spot?.best ?? 0})
          </span>
        </div>

        {/* 市场规模 */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="text-muted-foreground">市场产品数:</span>
            <span className="font-semibold">{summary?.market_size ?? 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-600" />
            <span className="text-muted-foreground">平均评分:</span>
            <span className="font-semibold">
              {marketData?.rating?.avg?.toFixed(1) || 'N/A'}
            </span>
          </div>
        </div>

        {/* 数据可靠性 */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">数据可靠性:</span>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${(summary?.reliability ?? 0) * 100}%` }}
            />
          </div>
          <span className="font-semibold text-xs">
            {Math.round((summary?.reliability ?? 0) * 100)}%
          </span>
        </div>

        {/* 竞争饱和度 */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">市场饱和度:</span>
          <span className={`font-semibold ${getSaturationColor(insights?.market_saturation ?? 'medium')}`}>
            {insights?.market_saturation === 'low' ? '低' :
             insights?.market_saturation === 'medium' ? '中' : '高'}
          </span>
        </div>

        {/* 推荐建议预览 */}
        {card.content?.recommendations && card.content.recommendations.length > 0 && (
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
        {card.content?.data_sources && card.content.data_sources.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {card.content.data_sources.map((source, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {source}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {card.views}
          </span>

          {/* Favorite button - simple bookmarking */}
          <button
            onClick={handleLike}
            disabled={liking}
            title={favorite ? "已收藏" : "收藏此卡片"}
            className={`relative group flex items-center gap-1 transition-all duration-300 ${
              favorite
                ? 'text-red-500 hover:text-red-600'
                : 'text-gray-400 hover:text-red-500 hover:scale-110'
            }`}
          >
            <Heart className={`h-4 w-4 ${favorite ? 'fill-current' : ''}`} />
            <span className="text-xs">{localLikes}</span>
          </button>

          {/* Follow as Opportunity button */}
          <button
            onClick={handleFollow}
            disabled={following}
            title={followed ? "取消商机跟踪" : "关注为商机 - AI将持续监控市场变化"}
            className={`relative group flex items-center gap-1 transition-all duration-300 ${
              followed
                ? 'text-orange-500 hover:text-orange-600'
                : 'text-gray-400 hover:text-orange-500 hover:scale-110'
            }`}
          >
            <Target className={`h-4 w-4 ${followed ? 'fill-current' : ''}`} />
            <span className="text-xs">{followed ? '跟踪中' : '关注'}</span>
          </button>

          <span className="text-xs">
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
