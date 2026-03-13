'use client';

import { InfoCard } from './card';
import { Card as CardType } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

interface CardsGridProps {
  cards: CardType[];
  loading?: boolean;
}

export function CardsGrid({ cards, loading = false }: CardsGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="border rounded-lg p-6 space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg mb-2">暂无信息卡片</p>
        <p className="text-muted-foreground text-sm">
          访问首页即时生成最新市场分析卡片
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <InfoCard key={card.id} card={card} />
      ))}
    </div>
  );
}
