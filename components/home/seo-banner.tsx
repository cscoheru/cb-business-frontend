'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

type BannerVariant = 'value-prop' | 'social-proof' | 'urgency';

interface BannerConfig {
  variant: BannerVariant;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  bgColor: string;
  icon: string;
}

const BANNERS: BannerConfig[] = [
  {
    variant: 'value-prop',
    title: 'AI驱动的跨境电商智能选品平台',
    description: '14天免费试用 • 无限商机查看 • 智能数据分析 • 市场趋势预测',
    ctaText: '立即体验',
    ctaLink: '/register',
    bgColor: 'bg-gradient-to-r from-blue-600 to-purple-600',
    icon: '🎯'
  },
  {
    variant: 'social-proof',
    title: '已为 1000+ 跨境卖家提供智能选品服务',
    description: '覆盖东南亚、欧美、拉美市场 • 实时数据分析 • AI机会评分',
    ctaText: '免费注册',
    ctaLink: '/register',
    bgColor: 'bg-gradient-to-r from-emerald-600 to-teal-600',
    icon: '📈'
  },
  {
    variant: 'urgency',
    title: '限时开放14天完整功能试用',
    description: '无需信用卡 • 无限访问所有商机 • 完整AI分析功能 • 随时取消',
    ctaText: '开始试用',
    ctaLink: '/register',
    bgColor: 'bg-gradient-to-r from-orange-500 to-red-500',
    icon: '⚡'
  }
];

export function SEOBanner() {
  const { user, isAuthenticated } = useAuth();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  // 每8秒轮播一次
  useEffect(() => {
    if (dismissed) return;

    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % BANNERS.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [dismissed]);

  // 从localStorage恢复dismissed状态
  useEffect(() => {
    const wasDismissed = localStorage.getItem('seo_banner_dismissed');
    if (wasDismissed) {
      setDismissed(true);
    }
  }, []);

  if (!isVisible || dismissed) return null;

  const banner = BANNERS[currentBanner];

  // 已登录用户显示试用提醒
  if (isAuthenticated && user) {
    const isTrial = user.plan_tier === 'trial';
    const isFree = user.plan_tier === 'free';

    if (isTrial && user.trial_ends_at) {
      const daysLeft = Math.ceil(
        (new Date(user.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      if (daysLeft > 0) {
        return (
          <div className="bg-blue-50 border-b border-blue-200">
            <div className="max-w-7xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⏰</span>
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      试用剩余 <span className="font-bold text-blue-600">{daysLeft}</span> 天
                    </p>
                    <p className="text-xs text-blue-700">
                      升级到Pro版，继续享受完整功能
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href="/pricing"
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    立即升级
                  </Link>
                  <button
                    onClick={() => setIsVisible(false)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    aria-label="关闭"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      }
    }

    if (isFree) {
      return (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💎</span>
                <div>
                  <p className="text-sm font-medium text-purple-900">
                    升级到Pro版，解锁完整功能
                  </p>
                  <p className="text-xs text-purple-700">
                    无限商机查看 • AI智能分析 • 数据采集验证
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/pricing"
                  className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                >
                  查看定价
                </Link>
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-purple-600 hover:text-purple-800 p-1"
                  aria-label="关闭"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  }

  // 未登录用户显示营销横幅
  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('seo_banner_dismissed', 'true');
    // 24小时后重新显示
    setTimeout(() => {
      localStorage.removeItem('seo_banner_dismissed');
      setDismissed(false);
      setIsVisible(true);
    }, 24 * 60 * 60 * 1000);
  };

  return (
    <div className={`${banner.bgColor} text-white`}>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{banner.icon}</span>
            <div>
              <h1 className="text-lg md:text-xl font-bold mb-1">
                {banner.title}
              </h1>
              <p className="text-sm text-blue-50">
                {banner.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href={banner.ctaLink}
              className="hidden sm:block px-6 py-2.5 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              {banner.ctaText}
            </Link>

            {/* 轮播指示器 */}
            <div className="flex gap-1.5">
              {BANNERS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentBanner(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentBanner ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`显示横幅 ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleDismiss}
              className="text-white/70 hover:text-white p-1 transition-colors"
              aria-label="关闭横幅"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
