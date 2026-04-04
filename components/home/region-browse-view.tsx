'use client';

import { useEffect, useState } from 'react';
import { cardsApi, Card } from '@/lib/api';
import { countriesByRegion, getCountryByCode } from '@/config/countries';
import Link from 'next/link';

// Region configuration with country codes from backend
const REGIONS = [
  {
    key: 'southeast_asia',
    name: '东南亚',
    emoji: '🌏',
    gradient: 'from-purple-500 to-pink-500',
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-700',
    countryCodes: ['TH', 'VN', 'MY', 'SG', 'PH', 'ID'],
  },
  {
    key: 'north_america',
    name: '欧美',
    emoji: '🇺🇸',
    gradient: 'from-blue-500 to-indigo-500',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-700',
    countryCodes: ['US', 'CA'],
  },
  {
    key: 'latin_america',
    name: '拉美',
    emoji: '🇧🇷',
    gradient: 'from-green-500 to-teal-500',
    bgLight: 'bg-green-50',
    textColor: 'text-green-700',
    countryCodes: ['BR', 'MX', 'CO'],
  },
] as const;

// Category name mapping (Chinese)
const CATEGORY_NAMES: Record<string, string> = {
  wireless_earbuds: '无线耳机', smart_plugs: '智能插座', fitness_trackers: '健身追踪器',
  phone_chargers: '手机充电器', desk_lamps: 'LED台灯', phone_cases: '手机壳',
  yoga_mats: '瑜伽垫', coffee_makers: '咖啡机', bluetooth_speakers: '蓝牙音箱',
  webcams: '网络摄像头', keyboards: '机械键盘', mouse: '无线鼠标',
  mechanical_keyboards: '机械键盘', portable_power_banks: '充电宝',
  robot_vacuums: '扫地机器人', air_purifiers: '空气净化器',
  smart_kitchen_scales: '智能厨房秤', essential_oil_diffusers: '香薰机', portable_fans: '便携风扇',
  led_face_masks: 'LED面膜仪', hair_curlers: '卷发棒', facial_cleansing_devices: '洁面仪',
  nail_lamps: '美甲灯', makeup_brush_sets: '化妆刷套装', scalp_massagers: '头皮按摩器',
  camping_lanterns: '露营灯', portable_blenders: '便携搅拌机', folding_chairs: '折叠椅', dry_bags: '防水袋',
  pet_water_fountains: '宠物饮水机', automatic_pet_feeders: '自动喂食器',
  pet_grooming_brushes: '宠物梳毛器', cat_litter_boxes: '猫砂盆', pet_carriers: '宠物包', pet_toy_sets: '宠物玩具套装',
  baby_bottle_warmers: '奶瓶消毒器', baby_monitors: '婴儿监视器', baby_carriers: '婴儿背带',
  diaper_bags: '妈咪包', baby_teethers: '婴儿牙胶', portable_baby_chairs: '便携餐椅',
  car_phone_mounts: '车载手机支架', car_vacuum_cleaners: '车载吸尘器', dash_cams: '行车记录仪',
  car_air_fresheners: '车载香薰', car_chargers: '车载充电器', car_organizers: '车载收纳', jump_starters: '应急启动电源',
};

interface CountryCards {
  code: string;
  name: string;
  flag: string;
  slug: string;
  cards: Card[];
}

interface RegionGroup {
  region: typeof REGIONS[number];
  countries: CountryCards[];
  totalCards: number;
}

function MiniCard({ card }: { card: Card }) {
  const score = card.content?.summary?.opportunity_score;
  const sweetSpot = card.content?.summary?.sweet_spot;
  const categoryName = CATEGORY_NAMES[card.category] || card.category;

  const scoreColor = score >= 80 ? 'text-green-600 bg-green-50' :
                     score >= 60 ? 'text-yellow-600 bg-yellow-50' :
                     'text-red-600 bg-red-50';

  return (
    <Link href={`/cards?id=${card.id}`} className="block">
      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">{categoryName}</div>
          <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
            {card.title?.replace(/市场洞察.*/, '').trim() || card.category}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${scoreColor}`}>
            {score || 0}分
          </div>
          {sweetSpot && (
            <div className="text-xs text-gray-400 mt-1">
              ${sweetSpot.min}-${sweetSpot.max}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export function RegionBrowseView() {
  const [groups, setGroups] = useState<RegionGroup[]>([]);
  const [expandedRegion, setExpandedRegion] = useState<string | null>('southeast_asia');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await cardsApi.getCardsByRegion({ limit: 20 });
        const grouped = response.grouped_by_country;

        // Build region groups
        const regionGroups: RegionGroup[] = REGIONS.map(region => {
          const countries: CountryCards[] = [];

          for (const code of region.countryCodes) {
            const countryConfig = getCountryByCode(code);
            const cards = (grouped[code] || []).map(c => {
              // Ensure target_countries is set for proper display
              if (!c.target_countries) c.target_countries = [];
              return c;
            });

            if (countryConfig) {
              countries.push({
                code,
                name: countryConfig.name,
                flag: countryConfig.flag,
                slug: countryConfig.slug,
                cards,
              });
            }
          }

          return {
            region,
            countries: countries.filter(c => c.cards.length > 0),
            totalCards: countries.reduce((sum, c) => sum + c.cards.length, 0),
          };
        });

        setGroups(regionGroups);
      } catch (error) {
        console.error('Failed to fetch region cards:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center text-gray-400">
        <div className="animate-pulse text-lg">加载区域数据...</div>
      </div>
    );
  }

  const totalAll = groups.reduce((sum, g) => sum + g.totalCards, 0);

  return (
    <div className="py-6">
      {/* Summary bar */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="text-sm text-gray-500">
          共 <span className="font-semibold text-gray-900">{totalAll}</span> 个商机覆盖{' '}
          <span className="font-semibold text-gray-900">{groups.filter(g => g.totalCards > 0).length}</span> 个区域
        </div>
      </div>

      {/* Region accordions */}
      <div className="space-y-3">
        {groups.map(({ region, countries, totalCards }) => (
          <div key={region.key} className="border rounded-xl overflow-hidden bg-white">
            {/* Region header */}
            <button
              onClick={() => setExpandedRegion(expandedRegion === region.key ? null : region.key)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{region.emoji}</span>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">{region.name}</div>
                  <div className="text-xs text-gray-500">
                    {countries.map(c => c.name).join('、') || '暂无数据'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${region.bgLight} ${region.textColor}`}>
                  {totalCards} 个商机
                </span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${expandedRegion === region.key ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Expanded content */}
            {expandedRegion === region.key && (
              <div className="border-t border-gray-100">
                {countries.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 text-sm">
                    该区域暂无商机数据
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {countries.map(country => (
                      <div key={country.code} className="px-5 py-4">
                        {/* Country header */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg">{country.flag}</span>
                          <span className="font-medium text-gray-900">{country.name}</span>
                          <span className="text-xs text-gray-400">({country.cards.length})</span>
                          <Link
                            href={`/${country.slug}`}
                            className="ml-auto text-xs text-blue-500 hover:text-blue-700"
                          >
                            查看市场详情 →
                          </Link>
                        </div>

                        {/* Mini cards grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {country.cards.slice(0, 6).map(card => (
                            <MiniCard key={card.id} card={card} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
