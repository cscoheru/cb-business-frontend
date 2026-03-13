'use client';

import { useEffect, useState } from 'react';
import { CardsGrid } from '@/components/cards/grid';
import { cardsApi, Card } from '@/lib/api';
import { useFavorites } from '@/lib/contexts/favorites-context';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart } from 'lucide-react';
import Link from 'next/link';

export default function FavoritesPage() {
  const { favorites, favoriteCount } = useFavorites();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavoriteCards();
  }, [favorites]);

  const loadFavoriteCards = async () => {
    if (favorites.size === 0) {
      setCards([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Fetch all favorite cards in parallel
      const cardPromises = Array.from(favorites).map((id) =>
        cardsApi.getCard(id).catch(() => null)
      );
      const results = await Promise.all(cardPromises);
      const validCards = results
        .filter((r) => r !== null)
        .map((r) => r!.card)
        .sort((a, b) => {
          // Sort by favorite order (most recently clicked first)
          const favArray = Array.from(favorites);
          return favArray.indexOf(a.id) - favArray.indexOf(b.id);
        });

      setCards(validCards);
    } catch (error) {
      console.error('Failed to load favorite cards:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
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
      </div>

      {/* 收藏的卡片 */}
      <CardsGrid cards={cards} loading={loading && favoriteCount > 0} />

      {/* 空状态提示 */}
      {!loading && cards.length === 0 && (
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
  );
}
