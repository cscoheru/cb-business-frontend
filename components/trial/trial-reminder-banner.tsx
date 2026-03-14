'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

type UrgencyLevel = 'normal' | 'warning' | 'critical' | 'expired';

interface TrialReminderProps {
  /**
   * 是否在导航栏下方显示（紧凑模式）
   */
  compact?: boolean;
  /**
   * 是否允许关闭
   */
  dismissible?: boolean;
}

export function TrialReminderBanner({ compact = false, dismissible = true }: TrialReminderProps) {
  const { user, isAuthenticated } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [urgency, setUrgency] = useState<UrgencyLevel>('normal');

  useEffect(() => {
    // 检查localStorage中是否已关闭
    if (dismissible) {
      const dismissed = localStorage.getItem('trial_reminder_dismissed');
      if (dismissed) {
        const dismissedTime = parseInt(dismissed);
        const now = Date.now();
        // 如果关闭时间超过1小时，重新显示
        if (now - dismissedTime < 60 * 60 * 1000) {
          setIsVisible(false);
        } else {
          localStorage.removeItem('trial_reminder_dismissed');
        }
      }
    }
  }, [dismissible]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const isTrial = user.plan_tier === 'trial';
    if (!isTrial) {
      setIsVisible(false);
      return;
    }

    if (!user.trial_ends_at) {
      setIsVisible(false);
      return;
    }

    const trialEnd = new Date(user.trial_ends_at).getTime();
    const now = Date.now();
    const diff = trialEnd - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    setDaysLeft(days);

    // 确定紧急程度
    if (days <= 0) {
      setUrgency('expired');
    } else if (days <= 2) {
      setUrgency('critical');
    } else if (days <= 5) {
      setUrgency('warning');
    } else {
      setUrgency('normal');
    }
  }, [user, isAuthenticated]);

  const handleDismiss = () => {
    if (!dismissible) return;
    setIsVisible(false);
    localStorage.setItem('trial_reminder_dismissed', Date.now().toString());
  };

  // 不显示的条件
  if (!isVisible || !isAuthenticated || !user || user.plan_tier !== 'trial' || daysLeft === null) {
    return null;
  }

  // 根据紧急程度选择样式
  const getBannerConfig = () => {
    switch (urgency) {
      case 'expired':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-900',
          subTextColor: 'text-red-700',
          btnColor: 'bg-red-600 hover:bg-red-700',
          icon: '⚠️',
          title: '试用已到期',
          message: '升级到Pro版继续享受完整功能'
        };
      case 'critical':
        return {
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-900',
          subTextColor: 'text-orange-700',
          btnColor: 'bg-orange-600 hover:bg-orange-700',
          icon: '🔥',
          title: `试用剩余 ${daysLeft} 天`,
          message: '立即升级，避免中断您的智能选品服务'
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-900',
          subTextColor: 'text-yellow-700',
          btnColor: 'bg-yellow-600 hover:bg-yellow-700',
          icon: '⏰',
          title: `试用剩余 ${daysLeft} 天`,
          message: '升级到Pro版，继续享受AI智能选品服务'
        };
      default:
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-900',
          subTextColor: 'text-blue-700',
          btnColor: 'bg-blue-600 hover:bg-blue-700',
          icon: '💎',
          title: `试用期 (${daysLeft}天剩余)`,
          message: '体验完整AI选品功能，发现更多跨境商机'
        };
    }
  };

  const config = getBannerConfig();

  // 紧凑模式（用于导航栏下方）
  if (compact) {
    return (
      <div className={`${config.bgColor} ${config.textColor} border-b ${config.borderColor} py-2`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span>{config.icon}</span>
              <span className="font-medium">{config.title}</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/pricing" className={`${config.btnColor} text-white px-3 py-1 rounded text-xs font-medium transition-colors`}>
                立即升级
              </Link>
              {dismissible && (
                <button
                  onClick={handleDismiss}
                  className="hover:opacity-70 p-0.5"
                  aria-label="关闭"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 完整模式
  return (
    <div className={`${config.bgColor} ${config.textColor} border-b ${config.borderColor}`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{config.icon}</span>
            <div>
              <p className="font-medium">{config.title}</p>
              <p className={`text-sm ${config.subTextColor}`}>{config.message}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/pricing"
              className={`${config.btnColor} text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm`}
            >
              查看定价
            </Link>
            <Link
              href="/dashboard/settings"
              className="px-4 py-2 border border-current rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
            >
              订阅管理
            </Link>
            {dismissible && (
              <button
                onClick={handleDismiss}
                className="hover:opacity-70 p-1"
                aria-label="关闭"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* 进度条 */}
        {daysLeft !== null && daysLeft > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className={config.subTextColor}>试用期进度</span>
              <span className="font-medium">{14 - daysLeft}/14 天</span>
            </div>
            <div className="w-full bg-white/50 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  urgency === 'critical' ? 'bg-red-500' :
                  urgency === 'warning' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`}
                style={{ width: `${((14 - daysLeft) / 14) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
