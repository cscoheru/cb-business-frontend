'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { countriesByRegion } from '@/config/countries';
import type { CountryConfig } from '@/config/countries';

interface KeywordCloudProps {
  region: 'southeast_asia' | 'north_america' | 'latin_america';
}

// 分类关键词（从 API 获取，这里作为 fallback）
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'electronics', name: '电子', emoji: '📱', count: 0 },
  { id: 'beauty', name: '美妆', emoji: '💄', count: 0 },
  { id: 'home', name: '家居', emoji: '🏠', count: 0 },
  { id: 'fashion', name: '服饰', emoji: '👗', count: 0 },
  { id: 'food', name: '食品', emoji: '🍜', count: 0 },
  { id: 'baby', name: '母婴', emoji: '👶', count: 0 },
  { id: 'sports', name: '运动', emoji: '⚽', count: 0 },
  { id: 'pets', name: '宠物', emoji: '🐕', count: 0 },
];

interface Category {
  id: string;
  name: string;
  emoji: string;
  count: number;
}

interface Platform {
  id: string;
  name: string;
  emoji: string;
  countries: string[];
}

// 区域颜色映射
const REGION_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  southeast_asia: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200 hover:border-green-300',
  },
  north_america: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200 hover:border-purple-300',
  },
  latin_america: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200 hover:border-orange-300',
  },
};

export function KeywordCloud({ region }: KeywordCloudProps) {
  const countries = countriesByRegion[region] || [];
  const colors = REGION_COLORS[region] || REGION_COLORS.southeast_asia;

  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);

  // 获取真实的关键词数据（从文章中提取）
  useEffect(() => {
    async function fetchKeywordData() {
      try {
        // 获取该区域的关键词分类统计
        const regionParam = region === 'southeast_asia' ? 'southeast_asia' :
                           region === 'north_america' ? 'north_america' :
                           region === 'latin_america' ? 'latin_america' : null;

        // 从 products API 获取真实分类数据
        const url = `https://api.zenconsult.top/api/v1/products/categories?region=${regionParam || ''}`;

        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          // 过滤出有数量的分类，并按区域排序
          const categoriesWithCount = (data.categories || [])
            .filter((cat: any) => cat.count > 0)
            .sort((a: any, b: any) => b.count - a.count)
            .slice(0, 8);  // 只显示前8个热门分类

          if (categoriesWithCount.length > 0) {
            setCategories(categoriesWithCount);
          } else {
            setCategories(DEFAULT_CATEGORIES);
          }
        } else {
          console.warn('Keywords API failed, using fallback');
          setCategories(DEFAULT_CATEGORIES);
        }

        // 平台数据 - 按区域配置
        const regionPlatforms: Record<string, Platform[]> = {
          southeast_asia: [
            { id: 'shopee', name: 'Shopee', emoji: '🛍️', countries: ['th', 'vn', 'my', 'sg', 'id', 'ph'] },
            { id: 'lazada', name: 'Lazada', emoji: '🛒', countries: ['th', 'vn', 'my', 'sg', 'id', 'ph'] },
            { id: 'tiktok', name: 'TikTok Shop', emoji: '🎵', countries: ['th', 'vn', 'my', 'sg', 'id', 'ph'] },
            { id: 'amazon', name: 'Amazon SG', emoji: '📦', countries: ['sg', 'my'] },
          ],
          north_america: [
            { id: 'amazon', name: 'Amazon', emoji: '🛒', countries: ['us', 'ca'] },
            { id: 'walmart', name: 'Walmart', emoji: '🏪', countries: ['us'] },
            { id: 'ebay', name: 'eBay', emoji: '📦', countries: ['us', 'ca'] },
            { id: 'tiktok', name: 'TikTok Shop', emoji: '🎵', countries: ['us'] },
          ],
          latin_america: [
            { id: 'mercadolibre', name: 'MercadoLibre', emoji: '🛒', countries: ['br', 'mx', 'co'] },
            { id: 'shopee', name: 'Shopee', emoji: '🛍️', countries: ['br'] },
            { id: 'amazon', name: 'Amazon', emoji: '📦', countries: ['br', 'mx'] },
            { id: 'magazineluiza', name: 'Magazine Luiza', emoji: '🏪', countries: ['br'] },
          ],
        };

        setPlatforms(regionPlatforms[region] || regionPlatforms.southeast_asia);
      } catch (error) {
        console.error('Failed to fetch keyword data:', error);
        setCategories(DEFAULT_CATEGORIES);
      } finally {
        setLoading(false);
      }
    }
    fetchKeywordData();
  }, [region]);

  return (
    <div className="space-y-4">
      {/* 国家标签 */}
      <div>
        <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
          <span>🌍</span>
          <span>国家/地区</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {countries.map((country: CountryConfig) => (
            <Link
              key={country.slug}
              href={`/${country.slug}`}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium border
                ${colors.bg} ${colors.text} ${colors.border}
                transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5
              `}
            >
              <span className="mr-1">{country.flag}</span>
              <span>{country.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 平台标签 - 从 API 获取 */}
      {platforms.length > 0 && (
        <div>
          <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
            <span>🛒</span>
            <span>热门平台</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium border
                  bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300
                  transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5
                `}
                onClick={() => {
                  window.location.href = `/search?q=${encodeURIComponent(platform.name)}`;
                }}
              >
                <span className="mr-1">{platform.emoji}</span>
                <span>{platform.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 分类标签 - 从 API 获取 */}
      {!loading && categories.length > 0 && (
        <div>
          <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
            <span>📂</span>
            <span>热门品类</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium border
                  bg-white text-gray-700 border-gray-200 hover:border-purple-200
                  transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5
                  relative
                `}
                onClick={() => {
                  window.location.href = `/products?category=${encodeURIComponent(cat.id)}`;
                }}
              >
                <span className="mr-1">{cat.emoji}</span>
                <span>{cat.name}</span>
                {cat.count > 0 && (
                  <span className="ml-1 text-xs text-gray-400">
                    ({cat.count})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 更多探索链接 */}
      <div className="pt-2 border-t border-gray-100">
        <Link
          href={`/${countries[0]?.slug || 'th'}`}
          className={`
            text-sm font-medium flex items-center gap-1
            ${colors.text} hover:underline
          `}
        >
          <span>探索更多</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
