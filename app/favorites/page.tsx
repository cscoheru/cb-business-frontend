'use client';

import { useFavorites } from '@/lib/contexts/favorites-context';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart } from 'lucide-react';
import Link from 'next/link';
import { InfoCard } from '@/components/cards/card';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function FavoritesPage() {
  const { favoriteItems, isLoading, error, favoriteCount } = useFavorites();
  const { isAuthenticated } = useAuth();

  // Extract cards from favoriteItems (filter out undefined and opportunity-only items)
  const cards = favoriteItems
    .map(item => item.card)
    .filter((card): card is NonNullable<typeof card> => card !== undefined);

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <Link href="/cards">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回信息卡片
          </Button>
        </Link>

        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-8 w-8 text-red-500 fill-current" />
            <h1 className="text-3xl font-bold">我的收藏</h1>
          </div>
          <p className="text-muted-foreground">
            {favoriteCount > 0
              ? `您已收藏 ${favoriteCount} 张信息卡片`
              : '还没有收藏任何信息卡片'}
          </p>
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>

        {/* 收藏的卡片 */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">加载中...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <InfoCard key={card.id} card={card} />
            ))}
          </div>
        )}

        {/* 空状态提示 */}
        {!isLoading && cards.length === 0 && (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">还没有收藏任何卡片</h2>
            <p className="text-muted-foreground mb-6">
              点击卡片上的心形图标，收藏感兴趣的市场分析
            </p>
            <Link href="/cards">
              <Button>
                浏览信息卡片
              </Button>
            </Link>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
