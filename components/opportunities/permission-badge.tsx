'use client';

import { useAuth } from '@/lib/auth-context';

export type AccessLevel = 'full' | 'view_only' | 'locked' | 'denied';

interface PermissionBadgeProps {
  /**
   * 访问级别
   */
  accessLevel: AccessLevel;
  /**
   * 权限原因/限制说明
   */
  reason?: string;
  /**
   * 是否需要升级才能访问
   */
  upgradeRequired?: boolean;
  /**
   * 所需的最低订阅级别
   */
  requiredTier?: 'trial' | 'pro' | 'enterprise';
  /**
   * 紧凑模式（显示在小卡片上）
   */
  compact?: boolean;
}

export function PermissionBadge({
  accessLevel,
  reason,
  upgradeRequired = false,
  requiredTier,
  compact = false
}: PermissionBadgeProps) {
  const { user, isAuthenticated } = useAuth();

  const getBadgeConfig = () => {
    switch (accessLevel) {
      case 'full':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200',
          icon: '✅',
          label: '完整访问',
          description: '您可以查看和操作此商机'
        };
      case 'view_only':
        return {
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-200',
          icon: '👁️',
          label: '只读访问',
          description: reason || '您可以查看此商机，但无法执行操作'
        };
      case 'locked':
        return {
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-800',
          borderColor: 'border-orange-200',
          icon: '🔒',
          label: '内容锁定',
          description: reason || '此商机的详细数据已锁定，升级后解锁'
        };
      case 'denied':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-200',
          icon: '🚫',
          label: '访问受限',
          description: reason || '此内容需要升级订阅才能访问'
        };
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200',
          icon: '❓',
          label: '未知状态',
          description: '无法确定访问权限'
        };
    }
  };

  const config = getBadgeConfig();

  // 紧凑模式 - 用于商机卡片
  if (compact) {
    if (accessLevel === 'full') return null;

    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${config.bgColor} ${config.textColor} border ${config.borderColor}`}
        title={config.description}
      >
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </div>
    );
  }

  // 完整模式 - 用于详情页
  return (
    <div className={`${config.bgColor} ${config.textColor} border ${config.borderColor} rounded-lg p-4`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{config.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold">{config.label}</h4>
            {upgradeRequired && requiredTier && (
              <span className="px-2 py-0.5 bg-white/50 rounded text-xs font-medium">
                需要 {requiredTier === 'pro' ? 'Pro' : 'Enterprise'} 版
              </span>
            )}
          </div>
          <p className="text-sm opacity-90 mb-3">{config.description}</p>

          {upgradeRequired && (
            <div className="flex gap-2">
              <a
                href="/pricing"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-current rounded text-sm font-medium hover:bg-opacity-90 transition-colors"
              >
                查看定价
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
              {!isAuthenticated && (
                <a
                  href="/register"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-current text-white rounded text-sm font-medium hover:opacity-90 transition-colors"
                >
                  免费注册
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


/**
 * 商机内容锁定遮罩
 * 用于覆盖部分内容，提示用户升级
 */
interface LockedContentOverlayProps {
  /**
   * 被锁定的内容类型
   */
  contentType?: 'ai_insights' | 'market_data' | 'analysis' | 'full';
  /**
   * 解锁所需的最低订阅级别
   */
  requiredTier?: 'trial' | 'pro' | 'enterprise';
  /**
   * 点击时的回调
   */
  onUpgradeClick?: () => void;
}

export function LockedContentOverlay({
  contentType = 'full',
  requiredTier = 'pro',
  onUpgradeClick
}: LockedContentOverlayProps) {
  const getContentLabel = () => {
    switch (contentType) {
      case 'ai_insights':
        return 'AI智能分析';
      case 'market_data':
        return '市场数据';
      case 'analysis':
        return '详细分析';
      case 'full':
      default:
        return '完整内容';
    }
  };

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/90 to-white/95 backdrop-blur-sm flex items-center justify-center p-6 rounded-lg">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {getContentLabel()}已锁定
        </h3>

        <p className="text-gray-600 mb-4">
          升级到 <span className="font-semibold">{requiredTier === 'pro' ? 'Pro' : 'Enterprise'}</span> 版
          解锁{getContentLabel()}，获取完整商机洞察
        </p>

        <div className="flex gap-2 justify-center">
          <button
            onClick={onUpgradeClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            立即升级
          </button>
          <a
            href="/pricing"
            className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            查看定价
          </a>
        </div>

        <p className="text-xs text-gray-500 mt-3">
          试用用户可免费体验14天完整功能
        </p>
      </div>
    </div>
  );
}


/**
 * 订阅提示卡片
 * 显示在权限受限的页面
 */
interface SubscriptionPromptProps {
  /**
   * 提示标题
   */
  title?: string;
  /**
   * 提示描述
   */
  description?: string;
  /**
   * 功能列表
   */
  features?: string[];
  /**
   * 背景渐变
   */
  gradient?: 'blue' | 'purple' | 'orange';
}

export function SubscriptionPrompt({
  title = '解锁完整功能',
  description = '升级订阅，获取无限商机访问权限',
  features = [
    '无限查看所有商机',
    'AI智能分析',
    '市场数据采集验证',
    '专属客服支持'
  ],
  gradient = 'blue'
}: SubscriptionPromptProps) {
  const gradientClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <div className={`bg-gradient-to-r ${gradientClasses[gradient]} rounded-xl p-6 text-white`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-blue-50 mb-4">{description}</p>

          <ul className="space-y-2 mb-4">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm">
                <svg className="w-5 h-5 text-blue-200 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>

          <div className="flex gap-2">
            <a
              href="/pricing"
              className="inline-flex items-center gap-1 px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              查看定价
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
            <a
              href="/register"
              className="inline-flex items-center gap-1 px-4 py-2 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors"
            >
              免费试用14天
            </a>
          </div>
        </div>

        <div className="hidden md:block">
          <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
            <svg className="w-16 h-16 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
