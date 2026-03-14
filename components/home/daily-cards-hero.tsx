'use client';

import { useEffect, useState } from 'react';
import { cardsApi, Card } from '@/lib/api';
import { InfoCard } from '@/components/cards/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, TrendingUp, Sparkles } from 'lucide-react';
import { useFavorites } from '@/lib/contexts/favorites-context';

export function DailyCardsHero() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [cacheInfo, setCacheInfo] = useState<any>(null);
  const { favoriteCount } = useFavorites();

  useEffect(() => {
    loadDailyCards();
  }, []);

  const loadDailyCards = async () => {
    try {
      const response = await cardsApi.getDailyCards();
      setCards(response.cards);
      setCacheInfo(response.cache_info || null);
    } catch (error) {
      console.error('Failed to load daily cards:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 border-b">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* 标题区域 */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {cacheInfo?.mode === '实时生成' ? '🔥 实时生成' : '💾 缓存模式'} · 30分钟智能缓存
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            今日商机洞察
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            AI分析Amazon真实数据，发现高潜力市场机会。
            <span className="font-semibold text-gray-900">收藏感兴趣的商机</span>，
            我们会持续跟踪价格、评分和竞争变化。
          </p>
          {cacheInfo?.generated_at && (
            <p className="text-sm text-gray-500 mt-2">
              数据更新于: {new Date(cacheInfo.generated_at).toLocaleString('zh-CN')}
            </p>
          )}
        </div>

        {/* 今日卡片 */}
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg p-6 border border-gray-200">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-20 w-full mb-4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : cards.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {cards.map((card) => (
              <div key={card.id} className="transform transition-all hover:scale-[1.02]">
                <InfoCard card={card} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200 mb-8">
            <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">今日卡片生成中...</p>
            <p className="text-sm text-gray-500 mb-4">
              系统即时生成最新市场分析卡片（30分钟智能缓存）
            </p>
            <Link href="/cards">
              <Button variant="outline">
                查看历史卡片
              </Button>
            </Link>
          </div>
        )}

        {/* 数据来源说明 */}
        <div className="bg-white/60 backdrop-blur rounded-lg p-6 border border-gray-200">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>数据来源: Oxylabs Amazon API</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>可靠性: 95%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span>更新频率: 每日 8:00 AM</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <Link href="/cards">
            <Button variant="outline" className="gap-2">
              查看所有卡片
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          {favoriteCount > 0 && (
            <Link href="/favorites">
              <Button className="gap-2">
                我的收藏 ({favoriteCount})
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
