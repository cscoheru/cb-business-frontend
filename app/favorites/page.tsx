'use client';

import { useFavorites } from '@/lib/contexts/favorites-context';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, LogIn } from 'lucide-react';
import Link from 'next/link';
import { InfoCard } from '@/components/cards/card';
import { OpportunityCard } from '@/components/opportunities/OpportunityCard';

export default function FavoritesPage() {
  const { favoriteItems, isLoading, error, favoriteCount } = useFavorites();
  const { isAuthenticated } = useAuth();

  // Separate cards and opportunities from favoriteItems
  // Filter out cards that don't have required data structure
  // Note: API returns content with summary fields directly (not nested under content.summary)
  const cards = favoriteItems
    .map(item => item.card)
    .filter((card): card is NonNullable<typeof card> => {
      // Basic validation: card must exist with id
      if (!card || !card.id) {
        return false;
      }
      // Accept if content exists (with either nested summary or direct fields)
      if (card.content) {
        return true;
      }
      return false;
    });

  const opportunities = favoriteItems
    .map(item => item.opportunity)
    .filter((opp): opp is NonNullable<typeof opp> => {
      if (!opp || !opp.id) {
        return false;
      }
      return true;
    });

  return (
    <div className="container mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回首页
          </Button>
        </Link>

        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-8 w-8 text-red-500 fill-current" />
            <h1 className="text-3xl font-bold">我的收藏</h1>
          </div>
          {/* Don't show count text - just show content */}
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">加载中...</p>
          </div>
        ) : (
          <>
            {/* 收藏内容网格 - Cards和Opportunities分别显示 */}
            {(cards.length > 0 || opportunities.length > 0) ? (
              <div className="grid lg:grid-cols-2 gap-8">
                {/* 卡片收藏 */}
                {cards.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <h2 className="text-xl font-bold">📦 卡片收藏</h2>
                      <span className="text-sm text-muted-foreground">
                        ({cards.length})
                      </span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      {cards.map((card) => (
                        <InfoCard key={card.id} card={card} />
                      ))}
                    </div>
                  </section>
                )}

                {/* 商机收藏 */}
                {opportunities.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <h2 className="text-xl font-bold">🎯 商机监控</h2>
                      <span className="text-sm text-muted-foreground">
                        ({opportunities.length})
                      </span>
                    </div>
                    <div className="space-y-4">
                      {opportunities.map((opp) => (
                        <OpportunityCard key={opp.id} opportunity={opp} />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            ) : (
              /* 空状态提示 */
              <div className="text-center py-16">
                <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">还没有收藏任何内容</h2>
                <p className="text-muted-foreground mb-6">
                  点击卡片上的心形图标，收藏感兴趣的市场分析
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Link href="/cards">
                    <Button>
                      浏览信息卡片
                    </Button>
                  </Link>
                  {!isAuthenticated && (
                    <Link href="/register">
                      <Button variant="outline">
                        <LogIn className="h-4 w-4 mr-2" />
                        注册账户
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }
