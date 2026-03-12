'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { countriesByRegion } from '@/config/countries';
import type { CountryConfig } from '@/config/countries';

interface KeywordCloudProps {
  region: 'southeast_asia' | 'north_america' | 'latin_america';
}

// 平台关键词配置
const PLATFORMS_BY_REGION: Record<string, string[]> = {
  southeast_asia: ['Shopee', 'Lazada', 'TikTok Shop', 'Amazon'],
  north_america: ['Amazon', 'Shopify', 'eBay', 'Walmart'],
  latin_america: ['Mercado Libre', 'Amazon', 'Shopee', 'AliExpress'],
};

// 分类关键词
const CATEGORIES = [
  { label: '美妆', emoji: '💄' },
  { label: '电子', emoji: '📱' },
  { label: '家居', emoji: '🏠' },
  { label: '服饰', emoji: '👗' },
  { label: '食品', emoji: '🍜' },
  { label: '母婴', emoji: '👶' },
  { label: '运动', emoji: '⚽' },
  { label: '宠物', emoji: '🐕' },
];

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

// 信息源名称映射
const SOURCE_NAMES: Record<string, string> = {
  'retail_dive': 'Retail Dive',
  'tech_in_asia': 'Tech in Asia',
  'e27': 'e27',
  'cifnews': '雨果网',
  'techcrunch': 'TechCrunch',
  'digital_commerce_360': 'Digital Commerce 360',
  'ecommerce_bytes': 'EcommerceBytes',
  'pymnts': 'PYMNTS',
  'amazon_seller_news': 'Amazon Seller News',
  'ebay_seller_news': 'eBay Seller News',
  'paypal_blog': 'PayPal Blog',
  'stripe_blog': 'Stripe Blog',
  'emarketer': 'eMarketer',
  'ennews': '亿恩网',
  'mercopress': 'Mercopress',
};

export function KeywordCloud({ region }: KeywordCloudProps) {
  const countries = countriesByRegion[region] || [];
  const platforms = PLATFORMS_BY_REGION[region] || [];
  const colors = REGION_COLORS[region] || REGION_COLORS.southeast_asia;

  const [sourcesByCountry, setSourcesByCountry] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);

  // 获取每个国家的信息来源
  useEffect(() => {
    async function fetchSources() {
      try {
        const response = await fetch('https://api.zenconsult.top/api/v1/crawler/sources/by-country');
        if (response.ok) {
          const data = await response.json();
          // 提取每个国家的来源列表
          const sourcesMap: Record<string, string[]> = {};
          for (const [country, sources] of Object.entries(data.country_sources || {})) {
            sourcesMap[country] = Object.keys(sources as Record<string, unknown>).map((s) => SOURCE_NAMES[s] || s);
          }
          setSourcesByCountry(sourcesMap);
        }
      } catch (error) {
        console.error('Failed to fetch sources:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSources();
  }, []);

  return (
    <div className="space-y-4">
      {/* 国家标签 + 信息来源 */}
      <div>
        <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
          <span>🌍</span>
          <span>国家/地区</span>
        </div>
        <div className="space-y-2">
          {countries.map((country: CountryConfig) => {
            const sources = sourcesByCountry[country.slug] || [];
            return (
              <div
                key={country.slug}
                className={`
                  p-3 rounded-lg border
                  ${colors.bg} ${colors.border}
                `}
              >
                <Link
                  href={`/${country.slug}`}
                  className={`
                    text-sm font-medium ${colors.text} hover:underline
                    flex items-center gap-2 mb-1
                  `}
                >
                  <span>{country.flag}</span>
                  <span>{country.name}</span>
                  {sources.length > 0 && (
                    <span className="text-xs opacity-70">
                      ({sources.length} 个信息源)
                    </span>
                  )}
                </Link>
                {!loading && sources.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {sources.slice(0, 4).map((source) => (
                      <span
                        key={source}
                        className="text-xs bg-white/70 px-2 py-0.5 rounded text-gray-600"
                      >
                        {source}
                      </span>
                    ))}
                    {sources.length > 4 && (
                      <span className="text-xs text-gray-500 px-2 py-0.5">
                        +{sources.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 平台标签 */}
      <div>
        <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
          <span>🛒</span>
          <span>热门平台</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {platforms.map((platform) => (
            <button
              key={platform}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium border
                bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300
                transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5
              `}
              onClick={() => {
                window.location.href = `/search?q=${encodeURIComponent(platform)}`;
              }}
            >
              {platform}
            </button>
          ))}
        </div>
      </div>

      {/* 分类标签 */}
      <div>
        <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
          <span>📂</span>
          <span>品类</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium border
                bg-white text-gray-700 border-gray-200 hover:border-purple-200
                transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5
              `}
              onClick={() => {
                window.location.href = `/search?q=${encodeURIComponent(cat.label)}`;
              }}
            >
              <span className="mr-1">{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

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
