'use client';

import { useEffect, useState, useCallback } from 'react';
import { articlesApi, Article } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Link from 'next/link';

const REGIONS = [
  { key: 'southeast_asia', name: '东南亚', emoji: '🌏' },
  { key: 'north_america', name: '欧美', emoji: '🇺🇸' },
  { key: 'latin_america', name: '拉美', emoji: '🇧🇷' },
] as const;

const THEMES = [
  { key: 'policy', label: '政策', emoji: '📜', color: 'border-l-yellow-400' },
  { key: 'risk', label: '风险', emoji: '⚠️', color: 'border-l-red-400' },
  { key: 'guide', label: '指南', emoji: '📊', color: 'border-l-blue-400' },
  { key: 'platform', label: '平台', emoji: '🛒', color: 'border-l-purple-400' },
  { key: 'logistics', label: '物流', emoji: '🚚', color: 'border-l-orange-400' },
  { key: 'opportunity', label: '机会', emoji: '💡', color: 'border-l-green-400' },
] as const;

interface RegionArticles {
  loading: boolean;
  articles: Article[];
}

function formatTime(dateString: string | null) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const hours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (hours < 1) return '刚刚';
  if (hours < 24) return `${hours}h前`;
  if (days < 7) return `${days}天前`;
  return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
}

export function ProfessionalInfoSection() {
  const [activeRegion, setActiveRegion] = useState(REGIONS[0].key);
  const [regionData, setRegionData] = useState<Record<string, RegionArticles>>({
    southeast_asia: { loading: true, articles: [] },
    north_america: { loading: true, articles: [] },
    latin_america: { loading: true, articles: [] },
  });
  const [initialized, setInitialized] = useState(false);

  const fetchRegionArticles = useCallback(async (regionKey: string) => {
    setRegionData(prev => ({ ...prev, [regionKey]: { loading: true, articles: [] } }));
    try {
      const response = await articlesApi.getArticles({ region: regionKey, per_page: 30 });
      setRegionData(prev => ({ ...prev, [regionKey]: { loading: false, articles: response.articles } }));
    } catch {
      setRegionData(prev => ({ ...prev, [regionKey]: { loading: false, articles: [] } }));
    }
  }, []);

  // Initial load: fetch all regions in parallel
  useEffect(() => {
    REGIONS.forEach(r => fetchRegionArticles(r.key));
    setInitialized(true);
  }, [fetchRegionArticles]);

  const currentArticles = regionData[activeRegion]?.articles || [];
  const currentLoading = regionData[activeRegion]?.loading ?? true;

  // Group articles by theme
  const byTheme: Record<string, Article[]> = {};
  currentArticles.forEach(a => {
    const theme = a.content_theme || 'other';
    if (!byTheme[theme]) byTheme[theme] = [];
    byTheme[theme].push(a);
  });

  const totalArticles = Object.values(regionData).reduce((sum, d) => sum + d.articles.length, 0);

  if (!initialized) {
    return (
      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-4">专业信息</h2>
        <Card className="p-6 text-center text-muted-foreground">
          <div className="animate-pulse">加载中...</div>
        </Card>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">专业信息</h2>
        <span className="text-sm text-gray-500">
          基于区域市场的政策、风险与实操资讯
        </span>
      </div>

      {totalArticles === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          <div className="text-3xl mb-2 opacity-50">📰</div>
          <p>暂无市场资讯</p>
          <p className="text-sm mt-1">资讯正在采集中，请稍后再来查看</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          {/* Region tabs */}
          <Tabs value={activeRegion} onValueChange={setActiveRegion}>
            <div className="border-b bg-gray-50/50">
              <TabsList variant="line" className="w-full justify-start bg-transparent">
                {REGIONS.map(r => {
                  const count = regionData[r.key]?.articles.length || 0;
                  return (
                    <TabsTrigger key={r.key} value={r.key} className="px-5 py-3">
                      <span className="mr-1.5">{r.emoji}</span>
                      {r.name}
                      {count > 0 && (
                        <span className="ml-1.5 text-xs bg-white text-gray-500 px-1.5 py-0.5 rounded-full border border-gray-200">
                          {count}
                        </span>
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {REGIONS.map(region => (
              <TabsContent key={region.key} value={region.key} className="mt-0 p-4">
                {currentLoading ? (
                  <div className="py-8 text-center text-gray-400">
                    <div className="animate-pulse">加载{region.name}资讯...</div>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {THEMES.map(theme => {
                      const themeArticles = byTheme[theme.key] || [];
                      if (themeArticles.length === 0) return null;

                      return (
                        <div key={theme.key} className={`p-3 rounded-lg border-l-4 bg-gray-50/50 ${theme.color}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span>{theme.emoji}</span>
                            <span className="font-semibold text-sm text-gray-900">{theme.label}</span>
                            <span className="text-xs text-gray-400">({themeArticles.length})</span>
                          </div>
                          <div className="space-y-1.5">
                            {themeArticles.slice(0, 4).map(article => (
                              <Link
                                key={article.id}
                                href={`/articles/${article.id}`}
                                className="flex items-start gap-2 group"
                              >
                                <span className="text-xs text-gray-400 mt-0.5 whitespace-nowrap shrink-0">
                                  {formatTime(article.published_at)}
                                </span>
                                <span className="text-sm text-gray-700 group-hover:text-blue-600 line-clamp-1 transition-colors">
                                  {article.title}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </Card>
      )}
    </section>
  );
}
