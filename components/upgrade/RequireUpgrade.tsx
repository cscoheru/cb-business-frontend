'use client';

import { useAuth } from '@/lib/auth-context';
import { UpgradePrompt } from '@/components/subscription/upgrade-prompt';
import { Shield, Lock } from 'lucide-react';

interface RequireUpgradeProps {
  feature?: 'ai_analysis' | 'risk_alert' | 'general';
  variant?: 'card' | 'banner' | 'inline';
  className?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Wrapper component that shows upgrade prompt for free/trial users
 * and renders Pro features for paid users
 *
 * Usage:
 *   <RequireUpgrade feature="ai_analysis">
 *     <AIAnalysisContent />
 *   </RequireUpgrade>
 */
export function RequireUpgrade({
  feature = 'general',
  variant = 'banner',
  className = '',
  fallback,
  children
}: RequireUpgradeProps) {
  const { user, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not logged in - show fallback or nothing
  if (!user) {
    return fallback ? <>{fallback}</> : null;
  }

  // Pro or Enterprise users get full access
  if (user.plan_tier === 'pro' || user.plan_tier === 'enterprise') {
    return <>{children}</>;
  }

  // Trial and Free users see upgrade prompt
  return (
    <div className={className}>
      <UpgradePrompt feature={feature} variant={variant} />
    </div>
  );
}

/**
 * Inline version that shows a lock icon instead of full banner
 * Good for use inside cards or lists
 */
export function ProFeatureLock({ feature = 'general', className = '' }: { feature?: 'ai_analysis' | 'risk_alert' | 'general'; className?: string }) {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) return null;
  if (user.plan_tier === 'pro' || user.plan_tier === 'enterprise') return null;

  return (
    <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
      <Lock className="h-4 w-4" />
      <span>Pro功能</span>
    </div>
  );
}

/**
 * Trial expiry warning banner
 * Shows when trial user has less than 3 days remaining
 */
export function TrialExpiryWarning() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user || user.plan_tier !== 'trial') return null;

  // Check if trial is expiring soon (less than 3 days)
  // This would need trial_end_date from the user object
  // For now, show warning to all trial users
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-3">
        <Shield className="h-5 w-5 text-yellow-600" />
        <div className="flex-1">
          <p className="font-medium text-yellow-900">试用版提醒</p>
          <p className="text-sm text-yellow-700">
            您正在使用试用版，升级到Pro版继续享受所有功能
          </p>
        </div>
        <UpgradePrompt feature="general" variant="inline" />
      </div>
    </div>
  );
}
