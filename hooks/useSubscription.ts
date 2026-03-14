'use client';

import { useEffect, useState } from 'react';
import { subscriptionsApi, Subscription } from '@/lib/api';

interface SubscriptionStatus {
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due';
  billingCycle: 'monthly' | 'yearly' | null;
  startedAt: string;
  expiresAt: string | null;
  canceledAt: string | null;
  isTrialing: boolean;
  daysUntilExpiry: number | null;
}

/**
 * Hook to fetch and manage user subscription status
 */
export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await subscriptionsApi.getMySubscription();

      if (data) {
        setSubscription(data);

        // Calculate derived status
        const sub = data;
        let daysUntilExpiry: number | null = null;

        if (sub.expires_at) {
          const expiryDate = new Date(sub.expires_at);
          const now = new Date();
          daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        }

        setStatus({
          plan: sub.plan_tier,
          status: sub.status,
          billingCycle: sub.billing_cycle,
          startedAt: sub.started_at,
          expiresAt: sub.expires_at,
          canceledAt: sub.canceled_at,
          isTrialing: sub.status === 'active' && !!sub.expires_at && daysUntilExpiry !== null && daysUntilExpiry > 0,
          daysUntilExpiry,
        });
      } else {
        // No subscription found, default to free
        setStatus({
          plan: 'free',
          status: 'active',
          billingCycle: null,
          startedAt: new Date().toISOString(),
          expiresAt: null,
          canceledAt: null,
          isTrialing: false,
          daysUntilExpiry: null,
        });
      }
    } catch (err: any) {
      console.error('Failed to load subscription:', err);
      setError(err?.message || '获取订阅信息失败');

      // Set default free status on error
      setStatus({
        plan: 'free',
        status: 'active',
        billingCycle: null,
        startedAt: new Date().toISOString(),
        expiresAt: null,
        canceledAt: null,
        isTrialing: false,
        daysUntilExpiry: null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanLabel = (plan: string): string => {
    const labels: Record<string, string> = {
      free: '免费版',
      pro: '专业版',
      enterprise: '企业版',
    };
    return labels[plan] || plan;
  };

  const getStatusBadge = (status: SubscriptionStatus): { label: string; color: string } => {
    if (status.plan === 'free') {
      return { label: '免费版', color: 'bg-gray-100 text-gray-800' };
    }

    if (status.isTrialing && status.daysUntilExpiry !== null) {
      return {
        label: `试用中 (${status.daysUntilExpiry}天剩余)`,
        color: 'bg-purple-100 text-purple-800',
      };
    }

    if (status.status === 'active') {
      return { label: '活跃', color: 'bg-green-100 text-green-800' };
    }

    if (status.status === 'canceled') {
      return { label: '已取消', color: 'bg-red-100 text-red-800' };
    }

    if (status.status === 'past_due') {
      return { label: '逾期', color: 'bg-yellow-100 text-yellow-800' };
    }

    return { label: status.status, color: 'bg-gray-100 text-gray-800' };
  };

  const canAccessFeature = (feature: 'ai_analysis' | 'risk_alert' | 'unlimited_api'): boolean => {
    if (!status) return false;

    // Free tier limitations
    if (status.plan === 'free') {
      return false; // Free tier has no premium features
    }

    // Pro tier features
    if (status.plan === 'pro') {
      return ['ai_analysis', 'risk_alert', 'unlimited_api'].includes(feature);
    }

    // Enterprise tier has everything
    if (status.plan === 'enterprise') {
      return true;
    }

    return false;
  };

  return {
    subscription,
    status,
    isLoading,
    error,
    loadSubscription,
    getPlanLabel,
    getStatusBadge,
    canAccessFeature,
  };
}
