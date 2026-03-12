'use client';

import { useEffect, useState } from 'react';
import { FunModules } from '@/components/home/fun-modules';
import { RegionNews } from '@/components/home/region-news';
import { ThemePortals } from '@/components/home/theme-portals';
import { Article } from '@/lib/api';

export function HomeContent() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [useProductData, setUseProductData] = useState(false);

  useEffect(() => {
    async function fetchContent() {
      let needFallback = true;

      // 首先尝试从爬虫 API 获取文章
      try {
        const response = await fetch('https://api.zenconsult.top/api/v1/crawler/articles?per_page=50');

        if (response.ok) {
          const data = await response.json();
          if (data.articles && data.articles.length > 0) {
            setArticles(data.articles);
            setUseProductData(false);
            needFallback = false;
          }
        } else {
          console.log('Crawler API returned', response.status, '- using fallback');
        }
      } catch (error) {
        console.log('Crawler API not available, falling back to product data:', error);
      }

      if (!needFallback) {
        setLoading(false);
        return;
      }

      // 降级方案：使用产品数据作为内容展示
      try {
        const productResponse = await fetch('https://api.zenconsult.top/api/v1/products/trending?category=electronics&limit=20');
        if (productResponse.ok) {
          const data = await productResponse.json();
          // 将产品数据转换为文章格式
          const mockArticles = data.products.map((product: any) => ({
            id: product.asin,
            title: product.title || `${product.brand} Product`,
            summary: `${product.brand || ''} - ${product.rating ? `Rating: ${product.rating}/5` : ''} - ${product.reviews_count || 0} reviews`,
            link: product.url,
            source: 'Amazon via Oxylabs',
            language: 'en',
            content_theme: 'products',
            region: 'north_america',
            country: 'us',
            platform: 'amazon',
            published_at: product.fetched_at,
            created_at: product.fetched_at,
            opportunity_score: 0.5
          }));
          setArticles(mockArticles);
          setUseProductData(true);
          console.log('Using product data as fallback, articles:', mockArticles.length);
        } else {
          console.error('Products API failed with status:', productResponse.status);
        }
      } catch (error) {
        console.error('Failed to fetch product data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

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
