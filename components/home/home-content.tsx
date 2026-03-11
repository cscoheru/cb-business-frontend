'use client';

import { useEffect, useState } from 'react';
import { FunModules } from '@/components/home/fun-modules';
import { RegionNews } from '@/components/home/region-news';
import { ThemePortals } from '@/components/home/theme-portals';
import { articlesApi, Article } from '@/lib/api';

export function HomeContent() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const response = await articlesApi.getArticles({ per_page: 50 });
        setArticles(response.articles);
      } catch (error) {
        console.error('Failed to fetch articles:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, []);

  return (
    <>
      {/* 三大区域资讯流 */}
      <RegionNews initialArticles={articles} />

      {/* 有趣的功能模块 */}
      <FunModules />

      {/* 专业信息门户 */}
      <ThemePortals articles={articles} />
    </>
  );
}
